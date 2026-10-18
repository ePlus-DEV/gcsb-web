import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const home = readRepoFile("app/page.tsx")
const localizedHome = readRepoFile("app/[locale]/page.tsx")
const dashboardTiers = readRepoFile("components/arcade/dashboard-tiers.tsx")
const guestDashboard = readRepoFile("components/arcade/guest-dashboard.tsx")
const guestStyles = readRepoFile("app/styles/home-refactor.css")
const previewToolbar = readRepoFile("components/arcade/preview-mode-toolbar.tsx")
const dashboardState = readRepoFile("components/arcade/dashboard-state.ts")
const calculator = readRepoFile("app/redesign-calculator.tsx")
const monthlySection = readRepoFile("components/arcade/monthly-games-section.tsx")
const monthlyPanel = readRepoFile("components/arcade/monthly-games-panel.tsx")
const monthlyStyles = readRepoFile("app/styles/monthly-games.css")
const guide = readRepoFile("components/seo/home-search-guide.tsx")

const sharedBlocks = /<(RedesignCalculator|ProgramCountdown|FreshScoreCheckEnhancer|SwagDropsPreview|ShareProfileEnhancer|FacilitatorAnalyzerOption|FacilitatorPanelGate|SeoContent)\b/g

function homepageBlocks(source) {
  return [...source.matchAll(sharedBlocks)].map((match) => match[1])
}

test("all locales mount the English homepage block sequence", () => {
  assert.deepEqual(homepageBlocks(localizedHome), homepageBlocks(home))
  assert.deepEqual(homepageBlocks(home), [
    "RedesignCalculator",
    "ProgramCountdown",
    "FreshScoreCheckEnhancer",
    "SwagDropsPreview",
    "ShareProfileEnhancer",
    "FacilitatorAnalyzerOption",
    "FacilitatorPanelGate",
    "SeoContent",
  ])
})

test("Monthly Labs has deterministic React-owned anchors in both dashboard states", () => {
  assert.equal((monthlySection.match(/id="monthly-games"/g) ?? []).length, 1)
  assert.equal((monthlySection.match(/data-home-order="monthly-labs"/g) ?? []).length, 1)
  const summary = calculator.indexOf('data-home-order="dashboard-summary"')
  const resultsMonthly = calculator.indexOf("<MonthlyGamesSection")
  const bottom = calculator.indexOf('className="dashboard-content-grid"')
  assert.ok(summary >= 0 && summary < resultsMonthly && resultsMonthly < bottom)

  const empty = calculator.indexOf("<GuestDashboard")
  const emptyMonthly = guestDashboard.indexOf("<MonthlyGamesSection")
  const about = calculator.indexOf("{footerContent}")
  assert.ok(empty > bottom)
  assert.ok(emptyMonthly >= 0 && emptyMonthly < guestDashboard.indexOf("<DashboardTiers\n"))
  assert.match(guestDashboard, /<DashboardTiers/)
  assert.match(dashboardTiers, /data-home-order="tier-history"/)
  assert.ok(about > empty)
  assert.match(calculator, /href="#monthly-games"/)
  assert.match(guide, /data-home-order="about"/)
})

test("portal targets cannot depend on translated labels or mutation timing", () => {
  assert.match(calculator, /data-home-order="program-countdown"/)
  assert.ok(
    calculator.indexOf("<ProfileAnalyzer") <
    calculator.indexOf('data-home-order="program-countdown"'),
  )
  assert.ok(
    calculator.indexOf("<GuestDashboard") <
    calculator.indexOf("<ExtensionStrip"),
  )
  assert.match(calculator, /<MonthlyGamesSection badges=\{badges\} hasProfile=\{showProfileDashboard\}/)
  assert.match(monthlySection, /badges=\{hasProfile \? badges : \[\]\}/)
  assert.doesNotMatch(monthlySection, /MutationObserver|setInterval|createPortal|localStorage|querySelector/)
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

test("shared hero preserves the established Arcade pixel font and responsive sizing", () => {
  const styles = readRepoFile("app/styles/home-refactor.css")
  assert.match(styles, /font-family: "Press Start 2P", ui-monospace, monospace/)
  assert.match(styles, /font-weight: 400/)
  const layout = readRepoFile("app/layout.tsx")
  assert.match(layout, /family=Inter:/)
  assert.match(layout, /family=Press\+Start\+2P/)
  assert.match(styles, /font-size: clamp\(1\.5rem, 2\.2vw, 2rem\)/)
  assert.match(styles, /font-size: clamp\(1\.1rem, 4\.5vw, 1\.5rem\)/)
})
