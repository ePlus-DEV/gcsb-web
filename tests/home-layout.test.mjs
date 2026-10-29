import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const home = readRepoFile("app/page.tsx")
const localizedHome = readRepoFile("app/[locale]/page.tsx")
const dashboardTiers = readRepoFile("components/arcade/dashboard-tiers.tsx")
const guestDashboard = readRepoFile("components/arcade/guest-dashboard.tsx")
const guestStyles = readRepoFile("app/styles/guest-discovery.css")
const previewToolbar = readRepoFile("components/arcade/preview-mode-toolbar.tsx")
const dashboardState = readRepoFile("components/arcade/dashboard-state.ts")
const calculator = readRepoFile("app/redesign-calculator.tsx")
const homeClient = readRepoFile("components/arcade/home-page.tsx")
const shell = readRepoFile("components/arcade/route-shell.tsx")
const monthlyGate = readRepoFile("components/arcade/monthly-games-panel-gate.tsx")
const monthlyPanel = readRepoFile("components/arcade/monthly-games-panel.tsx")
const monthlyStyles = readRepoFile("app/styles/monthly-games.css")
const guide = readRepoFile("components/seo/home-search-guide.tsx")

const sharedBlocks = /<(HomePage|ProgramCountdown|FreshScoreCheckEnhancer|TierStatusIconEnhancer|SwagDropsPreview|MonthlyGamesPanelGate|ShareProfileEnhancer|FacilitatorAnalyzerOption|FacilitatorPanelGate|SeoContent)\b/g

function homepageBlocks(source) {
  return [...source.matchAll(sharedBlocks)].map((match) => match[1])
}

test("all locales mount the English homepage block sequence", () => {
  assert.deepEqual(homepageBlocks(localizedHome), homepageBlocks(home))
  assert.deepEqual(homepageBlocks(home), [
    "HomePage",
    "ProgramCountdown",
    "SwagDropsPreview",
    "MonthlyGamesPanelGate",
    "SeoContent",
  ])
})

test("public programs stay on Home and link back from Dashboard", () => {
  assert.match(homeClient, /<GuestDashboard/)
  assert.doesNotMatch(calculator, /id="monthly-games"/)
  assert.match(guestDashboard, /id="monthly-games"/)
  assert.match(shell, /homeHref\}#monthly-games/)
  assert.match(guide, /data-home-order="about"/)
})

test("profile layout groups badges and insight cards without stretching against tiers", () => {
  const primaryOpen = calculator.indexOf('className="dashboard-primary-column"')
  const badges = calculator.indexOf('id="badges"')
  const bottom = calculator.indexOf('data-home-order="dashboard-bottom"')
  const tiers = calculator.indexOf("<DashboardTiers")
  const monthly = calculator.indexOf('data-home-order="monthly-labs"')
  assert.ok(primaryOpen >= 0 && primaryOpen < badges && badges < bottom && bottom < tiers)
  assert.equal((calculator.match(/className="dashboard-primary-column"/g) ?? []).length, 1)
  const css = readRepoFile("app/styles/interface-refresh.css")
  assert.ok(css.includes(".dashboard-content-grid {"))
  assert.ok(css.includes("align-items: start;"))
  assert.ok(css.includes(".dashboard-primary-column {"))
  assert.ok(css.includes("display: grid;"))
  assert.ok(css.includes("max-width: 1080px"))
})

test("Tiers sidebar stays sticky only in desktop profile layout", () => {
  const css = readRepoFile("app/styles/interface-refresh.css")
  const stickyRule = css.slice(css.indexOf('The profile badge list can grow'))
  assert.match(stickyRule, /@media \(min-width: 821px\)/)
  assert.ok(stickyRule.includes('.arcade-dashboard-page[data-dashboard-view="profile"] .dashboard-content-grid > .tier-list-panel'))
  assert.match(stickyRule, /position:\s*sticky;/)
  assert.match(stickyRule, /top:\s*calc\(var\(--arcade-sticky-header-height/)
  assert.match(stickyRule, /max-height:\s*calc\(100dvh/)
  assert.match(stickyRule, /overflow-y:\s*auto;/)
  assert.ok(shell.includes('<header ref={headerRef} className="arcade-header">'))
  assert.ok(shell.includes("new ResizeObserver(syncHeaderHeight)"))
  const browserCheck = readRepoFile("scripts/verify-halloween-ui.mjs")
  assert.ok(browserCheck.includes('for (const width of [390, 1024, 1440])'))
  assert.ok(browserCheck.includes('await page.locator(".show-all-badges").click()'))
  assert.ok(browserCheck.includes('metrics.position, desktop ? "sticky" : "static"'))
})

test("portal targets cannot depend on translated labels or mutation timing", () => {
  assert.match(homeClient, /data-home-order="program-countdown"/)
  assert.ok(homeClient.indexOf('data-home-order="hero"') < homeClient.indexOf('data-home-order="program-countdown"'))
  assert.ok(homeClient.indexOf('data-home-order="program-countdown"') < homeClient.indexOf("<ExtensionStrip"))
  assert.ok(monthlyGate.includes('page?.querySelector<HTMLElement>(`#${HOST_ID}.${HOST_CLASS_NAME}`)'))
  assert.doesNotMatch(monthlyGate, /\[aria-label=/)
  assert.doesNotMatch(monthlyGate, /insertAdjacentElement|document\.createElement/)
})


test("Monthly Labs hides expired games and shows a coming-soon state between monthly releases", () => {
  assert.match(monthlyPanel, /function isGameExpired/)
  assert.match(monthlyPanel, /games\.filter\(\(game\) => !isGameExpired\(game, nowMs\)\)/)
  assert.match(monthlyPanel, /expiredGames\.length === games\.length/)
  assert.match(monthlyPanel, /games\.length === 0/)
  assert.match(monthlyPanel, /text\("awaitingNewLabs"\)/)
  assert.match(monthlyPanel, /text\("newGamesAuto"\)/)
  assert.match(monthlyPanel, /activeGames\.map\(\(game, index\) =>/)
  assert.doesNotMatch(monthlyPanel, /games\.map\(\(game, index\) =>/)
  assert.match(monthlyStyles, /\.monthly-games-coming-soon/)
  assert.match(monthlyStyles, /\.monthly-progress-summary\.is-coming-soon/)
})

test("previous monthly lab label uses the Arcade source timezone instead of the browser timezone", () => {
  assert.match(monthlyPanel, /latestGame\.deadlineTimeZone/)
  assert.match(monthlyPanel, /timeZone: latestGame\.deadlineTimeZone/)
  assert.match(monthlyPanel, /new Date\(latestGame\.deadline\)/)
})

test("an empty published monthly feed is treated as awaiting publication, not a fetch failure", () => {
  assert.match(monthlyPanel, /if \(!Array\.isArray\(payload\)\) throw new Error/)
  assert.match(monthlyPanel, /payload\.length > 0 && parsed\.length === 0/)
  assert.match(monthlyPanel, /setLoadFailed\(false\)/)
  assert.match(monthlyPanel, /if \(loadFailed\) return \(/)
  assert.doesNotMatch(monthlyPanel, /loadFailed \|\| games\.length === 0/)
})


test("Guest and Profile share dashboard styling", () => {
  const styles = readRepoFile("app/styles/home-refactor.css")
  assert.doesNotMatch(styles, /data-dashboard-view="guest"|guest-tier/)
  assert.match(styles, /preview-mode-toolbar/)
  assert.match(guestDashboard, /dashboard-shell/)
})

test("PR-preview guest and profile debug modes stay profile-safe and fully localized", () => {
  const monthlyGateSource = readRepoFile("components/arcade/monthly-games-panel-gate.tsx")
  const facilitatorGateSource = readRepoFile("components/arcade/facilitator-panel-gate.tsx")
  const facilitatorOptionSource = readRepoFile("components/arcade/facilitator-analyzer-option.tsx")
  const requiredKeys = [
    "dashboardView",
    "guestView",
    "profileView",
    "guestDashboardTitle",
    "guestDashboardHint",
    "guestHeroTop",
    "guestHeroBottom",
    "guestHeroDescription",
    "guestLabsLabel",
  ]
  const locales = [
    "ar", "de", "en", "es", "fr", "hi", "it",
    "ja", "ko", "pt_BR", "ru", "vi", "zh_CN",
  ]

  assert.match(calculator, /data-dashboard-view=\{viewMode\}/)
  const previewFixture = readRepoFile("components/arcade/preview-debug-profile.ts")
  assert.match(previewFixture, /startsWith\("\/pr-preview\/pr-"\)/)
  assert.match(calculator, /\{IS_PR_PREVIEW && \(/)
  assert.match(calculator, /useState<DashboardViewMode>\("guest"\)/)
  assert.match(calculator, /PREVIEW_DEBUG_PROFILE_RESULT/)
  assert.match(calculator, /PREVIEW_DEBUG_PROFILE_URL/)
  assert.match(calculator, /if \(!result \|\| usingPreviewFakeProfile\) return/)
  assert.match(calculator, /data-dashboard-debug-fake=\{usingPreviewFakeProfile/)
  assert.match(previewFixture, /userName: "PR Preview Learner"/)
  assert.match(previewFixture, /totalPoints: 112/)
  assert.match(calculator, /if \(!IS_PR_PREVIEW\) return/)
  assert.match(calculator, /if \(!IS_PR_PREVIEW \|\| !viewModeRestored\) return/)
  assert.match(previewToolbar, /className="dashboard-view-switch"/)
  assert.match(previewToolbar, /className="preview-mode-toolbar"/)
  assert.match(previewToolbar, /className="preview-mode-badge"/)
  assert.match(guestDashboard, /dashboard-shell/)
  assert.match(dashboardTiers, /tier-list-row tier-/)
  assert.match(calculator, /showProfileDashboard/)
  assert.match(calculator, /setViewMode\("profile"\)/)
  assert.match(monthlyGateSource, /readActiveDashboard\(\)/)
  assert.match(dashboardState, /IS_PR_PREVIEW && page\?\.dataset\.dashboardDebugFake/)
  assert.match(facilitatorGateSource, /readActiveDashboard\(\)/)
  assert.match(dashboardState, /dataset\.dashboardView === "guest"/)
  assert.match(facilitatorOptionSource, /dashboardViewMode === "guest"/)
  assert.match(facilitatorOptionSource, /dashboardViewMode !== "profile"/)
  const shareEnhancerSource = readRepoFile("components/arcade/share-profile-enhancer.tsx")
  assert.match(shareEnhancerSource, /observer = new MutationObserver\(\(\) => installShareAction\(\)\)/)
  assert.doesNotMatch(
    [calculator, guestDashboard, previewToolbar].join("\n"),
    />Guest view<|>Profile view<|>Browsing as guest<|Personal profile data is hidden/,
  )

  for (const locale of locales) {
    const catalog = JSON.parse(readRepoFile(`public/i18n/locales/${locale}.json`))
    for (const key of requiredKeys) {
      assert.equal(typeof catalog.messages?.[key], "string", `${locale} is missing ${key}`)
      assert.ok(catalog.messages[key].trim().length > 0, `${locale} has empty ${key}`)
    }
  }
})


test("both views use the Profile tier renderer and hero", () => {
  assert.equal((calculator.match(/<DashboardTiers\b/g) ?? []).length, 1)
  assert.equal((guestDashboard.match(/<DashboardTiers\b/g) ?? []).length, 1)
  assert.match(dashboardTiers, /tier-list-row tier-/)
  assert.match(dashboardTiers, /<SlotChangeBadge/)
  assert.match(dashboardTiers, /<TierSlotHistoryPanel/)
  assert.doesNotMatch(calculator, /catalog.messages.guestHero/)
  assert.match(calculator, /setGuestProfileUrl\(""\)/)
})

test("shared hero preserves the Arcade pixel font with responsive sizing", () => {
  const styles = readRepoFile("app/styles/home-refactor.css")
  assert.match(styles, /font-family: "Press Start 2P", ui-monospace, monospace/)
  assert.match(styles, /font-size: clamp\(1\.5rem, 2\.2vw, 2rem\)/)
  assert.match(styles, /font-size: clamp\(1\.1rem, 4\.5vw, 1\.5rem\)/)
})

test("Arcade logo corrects the Font Awesome gamepad optical alignment", () => {
  const css = readRepoFile("app/styles/fontawesome-icons.css")
  const shell = readRepoFile("components/arcade/route-shell.tsx")
  assert.match(css, /\.arcade-brand-mark \.fa-icon\.fa-gamepad \{\s*transform: translateX\(-3px\);/)
  assert.match(shell, /className="arcade-brand-mark"><Gamepad2\s*\/>/)
})
