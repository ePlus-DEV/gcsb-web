import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const lightCss = readRepoFile("app/styles/theme-light-components.css")
const resultsCss = readRepoFile("app/styles/redesign-results.css")
const dashboard = readRepoFile("app/redesign-calculator.tsx")
const layout = readRepoFile("app/layout.tsx")

function ruleBody(selector) {
  const start = lightCss.indexOf(`${selector} {`)
  assert.notEqual(start, -1, `Missing CSS rule: ${selector}`)
  return lightCss.slice(start).split("{", 2)[1].split("}", 1)[0]
}

test("light profile metric tiles override desktop dark surfaces with readable contrast", () => {
  assert.match(resultsCss, /@media \(min-width:1081px\)/)
  assert.match(resultsCss, /\.profile-stat-grid>div\{[^}]*background:linear-gradient\(/)

  const selector = "html.light .arcade-dashboard-page .profile-stat-grid > .ui-metric-stat"
  const tile = ruleBody(selector)
  assert.match(tile, /background:\s*linear-gradient\(145deg, #f8faff, #eef2ff\)/)
  assert.match(tile, /border-color:/)

  const numbers = ruleBody(`${selector} strong`)
  assert.match(numbers, /color:\s*#25304a;/)
  const labels = ruleBody(`${selector} > span:not\(.profile-stat-icon\)`)
  assert.match(labels, /color:\s*#52637c;/)
  assert.match(ruleBody("html.light .arcade-dashboard-page .profile-stat-grid .profile-stat-icon"), /color:\s*#6d28d9;/)

  assert.match(dashboard, /className="profile-stat-grid"/)
  assert.match(layout, /import "\.\/styles\/redesign-results\.css"[\s\S]*import "\.\/styles\/theme-light-components\.css"/)
})

test("dark mode metric tiles keep their existing styling", () => {
  // Rules must remain under html.light rather than affecting both themes.
  assert.doesNotMatch(lightCss, /(?:^|\n)\.arcade-dashboard-page \.profile-stat-grid > \.ui-metric-stat \{/)
})
