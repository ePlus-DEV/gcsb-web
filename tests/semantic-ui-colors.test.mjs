import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const styles = readRepoFile("app/styles/design-adoption.css")
const tokens = readRepoFile("app/styles/design-tokens.css")
const layout = readRepoFile("app/layout.tsx")

function palette(rule) {
  const start = tokens.indexOf(rule + " {")
  assert.ok(start >= 0, `Unknown token rule ${rule}`)
  const body = tokens.slice(start, tokens.indexOf("}", start))
  return Object.fromEntries(
    [...body.matchAll(/(--ds-[\w-]+):\s*(#[0-9a-f]{6});/gi)].map((m) => [m[1], m[2]])
  )
}

function contrast(a, b) {
  const luminance = (hex) => {
    const values = hex.match(/[0-9a-f]{2}/gi).map((v) => Number.parseInt(v, 16) / 255)
    const [r, g, b] = values.map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    return r * .2126 + g * .7152 + b * .0722
  }
  const x = luminance(a), y = luminance(b)
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05)
}

test("all primary/hover and informational token combinations meet AA normal text contrast", () => {
  for (const [mode, colors] of [["dark", palette(":root,\nhtml.dark")], ["light", palette("html.light")]]) {
    for (const [label, foreground, background] of [
      ["CTA", colors["--ds-on-primary"], colors["--ds-primary"]],
      ["CTA hover", colors["--ds-on-primary"], colors["--ds-primary-hover"]],
      ["card text", colors["--ds-text"], colors["--ds-surface"]],
      ["muted card text", colors["--ds-text-muted"], colors["--ds-surface"]],
      ["informational link", colors["--ds-link"], colors["--ds-surface"]],
    ]) {
      assert.ok(foreground && background, `${mode} missing ${label} token`)
      const ratio = contrast(foreground, background)
      assert.ok(ratio >= 4.5, `${mode} ${label} fails AA at ${ratio.toFixed(2)}:1`)
    }
  }
})

test("semantic adoption loads after all legacy light/dark overrides", () => {
  const a = layout.indexOf('import "./styles/design-tokens.css"')
  const b = layout.indexOf('import "./styles/swag-theme.css"')
  const c = layout.indexOf('import "./styles/design-adoption.css"')
  assert.ok(a >= 0 && b > a && c > b)
  assert.doesNotMatch(styles, /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i)
})

test("primary actions on all major app surfaces share one violet semantic token", () => {
  for (const selector of [
    ".arcade-dashboard-page .analyze-button",
    ".cookie-consent-button",
    ".facilitator-empty button",
    ".swag-season-page .swag-action-primary",
    ".bonus-milestone-confirmation-button:not(.is-completed):not(.is-secondary)",
  ]) {
    assert.ok(styles.includes(selector), `Missing primary component ${selector}`)
  }
  assert.match(styles, /border-color:\s*var\(--ds-primary\);/)
  assert.match(styles, /background:\s*var\(--ds-primary\);/)
  assert.match(styles, /color:\s*var\(--ds-on-primary\);/)
  assert.match(styles, /background:\s*var\(--ds-primary-hover\);/)
})

test("outline buttons and navigation use neutral surfaces and a single violet active color", () => {
  for (const selector of [
    ".cookie-consent-detail-button",
    ".swag-season-page .swag-action-outline",
    ".swag-season-page .swag-action-chip",
    ".arcade-dashboard-page .show-all-badges",
  ]) assert.ok(styles.includes(selector), `Missing secondary component ${selector}`)

  assert.match(styles, /background:\s*var\(--ds-surface\);/)
  assert.match(styles, /border-color:\s*var\(--ds-border\);/)
  assert.match(styles, /\.arcade-nav a\.active::after/)
  assert.match(styles, /\.badge-filters button\.active/)
  assert.match(styles, /\.mobile-bottom-nav a\.is-active/)
  assert.match(styles, /\.badge-search-field:focus-within/)
  assert.match(styles, /outline:\s*2px solid var\(--ds-focus\);/)
})

test("informational links retain secondary teal/cyan and tier/status/logo palettes are untouched", () => {
  assert.match(styles, /\.internal-breadcrumb-link/)
  assert.match(styles, /\.internal-breadcrumb-current/)
  assert.match(styles, /\.swag-action-text/)
  assert.match(styles, /color:\s*var\(--ds-link\);/)
  assert.doesNotMatch(styles, /\.arcade-brand|\.arcade-brand-mark|\.arcade-brand-copy/)
  assert.doesNotMatch(styles, /\.tier-(?:120|95|75|50)\b|\.point-tone-|\.earned-badge-art/)
  assert.doesNotMatch(styles, /\.is-completed(?:\s*\{|\s*,)/)
})
