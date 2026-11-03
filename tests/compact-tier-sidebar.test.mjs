import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const css = readRepoFile("app/styles/arcade-ui.css")
const markup = readRepoFile("components/arcade/dashboard-tiers.tsx")
const start = css.indexOf("/* The profile's 350px tier sidebar")
const end = css.indexOf(".arcade-dashboard-page :where(a, button, input, summary):focus-visible", start)
assert.ok(start > -1 && end > start, "Compact sidebar styles must load before global focus rules")
const compact = css.slice(start, end)

function findRule(selector) {
  const index = compact.indexOf(`${selector} {`)
  assert.ok(index >= 0, `Missing compact style for: ${selector}`)
  const open = compact.indexOf("{", index)
  return compact.slice(open + 1, compact.indexOf("}", open))
}

test("profile tiers render as compact rows without removing slot or delta details", () => {
  const selector = ".dashboard-content-grid > .shared-tier-panel .tier-list-row.arcade-ui-surface"
  assert.match(findRule(selector), /min-height:\s*72px/)
  assert.match(findRule(selector), /padding:\s*10px 12px/)
  assert.match(findRule(".dashboard-content-grid > .shared-tier-panel .tier-list"), /gap:\s*8px/)
  assert.match(findRule(".dashboard-content-grid > .shared-tier-panel .tier-slot-count b"), /font-size:\s*1\.15rem/)
  assert.match(markup, /className="dashboard-panel tier-list-panel shared-tier-panel"/)
  assert.match(markup, /<SlotChangeBadge\b/)
  assert.match(markup, /formatInteger\(tier\.spotsLeft\)/)
  assert.match(markup, /tierRangeLabel\(tier\)/)
})

test("compact tier styling stays limited to the dashboard sidebar and adapts to mobile", () => {
  assert.match(compact, /@media \(max-width: 600px\)/)
  assert.match(compact, /min-height:\s*68px/)
  assert.match(compact, /padding:\s*9px 10px/)
  assert.match(compact, /grid-template-columns:\s*26px minmax\(0, 1fr\) minmax\(68px, auto\)/)
  assert.doesNotMatch(compact, /\.guest-dashboard/)
  assert.doesNotMatch(compact, /\b(?:color|background|border-color):\s*#[0-9a-f]/i)
  assert.match(css, /\.shared-tier-panel \.arcade-ui-surface\.is-current/)
})
