/** Run against next start/dev or a static preview: UI_BASE_URL=http://... node scripts/verify-site-ui.mjs */
import assert from "node:assert/strict"
import { readFile, mkdir } from "node:fs/promises"
import { chromium } from "playwright"

const base = (process.env.UI_BASE_URL ?? "http://127.0.0.1:3086").replace(/\/$/, "")
const artifacts = process.env.UI_SCREENSHOT_DIR
const profileId = "11111111-2222-4333-8444-555555555555"
const fixture = {
  success: true,
  userDetails: [{ userName: "UI review", memberSince: "2024", points: "112" }],
  arcadePoints: { totalPoints: 112, gamePoints: 50, skillPoints: 42, triviaPoints: 20 },
  game: [{ title: "Arcade review badge", points: 50, dateEarned: "2026-09-29" }],
  skill: [{ title: "Skill review badge", points: 42, dateEarned: "2026-09-28" }],
  trivia: [{ title: "Trivia review badge", points: 20, dateEarned: "2026-09-27" }],
}
const tiers = [{points:120,slots:2500,spotsLeft:1361},{points:95,slots:3000,spotsLeft:671},{points:75,slots:4000,spotsLeft:1684},{points:50,slots:6000,spotsLeft:3719}]
const routes = ["/", "/about/", "/guide/", "/privacy/", "/terms/", "/swag-drops/", "/swag-drops/2025/", "/swag-drops/2026/", ...["trooper","ranger","champion","legend","arcade-backpack","weather-shield-jacket"].map(slug=>`/swag-drops/2026/${slug}/`), `/profile/?id=${profileId}`, "/profile/", "/widget/"]
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] })
const errors = []
let checks = 0
if (artifacts) await mkdir(artifacts, { recursive: true })

async function open(route, theme, locale, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  page.on("pageerror", error => errors.push(`${route}: ${error.message}`))
  await page.addInitScript(({ theme, locale }) => {
    localStorage.setItem("arcade-theme", theme)
    localStorage.setItem("arcade-widget-theme-v1", theme)
    localStorage.setItem("arcade-points-locale", locale)
  }, { theme, locale })
  await page.route("**/*", async r => {
    const url = new URL(r.request().url())
    if (url.href.includes("arcade_milestones.json")) return r.fulfill({ json: tiers })
    if (url.href.includes("arcade_milestones_history")) return r.fulfill({ status: 404, body: "" })
    if (url.hostname === "hub.eplus.dev") return r.fulfill({ json: fixture })
    if (url.origin === new URL(base).origin) return r.continue()
    return r.abort()
  })
  const response = await page.goto(base + route, { waitUntil: "domcontentloaded" })
  assert.equal(response?.status(), 200, route)
  const widget = route === "/widget/"
  await page.locator(widget ? ".arcade-widget-card" : ".site-header").waitFor()
  if (!widget) {
    const catalog = JSON.parse(await readFile(`public/i18n/locales/${locale}.json`, "utf8"))
    await page.locator(".site-header .arcade-nav a").first().filter({ hasText: catalog.messages.calculator }).waitFor({ state: "attached" })
    await page.locator(".website-theme-toggle").waitFor()
  }
  await page.waitForFunction(theme=>document.documentElement.classList.contains(theme),theme)
  await page.evaluate(async () => {
    await document.fonts.ready
    const bodyFamily=getComputedStyle(document.body).getPropertyValue('--font-arcade-body').trim().split(',')[0]
    await document.fonts.load(`400 16px ${bodyFamily}`, 'Việt')
    if (!document.fonts.check(`400 16px ${bodyFamily}`, 'Việt')) throw new Error('Local body font is not loaded')
  })
  // External requests are blocked above: icons must still have local glyphs.
  for (const selector of ['.fa-solid', '.fa-brands']) {
    const icon = page.locator(selector).first()
    if (await icon.count()) {
      const loaded = await icon.evaluate(async el => {
        const style = getComputedStyle(el, '::before')
        const font = `${style.fontWeight} 16px ${style.fontFamily}`
        const glyph = style.content.replace(/^['"]|['"]$/g, '')
        await document.fonts.load(font, glyph)
        return glyph !== 'none' && glyph.length > 0 && document.fonts.check(font, glyph)
      })
      assert.equal(loaded, true, `${route}: ${selector} glyph font unavailable`)
    }
  }
  if (await page.locator(".cookie-consent-close").count()) await page.locator(".cookie-consent-close").click()
  return page
}

try {
  for (const theme of ["dark", "light"]) for (const locale of ["en", "vi"]) for (const width of [390, 428, 1440]) {
    for (const original of routes) {
      const route = locale === "vi" && original === "/" ? "/vi/" : original
      const page = await open(route, theme, locale, width)
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth), true, `${route} ${width} overflow`)
      if (original === '/' && locale === 'en') {
        const headingFont = await page.locator('.hero-heading h1').evaluate(async el => {
          const family=getComputedStyle(el).fontFamily.split(',')[0]
          await document.fonts.load(`400 26px ${family}`, 'ARCADE')
          return {family,loaded:document.fonts.check(`400 26px ${family}`, 'ARCADE')}
        })
        assert.ok(headingFont.family.includes('arcadePixel'),headingFont.family)
        assert.equal(headingFont.loaded,true)
        if (width === 390) {
          const layout = await page.evaluate(() => {
            const heading=document.querySelector('.hero-heading h1')
            const pills=[...document.querySelectorAll('.trust-pills span')].map(el=>el.getBoundingClientRect())
            return {fontSize:parseFloat(getComputedStyle(heading).fontSize),lineHeight:parseFloat(getComputedStyle(heading).lineHeight),pillsSameRow:Math.abs(pills[0].top-pills[1].top)<1,headerRadius:getComputedStyle(document.querySelector('.site-header')).borderRadius,formBefore:getComputedStyle(document.querySelector('.profile-analyzer-card'),'::before').content}
          })
          assert.ok(Math.abs(layout.fontSize-35.1)<.1,JSON.stringify(layout))
          assert.ok(Math.abs(layout.lineHeight/layout.fontSize-1.28)<.01)
          assert.equal(layout.pillsSameRow,true)
          assert.equal(layout.headerRadius,'0px')
          assert.ok(['none','normal'].includes(layout.formBefore))
        }
      }
      const primary = page.locator(route === '/widget/' ? '.arcade-widget-form button[type="submit"]' : '.analyze-button')
      if (await primary.count()) {
        const contrast = await primary.evaluate(el => {
          const style = getComputedStyle(el)
          const luminance = color => {
            const values = color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
            return values[0]*.2126+values[1]*.7152+values[2]*.0722
          }
          const a=luminance(style.color), b=luminance(style.backgroundColor)
          return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)
        })
        assert.ok(contrast>=4.5, `${route}: primary button text contrast ${contrast}`)
      }
      if (route !== "/widget/") {
        assert.equal(await page.locator(".site-header").count(), 1, route)
        assert.equal(await page.locator(".site-footer").count(), 1, route)
        if (width === 390) {
          const toggle = page.locator(".mobile-menu-toggle")
          await toggle.click()
          await page.locator(".arcade-nav.is-open").waitFor()
          await page.keyboard.press("Escape")
          assert.equal(await toggle.getAttribute("aria-expanded"), "false")
          assert.equal(await toggle.evaluate(el=>el===document.activeElement),true)
        }
        const colors = await page.locator(".site-header").evaluate(el => ({ background:getComputedStyle(el).backgroundColor, surface:getComputedStyle(document.documentElement).getPropertyValue("--ui-surface") }))
        assert.ok(colors.surface && colors.background !== "rgba(0, 0, 0, 0)")
      }
      if (artifacts && locale === "en" && [390,428].includes(width) && ["/","/about/","/swag-drops/2026/","/widget/",`/profile/?id=${profileId}`].includes(route)) {
        await page.screenshot({ path: `${artifacts}/${route.split("/").filter(Boolean).join("-").replace(/[?=]/g,"-") || "home"}-${width}-${theme}.png`, fullPage:true })
      }
      checks++
      await page.close()
    }
    console.log(`PASS routes: ${theme}, ${locale}, ${width}px`)
  }
  // Data-bearing calculator shares tier markup with the guest and adds one current marker.
  const page = await open("/", "dark", "en", 390)
  await page.locator('.profile-input input').fill(`https://www.skills.google/public_profiles/${profileId}`)
  await page.locator('.analyze-button').click()
  await page.locator('.profile-panel').waitFor()
  assert.equal(await page.locator('.guest-tier-card[aria-current]').count(),1)
  await page.locator('.tier-trends-trigger').click()
  await page.locator('[role="dialog"]').waitFor()
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  await page.keyboard.press('Escape')
  await page.locator('[role="dialog"]').waitFor({state:'hidden'})
  if (await page.locator('.facilitator-launcher').count()) {
    await page.locator('.analyzer-facilitator-option').first().click()
    await page.locator('.facilitator-launcher').waitFor()
    const launcherBounds = await page.locator('.facilitator-launcher').boundingBox()
    const submitBounds = await page.locator('.analyze-button').boundingBox()
    assert.ok(launcherBounds.y >= submitBounds.y + submitBounds.height, 'Facilitator launcher overlaps Analyze')
    assert.equal(await page.locator('.facilitator-launcher').evaluate(el=>getComputedStyle(el).position),'static')
    await page.locator('.facilitator-launcher').click()
    await page.locator('.facilitator-drawer').waitFor()
    await page.keyboard.press('Escape')
    await page.locator('.facilitator-drawer').waitFor({state:'hidden'})
  }
  await page.close()
  const privacy = await open('/privacy/', 'light', 'vi', 390)
  await privacy.locator('.cookie-preferences-trigger').click()
  if (await privacy.locator('.cookie-consent-card').count()) {
    await privacy.locator('.cookie-consent-detail-button').click()
    await privacy.locator('.cookie-consent-details').waitFor()
    assert.equal(await privacy.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
    await privacy.locator('.cookie-consent-close').click()
    await privacy.locator('.cookie-consent-card').waitFor({state:'hidden'})
  }
  await privacy.close()
  const rtl = await open('/ar/', 'dark', 'ar', 320)
  assert.equal(await rtl.locator('html').getAttribute('dir'), 'rtl')
  assert.equal(await rtl.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), true)
  await rtl.close()
  const moved = await browser.newPage()
  await moved.goto(base+'/changelog/')
  await moved.waitForURL(base+'/guide/')
  await moved.close()
  const error = await browser.newPage({viewport:{width:390,height:900}})
  await error.goto(base+'/missing-ui-review-route/')
  await error.locator('.site-header').waitFor()
  assert.equal(await error.locator('.site-surface').count(),1)
  assert.equal(await error.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  await error.close()
  for (const width of [320,768]) {
    const page = await open('/vi/', 'light','vi',width)
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
    await page.close()
  }
  assert.deepEqual(errors, [])
  console.log(`PASS ${checks} route/theme/locale/viewport combinations, calculator profile, modal, keyboard navigation, 320/768px layout`)
} finally { await browser.close() }
