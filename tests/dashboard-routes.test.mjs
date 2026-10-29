import assert from "node:assert/strict"
import test from "node:test"
import fs from "node:fs"
import { readRepoFile } from "./helpers/typescript-source.mjs"

test("Home keeps the full personal Dashboard out of its route bundle", () => {
  const home = readRepoFile("components/arcade/home-page.tsx")
  assert.doesNotMatch(home, /RedesignCalculator|ReleasedPointsPanel|readStoredDashboard|DASHBOARD_STORAGE_KEY|PREVIEW_DEBUG_PROFILE_RESULT/)
  assert.match(home, /PROFILE_URL_PATTERN.test\(profile\)/)
  assert.match(home, /dashboard\/\?profile=\$\{encodeURIComponent\(profile\)\}/)
  assert.match(home, /catalog=\{language.catalog\}/)
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
  assert.match(readRepoFile("components/arcade/home-page.tsx"), /error=\{invalid \? m.invalidProfileUrl : ""\}/)
  assert.match(readRepoFile("components/arcade/route-shell.tsx"), /catalog.messages.dashboardNav/)
})


test("Home and Dashboard keep one responsive tier system and consistent page gutters", () => {
  const css = readRepoFile("app/styles/route-layout.css")
  const tiers = readRepoFile("components/arcade/dashboard-tiers.tsx")
  assert.match(css, /\[data-dashboard-view="guest"\] \.dashboard-analyzer \{\s*max-width: 1000px;/)
  assert.match(css, /\.dashboard-guest-start \{ max-width: 1000px;/)
  assert.match(css, /\.arcade-home-route \.guest-dashboard \.tier-list-row \{ grid-template-columns: 32px minmax\(0, 1fr\)/)
  assert.match(css, /\.arcade-home-route \.guest-dashboard \.tier-list-icon \{ display: grid;/)
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
