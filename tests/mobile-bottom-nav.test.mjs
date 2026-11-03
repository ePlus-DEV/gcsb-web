import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const calculator = readRepoFile("app/redesign-calculator.tsx")
const mobile = readRepoFile("components/arcade/mobile-bottom-nav.tsx")
const mobileCss = readRepoFile("app/styles/redesign-responsive.css")
const lightCss = readRepoFile("app/styles/theme-light-components.css")
const anchorsCss = readRepoFile("app/styles/header-compact.css")

test("mobile footer routes to real destinations in Guest, empty Profile and analyzed Profile", () => {
  assert.match(calculator, /<MobileBottomNav\b/)
  assert.match(calculator, /hasResult=\{showProfileDashboard\}/)
  assert.match(mobile, /showBadges = viewMode === "profile" && hasResult/)
  assert.match(mobile, /showBadges \? "badges" : "monthly-games"/)
  for (const target of ["calculator", "tiers", "extension"]) {
    assert.ok(mobile.includes(`id: "${target}"`), target)
  }
  assert.match(mobile, /href=\{`#\$\{id\}`\}/)
  assert.match(anchorsCss, /#monthly-games,/)
})

test("mobile footer active state is based on selection, hash and scrolling, not fixed first child", () => {
  assert.match(mobile, /aria-current=\{activeTarget === id \? "location" : undefined\}/)
  assert.match(mobile, /onClick=\{\(\) => setActiveTarget\(id\)\}/)
  assert.match(mobile, /window\.addEventListener\("scroll", scheduleSync/)
  assert.match(mobile, /window\.addEventListener\("hashchange", scheduleSync/)
  assert.match(mobile, /window\.cancelAnimationFrame\(frame\)/)
  assert.match(mobileCss, /\.mobile-bottom-nav a\[aria-current="location"\]/)
  assert.match(lightCss, /html\.light \.mobile-bottom-nav a\[aria-current="location"\]/)
  assert.doesNotMatch(mobileCss, /\.mobile-bottom-nav a:first-child/)
  assert.doesNotMatch(lightCss, /\.mobile-bottom-nav a:first-child/)
})
