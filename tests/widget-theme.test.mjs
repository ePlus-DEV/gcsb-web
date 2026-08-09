import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const page = readFileSync(new URL("../app/widget/page.tsx", import.meta.url), "utf8")
const themeCss = readFileSync(new URL("../app/widget/widget-theme.css", import.meta.url), "utf8")
const defaultLightCss = readFileSync(new URL("../app/widget/widget-default-light.css", import.meta.url), "utf8")
const themeBridge = readFileSync(new URL("../components/arcade/widget-theme-bridge.tsx", import.meta.url), "utf8")

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

test("widget is light by default without changing the website default theme", () => {
  const themeImport = page.indexOf('import "./widget-theme.css"')
  const defaultLightImport = page.indexOf('import "./widget-default-light.css"')

  assert.notEqual(defaultLightImport, -1)
  assert.ok(defaultLightImport > themeImport)
  assert.match(page, /WidgetThemeBridge/)
  assert.match(defaultLightCss, /html:not\(\[data-widget-theme="dark"\]\) \.arcade-widget-card/)
  assert.match(defaultLightCss, /linear-gradient\(135deg, #fff, #f8faff 70%, #f5f3ff\)/)
  assert.match(themeBridge, /=== "dark" \? "dark" : "light"/)
  assert.match(themeBridge, /return "light"/)
  assert.equal(themeBridge.includes('setTheme('), false)
})
