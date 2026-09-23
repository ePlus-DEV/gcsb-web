import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const locales = ["en","vi","ja","ko","zh_CN","fr","de","es","pt_BR","it","ru","ar","hi"]
const required = ["title","subtitle","viewAria","eyebrow","description","loading",
  "pending","checkAgain","unavailable","retry","collecting","timeRange",
  "rewardTiers","showAll","toggleTiers","days","remaining","liveDiffers",
  "visibleSummary","comparedWith","chartTitle","chartSubtitle","noSelection",
  "noPeriodData","notEnoughData","chartNote","lastSaved","aboutTitle",
  "aboutCounts","aboutCompare","aboutDates","aboutUpdate","tooltipValue",
  "changeTitle","changeAria"]
const catalog = (locale) => JSON.parse(readRepoFile("public/i18n/locales/"+locale+".json"))
const placeholders = (value) => [...value.matchAll(/\{[a-z]+\}/g)].map((item) => item[0]).sort()

test("all 13 locales have every translated slot-history label and matching parameters", () => {
  const english = catalog("en")
  assert.equal(new Set(required).size, 35)
  for (const locale of locales) {
    const actual = catalog(locale)
    const keys = Object.keys(actual.additional).filter((key) => key.startsWith("__slotHistory:"))
    assert.equal(keys.length, required.length, locale+": key count")
    for (const key of required) {
      const name = "__slotHistory:" + key
      const translated = actual.additional[name]
      const original = english.additional[name]
      assert.ok(typeof translated === "string" && translated.trim().length > 0,
        locale+": missing "+key)
      assert.deepEqual(placeholders(translated), placeholders(original),
        locale+": placeholder mismatch "+key)
      assert.doesNotMatch(translated, /\b(?:Git|commit|crawler)\b/i,
        locale+": technical text leaked "+key)
      if (locale !== "en" && key !== "eyebrow") {
        assert.notEqual(translated, original, locale+": untranslated "+key)
      }
    }
  }
})

test("slot history uses existing catalog data and the localized static route", () => {
  const helper = readRepoFile("components/arcade/slot-history-copy.ts")
  const page = readRepoFile("app/[locale]/page.tsx")
  assert.ok(helper.includes("catalog.additional["))
  assert.ok(helper.includes("__slotHistory:"))
  assert.ok(page.includes("historyCatalog={catalog}"))
  assert.ok(page.includes("historyLocale={locale}"))
})
