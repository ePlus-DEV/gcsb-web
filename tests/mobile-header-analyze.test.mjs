import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const ui = readRepoFile("app/styles/arcade-ui.css")
const layout = readRepoFile("app/layout.tsx")
const calculator = readRepoFile("app/redesign-calculator.tsx")
const analyzer = readRepoFile("components/arcade/profile-analyzer.tsx")
const logo = readRepoFile("components/arcade/arcade-points-logo.tsx")
const standaloneSvg = readRepoFile("public/branding/arcade-points-logo.svg")
const internalShell = readRepoFile("components/site/internal-page-shell.tsx")
const notFound = readRepoFile("components/site/not-found-redirect.tsx")
const sharedProfile = readRepoFile("components/arcade/shared-profile-client.tsx")

test("logo is complete path-based SVG: fixed icon + two lines of vector lettering", () => {
  assert.match(logo, /viewBox="0 0 132 44"/)
  assert.match(logo, /role="img"/)
  assert.match(logo, /aria-label="Arcade Points"/)
  assert.match(logo, /className="arcade-brand-logo"/)
  assert.match(logo, /className="arcade-logo-bottom"/)
  assert.match(logo, /shapeRendering="crispEdges"/)
  assert.match(standaloneSvg, /viewBox="0 0 132 44"/)
  assert.match(standaloneSvg, /shape-rendering="crispEdges"/)
  assert.doesNotMatch(logo, /<text\b|<ArcadeBrandGamepad\s*\/>/)
  assert.doesNotMatch(standaloneSvg, /<text\b|<style\b|@font-face/)
})

test("all brand lockups are the same SVG; not separate gamepad and CSS-stacked text", () => {
  for (const [path, source, count] of [
    ["home header and footer", calculator, 2],
    ["internal routes", internalShell, 1],
    ["not found", notFound, 1],
    ["shared profile", sharedProfile, 1],
  ]) {
    const matches = [...source.matchAll(/<ArcadePointsLogo \/>/g)]
    assert.equal(matches.length, count, path + " logo count")
    assert.match(source, /import ArcadePointsLogo from "@\/components\/arcade\/arcade-points-logo"/)
    assert.doesNotMatch(source, /<span className="arcade-brand-mark">/)
    assert.doesNotMatch(source, /<span className="arcade-brand-copy">/)
  }
  assert.match(ui, /\.arcade-brand-logo \{[\s\S]*?width: 132px;[\s\S]*?height: auto;/)
  assert.match(ui, /\.arcade-dashboard-page \.arcade-header \.arcade-brand-logo \{[\s\S]*?width: 116px;/)
  assert.match(ui, /html\.light \.arcade-brand-logo \.arcade-logo-bottom \{\s*fill: #172033;/)
  assert.match(ui, /@media \(max-width: 360px\)/)
  assert.doesNotMatch(ui, /\.arcade-brand-copy|\.arcade-brand-mark/)
})

test("mobile Analyze CTA stays full width, 44px tall and preserves submit behavior", () => {
  const rule = ui.match(/\.arcade-dashboard-page \.profile-analyzer-card form \.analyze-button \{([^}]*)\}/)?.[1]
  assert.ok(rule, "compact mobile button rule missing")
  assert.match(rule, /width: 100%;/)
  assert.match(rule, /max-width: 100%;/)
  assert.match(rule, /min-height: 44px/)
  assert.match(rule, /height: 44px/)
  assert.match(rule, /justify-self: stretch/)
  assert.match(analyzer, /<button className="analyze-button" type="submit" disabled=\{loading\}>/)
  assert.match(layout, /import "\.\/styles\/arcade-ui\.css"/)
})
