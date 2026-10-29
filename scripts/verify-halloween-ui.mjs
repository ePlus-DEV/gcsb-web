import assert from "node:assert/strict"
import fs from "node:fs/promises"
import { chromium } from "playwright"
import { evaluateTypeScript, readRepoFile } from "../tests/helpers/typescript-source.mjs"
import { startStaticServer } from "./serve-static.mjs"

const server = process.env.HALLOWEEN_TEST_URL ? null : await startStaticServer({ directory: process.env.HALLOWEEN_STATIC_DIR ?? "out", basePath: process.env.HALLOWEEN_BASE_PATH ?? "" })
const base = (process.env.HALLOWEEN_TEST_URL ?? server.url).replace(/\/?$/, "/")
const screenshots = process.env.HALLOWEEN_SCREENSHOTS
const { PREVIEW_DEBUG_PROFILE_RESULT: result, PREVIEW_DEBUG_PROFILE_URL: profileUrl } = evaluateTypeScript(readRepoFile("components/arcade/preview-debug-profile.ts"))
let browser
if (screenshots) await fs.mkdir(screenshots, { recursive: true })
let cases = 0
try {
  browser = await chromium.launch({
    ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}),
  })
  // Direct Dashboard guest visits must not inherit Home's artwork cards.
  for (const locale of ["en", "vi"]) for (const theme of ["dark", "light"]) for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()
    await page.addInitScript(({ locale, theme }) => {
      localStorage.setItem("arcade-points-locale", locale)
      localStorage.setItem("arcade-theme", theme)
    }, { locale, theme })
    await page.route("https://**/*", route => route.abort())
    await page.goto(`${base}${locale === "en" ? "" : `${locale}/`}dashboard/`)
    await page.locator(".dashboard-guest-start .tier-list-row").first().waitFor()
    assert.equal(await page.locator(".dashboard-guest-start .tier-list-row").count(), 4)
    assert.equal(await page.locator(".dashboard-guest-start .tier-reward-art").count(), 0)
    assert.equal(await page.locator(".dashboard-start-description").isVisible(), true)
    assert.equal(await page.locator(".dashboard-page-title").isVisible(), true)
    assert.equal(await page.locator(".halloween-edition").count(), 0, "Dashboard must not contain a promotional seasonal label")
    const geometry = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      formWidth: document.querySelector(".dashboard-analyzer").getBoundingClientRect().width,
      formLeft: document.querySelector(".dashboard-analyzer").getBoundingClientRect().left,
      tierWidth: document.querySelector(".dashboard-guest-start").getBoundingClientRect().width,
      tierLeft: document.querySelector(".dashboard-guest-start").getBoundingClientRect().left,
      heights: [...document.querySelectorAll(".dashboard-guest-start .tier-list-row")].map(el => el.getBoundingClientRect().height),
    }))
    // Compare the history trigger and portaled dialog with Arcade theme tokens,
    // including light mode and the active seasonal palette.
    const trigger = page.locator(".dashboard-guest-start .tier-trends-trigger")
    await trigger.waitFor({ state: "visible" })
    const cookie = page.locator(".cookie-consent-button")
    await cookie.waitFor({ state: "visible", timeout: 1500 }).catch(() => {})
    if (await cookie.isVisible()) await cookie.click()
    await trigger.click()
    const modal = page.locator('[role="dialog"].tier-trends-dialog')
    await modal.waitFor({ state: "visible" })
    const historyColors = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement)
      const main = document.querySelector(".dashboard-guest-start .tier-trends-trigger")
      const dialog = document.querySelector(".tier-trends-dialog")
      const token = key => root.getPropertyValue(key).trim()
      return {
        triggerBackground: getComputedStyle(main).backgroundColor,
        dialogBackground: getComputedStyle(dialog).backgroundColor,
        expectedTrigger: token("--slot-history-raised"),
        expectedDialog: token("--slot-history-surface"),
        dialogText: getComputedStyle(dialog).color,
      }
    })
    const toRgb = hex => {
      const n = hex.replace("#", "")
      return "rgb(" + [0, 2, 4].map(i => Number.parseInt(n.slice(i, i + 2), 16)).join(", ") + ")"
    }
    assert.equal(historyColors.triggerBackground, toRgb(historyColors.expectedTrigger), theme + ": history trigger follows Arcade palette")
    assert.equal(historyColors.dialogBackground, toRgb(historyColors.expectedDialog), theme + ": portaled history dialog follows Arcade palette")
    await page.keyboard.press("Escape")
    await modal.waitFor({ state: "hidden" })
    assert.equal(geometry.overflow, false)
    assert.ok(geometry.formWidth <= 1200, "Guest Dashboard matches the shared content width")
    assert.ok(Math.abs(geometry.formWidth - geometry.tierWidth) <= 2, "Guest form and tiers have matching width")
    assert.ok(Math.abs(geometry.formLeft - geometry.tierLeft) <= 2, "Guest form and tiers align on the same grid")
    assert.ok(geometry.heights.every(height => height < 180), "Guest cards must not reserve empty artwork space")
    if (screenshots) await page.screenshot({path: `${screenshots}/dashboard-guest-${locale}-${theme}-${width}.png`, fullPage: true})
    await context.close()
    cases++
  }
  for (const locale of ["en", "vi"]) {
    const catalog = JSON.parse(readRepoFile(`public/i18n/locales/${locale}.json`))
    for (const theme of ["dark", "light"]) {
      for (const width of [320, 390, 1440]) {
        for (const state of ["empty", "profile"]) {
          const context = await browser.newContext({ viewport: { width, height: 900 }, locale })
          await context.addInitScript(({ theme, locale, state, result, profileUrl }) => {
            localStorage.setItem("arcade-theme", theme)
            localStorage.setItem("arcade-points-locale", locale)
            localStorage.setItem("arcade-seasonal-theme", "halloween")
            localStorage.setItem("eplus-arcade-dashboard-view-mode-v1", state === "empty" ? "guest" : "profile")
            if (state === "profile") localStorage.setItem("eplus-arcade-dashboard-v1", JSON.stringify({ profileUrl, result }))
          }, { theme, locale, state, result, profileUrl })
          const page = await context.newPage()
          // Keep network-dependent game/slot feeds deterministic; profile is local fixture data.
          await page.route("https://**/*", (route) => route.abort())
          await page.goto(`${base}${locale === "en" ? "" : `${locale}/`}${state === "profile" ? "dashboard/" : ""}`)
          await page.waitForFunction(() => document.documentElement.dataset.season === "halloween")
          if (state === "profile") {
            assert.equal(await page.locator(".halloween-edition").count(), 0, "Profile Dashboard must not display the Home edition label")
            await page.locator(".dashboard-page-title").waitFor({ state: "visible" })
            await page.locator(".profile-panel").waitFor({ state: "visible" })
          } else {
            await page.locator(".halloween-edition").waitFor({ state: "visible" })
            await page.waitForFunction((label) => document.querySelector(".halloween-edition")?.textContent.includes(label), catalog.messages.halloweenEdition)
          }
          const geometry = await page.evaluate(() => {
            const css = (s) => getComputedStyle(document.querySelector(s))
            const page = document.querySelector(".arcade-dashboard-page")
            const decor = document.querySelector(".halloween-season-decor")
            const card = document.querySelector(".profile-analyzer-card")
            const label = document.querySelector(".halloween-edition")?.getBoundingClientRect()
            return {
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
              decorInPage: decor.parentElement === page,
              decorPosition: css(".halloween-season-decor").position,
              decorZ: css(".halloween-season-decor").zIndex,
              pointerEvents: css(".halloween-season-decor").pointerEvents,
              moon: css(".halloween-moon").display,
              cardBackground: getComputedStyle(card).backgroundColor,
              tierBackgrounds: [...document.querySelectorAll(".tier-list-row, .guest-tier-card")].map((el) => getComputedStyle(el).backgroundColor),
              labelLeft: label?.left ?? null, labelRight: label?.right ?? null,
              buttonColor: css(".analyze-button").color,
            }
          })
          assert.equal(geometry.overflow, false, `${locale}/${theme}/${width}/${state}: overflow`)
          assert.equal(geometry.decorInPage, true)
          assert.equal(geometry.decorPosition, "absolute")
          assert.equal(geometry.decorZ, "-1")
          assert.equal(geometry.pointerEvents, "none")
          assert.equal(geometry.moon === "none", theme === "light" || width <= 820)
          assert.equal(geometry.cardBackground, theme === "light" ? "rgb(255, 252, 248)" : "rgb(19, 17, 38)")
          const tierColors = theme === "light" ? ["rgb(255, 252, 248)", "rgb(255, 247, 237)"] : ["rgb(19, 17, 38)", "rgb(25, 23, 47)"]
          assert.ok(geometry.tierBackgrounds.length > 0)
          for (const color of geometry.tierBackgrounds) assert.ok(tierColors.includes(color), `${theme}: unexpected tier surface ${color}`)
          assert.equal(geometry.buttonColor, "rgb(255, 255, 255)")
          // Portal-based history dialogs must adopt the Halloween variant too.
          if (state === "profile") {
            const trigger = page.locator(".shared-tier-panel .tier-trends-trigger")
            await trigger.waitFor({ state: "visible" })
            const cookie = page.locator(".cookie-consent-button")
            await cookie.waitFor({ state: "visible", timeout: 1500 }).catch(() => {})
            if (await cookie.isVisible()) await cookie.click()
            await trigger.click()
            const historyDialog = page.locator(".tier-trends-dialog")
            await historyDialog.waitFor({ state: "visible" })
            const bg = await historyDialog.evaluate(el => getComputedStyle(el).backgroundColor)
            assert.equal(bg, theme === "light" ? "rgb(255, 252, 248)" : "rgb(19, 17, 38)", theme + ": history dialog follows Halloween panel")
            await page.keyboard.press("Escape")
            await historyDialog.waitFor({ state: "hidden" })
          }

          if (state === "empty") assert.ok(geometry.labelLeft >= 0 && geometry.labelRight <= width)
          if (await page.locator(".preview-mode-toolbar").count()) {
            const toolbar = await page.locator(".preview-mode-toolbar").evaluate((el) => {
              const css = getComputedStyle(el)
              return { background: css.backgroundColor, border: parseFloat(css.borderTopWidth), display: getComputedStyle(el.querySelector(".dashboard-view-switch")).display }
            })
            assert.notEqual(toolbar.background, "rgba(0, 0, 0, 0)")
            assert.ok(toolbar.border > 0)
            assert.equal(toolbar.display, "grid")
            for (const button of await page.locator(".dashboard-view-switch button").all()) {
              const spacing = await button.evaluate((el) => {
                const icon = el.querySelector(".fa-icon, svg").getBoundingClientRect()
                const text = el.querySelector("span").getBoundingClientRect()
                return { gap: text.left - icon.right, display: getComputedStyle(el).display }
              })
              // Grid items blockify inline-flex to flex in computed styles.
              assert.ok(["flex", "inline-flex"].includes(spacing.display))
              assert.ok(spacing.gap >= 4, `${state}: preview icon overlaps label`)
            }
          }
          if (screenshots && await page.locator(".preview-mode-toolbar").count()) await page.locator(".preview-mode-toolbar").screenshot({ path: `${screenshots}/toolbar-${locale}-${theme}-${width}-${state}.png` })
          await page.locator(".profile-input input").click()
          assert.ok(await page.locator(".profile-input input").evaluate((el) => el === document.activeElement))
          if (screenshots && state === "empty") await page.screenshot({ path: `${screenshots}/${locale}-${theme}-${width}.png`, fullPage: true })
          await context.close()
          cases++
        }
      }
    }
  }


  // The tracker must remain accessible without opt-in, and opening it must
  // survive both participation toggles at phone and desktop widths.
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    await context.addInitScript(({ profileUrl, result }) => {
      localStorage.setItem("arcade-seasonal-theme", "off")
      localStorage.setItem("eplus-arcade-dashboard-view-mode-v1", "profile")
      localStorage.setItem("eplus-arcade-dashboard-v1", JSON.stringify({ profileUrl, result }))
      localStorage.removeItem("arcade-facilitator-participation-v1:" + profileUrl)
    }, { profileUrl, result })
    const page = await context.newPage()
    await page.route("https://**/*", route => route.abort())
    await page.goto(base + "dashboard/")
    const launcher = page.locator("body > .facilitator-launcher.is-floating")
    await launcher.waitFor({ state: "visible" })
    // Consent mounts after client hydration, so an immediate count() can miss
    // a banner that subsequently intercepts the floating button.
    const consent = page.locator(".cookie-consent-button")
    await consent.waitFor({ state: "visible", timeout: 2000 }).catch(() => {})
    if (await consent.isVisible()) await consent.click()
    assert.ok(await launcher.isEnabled(), width + ": launcher available without opt-in")
    const toolbarButtons = page.locator(".dashboard-view-switch button")
    const toolbarWidths = await toolbarButtons.evaluateAll(nodes => nodes.map(el => el.getBoundingClientRect().width))
    // The segmented switch exists in PR preview but is deliberately absent
    // in production static builds; only validate widths when rendered.
    assert.ok(toolbarWidths.length === 0 || toolbarWidths.length === 2)
    if (toolbarWidths.length === 2) {
      assert.ok(Math.abs(toolbarWidths[0] - toolbarWidths[1]) <= 1, width + ": Guest and Profile have equal widths")
    }
    if (width <= 600) {
      const dimensions = await page.evaluate(() => {
        const form = document.querySelector(".profile-input").getBoundingClientRect()
        const action = document.querySelector(".analyze-button").getBoundingClientRect()
        const card = document.querySelector(".profile-panel").getBoundingClientRect()
        const identity = document.querySelector(".profile-panel .profile-overview").getBoundingClientRect()
        return { formH: form.height, actionH: action.height, cardH: card.height, identityTop: identity.top, cardTop: card.top }
      })
      assert.ok(dimensions.formH <= 45 && dimensions.actionH <= 45, width + ": form controls use 44px mobile height")
      assert.ok(dimensions.identityTop - dimensions.cardTop < 90, width + ": profile avatar stays near the card heading")
      assert.ok(dimensions.cardH < 190, width + ": profile card has no excessive blank height")
    }
    const positionBeforeScroll = await launcher.evaluate(el => ({
      position: getComputedStyle(el).position,
      top: el.getBoundingClientRect().top,
      width: el.getBoundingClientRect().width,
      gutter: innerWidth - el.getBoundingClientRect().right,
      bottom: innerHeight - el.getBoundingClientRect().bottom,
      height: el.getBoundingClientRect().height,
    }))
    assert.equal(positionBeforeScroll.position, "fixed", width + ": launcher is fixed, not embedded")
    assert.ok(positionBeforeScroll.width <= 54, width + ": compact rail must not cover Tiers")
    assert.ok(positionBeforeScroll.gutter >= 8, width + ": launcher stays inside viewport")
    if (width <= 600) {
      assert.ok(positionBeforeScroll.width <= 45 && positionBeforeScroll.height <= 45, "mobile Facilitator uses a 44px FAB")
      assert.ok(positionBeforeScroll.bottom >= 130, "mobile FAB clears bottom nav and Back to top")
      assert.ok(positionBeforeScroll.top >= 600 && positionBeforeScroll.bottom <= 210, "FAB is near the bottom rather than mid-screen")
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const positionAfterScroll = await launcher.evaluate(el => el.getBoundingClientRect().top)
    assert.ok(Math.abs(positionAfterScroll - positionBeforeScroll.top) <= 2, width + ": launcher stays on screen while scrolling")
    await launcher.click()
    const drawer = page.locator(".facilitator-drawer")
    await drawer.waitFor({ state: "visible" })
    const toggle = drawer.getByRole("checkbox", { name: "Include Facilitator Program bonus in the estimated total" })
    await drawer.locator(".facilitator-participation-toggle").click()
    assert.equal(await toggle.isChecked(), true, width + ": opt-in switch enabled")
    await page.waitForTimeout(1000)
    assert.equal(await drawer.isVisible(), true, width + ": drawer stays open after opt-in")
    assert.equal(await launcher.isVisible(), true, width + ": launcher stays visible when participating")
    assert.ok(await launcher.evaluate(el => el.classList.contains("is-participating")))
    await drawer.locator(".facilitator-participation-toggle").click()
    assert.equal(await toggle.isChecked(), false, width + ": opt-out switch disabled")
    await page.waitForTimeout(1000)
    assert.equal(await drawer.isVisible(), true, width + ": drawer stays open after opt-out")
    assert.equal(await launcher.isVisible(), true, width + ": launcher stays visible after opt-out")
    await drawer.locator(".facilitator-header > button").click()
    assert.equal(await drawer.count(), 0, width + ": drawer closes on request")
    assert.equal(await launcher.isVisible(), true)
    await context.close()
    cases++
  }

  // Profile regression: "View all badges" must keep the Tiers sidebar
  // visible on desktop, but must not create a sticky panel on phones.
  for (const width of [390, 1024, 1440]) {
    const viewportHeight = 720
    const context = await browser.newContext({ viewport: { width, height: viewportHeight } })
    const extendedResult = {
      ...result,
      badges: Array.from({ length: 64 }, (_, index) => ({
        ...result.badges[index % result.badges.length],
        title: `Regression badge ${index + 1}`,
      })),
    }
    await context.addInitScript(({ profileUrl, result }) => {
      localStorage.setItem("arcade-seasonal-theme", "off")
      localStorage.setItem("eplus-arcade-dashboard-view-mode-v1", "profile")
      localStorage.setItem("eplus-arcade-dashboard-v1", JSON.stringify({ profileUrl, result }))
    }, { profileUrl, result: extendedResult })
    const page = await context.newPage()
    await page.route("https://**/*", (route) => route.abort())
    await page.goto(`${base}dashboard/`)
    await page.locator(".show-all-badges").waitFor({ state: "visible" })
    await page.locator(".show-all-badges").click()
    assert.equal(await page.locator(".earned-badge").count(), 64, `${width}: expanded badge count`)

    await page.evaluate(() => {
      const grid = document.querySelector(".dashboard-primary-column")
      document.documentElement.style.scrollBehavior = "auto"
      window.scrollTo(0, grid.getBoundingClientRect().top + window.scrollY + 600)
    })
    const metrics = await page.locator(".dashboard-content-grid > .tier-list-panel").evaluate((el) => {
      const style = getComputedStyle(el)
      return {
        position: style.position,
        stickyTop: parseFloat(style.top),
        actualTop: el.getBoundingClientRect().top,
        headerBottom: document.querySelector(".arcade-header").getBoundingClientRect().bottom,
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      }
    })
    const desktop = width > 820
    assert.equal(metrics.position, desktop ? "sticky" : "static", `${width}: sidebar position`)
    assert.equal(metrics.horizontalOverflow, false, `${width}: horizontal overflow`)
    if (desktop) {
      assert.ok(Math.abs(metrics.actualTop - metrics.stickyTop) <= 3, `${width}: sidebar must stick to its offset`)
      assert.ok(metrics.actualTop >= metrics.headerBottom + 4, `${width}: sidebar must clear header`)
      assert.ok(metrics.clientHeight <= viewportHeight - metrics.stickyTop + 1, `${width}: sidebar must fit viewport`)
      if (metrics.scrollHeight > metrics.clientHeight) {
        const scrollTop = await page.locator(".dashboard-content-grid > .tier-list-panel").evaluate((el) => {
          el.scrollTop = 120
          return el.scrollTop
        })
        assert.ok(scrollTop > 0, `${width}: sidebar content remains reachable`)
      }
    }
    await context.close()
    cases++
  }

  // Bottom tabs follow the clicked section and the restored URL hash.
  for (const path of ["", "dashboard/"]) {
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const page = await mobile.newPage()
    await page.route("https://**/*", route => route.abort())
    await page.goto(base + path)
    const nav = page.locator(".mobile-bottom-nav")
    await nav.locator('a[href="#tiers"]').click()
    await page.waitForFunction(() => document.querySelector('.mobile-bottom-nav a[href="#tiers"]')?.getAttribute("aria-current") === "location")
    assert.ok(await nav.locator('a[href="#tiers"]').evaluate(el => el.classList.contains("is-active")), path + ": tiers tab active")
    await nav.locator('a[href="#calculator"]').click()
    await page.waitForFunction(() => document.querySelector('.mobile-bottom-nav a[href="#calculator"]')?.getAttribute("aria-current") === "location")
    assert.ok(await nav.locator('a[href="#calculator"]').evaluate(el => el.classList.contains("is-active")), path + ": calculator tab active")
    await mobile.close()
    cases++
  }

  // Home uses the saved public profile image, with graceful initials fallback.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const fakeAvatar = "https://avatar.arcade-example.test/photo.png"
    await context.addInitScript(({ profileUrl, result, fakeAvatar }) => {
      const record = { ...result, userDetails: [{ ...result.userDetails?.[0], profileImage: fakeAvatar }] }
      localStorage.setItem("eplus-arcade-dashboard-v1", JSON.stringify({ profileUrl, result: record }))
    }, { profileUrl, result, fakeAvatar })
    const page = await context.newPage()
    await page.route("https://**/*", route => route.abort())
    const tinyPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+Xh9kAAAAASUVORK5CYII="
    await page.route(fakeAvatar, route => route.fulfill({ status: 200, contentType: "image/png", body: Buffer.from(tinyPng, "base64") }))
    await page.goto(base)
    const avatar = page.locator(".home-profile-avatar img")
    await avatar.waitFor({ state: "visible" })
    await page.waitForFunction(() => {
      const img = document.querySelector(".home-profile-avatar img")
      return img?.complete && img.naturalWidth > 0
    })
    assert.equal(await avatar.getAttribute("src"), fakeAvatar)
    // Cross-tab snapshot updates are surfaced via the storage event.
    // Unsafe avatar URLs must never be requested and must render initials.
    await page.evaluate(() => {
      const raw = JSON.parse(localStorage.getItem("eplus-arcade-dashboard-v1"))
      raw.result.userDetails[0].profileImage = "http://unsafe.example/avatar.png"
      localStorage.setItem("eplus-arcade-dashboard-v1", JSON.stringify(raw))
      window.dispatchEvent(new StorageEvent("storage", { key: "eplus-arcade-dashboard-v1" }))
    })
    await page.locator(".home-profile-avatar > span").waitFor({ state: "visible", timeout: 5000 })
    assert.equal(await page.locator(".home-profile-avatar img").count(), 0)
    await context.close()
    cases++
  }

  const context = await browser.newContext({ reducedMotion: "reduce" })
  await context.addInitScript(() => localStorage.setItem("arcade-seasonal-theme", "halloween"))
  const page = await context.newPage()
  await page.route("https://**/*", (route) => route.abort())
  await page.goto(base)
  await page.locator(".halloween-season-decor").waitFor({ state: "attached" })
  assert.equal(await page.locator(".halloween-bat").first().evaluate((el) => getComputedStyle(el).animationName), "none")
  await page.locator('a[href$="/guide/"]').first().click()
  await page.waitForURL("**/guide/")
  await page.locator(".halloween-season-decor").waitFor({ state: "attached" })
  assert.equal(await page.locator(".halloween-season-decor").count(), 1)
  await page.evaluate(() => {
    localStorage.setItem("arcade-seasonal-theme", "off")
    window.dispatchEvent(new StorageEvent("storage", { key: "arcade-seasonal-theme" }))
  })
  await page.waitForFunction(() => !document.documentElement.dataset.season)
  assert.equal(await page.locator(".halloween-season-decor").count(), 0)
  await page.evaluate(() => {
    localStorage.setItem("arcade-seasonal-theme", "halloween")
    window.dispatchEvent(new StorageEvent("storage", { key: "arcade-seasonal-theme" }))
  })
  await page.locator(".halloween-season-decor").waitFor({ state: "attached" })
  // Next's native history integration updates usePathname without remounting the layout.
  await page.evaluate((url) => history.pushState(null, "", url), `${base}widget/`)
  await page.waitForFunction(() => !document.documentElement.dataset.season)
  assert.equal(await page.locator(".halloween-season-decor").count(), 0)
  for (const path of ["widget/", "widget/?theme=dark"]) {
    await page.goto(`${base}${path}`)
    await page.waitForTimeout(300)
    assert.equal(await page.evaluate(() => document.documentElement.dataset.season), undefined)
    assert.equal(await page.locator(".halloween-season-decor").count(), 0)
  }
  await context.close()
  console.log(`Halloween UI passed: ${cases} locale/theme/viewport/dashboard combinations; reduced motion, navigation, opt-out and widgets.`)
} finally {
  await browser?.close()
  await server?.close()
}
