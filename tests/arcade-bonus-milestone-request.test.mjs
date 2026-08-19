import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import vm from "node:vm"

const scriptPath = path.join(process.cwd(), "scripts", "arcade-request-dedupe.js")
const widgetComponentPath = path.join(
  process.cwd(),
  "components",
  "arcade",
  "arcade-embed-widget.tsx",
)
const script = await readFile(scriptPath, "utf8")
const widgetComponent = await readFile(widgetComponentPath, "utf8")
const endpoint = "https://hub.eplus.dev/api/arcade-public"
const profileUrl =
  "https://www.skills.google/public_profiles/11111111-1111-4111-8111-111111111111"

function install({ pathname = "/", search = "", completed = false } = {}) {
  const previousWindow = globalThis.window
  let submittedBody = null
  const browserWindow = {
    fetch: async (_input, init) => {
      submittedBody = JSON.parse(init.body)
      return new Response(JSON.stringify({ success: true }), { status: 200 })
    },
    location: {
      href: `https://arcade.eplus.dev${pathname}${search}`,
      pathname,
      search,
    },
    localStorage: {
      getItem(key) {
        return key === `arcade-facilitator-bonus-milestone-v1:${profileUrl}` &&
          completed
          ? "true"
          : null
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
    getSubmittedBody: () => submittedBody,
    restore() {
      if (previousWindow === undefined) delete globalThis.window
      else globalThis.window = previousWindow
    },
  }
}

async function submit(
  browserWindow,
  body = { url: profileUrl, season: "2026" },
) {
  await browserWindow.fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

test("web requests still receive the stored self-reported Bonus Milestone flag", async () => {
  const { browserWindow, getSubmittedBody, restore } = install({ completed: true })

  try {
    await submit(browserWindow)
    assert.deepEqual(getSubmittedBody().facilitator, {
      bonusMilestoneCompleted: true,
    })
    assert.equal("participating" in getSubmittedBody().facilitator, false)
  } finally {
    restore()
  }
})

test("explicit widget bonus confirmation is never overwritten by local storage", async () => {
  const { browserWindow, getSubmittedBody, restore } = install({ completed: true })

  try {
    await submit(browserWindow, {
      url: profileUrl,
      season: "2026",
      facilitator: { bonusMilestoneCompleted: false },
    })
    assert.deepEqual(getSubmittedBody().facilitator, {
      bonusMilestoneCompleted: false,
    })
  } finally {
    restore()
  }
})

test("shared profiles use the explicit bonus query flag instead of local storage", async () => {
  const { browserWindow, getSubmittedBody, restore } = install({
    pathname: "/profile/",
    search: "?id=11111111-1111-4111-8111-111111111111&bonus=0",
    completed: true,
  })

  try {
    await submit(browserWindow)
    assert.equal(getSubmittedBody().facilitator.bonusMilestoneCompleted, false)
  } finally {
    restore()
  }
})

test("widget requires Facilitator participation and explicit Bonus Milestone confirmation", () => {
  assert.match(widgetComponent, /Participating in Facilitator Program/)
  assert.match(widgetComponent, /Bonus Milestone completed/)
  assert.match(
    widgetComponent,
    /selection\.participating && selection\.bonusMilestoneCompleted/,
  )
  assert.match(
    widgetComponent,
    /const confirmedBonusMilestone = participating && bonusMilestoneCompleted/,
  )
  assert.match(
    widgetComponent,
    /disabled={!hasValidProfileUrl \|\| !participating \|\| loading}/,
  )
  assert.match(
    widgetComponent,
    /participating,\s*confirmedBonusMilestone,/,
  )
})
