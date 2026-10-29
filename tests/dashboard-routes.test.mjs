import assert from "node:assert/strict"
import test from "node:test"
import fs from "node:fs"
import { readRepoFile } from "./helpers/typescript-source.mjs"

test("Home contains introduction only, without score or profile analysis", () => {
  const home = readRepoFile("components/arcade/home-page.tsx")
  assert.doesNotMatch(home, /RedesignCalculator|ReleasedPointsPanel|<ProfileAnalyzer|<GuestDashboard|<HomeProfileSummary|readSavedProfileUrl|useArcadeMilestones|useTierSlotHistory/)
  assert.match(home, /m.startUsing/)
  assert.match(home, /home-intro-journey/)
})


test("Dashboard routes are exported for every locale and keep personal pages out of search", () => {
  const localized = readRepoFile("app/[locale]/dashboard/page.tsx")
  assert.match(localized, /generateStaticParams/)
  assert.match(localized, /WEBSITE_LOCALES.filter/)
  for (const route of ["app/dashboard/page.tsx", "app/[locale]/dashboard/page.tsx"]) {
    assert.match(readRepoFile(route), /index: false/)
    assert.match(readRepoFile(route), /<DashboardPage/)
  }
  const language = readRepoFile("components/i18n/website-language.tsx")
  assert.match(language, /isDashboard \? "dashboard\/" : ""/)
  assert.match(language, /window.location.search/)
})

test("route navigation and form errors are translated in every locale", () => {
  for (const name of fs.readdirSync("public/i18n/locales")) {
    const catalog = JSON.parse(readRepoFile(`public/i18n/locales/${name}`))
    for (const key of ["homeNav", "dashboardNav", "invalidProfileUrl"]) assert.ok(catalog.messages[key]?.trim(), `${name}: ${key}`)
  }
  assert.match(readRepoFile("components/arcade/home-page.tsx"), /m.startUsing/)
  assert.match(readRepoFile("components/arcade/route-shell.tsx"), /catalog.messages.dashboardNav/)
})


test("Home and Dashboard keep one responsive tier system and consistent page gutters", () => {
  const css = readRepoFile("app/styles/route-layout.css")
  const tiers = readRepoFile("components/arcade/dashboard-tiers.tsx")
  assert.match(css, /\[data-dashboard-view="guest"\] \.dashboard-analyzer \{\s*max-width: 1200px;/)
  assert.match(css, /\.dashboard-guest-start \{ max-width: 1200px;/)
  assert.match(readRepoFile("app/styles/home-introduction.css"), /\.home-intro-journey/)
  assert.match(tiers, /sort\(\(left, right\) => right\.points - left\.points\)/)
  assert.match(css, /\.profile-panel \{\s*display: flex; align-items: center; flex-wrap: wrap;/)
  assert.match(css, /flex-direction: column; align-items: stretch; gap: 10px; padding-inline-end: 0;/)
})

test("seasonal Home edition labels never leak into Dashboard guest or profile pages", () => {
  const home = readRepoFile("components/arcade/home-page.tsx")
  const dashboard = readRepoFile("app/redesign-calculator.tsx")
  const browser = readRepoFile("scripts/verify-halloween-ui.mjs")
  assert.match(home, /className="halloween-edition"/)
  assert.doesNotMatch(dashboard, /className="halloween-edition"/)
  assert.match(dashboard, /className="dashboard-page-heading"/)
  assert.match(browser, /Dashboard must not contain a promotional seasonal label/)
  assert.match(browser, /Profile Dashboard must not display the Home edition label/)
})

test("Facilitator launcher remains visible regardless of program enrollment", () => {
  const gate = readRepoFile("components/arcade/facilitator-panel-gate.tsx")
  const panel = readRepoFile("components/arcade/facilitator-panel.tsx")
  const browser = readRepoFile("scripts/verify-halloween-ui.mjs")
  assert.doesNotMatch(gate, /launcher\.hidden\s*=\s*!participating/)
  assert.match(gate, /key=\{normalizeFacilitatorProfileUrl\(profileUrl\)\}/)
  assert.match(panel, /writeFacilitatorParticipation\(currentProfileUrl, participating\)/)
  assert.match(panel, /FACILITATOR_PARTICIPATION_EVENT/)
  assert.match(panel, /launcherTarget && result \? createPortal\(launcher, launcherTarget\) : null/)
  assert.match(panel, /setLauncherTarget\(hasProfileDashboard \? document\.body : null\)/)
  assert.match(panel, /"is-floating"/)
  assert.doesNotMatch(readRepoFile("app/redesign-calculator.tsx"), /dashboard-facilitator-host/)
  const css = readRepoFile("app/styles/route-layout.css")
  assert.match(css, /body > \.facilitator-launcher\.is-floating \{/)
  assert.match(css, /position: fixed; inset: 50% 18px auto auto/)
  assert.match(browser, /launcher stays on screen while scrolling/)
  assert.match(browser, /drawer stays open after opt-in/)
  assert.match(browser, /drawer stays open after opt-out/)
})

test("Mobile control sizes, equal view options and stacked floating actions", () => {
  const route = readRepoFile("app/styles/route-layout.css")
  const home = readRepoFile("app/styles/home-refactor.css")
  const e2e = readRepoFile("scripts/verify-halloween-ui.mjs")
  assert.match(route, /--arcade-dashboard-control-height: 44px/)
  assert.match(route, /bottom: calc\(132px \+ env\(safe-area-inset-bottom\)\)/)
  assert.match(route, /flex: 0 0 auto; min-height: 0; margin: 0;/)
  assert.match(home, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); gap: 4px/)
  assert.match(e2e, /Guest and Profile have equal widths/)
  assert.match(e2e, /profile card has no excessive blank height/)
  assert.match(e2e, /mobile Facilitator uses a 44px FAB/)
})
 
test("Prize slot history reuses Arcade and seasonal surface colors", () => {
  const css = readRepoFile("app/styles/tier-slot-history.css")
  const chart = readRepoFile("components/arcade/tier-slot-history.tsx")
  assert.match(css, /html\[data-season="halloween"\]/)
  assert.match(css, /html\.light\[data-season="halloween"\]/)
  assert.match(css, /\.tier-trends-dialog\{background:var\(--slot-history-surface\)!important/)
  assert.match(css, /\.tier-trends-trigger\{[^\n]*background:var\(--slot-history-raised\)/)
  assert.match(css, /\.tier-trends-tier-card\{[^\n]*background:var\(--slot-history-row\)/)
  for (const [tier, color] of Object.entries({ trooper: "#2f80ff", ranger: "#2fd17d", champion: "#ff9f1c", legend: "#c054ff" })) {
    assert.match(chart, new RegExp('key: "' + tier + '"[^\\n]*color: "' + color + '"'))
  }
  assert.match(chart, /stroke="var\(--slot-history-accent\)"/)
})

test("mobile bottom navigation follows active section rather than first-child styling", () => {
  const shell = readRepoFile("components/arcade/route-shell.tsx")
  const css = readRepoFile("app/styles/redesign-responsive.css")
  const light = readRepoFile("app/styles/theme-light-components.css")
  assert.match(shell, /function MobileBottomNavigation/)
  assert.match(shell, /window\.addEventListener\("scroll", schedule/)
  assert.match(shell, /window\.addEventListener\("hashchange", syncHash/)
  assert.match(shell, /"aria-current": \(active === id \? "location"/)
  assert.match(shell, /href="#calculator"/)
  assert.match(css, /\.mobile-bottom-nav a\.is-active/)
  assert.doesNotMatch(css, /\.mobile-bottom-nav a:first-child\{color:/)
  assert.match(light, /html\.light \.mobile-bottom-nav a\.is-active/)
})
test("Home saved profile uses the same official avatar source as Dashboard", () => {
  const home = readRepoFile("components/arcade/home-profile-summary.tsx")
  const dashboard = readRepoFile("app/redesign-calculator.tsx")
  const css = readRepoFile("app/styles/route-layout.css")
  assert.match(home, /snapshot\.result\.userDetails\?\.\[0\]\?\.profileImage/)
  assert.match(home, /parsed\.protocol === "https:"/)
  assert.match(home, /onError=\{\(\) => setAvatarFailed\(true\)\}/)
  assert.match(home, /\{initials\}/)
  assert.match(dashboard, /profile\?\.profileImage/)
  assert.match(css, /\.home-profile-avatar img \{[^\n]*object-fit: cover/)
})

test("Guest mobile nav has no dead badges anchor; Profile nav links earned badges", () => {
  const shell = readRepoFile("components/arcade/route-shell.tsx")
  assert.match(shell, /page\.dataset\.dashboardView === "profile"/)
  assert.match(shell, /const thirdId: MobileSection = dashboard && profileView \? "badges" : "monthly-games"/)
  assert.match(shell, /const thirdHref = dashboard && !profileView \? "#monthly-games"/)
  assert.match(shell, /<Link href=\{thirdHref\}/)
})

test("mobile nav chooses the URL hash immediately on cross-page navigation", () => {
  const shell = readRepoFile("components/arcade/route-shell.tsx")
  assert.match(shell, /const syncHash = \(\) =>/)
  assert.match(shell, /window\.location\.hash\.slice\(1\)/)
  assert.match(shell, /setActive\(hash as MobileSection\)/)
  assert.match(shell, /syncHash\(\)\s*window\.addEventListener\("scroll"/)
})

test("Dashboard alone owns the profile input", () => {
  assert.doesNotMatch(readRepoFile("components/arcade/home-page.tsx"), /<ProfileAnalyzer/)
  assert.match(readRepoFile("app/redesign-calculator.tsx"), /<ProfileAnalyzer/)
})


test("Profile Dashboard retains the shared Analyze profile title and compact styles", () => {
  const css = readRepoFile("app/styles/route-layout.css")
  const e2e = readRepoFile("scripts/verify-halloween-ui.mjs")
  assert.doesNotMatch(css, /\.dashboard-analyzer \.analyzer-title \{ display: none; \}/)
  assert.match(css, /--arcade-analyzer-control-height: 46px/)
})

test("Home CTA opens localized Dashboard instead of running a profile request", () => {
  const home = readRepoFile("components/arcade/home-page.tsx")
  const shell = readRepoFile("components/arcade/route-shell.tsx")
  assert.match(home, /getWebsiteLocaleHref\(language.locale\)/)
  assert.match(home, /className="home-intro-primary"/)
  assert.match(shell, /home-bottom-nav/)
  assert.doesNotMatch(home, /onSubmit|PROFILE_URL_PATTERN/)
})


test("Monthly labs are reachable in Guest and Profile Dashboard without putting data on Home", () => {
  const dashboard = readRepoFile("app/redesign-calculator.tsx")
  const guest = readRepoFile("components/arcade/guest-dashboard.tsx")
  const home = readRepoFile("components/arcade/home-page.tsx")
  assert.match(dashboard, /showProfileDashboard \? <div id="monthly-games"/)
  assert.match(guest, /id="monthly-games"/)
  assert.doesNotMatch(home, /id="monthly-games"/)
})
