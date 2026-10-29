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
      for (const width of [320, 390, 768, 1024, 1440]) {
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
          const historyMonth = url.match(/arcade_monthly_games_history\/\d{4}\/(\d{2})\.json/)
          if (historyMonth) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ title: `Browser history ${historyMonth[1]}`, points: 1, status: "game_over" }]) })
          if (url.includes("/api/arcade") && route.request().method() === "POST") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(result) })
          return route.abort()
        })
        await page.goto(`${server.url}${locale === "en" ? "" : `${locale}/`}`)
        await page.locator(".guest-dashboard .monthly-game-card").first().waitFor({ state: "visible" })
        await page.waitForFunction((label) => document.querySelector(".hero-heading h1")?.textContent.includes(label), catalog.messages.heroTitleTop)
        assert.equal(await page.locator(".monthly-game-card").count(), 6)
        assert.equal(await page.locator(".monthly-game-status").count(), 0)
        assert.equal(await page.locator(".profile-input input").inputValue(), "")
        assert.equal(await page.locator(".analyzer-help-row button").count(), 0)
        for (const label of await page.locator(".tier-list-row > div:nth-child(2) strong").all()) {
          assert.ok(await label.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), "Tier name is clipped")
          assert.ok(await label.evaluate((el) => el.closest(".tier-list-row").querySelector(".tier-list-icon").getBoundingClientRect().right <= el.getBoundingClientRect().left), "Tier icon overlaps name")
        }
        const geometry = await page.evaluate(() => {
          const labs = document.querySelector(".guest-dashboard .monthly-games-host").getBoundingClientRect()
          const tiers = document.querySelector(".guest-dashboard .tier-list-panel").getBoundingClientRect()
          const extension = document.querySelector(".extension-strip").getBoundingClientRect()
          const hero = document.querySelector(".arcade-hero").getBoundingClientRect()
          return { overflow: document.documentElement.scrollWidth > innerWidth + 1, labs: { top: labs.top, bottom: labs.bottom, right: labs.right }, tiers: { top: tiers.top, bottom: tiers.bottom, left: tiers.left }, extension: extension.top, heroHeight: hero.height }
        })
        assert.equal(geometry.overflow, false, `${locale}/${theme}/${width}: horizontal overflow`)
        assert.ok(geometry.tiers.bottom <= geometry.labs.top)
        if (width > 1100) {
          assert.ok(geometry.heroHeight < 440, `${locale}/${theme}: entry hero height ${geometry.heroHeight}`)
          const rows = await page.locator(".guest-dashboard .tier-list-row").evaluateAll(elements => elements.map(el => el.getBoundingClientRect().top))
          assert.ok(rows.every(top => Math.abs(top - rows[0]) < 2), "Desktop tier overview must fit on one row")
        }
        assert.ok(geometry.extension < geometry.tiers.top)
        const sharedAppearance = () => page.evaluate(() => {
          const selectors = [".arcade-hero", ".hero-heading h1", ".profile-analyzer-card", ".monthly-games-grid", ".monthly-game-card"]
          return selectors.map(selector => {
            const style = getComputedStyle(document.querySelector(selector))
            return [style.width, style.fontSize, style.padding, style.borderRadius, style.gridTemplateColumns]
          })
        })
        const guestAppearance = await sharedAppearance()
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
        assert.ok(new URL(page.url()).pathname.endsWith("/dashboard/"))
        assert.equal(await page.locator(".monthly-game-card").count(), 0)
        // Core profile controls, point composition and reward availability stay visible.
        assert.equal(await page.locator('.dashboard-analyzer details, .breakdown-panel details, .tier-status-panel details').count(), 0)
        for (const selector of ['.profile-input input', '.point-compact-list', '.allocation-message']) {
          assert.equal(await page.locator(selector).isVisible(), true, `${selector} must not require expansion`)
        }
        const profileWidth = await page.locator('.profile-name-block').evaluate(el => el.getBoundingClientRect().width)
        assert.ok(profileWidth >= 120, `Profile name is squeezed into ${profileWidth}px at ${width}px`)
        assert.equal(await page.locator('.facilitator-summary-panel').count(), 0, 'Bonus must not duplicate the score breakdown')
        if (width >= 768) {
          const panels = await page.locator('.breakdown-panel, .tier-status-panel').evaluateAll(elements => elements.map(el => { const box = el.getBoundingClientRect(); return { top: box.top, height: box.height } }))
          assert.ok(Math.abs(panels[0].top - panels[1].top) <= 1, 'Score and tier must share a row')
          assert.ok(Math.abs(panels[0].height - panels[1].height) <= 1, 'Summary cards must have balanced heights')
        }
        const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("eplus-arcade-dashboard-v1")))
        assert.equal(stored.profileUrl, profileUrl)
        if (locale === "en" && theme === "dark" && width === 1440) {
          await page.reload()
          await page.locator(".profile-panel").waitFor({ state: "visible" })
          assert.equal(await page.locator(".profile-input input").inputValue(), profileUrl)
        }
        // Desktop uses hover without stealing focus; mobile only opens a modal sheet on tap.
        if (locale === "en" && theme === "dark" && [390, 1440].includes(width)) {
          const trigger = page.locator(".point-history-trigger")
          const pointCard = page.locator(".breakdown-panel")
          await trigger.scrollIntoViewIfNeeded()
          await page.locator(".point-history-count strong").waitFor({ state: "visible" })
          const heightBefore = await pointCard.evaluate((el) => el.getBoundingClientRect().height)
          if (width === 1440) {
            await page.evaluate(() => {
              window.__focusedBeforeHistoryHover = document.activeElement
              window.__historyFirstPosition = null
              // Observe the FIRST DOM insertion, before any post-mount effect
              // could move the portal from an incorrect placeholder position.
              const observer = new MutationObserver(() => {
                const popup = document.querySelector(".point-history-popover")
                if (!popup || window.__historyFirstPosition) return
                const trigger = document.querySelector(".point-history-trigger").getBoundingClientRect()
                const width = Math.min(380, innerWidth - 24)
                window.__historyFirstPosition = {
                  actualLeft: Number.parseFloat(popup.style.left),
                  expectedLeft: Math.max(12, Math.min(trigger.right - width, innerWidth - width - 12)),
                }
                observer.disconnect()
              })
              observer.observe(document.body, { childList: true, subtree: true })
            })
            await page.locator(".point-history-label").hover()
            await page.locator(".point-history-popover").waitFor({ state: "visible" })
            const firstPosition = await page.evaluate(() => window.__historyFirstPosition)
            assert.ok(firstPosition, "First popup insertion must have a measured position")
            assert.ok(Math.abs(firstPosition.actualLeft - firstPosition.expectedLeft) <= 1,
              `Initial popup jumped from ${firstPosition.actualLeft}px instead of opening at ${firstPosition.expectedLeft}px`)
            assert.equal(await page.evaluate(() => document.activeElement === window.__focusedBeforeHistoryHover), true, "Desktop hover must not steal keyboard focus")
            await page.locator(".point-history-popover .point-comparison-stats").hover()
            await page.waitForTimeout(250)
            assert.equal(await page.locator(".point-history-popover").count(), 1, "Hover card should stay open when pointer crosses to the popover")
            await page.locator(".profile-panel").hover()
            await page.locator(".point-history-popover").waitFor({ state: "detached", timeout: 2000 })
          } else {
            await trigger.hover()
            assert.equal(await page.locator(".point-history-popover").count(), 0, "Mobile hover must not open the sheet")
            await trigger.click()
            await page.locator(".point-history-popover").waitFor({ state: "visible" })
            assert.equal(await page.locator(".point-history-popover").getAttribute("aria-modal"), "true")
            assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden")
            const sheet = page.locator(".point-history-popover")
            const details = sheet.locator(".point-history-explanation")
            const collapsed = await details.evaluate(el => el.open)
            assert.equal(collapsed, false, "long explanatory copy is collapsed by default")
            const fit = await sheet.evaluate(el => {
              const outer = el.getBoundingClientRect()
              const header = el.querySelector(".point-history-popover-header").getBoundingClientRect()
              const body = el.querySelector(".point-history-popover-body")
              return {
                top: outer.top,
                bottom: outer.bottom,
                maxHeight: outer.height,
                closeVisible: header.top >= outer.top && header.bottom <= outer.bottom,
                scrolling: getComputedStyle(body).overflowY === "auto",
                viewport: window.innerHeight,
              }
            })
            assert.ok(fit.top > 0 && fit.bottom <= fit.viewport - 8, "mobile published-games sheet stays within the viewport")
            assert.ok(fit.closeVisible && fit.scrolling, "mobile published-games detail sheet has a usable inner scroll")
            await details.locator("summary").click()
            assert.equal(await details.evaluate(el => el.open), true)
            const scroll = await sheet.locator(".point-history-popover-body").evaluate(el => {
              const available = el.scrollHeight - el.clientHeight
              el.scrollTop = el.scrollHeight
              return { available, actual: el.scrollTop }
            })
            if (scroll.available > 1) assert.ok(scroll.actual > 0, "expanded explanations must scroll")
            assert.equal(await page.locator(".point-history-close").isVisible(), true, "close control stays visible after scrolling")
            await page.locator(".point-history-close").click()
            await page.locator(".point-history-popover").waitFor({ state: "detached" })
            assert.equal(await page.evaluate(() => document.body.style.overflow), "")
          }
          const heightAfter = await pointCard.evaluate((el) => el.getBoundingClientRect().height)
          assert.ok(Math.abs(heightAfter - heightBefore) <= 1, "Hover/tap history must not resize the point card")
        }
        if (await page.locator(".preview-mode-toolbar").count()) {
          await page.locator(".dashboard-view-switch button").first().click()
          await page.locator(".guest-dashboard").waitFor({ state: "visible" })
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
