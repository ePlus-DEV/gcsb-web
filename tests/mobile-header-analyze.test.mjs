import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const ui = readRepoFile("app/styles/arcade-ui.css")
const layout = readRepoFile("app/layout.tsx")
const calculator = readRepoFile("app/redesign-calculator.tsx")
const analyzer = readRepoFile("components/arcade/profile-analyzer.tsx")

test("mobile brand keeps icon and pixel wordmark vertically aligned", () => {
  assert.match(ui, /@media \(max-width: 600px\)/)
  assert.match(ui, /\.arcade-dashboard-page \.arcade-header \.arcade-brand \{[\s\S]*?align-items: center;/)
  assert.match(ui, /\.arcade-dashboard-page \.arcade-header \.arcade-brand-mark \{[\s\S]*?flex: 0 0 34px;/)
  assert.match(ui, /\.arcade-dashboard-page \.arcade-header \.arcade-brand-copy \{[\s\S]*?flex-direction: column;[\s\S]*?justify-content: center;/)
  assert.match(ui, /@media \(max-width: 360px\)/)
  assert.match(calculator, /className="arcade-brand"/)
})

test("mobile Analyze CTA is compact but meets touch-target minimum and retains submit behavior", () => {
  const rule = ui.match(/\.arcade-dashboard-page \.profile-analyzer-card form \.analyze-button \{([^}]*)\}/)?.[1]
  assert.ok(rule, "compact mobile button rule missing")
  assert.match(rule, /width: min\(100%, 228px\)/)
  assert.match(rule, /min-height: 44px/)
  assert.match(rule, /height: 44px/)
  assert.match(rule, /justify-self: center/)
  assert.match(analyzer, /<button className="analyze-button" type="submit" disabled=\{loading\}>/)
  assert.match(layout, /import "\.\/styles\/arcade-ui\.css"/)
})
