import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const ui = readRepoFile("app/styles/arcade-ui.css")
const layout = readRepoFile("app/layout.tsx")
const calculator = readRepoFile("app/redesign-calculator.tsx")
const analyzer = readRepoFile("components/arcade/profile-analyzer.tsx")
const brandGamepad = readRepoFile("components/arcade/arcade-brand-gamepad.tsx")
const internalShell = readRepoFile("components/site/internal-page-shell.tsx")
const notFound = readRepoFile("components/site/not-found-redirect.tsx")
const sharedProfile = readRepoFile("components/arcade/shared-profile-client.tsx")

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


test("all Arcade Points logos use the shared original gamepad SVG without font metric drift", () => {
  assert.match(brandGamepad, /viewBox="0 0 640 512"/)
  assert.match(brandGamepad, /fill="currentColor"/)
  assert.match(brandGamepad, /className="arcade-brand-gamepad"/)
  assert.match(brandGamepad, /Font Awesome Free/)
  assert.match(ui, /\.arcade-brand-mark > svg\.arcade-brand-gamepad \{[\s\S]*?width: 28px;[\s\S]*?height: 28px;/)
  assert.match(ui, /\.footer-brand \.arcade-brand-mark > svg\.arcade-brand-gamepad \{[\s\S]*?width: 26px;/)
  assert.match(ui, /\.arcade-dashboard-page \.arcade-header \.arcade-brand-mark > \.arcade-brand-gamepad \{[\s\S]*?width: 26px;/)
  assert.doesNotMatch(ui, /\.arcade-dashboard-page \.arcade-header \.arcade-brand-mark \.fa-icon \{/)

  for (const [path, source, count] of [
    ["home", calculator, 2],
    ["internal", internalShell, 1],
    ["not-found", notFound, 1],
    ["shared-profile", sharedProfile, 1],
  ]) {
    const logos = [...source.matchAll(/<span className="arcade-brand-mark"><ArcadeBrandGamepad \/><\/span>/g)]
    assert.equal(logos.length, count, path + " logo count")
    assert.match(source, /import ArcadeBrandGamepad from "@\/components\/arcade\/arcade-brand-gamepad"/)
    assert.doesNotMatch(source, /<span className="arcade-brand-mark"><Gamepad2 \/><\/span>/)
  }
})
