import assert from "node:assert/strict"
import fs from "node:fs/promises"
import { chromium } from "playwright"
import { startStaticServer } from "./serve-static.mjs"
import { evaluateTypeScript, readRepoFile } from "../tests/helpers/typescript-source.mjs"

const { PREVIEW_DEBUG_PROFILE_RESULT: result, PREVIEW_DEBUG_PROFILE_URL: profileUrl } = evaluateTypeScript(readRepoFile("components/arcade/preview-debug-profile.ts"))
const titles = ["Arcade Voyage: Language, Voice, and Multimodal Processing", "Arcade Trail: Containers & Load Balancing", "Arcade Base Camp October 2026", "Arcade Adventure: Google Cloud ML APIs", "Arcade Simulator: Site Reliability Engineer", "Trick-or-Metric"]
const games = titles.map((title, i) => ({ title, accessCode: `1q-browser-regression-${i}`, points: 1, spotsRemaining: 2500, description: "Explore Google Cloud with hands-on labs covering infrastructure, observability, containers and application development.", joinUrl: "https://www.skills.google/games/7441", deadline: new Date(Date.now() + 7 * 86400_000).toISOString(), deadlineTimeZone: "Asia/Kolkata" }))
const server = await startStaticServer({ basePath: process.env.HALLOWEEN_BASE_PATH ?? "" })
const screenshots = process.env.GUEST_SCREENSHOTS
let browser
let cases = 0
try {
  browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) })
  if (screenshots) await fs.mkdir(screenshots, { recursive: true })
  for (const locale of ["en", "vi", "de"]) {
    const catalog = JSON.parse(readRepoFile(`public/i18n/locales/${locale}.json`))
    for (const theme of ["dark", "light"]) {
      for (const width of [320, 390, 1440]) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, locale, permissions: ["clipboard-read", "clipboard-write"] })
        await context.addInitScript(({ theme, locale }) => {
          localStorage.setItem("arcade-theme", theme)
          localStorage.setItem("arcade-points-locale", locale)
          localStorage.setItem("arcade-seasonal-theme", "halloween")
          if (!localStorage.getItem("eplus-arcade-dashboard-view-mode-v1")) localStorage.setItem("eplus-arcade-dashboard-view-mode-v1", "guest")
        }, { theme, locale })
        const page = await context.newPage()
        let feedFailed = false
        await page.route("https://**/*", (route) => {
          const url = route.request().url()
          if (url.includes("arcade_monthly_games.json")) return route.fulfill({ status: feedFailed ? 503 : 200, contentType: "application/json", body: JSON.stringify(games) })
          if (url.includes("/api/arcade") && route.request().method() === "POST") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(result) })
          return route.abort()
        })
        await page.goto(`${server.url}${locale === "en" ? "" : `${locale}/`}`)
        await page.locator(".guest-discovery-grid .monthly-game-card").first().waitFor({ state: "visible" })
        await page.waitForFunction((label) => document.querySelector(".hero-heading h1")?.textContent.includes(label), catalog.messages.guestHeroTop)
        assert.equal(await page.locator(".monthly-game-card").count(), 6)
        assert.equal(await page.locator(".monthly-game-status").count(), 0)
        assert.equal(await page.locator(".profile-input input").inputValue(), "")
        assert.equal(await page.locator(".analyzer-help-row button").count(), 0)
        const geometry = await page.evaluate(() => {
          const labs = document.querySelector(".guest-labs-host").getBoundingClientRect()
          const tiers = document.querySelector(".guest-discovery-grid .tier-list-panel").getBoundingClientRect()
          const extension = document.querySelector(".extension-strip").getBoundingClientRect()
          const hero = document.querySelector(".arcade-hero").getBoundingClientRect()
          return { overflow: document.documentElement.scrollWidth > innerWidth + 1, labs: { top: labs.top, bottom: labs.bottom, right: labs.right }, tiers: { top: tiers.top, bottom: tiers.bottom, left: tiers.left }, extension: extension.top, heroHeight: hero.height }
        })
        assert.equal(geometry.overflow, false, `${locale}/${theme}/${width}: horizontal overflow`)
        if (width > 1000) assert.ok(geometry.labs.right <= geometry.tiers.left && Math.abs(geometry.labs.top - geometry.tiers.top) <= 2)
        else assert.ok(geometry.labs.bottom <= geometry.tiers.top)
        assert.ok(geometry.extension >= Math.max(geometry.labs.bottom, geometry.tiers.bottom))
        assert.ok(geometry.heroHeight < (width > 1000 ? 400 : 650), `${locale}: oversized guest hero`)
        await page.locator(".monthly-copy-button").first().click()
        assert.equal(await page.evaluate(() => navigator.clipboard.readText()), games[0].accessCode)
        if (screenshots && locale !== "de") {
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
          await page.screenshot({ path: `${screenshots}/${locale}-${theme}-${width}.png`, fullPage: true })
        }
        // Successful analysis leaves discovery and renders the real profile dashboard.
        await page.locator(".profile-input input").fill(profileUrl)
        await page.locator(".analyze-button").click()
        await page.locator(".profile-panel").waitFor({ state: "visible" })
        const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("eplus-arcade-dashboard-v1")))
        assert.equal(stored.profileUrl, profileUrl)
        if (locale === "en" && theme === "dark" && width === 1440) {
          await page.reload()
          await page.locator(".profile-panel").waitFor({ state: "visible" })
          assert.equal(await page.locator(".profile-input input").inputValue(), profileUrl)
        }
        if (await page.locator(".preview-mode-toolbar").count()) {
          await page.locator(".dashboard-view-switch button").first().click()
          await page.locator(".guest-discovery-grid").waitFor({ state: "visible" })
          assert.equal(await page.locator(".profile-input input").inputValue(), "")
          assert.equal(await page.locator(".analyzer-help-row button").count(), 0)
          assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("eplus-arcade-dashboard-v1")).profileUrl), profileUrl)
          await page.locator(".dashboard-view-switch button").last().click()
          await page.locator(".profile-panel").waitFor({ state: "visible" })
          assert.equal(await page.locator(".profile-input input").inputValue(), profileUrl)
        }
        await context.close()
        cases++
      }
    }
  }
  // A failed feed leaves an actionable panel instead of an empty discovery column.
  const page = await browser.newPage()
  await page.addInitScript(() => {
    localStorage.setItem("eplus-arcade-dashboard-view-mode-v1", "guest")
    localStorage.setItem("arcade-points-locale", "en")
  })
  let failed = true
  await page.route("https://**/*", (route) => route.request().url().includes("arcade_monthly_games.json") ? route.fulfill({ status: failed ? 503 : 200, contentType: "application/json", body: JSON.stringify(games) }) : route.abort())
  await page.goto(server.url)
  await page.locator(".monthly-games-load-error").waitFor({ state: "visible" })
  failed = false
  await page.locator(".monthly-games-load-error button").click()
  await page.locator(".monthly-game-card").first().waitFor({ state: "visible" })
  assert.equal(await page.locator(".monthly-game-card").count(), 6)
  console.log(`Guest discovery passed: ${cases} locale/theme/viewport combinations, access-code copy, profile analysis, privacy and feed retry.`)
} finally {
  await browser?.close()
  await server.close()
}
