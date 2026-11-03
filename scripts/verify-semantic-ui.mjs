import assert from "node:assert/strict"
import { chromium } from "playwright"
import { startStaticServer } from "./serve-static.mjs"

const server = await startStaticServer()
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}),
})
const routes = [
  { path: "", primary: ".arcade-dashboard-page .analyze-button" },
  { path: "swag-drops/2026/", primary: ".swag-season-page .swag-action-primary" },
]
let checks = 0

try {
  for (const theme of ["light", "dark"]) {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } })
      await context.addInitScript((mode) => localStorage.setItem("arcade-theme", mode), theme)
      const page = await context.newPage()
      await page.route("https://**/*", (route) => route.abort())
      for (const route of routes) {
        await page.goto(server.url + route.path, { waitUntil: "domcontentloaded" })
        await page.waitForFunction((mode) => document.documentElement.classList.contains(mode), theme)
        await page.locator(route.primary).first().waitFor({ state: "attached" })
        const result = await page.evaluate((selector) => {
          const colorValue = (token) => {
            const probe = document.createElement("span")
            probe.style.color = `var(${token})`
            document.body.appendChild(probe)
            const value = getComputedStyle(probe).color
            probe.remove()
            return value
          }
          const channels = (value) => value.match(/[0-9.]+/g)?.slice(0, 3).map(Number)
          const luminosity = (value) => {
            const rgb = channels(value).map((number) => {
              const n = number / 255
              return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4
            })
            return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
          }
          const ratio = (a, b) => {
            const x = luminosity(a), y = luminosity(b)
            return (Math.max(x, y) + .05) / (Math.min(x, y) + .05)
          }
          const expectedBg = colorValue("--ds-primary")
          const expectedText = colorValue("--ds-on-primary")
          const expectedSecondaryBg = colorValue("--ds-surface")
          const expectedSecondaryText = colorValue("--ds-text")
          const expectedLink = colorValue("--ds-link")
          const selectors = [selector]
          if (document.querySelector(".cookie-consent-button")) selectors.push(".cookie-consent-button")
          const components = selectors.map((sel) => {
            const el = document.querySelector(sel)
            const style = getComputedStyle(el)
            return {
              name: sel,
              background: style.backgroundColor,
              text: style.color,
              contrast: ratio(style.color, style.backgroundColor),
            }
          })
          const neutralSelectors = selector.includes("analyze-button")
            ? [".cookie-consent-detail-button"]
            : [".swag-season-page .swag-action-outline", ".swag-season-page .swag-action-chip"]
          const secondary = neutralSelectors.flatMap((sel) => {
            const el = document.querySelector(sel)
            if (!el) return []
            const style = getComputedStyle(el)
            return [{ name: sel, background: style.backgroundColor, text: style.color }]
          })
          const crumb = document.querySelector(".internal-breadcrumb-link")
          return {
            expectedBg, expectedText, expectedSecondaryBg, expectedSecondaryText, expectedLink,
            components, secondary, breadcrumb: crumb ? getComputedStyle(crumb).color : null,
          }
        }, route.primary)
        for (const component of result.components) {
          assert.equal(component.background, result.expectedBg, `${route.path}: ${component.name} not primary in ${theme}`)
          assert.equal(component.text, result.expectedText, `${route.path}: ${component.name} text inconsistent in ${theme}`)
          assert.ok(component.contrast >= 4.5, `${route.path}: ${component.name} contrast ${component.contrast.toFixed(2)}`)
        }
        for (const item of result.secondary) {
          assert.equal(item.background, result.expectedSecondaryBg, `${route.path}: ${item.name} secondary surface in ${theme}`)
          assert.equal(item.text, result.expectedSecondaryText, `${route.path}: ${item.name} secondary text in ${theme}`)
        }
        if (result.breadcrumb) {
          assert.equal(result.breadcrumb, result.expectedLink, `${route.path}: breadcrumbs must use secondary link color in ${theme}`)
        }
        checks++
      }
      await context.close()
    }
  }
  console.log(`Verified semantic UI palette in ${checks} light/dark mobile/desktop browser scenarios.`)
} finally {
  await browser.close()
  await server.close()
}
