import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import vm from "node:vm"

const scriptPath = path.join(process.cwd(), "scripts", "arcade-request-dedupe.js")
const script = await readFile(scriptPath, "utf8")
const endpoint = "https://hub.eplus.dev/api/arcade-public"
const requestA = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://www.skills.google/public_profiles/11111111-1111-4111-8111-111111111111",
    season: "2026",
  }),
}

function install(fakeFetch) {
  const previousWindow = globalThis.window
  const browserWindow = {
    fetch: fakeFetch,
    location: { href: "https://arcade.eplus.dev/" },
    setTimeout(callback, delay) {
      const timer = setTimeout(callback, delay)
      timer.unref?.()
      return timer
    },
  }
  globalThis.window = browserWindow
  vm.runInThisContext(script, { filename: scriptPath })

  return {
    browserWindow,
    restore() {
      if (previousWindow === undefined) delete globalThis.window
      else globalThis.window = previousWindow
    },
  }
}

test("dedupes identical in-flight and immediate Arcade POST requests", async () => {
  let fetchCount = 0
  const { browserWindow, restore } = install(async () => {
    fetchCount += 1
    return new Response(JSON.stringify({ success: true, fetchCount }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  })

  try {
    const [first, second] = await Promise.all([
      browserWindow.fetch(endpoint, requestA),
      browserWindow.fetch(endpoint, requestA),
    ])

    assert.equal(fetchCount, 1)
    assert.deepEqual(await first.json(), { success: true, fetchCount: 1 })
    assert.deepEqual(await second.json(), { success: true, fetchCount: 1 })

    const immediateRetry = await browserWindow.fetch(endpoint, requestA)
    assert.equal(fetchCount, 1)
    assert.deepEqual(await immediateRetry.json(), { success: true, fetchCount: 1 })
  } finally {
    restore()
  }
})

test("does not merge different Arcade request bodies or unrelated fetches", async () => {
  let fetchCount = 0
  const { browserWindow, restore } = install(async () => {
    fetchCount += 1
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  })

  try {
    const requestB = {
      ...requestA,
      body: JSON.stringify({
        url: "https://www.skills.google/public_profiles/22222222-2222-4222-8222-222222222222",
        season: "2026",
      }),
    }

    await Promise.all([
      browserWindow.fetch(endpoint, requestA),
      browserWindow.fetch(endpoint, requestB),
      browserWindow.fetch("https://example.com/data.json"),
    ])

    assert.equal(fetchCount, 3)
  } finally {
    restore()
  }
})

test("consumer abort does not cancel the shared Arcade request", async () => {
  let fetchCount = 0
  let resolveFetch
  const { browserWindow, restore } = install(
    () =>
      new Promise((resolve) => {
        fetchCount += 1
        resolveFetch = resolve
      }),
  )

  try {
    const controller = new AbortController()
    const first = browserWindow.fetch(endpoint, { ...requestA, signal: controller.signal })
    const second = browserWindow.fetch(endpoint, requestA)

    controller.abort()
    await assert.rejects(first, (error) => error?.name === "AbortError")
    assert.equal(fetchCount, 1)

    resolveFetch(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    assert.deepEqual(await (await second).json(), { success: true })
    assert.equal(fetchCount, 1)
  } finally {
    restore()
  }
})
