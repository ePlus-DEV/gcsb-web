import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const home = readRepoFile("app/page.tsx")
const localizedHome = readRepoFile("app/[locale]/page.tsx")
const calculator = readRepoFile("app/redesign-calculator.tsx")
const monthlyGate = readRepoFile("components/arcade/monthly-games-panel-gate.tsx")
const monthlyPanel = readRepoFile("components/arcade/monthly-games-panel.tsx")
const monthlyStyles = readRepoFile("app/styles/monthly-games.css")
const guide = readRepoFile("components/seo/home-search-guide.tsx")

const sharedBlocks = /<(RedesignCalculator|ProgramCountdown|FreshScoreCheckEnhancer|TierStatusIconEnhancer|SwagDropsPreview|MonthlyGamesPanelGate|ShareProfileEnhancer|FacilitatorAnalyzerOption|FacilitatorPanelGate|SeoContent)\b/g

function homepageBlocks(source) {
  return [...source.matchAll(sharedBlocks)].map((match) => match[1])
}

test("all locales mount the English homepage block sequence", () => {
  assert.deepEqual(homepageBlocks(localizedHome), homepageBlocks(home))
  assert.deepEqual(homepageBlocks(home), [
    "RedesignCalculator",
    "ProgramCountdown",
    "FreshScoreCheckEnhancer",
    "TierStatusIconEnhancer",
    "SwagDropsPreview",
    "MonthlyGamesPanelGate",
    "ShareProfileEnhancer",
    "FacilitatorAnalyzerOption",
    "FacilitatorPanelGate",
    "SeoContent",
  ])
})

test("Monthly Labs has deterministic React-owned anchors in both dashboard states", () => {
  assert.equal((calculator.match(/id="monthly-games"/g) ?? []).length, 2)
  assert.equal((calculator.match(/data-home-order="monthly-labs"/g) ?? []).length, 2)
  const summary = calculator.indexOf('data-home-order="dashboard-summary"')
  const resultsMonthly = calculator.indexOf('data-home-order="monthly-labs"')
  const bottom = calculator.indexOf('data-home-order="dashboard-bottom"')
  assert.ok(summary >= 0 && summary < resultsMonthly && resultsMonthly < bottom)

  const empty = calculator.indexOf('data-home-order="dashboard-empty"')
  const history = calculator.indexOf('data-home-order="tier-history"')
  const emptyMonthly = calculator.lastIndexOf('data-home-order="monthly-labs"')
  const about = calculator.indexOf("{footerContent}")
  assert.ok(empty > bottom && history > empty && emptyMonthly > history)
  assert.ok(about > emptyMonthly)
  assert.match(calculator, /href="#monthly-games"/)
  assert.match(guide, /data-home-order="about"/)
})

test("portal targets cannot depend on translated labels or mutation timing", () => {
  assert.match(calculator, /data-home-order="program-countdown"/)
  assert.ok(
    calculator.indexOf('data-home-order="hero"') <
    calculator.indexOf('data-home-order="program-countdown"'),
  )
  assert.ok(
    calculator.indexOf('data-home-order="program-countdown"') <
    calculator.indexOf('data-home-order="extension"'),
  )
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
  assert.match(monthlyPanel, /if \(loadFailed\) return null/)
  assert.doesNotMatch(monthlyPanel, /loadFailed \|\| games\.length === 0/)
})


test("home dashboard v2 stays scoped and its visual overrides load last", () => {
  const layout = readRepoFile("app/layout.tsx")
  const refactorStyles = readRepoFile("app/styles/home-refactor.css")

  assert.match(calculator, /arcade-dashboard-page arcade-dashboard-v2/)
  assert.match(refactorStyles, /\.arcade-dashboard-v2/)
  assert.match(refactorStyles, /\.arcade-dashboard-v2 \.program-countdown-host/)
  assert.match(refactorStyles, /\.guest-dashboard-hero/)
  assert.match(refactorStyles, /\.guest-tier-card\.tier-120/)
  assert.match(refactorStyles, /\.guest-tier-progress/)
  assert.match(refactorStyles, /html\.light \.arcade-dashboard-v2/)
  assert.match(refactorStyles, /@media \(max-width: 600px\)/)

  const legacyResponsive = layout.indexOf('import "./styles/redesign-responsive.css"')
  const facilitatorStyles = layout.indexOf('import "./styles/facilitator-participation.css"')
  const refactorImport = layout.indexOf('import "./styles/home-refactor.css"')

  assert.ok(legacyResponsive >= 0)
  assert.ok(facilitatorStyles >= 0)
  assert.ok(refactorImport > legacyResponsive)
  assert.ok(refactorImport > facilitatorStyles)
})


test("guest and profile dashboard modes stay profile-safe and fully localized", () => {
  const monthlyGateSource = readRepoFile("components/arcade/monthly-games-panel-gate.tsx")
  const facilitatorGateSource = readRepoFile("components/arcade/facilitator-panel-gate.tsx")
  const facilitatorOptionSource = readRepoFile("components/arcade/facilitator-analyzer-option.tsx")
  const requiredKeys = [
    "dashboardView",
    "guestView",
    "profileView",
    "guestDashboardTitle",
    "guestDashboardHint",
  ]
  const locales = [
    "ar", "de", "en", "es", "fr", "hi", "it",
    "ja", "ko", "pt_BR", "ru", "vi", "zh_CN",
  ]

  assert.match(calculator, /data-dashboard-view=\{viewMode\}/)
  assert.match(calculator, /className="dashboard-view-switch"/)
  assert.match(calculator, /className="dashboard-mode-bar"/)
  assert.match(calculator, /guest-dashboard-hero/)
  assert.match(calculator, /guest-tier-card tier-/)
  assert.match(calculator, /guest-tier-progress/)
  assert.match(calculator, /showProfileDashboard/)
  assert.match(calculator, /setViewMode\("profile"\)/)
  assert.match(monthlyGateSource, /dataset\.dashboardView === "profile"/)
  assert.match(facilitatorGateSource, /dataset\.dashboardView === "guest"/)
  assert.match(facilitatorOptionSource, /dashboardViewMode === "guest"/)
  assert.match(facilitatorOptionSource, /dashboardViewMode !== "profile"/)
  const shareEnhancerSource = readRepoFile("components/arcade/share-profile-enhancer.tsx")
  assert.match(shareEnhancerSource, /observer = new MutationObserver\(\(\) => installShareAction\(\)\)/)
  assert.doesNotMatch(
    calculator,
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
