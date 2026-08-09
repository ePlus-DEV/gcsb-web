import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const page = readFileSync(new URL("../app/widget/page.tsx", import.meta.url), "utf8")
const themeCss = readFileSync(new URL("../app/widget/widget-theme.css", import.meta.url), "utf8")
const defaultLightCss = readFileSync(new URL("../app/widget/widget-default-light.css", import.meta.url), "utf8")
const controlsCss = readFileSync(new URL("../app/widget/widget-controls.css", import.meta.url), "utf8")
const themeBridge = readFileSync(new URL("../components/arcade/widget-theme-bridge.tsx", import.meta.url), "utf8")

test("widget loads explicit persisted theme overrides after base styles", () => {
  const baseImport = page.indexOf('import "./widget.css"')
  const themeImport = page.indexOf('import "./widget-theme.css"')
  const defaultLightImport = page.indexOf('import "./widget-default-light.css"')
  const controlsImport = page.indexOf('import "./widget-controls.css"')

  assert.notEqual(baseImport, -1)
  assert.notEqual(themeImport, -1)
  assert.notEqual(defaultLightImport, -1)
  assert.notEqual(controlsImport, -1)
  assert.ok(themeImport > baseImport)
  assert.ok(defaultLightImport > themeImport)
  assert.ok(controlsImport > defaultLightImport)
  assert.equal(page.includes('widget-header-contrast.css'), false)
})

test("widget theme follows explicit classes instead of only OS color scheme", () => {
  assert.match(themeCss, /html\.dark \.arcade-widget-card/)
  assert.match(themeCss, /html\.light \.arcade-widget-card/)
  assert.match(themeCss, /html\.dark \.arcade-widget-marquee-track/)
  assert.match(themeCss, /html\.light \.arcade-widget-marquee-track/)
  assert.doesNotMatch(themeCss, /@media\s*\([^)]*prefers-color-scheme/i)
})

test("widget is light by default without changing the website theme preference", () => {
  assert.match(page, /WidgetThemeBridge/)
  assert.match(defaultLightCss, /html:not\(\[data-widget-theme="dark"\]\) \.arcade-widget-card/)
  assert.match(defaultLightCss, /linear-gradient\(135deg, #fff, #f8faff 70%, #f5f3ff\)/)
  assert.match(themeBridge, /arcade-widget-theme-v1/)
  assert.match(themeBridge, /useState<WidgetTheme>\("light"\)/)
  assert.match(themeBridge, /return "light"/)
  assert.doesNotMatch(themeBridge, /WEBSITE_THEME_STORAGE_KEY/)
  assert.doesNotMatch(themeBridge, /from "next-themes"/)
})

test("widget exposes a compact non-overlaying dark mode toggle", () => {
  assert.match(themeBridge, /arcade-widget-theme-toggle/)
  assert.match(themeBridge, /Switch widget to \$\{nextTheme\} mode/)
  assert.match(themeBridge, /localStorage\.setItem\(WIDGET_THEME_STORAGE_KEY, nextTheme\)/)
  assert.match(themeBridge, /classList\.toggle\("dark", theme === "dark"\)/)
  assert.match(themeBridge, /classList\.toggle\("light", theme === "light"\)/)
  assert.match(controlsCss, /\.arcade-widget-theme-toggle\s*\{/)
  assert.match(controlsCss, /width:\s*32px/)
  assert.match(controlsCss, /height:\s*32px/)
  assert.match(controlsCss, /grid-template-columns:\s*minmax\(0, 1fr\) auto auto/)
  assert.doesNotMatch(controlsCss, /position:\s*(?:fixed|absolute)/)
})
