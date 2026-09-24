import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const home = readRepoFile("app/page.tsx")
const localizedHome = readRepoFile("app/[locale]/page.tsx")
const calculator = readRepoFile("app/redesign-calculator.tsx")
const monthlyGate = readRepoFile("components/arcade/monthly-games-panel-gate.tsx")
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
