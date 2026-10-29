import assert from "node:assert/strict"
import { chromium } from "playwright"
import fs from "node:fs/promises"
import { startStaticServer } from "./serve-static.mjs"
import { evaluateTypeScript, readRepoFile } from "../tests/helpers/typescript-source.mjs"
const { PREVIEW_DEBUG_PROFILE_RESULT: fixture, PREVIEW_DEBUG_PROFILE_URL: profileUrl } = evaluateTypeScript(readRepoFile("components/arcade/preview-debug-profile.ts"))
const result = { ...fixture, userDetails: [{ userName: "Hoàng Minh" }], arcadePoints: { ...fixture.arcadePoints, totalPoints: 93.5 }, faciCounts: { faciGame: 12, faciSkill: 66 } }
const snapshot = { profileUrl, result, checkedAt: "2026-10-29T07:30:00.000Z" }
const server = await startStaticServer()
const browser = await chromium.launch()
const screenshots = process.env.HOME_SUMMARY_SCREENSHOTS
if (screenshots) await fs.mkdir(screenshots, { recursive: true })
let cases = 0
try {
 for (const locale of ["en", "vi", "de", "ar"]) for (const theme of ["dark", "light"]) for (const width of [320, 390, 768, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  const catalogs = JSON.parse(readRepoFile(`public/i18n/locales/${locale}.json`))
  let scoreRequests = 0
  await page.route("https://**/*", route => { if (route.request().url().includes("/api/arcade")) scoreRequests++; return route.abort() })
  await page.addInitScript(({ snapshot, locale, theme }) => {
    localStorage.setItem("arcade-points-locale", locale)
    localStorage.setItem("arcade-theme", theme)
    localStorage.setItem("eplus-arcade-dashboard-v1", JSON.stringify(snapshot))
    localStorage.setItem(`arcade-facilitator-participation-v1:${snapshot.profileUrl}`, "true")
  }, { snapshot, locale, theme })
  await page.goto(`${server.url}${locale === "en" ? "" : locale + "/"}`)
  const summary = page.locator(".home-profile-summary")
  await summary.waitFor()
  assert.equal(await summary.locator(".home-profile-identity strong").innerText(), "Hoàng Minh")
  assert.equal(await summary.locator(".home-profile-points strong").innerText(), new Intl.NumberFormat(locale).format(128.5))
  assert.equal(await summary.locator(".home-profile-tier strong").innerText(), "Legend")
  assert.equal(await summary.locator(".home-profile-tier small").innerText(), catalogs.messages.homeScoreTier)
  assert.equal(await summary.locator("a").innerText(), catalogs.messages.homeOpenDashboard)
  const geometry = await summary.evaluate(el => {
    const box = selector => el.querySelector(selector).getBoundingClientRect()
    return { overflow: document.documentElement.scrollWidth > innerWidth + 1, height: el.getBoundingClientRect().height, identity: box('.home-profile-identity').top, points: box('.home-profile-points').top, tier: box('.home-profile-tier').top, action: box('a').top }
  })
  assert.equal(geometry.overflow, false, `${locale}/${width} overflows`)
  assert.ok(geometry.height < (width > 900 ? 140 : 220), `${locale}/${width} summary too tall`)
  if (width <= 900) assert.ok(geometry.tier > geometry.identity && Math.abs(geometry.tier - geometry.action) < 25, 'Mobile uses two rows')
  assert.equal(scoreRequests, 0, 'Home must not request personal scores')
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('eplus-arcade-dashboard-v1'))), snapshot)
  if (screenshots && ["en", "vi"].includes(locale) && [390, 1440].includes(width)) await summary.screenshot({ path: `${screenshots}/${locale}-${theme}-${width}.png` })
  if (locale === "vi" && theme === "dark" && width === 1440) {
    await summary.locator('a').click()
    await page.locator('.profile-panel').waitFor()
    assert.equal(await page.locator('.points-total strong').first().innerText(), '128,5')
    assert.equal(scoreRequests, 0, 'Opening saved Dashboard must reuse the snapshot')
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('eplus-arcade-dashboard-v1')).checkedAt), snapshot.checkedAt)
  }
  await page.close(); cases++
 }
 // No snapshot, corrupt data and unavailable storage must leave Home usable.
 for (const saved of [null, '{broken', JSON.stringify({ ...snapshot, result: { success: false } }), JSON.stringify({...snapshot, result:{success:true,arcadePoints:{totalPoints:-1}}})]) {
  const page=await browser.newPage()
  await page.route('https://**/*',r=>r.abort())
  await page.addInitScript(saved=>{ if(saved) localStorage.setItem('eplus-arcade-dashboard-v1',saved) },saved)
  await page.goto(server.url); await page.locator('.profile-input input').waitFor()
  assert.equal(await page.locator('.home-profile-summary').count(),0)
  await page.close()
 }
 const legacy=await browser.newPage();await legacy.route('https://**/*',r=>r.abort())
 await legacy.addInitScript(({profileUrl})=>localStorage.setItem('eplus-arcade-dashboard-v1',JSON.stringify({profileUrl,result:{success:true,arcadePoints:{totalPoints:0}}})),{profileUrl})
 await legacy.goto(server.url);await legacy.locator('.home-profile-summary').waitFor()
 assert.equal(await legacy.locator('.home-profile-points strong').innerText(),'0')
 assert.equal(await legacy.locator('.home-profile-identity small').innerText(),JSON.parse(readRepoFile('public/i18n/locales/en.json')).messages.homeSavedResult)
 await legacy.evaluate(()=>{localStorage.removeItem('eplus-arcade-dashboard-v1');window.dispatchEvent(new StorageEvent('storage',{key:'eplus-arcade-dashboard-v1'}))})
 await legacy.locator('.home-profile-summary').waitFor({state:'detached'});await legacy.close()
 const page=await browser.newPage();await page.route('https://**/*',r=>r.abort())
 await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Unavailable')}}))
 await page.goto(server.url);await page.locator('.profile-input input').waitFor();assert.equal(await page.locator('.home-profile-summary').count(),0);await page.close()
 console.log(`Home saved profile passed: ${cases} locale/theme/viewport cases; cached Dashboard handoff, timestamp and invalid/storage cases.`)
} finally { await browser.close(); await server.close() }
