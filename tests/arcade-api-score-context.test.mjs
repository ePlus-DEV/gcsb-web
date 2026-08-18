import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import vm from "node:vm"

const scriptPath = path.join(process.cwd(), "scripts", "arcade-request-dedupe.js")
const script = await readFile(scriptPath, "utf8")
const endpoint = "https://hub.eplus.dev/api/arcade-public"
const profileUrl =
  "https://www.skills.google/public_profiles/11111111-1111-4111-8111-111111111111"

function install({ pathname = "/", search = "", storage = new Map(), fakeFetch }) {
  const previousWindow = globalThis.window
  const browserWindow = {
    fetch: fakeFetch,
    location: { href: `https://arcade.eplus.dev${pathname}${search}`, pathname, search },
    localStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null
      },
      setItem(key, value) {
        storage.set(key, String(value))
      },
    },
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
    storage,
    restore() {
      if (previousWindow === undefined) delete globalThis.window
      else globalThis.window = previousWindow
    },
  }
}

function requestBody() {
  return JSON.stringify({ url: profileUrl, season: "2026" })
}

function scoredResponse() {
  return new Response(
    JSON.stringify({
      success: true,
      arcadePoints: {
        baseTotalPoints: 20,
        facilitatorBonusPoints: 15,
        totalPoints: 35,
      },
      beta: {
        facilitator: {
          participating: true,
          bonusMilestoneCompleted: true,
          bonusIncludedInTotal: true,
        },
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  )
}

test("web and widget requests send locally persisted Facilitator scoring state", async () => {
  const storage = new Map([
    [`arcade-facilitator-participation-v1:${profileUrl}`, "true"],
    [`arcade-facilitator-bonus-milestone-v1:${profileUrl}`, "true"],
  ])
  let submittedBody = null
  const { browserWindow, restore } = install({
    storage,
    fakeFetch: async (_input, init) => {
      submittedBody = JSON.parse(init.body)
      return scoredResponse()
    },
  })

  try {
    await browserWindow.fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody(),
    })
    await new Promise((resolve) => setImmediate(resolve))

    assert.deepEqual(submittedBody.facilitator, {
      participating: true,
      bonusMilestoneCompleted: true,
    })
    assert.deepEqual(browserWindow.__eplusArcadeLatestScoreContext, {
      profileUrl,
      participating: true,
      bonusMilestoneCompleted: true,
      baseTotalPoints: 20,
      totalPoints: 35,
      facilitatorBonusPoints: 15,
    })
    assert.ok(storage.has(`arcade-api-score-context-v1:${profileUrl}`))
  } finally {
    restore()
  }
})

test("shared profile requests use only explicit facilitator and bonus query flags", async () => {
  const storage = new Map([
    [`arcade-facilitator-participation-v1:${profileUrl}`, "false"],
    [`arcade-facilitator-bonus-milestone-v1:${profileUrl}`, "false"],
  ])
  let submittedBody = null
  const { browserWindow, restore } = install({
    pathname: "/profile/",
    search: "?id=11111111-1111-4111-8111-111111111111&facilitator=1&bonus=1",
    storage,
    fakeFetch: async (_input, init) => {
      submittedBody = JSON.parse(init.body)
      return scoredResponse()
    },
  })

  try {
    await browserWindow.fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody(),
    })

    assert.deepEqual(submittedBody.facilitator, {
      participating: true,
      bonusMilestoneCompleted: true,
    })
  } finally {
    restore()
  }
})
