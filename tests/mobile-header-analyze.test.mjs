import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const ui = readRepoFile("app/styles/arcade-ui.css")
const layout = readRepoFile("app/layout.tsx")
const calculator = readRepoFile("app/redesign-calculator.tsx")
const analyzer = readRepoFile("components/arcade/profile-analyzer.tsx")
const iconAdapter = readRepoFile("components/fontawesome-icon-adapter.tsx")

test("mobile brand keeps icon and pixel wordmark vertically aligned", () => {
  assert.match(ui, /@media \(max-width: 600px\)/)
  assert.match(ui, /\.arcade-dashboard-page \.arcade-header \.arcade-brand \{[\s\S]*?align-items: center;/)
  assert.match(ui, /\.arcade-dashboard-page \.arcade-header \.arcade-brand-mark \{[\s\S]*?flex: 0 0 34px;/)
  assert.match(ui, /\.arcade-dashboard-page \.arcade-header \.arcade-brand-copy \{[\s\S]*?flex-direction: column;[\s\S]*?justify-content: center;/)
  assert.match(ui, /@media \(max-width: 360px\)/)
  assert.match(calculator, /className="arcade-brand"/)
})

test("mobile Analyze CTA stays full-width, lowers height to 44px, and keeps submit behavior", () => {
  const rule = ui.match(/\.arcade-dashboard-page \.profile-analyzer-card form \.analyze-button \{([^}]*)\}/)?.[1]
  assert.ok(rule, "compact mobile button rule missing")
  assert.match(rule, /width: 100%;/)
  assert.match(rule, /max-width: 100%;/)
  assert.doesNotMatch(rule, /228px/)
  assert.match(rule, /min-height: 44px/)
  assert.match(rule, /height: 44px/)
  assert.match(rule, /justify-self: stretch/)
  const iconRule = ui.match(/\.arcade-dashboard-page \.profile-analyzer-card form \.analyze-button \.fa-icon \{([^}]*)\}/)?.[1]
  assert.ok(iconRule, "Font Awesome Analyze icon rule missing")
  assert.match(iconRule, /width: 17px;/)
  assert.match(iconRule, /font-size: 17px;/)
  assert.match(analyzer, /<button className="analyze-button" type="submit" disabled=\{loading\}>/)
  assert.match(layout, /import "\.\/styles\/arcade-ui\.css"/)
})


test("logo uses a centered Font Awesome gamepad rather than an ineffective SVG rule", () => {
  assert.match(iconAdapter, /Gamepad2 = createFontAwesomeIcon\("Gamepad2", "fa-solid fa-gamepad"\)/)
  const rule = ui.match(/\.arcade-dashboard-page \.arcade-header \.arcade-brand-mark \.fa-icon \{([^}]*)\}/)?.[1]
  assert.ok(rule, "actual Font Awesome gamepad centering rule missing")
  assert.match(rule, /align-items: center;/)
  assert.match(rule, /justify-content: center;/)
  assert.match(rule, /font-size: 18px;/)
  assert.match(rule, /width: 24px;/)
  assert.match(rule, /height: 24px;/)
  assert.doesNotMatch(ui, /\.arcade-dashboard-page \.arcade-header \.arcade-brand-mark svg \{/)
})
