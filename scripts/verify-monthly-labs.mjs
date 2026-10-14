import assert from "node:assert/strict"
import { readFile, mkdir } from "node:fs/promises"
import { chromium } from "playwright"
const base = (process.env.UI_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "")
const snapshot = JSON.parse(await readFile("data/monthly-labs.json", "utf8"))
const september = snapshot.months["2026-09"]
const example = september.find(lab => lab.joinUrl?.includes("/games/7441"))
assert.ok(example)
const browser = await chromium.launch({ headless: true, channel: "chrome" })
const errors = []
let checks = 0
await mkdir("screenshots", { recursive: true })
try {
  for (const locale of ["en", "vi"]) for (const theme of ["dark", "light"]) for (const width of [320, 390, 1440]) {
    const catalog = JSON.parse(await readFile(`public/i18n/locales/${locale}.json`, "utf8"))
    const context = await browser.newContext({ viewport: { width, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] })
    await context.addInitScript(({ locale, theme }) => {
      localStorage.setItem("arcade-points-locale", locale)
      localStorage.setItem("arcade-theme", theme)
    }, { locale, theme })
    const page = await context.newPage()
    page.on("pageerror", error => errors.push(error.message))
    await page.route("**/*", r => new URL(r.request().url()).origin === new URL(base).origin ? r.continue() : r.abort())
    for (const path of ["/monthly-labs/", "/monthly-labs/2026/09/", "/monthly-labs/2026/09/game-7441/"]) {
      const response = await page.goto(base + path, { waitUntil: "domcontentloaded" })
      assert.equal(response.status(), 200, path)
      await page.waitForFunction(locale => document.documentElement.dataset.locale === locale, locale)
      await page.getByRole("navigation", { name: catalog.messages.labBreadcrumb }).waitFor()
      await page.waitForFunction(theme => document.documentElement.classList.contains(theme), theme)
      assert.equal(await page.locator("h1").count(), 1)
      if (path === "/monthly-labs/") {
        await page.locator("h1").filter({ hasText: catalog.messages.monthlyLabs }).waitFor()
        assert.equal(await page.locator(".monthly-lab-month-card").count(), Object.keys(snapshot.months).length)
      } else if (path.endsWith("/09/")) {
        assert.equal(await page.locator(".monthly-lab-game-card").count(), september.length)
        await page.locator(".monthly-lab-game-card").filter({ hasText: catalog.messages.labDetails }).first().waitFor()
      } else {
        assert.equal(await page.locator("h1").innerText(), example.title)
        await page.locator(".monthly-lab-status").filter({ hasText: catalog.messages.labArchived }).waitFor()
        assert.equal(await page.locator("code").innerText(), example.accessCode)
        assert.equal(await page.locator("time").getAttribute("datetime"), example.deadline)
        await page.getByRole("button", { name: catalog.additional["__monthlyGames:copyAccessCode"] }).click()
        assert.equal(await page.evaluate(() => navigator.clipboard.readText()), example.accessCode)
        assert.equal(await page.getByRole("link", { name: catalog.additional["__monthlyGames:openGame"], exact: true }).count(), 0)
      }
      await page.evaluate(() => document.fonts.ready)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${path} ${locale} ${theme} ${width} overflow`)
      if (width === 390) await page.screenshot({ path: `screenshots/monthly-labs-${locale}-${theme}-${path.endsWith("game-7441/") ? "detail" : path.endsWith("09/") ? "month" : "archive"}.png`, fullPage: true })
      checks++
    }
    await context.close()
  }
  const page = await browser.newPage()
  for (const path of ["/monthly-labs/2026/13/", "/monthly-labs/2026/09/missing-lab/"]) assert.equal((await page.goto(base + path)).status(), 404)
  await page.close()
  assert.deepEqual(errors, [])
  console.log(`Monthly Labs: ${checks} route/locale/theme/viewport checks, clipboard and 404 checks passed.`)
} finally { await browser.close() }
