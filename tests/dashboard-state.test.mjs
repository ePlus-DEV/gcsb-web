import assert from "node:assert/strict"
import test from "node:test"
import { evaluateTypeScript, readRepoFile } from "./helpers/typescript-source.mjs"

function stateModule(preview) {
  const source = readRepoFile("components/arcade/dashboard-state.ts")
    .replace(/^import .*$/gm, "")
  return evaluateTypeScript(`
    const DASHBOARD_STORAGE_KEY = "dashboard"
    const IS_PR_PREVIEW = ${preview}
    const PREVIEW_DEBUG_PROFILE_URL = "preview-url"
    const PREVIEW_DEBUG_PROFILE_RESULT = { success: true }
    ${source}
  `)
}

function withBrowser(raw, dataset, run) {
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document
  globalThis.window = { localStorage: { getItem: () => {
    if (raw instanceof Error) throw raw
    return raw
  } } }
  globalThis.document = { querySelector: () => ({ dataset }) }
  try { run() } finally {
    globalThis.window = originalWindow
    globalThis.document = originalDocument
  }
}

const saved = { profileUrl: "real-url", result: { success: true, badges: [] } }

test("dashboard restoration safely handles missing, malformed and unavailable storage", () => {
  const state = stateModule(false)
  for (const raw of [null, "{", "null", "[]", "123", '{"profileUrl":123,"result":{}}', '{"profileUrl":"url","result":[]}', new Error("blocked")]) {
    withBrowser(raw, {}, () => assert.equal(state.readStoredDashboard(), null))
  }
  withBrowser(JSON.stringify(saved), {}, () => assert.deepEqual(state.readStoredDashboard(), saved))
})

test("guest hides a stored profile without deleting it; production ignores fake-profile attributes", () => {
  const state = stateModule(false)
  withBrowser(JSON.stringify(saved), { dashboardView: "guest", dashboardDebugFake: "true" }, () => {
    assert.equal(state.readActiveDashboard(), null)
    assert.deepEqual(state.readStoredDashboard(), saved)
  })
  withBrowser(JSON.stringify(saved), { dashboardView: "profile", dashboardDebugFake: "true" }, () => {
    assert.deepEqual(state.readActiveDashboard(), saved)
  })
})

test("PR fake profile works without localStorage and remains hidden in guest mode", () => {
  const state = stateModule(true)
  withBrowser(new Error("blocked"), { dashboardView: "profile", dashboardDebugFake: "true" }, () => {
    assert.deepEqual(state.readActiveDashboard(), { profileUrl: "preview-url", result: { success: true } })
  })
  withBrowser(null, { dashboardView: "guest", dashboardDebugFake: "true" }, () => assert.equal(state.readActiveDashboard(), null))
})

test("dashboard observers subscribe to both mode attributes and disconnect on cleanup", () => {
  const originalObserver = globalThis.MutationObserver
  let callback
  let options
  let disconnected = false
  globalThis.MutationObserver = class {
    constructor(onChange) { callback = onChange }
    observe(_target, value) { options = value }
    disconnect() { disconnected = true }
  }
  try {
    withBrowser(null, {}, () => {
      let updates = 0
      const cleanup = stateModule(true).observeDashboardMode(() => updates++)
      assert.deepEqual(options.attributeFilter, ["data-dashboard-view", "data-dashboard-debug-fake"])
      assert.equal(options.attributes, true)
      callback()
      assert.equal(updates, 1)
      cleanup()
      assert.equal(disconnected, true)
    })
  } finally { globalThis.MutationObserver = originalObserver }
})

test("reuses a parsed dashboard until the stored snapshot changes", () => {
  const state = stateModule(false)
  const oldWindow = globalThis.window
  let raw = JSON.stringify(saved)
  globalThis.window = { localStorage: { getItem: () => raw } }
  try {
    const first = state.readStoredDashboard()
    assert.strictEqual(state.readStoredDashboard(), first)
    raw = JSON.stringify({ ...saved, profileUrl: "another-profile" })
    const changed = state.readStoredDashboard()
    assert.notStrictEqual(changed, first)
    assert.equal(changed.profileUrl, "another-profile")
    raw = null
    assert.equal(state.readStoredDashboard(), null)
  } finally {
    globalThis.window = oldWindow
  }
})

test("profile consumers subscribe to the same-tab dashboard event without polling", () => {
  const paths = [
    "components/arcade/monthly-games-panel-gate.tsx",
    "components/arcade/facilitator-panel-gate.tsx",
    "components/arcade/facilitator-panel.tsx",
    "components/arcade/facilitator-analyzer-option.tsx",
  ]
  for (const path of paths) {
    const source = readRepoFile(path)
    assert.match(source, /DASHBOARD_CHANGE_EVENT/, path)
    assert.doesNotMatch(source, /setInterval\(/, path)
  }
  const calculator = readRepoFile("app/redesign-calculator.tsx")
  assert.match(calculator, /notifyDashboardChanged\(\)/)
})
