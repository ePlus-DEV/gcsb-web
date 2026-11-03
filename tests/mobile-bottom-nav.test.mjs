import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const calculator = readRepoFile("app/redesign-calculator.tsx")
const shell = readRepoFile("components/arcade/route-shell.tsx")
const mobileCss = readRepoFile("app/styles/redesign-responsive.css")
const lightCss = readRepoFile("app/styles/theme-light-components.css")

test("mobile navigation is mounted in the route footer and links to working dashboard sections", () => {
  assert.match(calculator, /<ArcadeFooter\b/)
  assert.match(shell, /function MobileBottomNavigation\(/)
  assert.match(shell, /const thirdId: MobileSection = dashboard && profileView \? "badges" : "monthly-games"/)
  assert.match(shell, /href="#calculator"/)
  assert.match(shell, /href="#tiers"/)
  assert.match(shell, /href=\{thirdHref\}/)
  assert.match(shell, /href=\{dashboardHref\}/)
  assert.match(shell, /<MobileBottomNavigation catalog=\{catalog\}/)
})

test("mobile nav active status follows user clicks, URL hash and scroll", () => {
  assert.match(shell, /className: active === id \? "is-active" : ""/)
  assert.match(shell, /"aria-current": \(active === id \? "location" : undefined\)/)
  assert.match(shell, /onClick: \(\) => select\(id\)/)
  assert.match(shell, /window\.addEventListener\("scroll", schedule/)
  assert.match(shell, /window\.addEventListener\("hashchange", syncHash\)/)
  assert.match(shell, /cancelAnimationFrame\(frame\)/)
  assert.match(mobileCss, /\.mobile-bottom-nav a\.is-active/)
  assert.match(lightCss, /html\.light \.mobile-bottom-nav a\.is-active/)
  assert.doesNotMatch(mobileCss, /\.mobile-bottom-nav a:first-child/)
  assert.doesNotMatch(lightCss, /\.mobile-bottom-nav a:first-child/)
})
