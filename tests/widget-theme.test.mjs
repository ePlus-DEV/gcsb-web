import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const page = readFileSync(new URL("../app/widget/page.tsx", import.meta.url), "utf8")
const themeCss = readFileSync(new URL("../app/widget/widget-theme.css", import.meta.url), "utf8")

test("widget loads explicit persisted theme overrides after base styles", () => {
  const baseImport = page.indexOf('import "./widget.css"')
  const themeImport = page.indexOf('import "./widget-theme.css"')

  assert.notEqual(baseImport, -1)
  assert.notEqual(themeImport, -1)
  assert.ok(themeImport > baseImport)
  assert.equal(page.includes('widget-header-contrast.css'), false)
})

test("widget theme follows next-themes classes instead of only OS color scheme", () => {
  assert.match(themeCss, /html\.dark \.arcade-widget-card/)
  assert.match(themeCss, /html\.light \.arcade-widget-card/)
  assert.match(themeCss, /html\.dark \.arcade-widget-marquee-track/)
  assert.match(themeCss, /html\.light \.arcade-widget-marquee-track/)
  assert.doesNotMatch(themeCss, /@media\s*\([^)]*prefers-color-scheme/i)
})
