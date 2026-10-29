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
