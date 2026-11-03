import assert from "node:assert/strict"
import { chromium } from "playwright"
import { startStaticServer } from "./serve-static.mjs"

const server = await startStaticServer()
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}),
})
const routes = [
  "swag-drops/2026/",
  "swag-drops/2026/legend/",
  "swag-drops/2026/arcade-magic-mug/",
  "swag-drops/2026/arcade-lumisnap-magnetic-fill-light/",
]
let scenarios = 0

try {
  for (const theme of ["light", "dark"]) {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } })
      await context.addInitScript((theme) => {
        localStorage.setItem("arcade-theme", theme)
      }, theme)
      const page = await context.newPage()
      await page.route("https://**/*", (route) => route.abort())
      for (const route of routes) {
        await page.goto(server.url + route, { waitUntil: "domcontentloaded" })
        await page.waitForFunction((expected) => document.documentElement.classList.contains(expected), theme)
        await page.locator(".internal-breadcrumb-current").waitFor({ state: "visible" })
        await page.locator(".swag-season-page").waitFor({ state: "visible" })
        const result = await page.evaluate((theme) => {
          const current = document.querySelector(".internal-breadcrumb-current")
          const crumbs = document.querySelector(".internal-breadcrumb-link")
          const rgba = (color) => {
            const values = color.match(/[0-9.]+/g)?.slice(0, 3).map(Number)
            if (!values || values.length < 3) throw new Error("Cannot parse color: " + color)
            return values
          }
          const luminance = (color) => {
            const rgb = rgba(color).map((value) => {
              const n = value / 255
              return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4
            })
            return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
          }
          const ratio = (fg, bg) => {
            const a = luminance(fg), b = luminance(bg)
            return (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
          }
          const approximateHeroBg = theme === "dark" ? "rgb(5, 9, 24)" : "rgb(244, 247, 255)"
          const values = {
            current: ratio(getComputedStyle(current).color, approximateHeroBg),
            breadcrumb: ratio(getComputedStyle(crumbs).color, approximateHeroBg),
          }
          const actions = [...document.querySelectorAll(".swag-season-page a")].filter((el) =>
            ["swag-action-primary", "swag-action-outline", "swag-action-chip"].some((name) => el.classList.contains(name))
          )
          const actionResults = actions.map((a) => {
            const s = getComputedStyle(a)
            return {
              text: a.textContent.trim(),
              contrast: ratio(s.color, s.backgroundColor),
              color: s.color,
              bg: s.backgroundColor,
            }
          })
          return {
            theme: document.documentElement.classList.contains(theme),
            overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            values,
            actionResults,
          }
        }, theme)
        assert.equal(result.theme, true)
        assert.equal(result.overflow, false, `${route}/${theme}/${width}: horizontal overflow`)
        for (const [label, value] of Object.entries(result.values)) {
          assert.ok(value >= 4.5, `${route}/${theme}/${width}: ${label} contrast ${value.toFixed(2)}`)
        }
        for (const item of result.actionResults) {
          assert.ok(item.contrast >= 4.5, `${route}/${theme}/${width}: ${item.text} contrast ${item.contrast.toFixed(2)} between ${item.color} and ${item.bg}`)
        }
        if (route === "swag-drops/2026/") {
          assert.ok(result.actionResults.length >= 4, "Season page must expose reward buttons and detail chips")
        }
        scenarios++
      }
      await context.close()
    }
  }
  console.log(`Validated Swag dark/light contrast and responsive layout across ${scenarios} browser scenarios.`)
} finally {
  await browser.close()
  await server.close()
}
