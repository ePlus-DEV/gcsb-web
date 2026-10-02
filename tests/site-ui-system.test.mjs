import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const chromeKeys = ["calculator", "tiers", "badges", "extension", "swagDrops", "monthlyLabs", "goToCalculator", "openNavigation", "closeNavigation", "mobileNavigation", "aboutTool", "unofficial", "about", "guide", "privacy", "terms"]

test("shared chrome copy has complete catalogs for all thirteen supported locales", () => {
  const names = readdirSync(new URL("../public/i18n/locales/", import.meta.url)).filter(n => n.endsWith(".json"))
  assert.equal(names.length, 13)
  for (const name of names) {
    const catalog = JSON.parse(readFileSync(new URL("../public/i18n/locales/" + name, import.meta.url), "utf8"))
    for (const key of chromeKeys) assert.ok(catalog.messages[key]?.trim(), `${name} missing ${key}`)
  }
  for (const file of ["site-header", "site-footer"]) {
    const source = readRepoFile(`components/site/${file}.tsx`)
    assert.doesNotMatch(source, />\s*(Calculator|Tiers|Badges|Extension|Swag Drops|Monthly labs|About|Guide|Privacy|Terms)\s*</)
    assert.doesNotMatch(source, /aria-label="(?:Open|Close|Main|Site|Arcade)/)
  }
})

test("the theme contract supplies the previously missing primitive colors and shared geometry", () => {
  const tokens = readRepoFile("app/styles/ui-tokens.css")
  for (const name of ["background", "foreground", "card", "card-foreground", "popover", "primary", "muted", "muted-foreground", "border", "input", "ring", "radius", "ui-width", "ui-gutter", "ui-radius", "ui-surface"]) {
    assert.ok(tokens.includes(`--${name}:`), `Missing ${name}`)
  }
  assert.match(tokens, /html\.light, html\[data-widget-theme="light"\]/)
  const layout = readRepoFile("app/layout.tsx")
  assert.ok(layout.indexOf('styles/ui-tokens.css') < layout.indexOf('styles/redesign-dashboard.css'))
  assert.ok(layout.indexOf('styles/site-ui.css') > layout.indexOf('styles/home-refactor.css'))
  assert.doesNotMatch(readRepoFile("components/arcade/shared-profile-client.tsx"), /<style>|SharedProfileStyles/)
  assert.doesNotMatch(layout, /styles\/internal-page-theme.css/)
})


test("stacked PR previews always build production from the default branch", () => {
  const workflow = readRepoFile(".github/workflows/pr-preview.yml")
  const production = workflow.split("- name: Checkout production source")[1].split("- name: Checkout pull request source")[0]
  assert.match(production, /github.event.repository.default_branch/)
  assert.doesNotMatch(production, /github.event.pull_request.base.ref/)
})

test("Arcade fonts are local and pixel headings cannot mix unsupported translated glyphs", () => {
  const layout = readRepoFile("app/layout.tsx")
  assert.match(layout, /localFont from "next\/font\/local"/)
  assert.match(layout, /inter-variable\.woff2/)
  assert.match(layout, /press-start-2p\.woff2/)
  assert.match(layout, /weight: "100 900"/)
  assert.doesNotMatch(layout, /fonts\.googleapis\.com|fonts\.gstatic\.com/)
  assert.doesNotMatch(readRepoFile("app/styles/redesign-dashboard.css"), /fonts\.googleapis\.com/)
  assert.match(readRepoFile("app/styles/site-ui.css"), /html\[lang="en"\].*hero-heading h1.*font-arcade-pixel/)
})

test("Facilitator launcher mounts inside the analyzer rather than floating over its controls", () => {
  assert.match(readRepoFile("app/redesign-calculator.tsx"), /className="facilitator-launcher-host"/)
  const source = readRepoFile("components/arcade/facilitator-panel.tsx")
  assert.match(source, /usePortalTarget\("\.facilitator-launcher-host"\)/)
  assert.match(source, /createPortal\(launcher, launcherTarget\)/)
})

 test("icon CSS and all font families ship locally without a CDN stylesheet", () => {
  const layout = readRepoFile("app/layout.tsx")
  assert.match(layout, /styles\/fontawesome-vendor.css/)
  assert.doesNotMatch(layout, /cdnjs\.cloudflare\.com|fontAwesomeUrl/)
  const css = readRepoFile("app/styles/fontawesome-vendor.css")
  for (const family of ["solid-900", "regular-400", "brands-400"]) {
    assert.ok(css.includes(`../fonts/fa-${family}.woff2`))
    assert.ok(readFileSync(new URL(`../app/fonts/fa-${family}.woff2`, import.meta.url)).length > 1000)
  }
})
