import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const locales = [
  "en",
  "vi",
  "ja",
  "ko",
  "zh_CN",
  "fr",
  "de",
  "es",
  "pt_BR",
  "it",
  "ru",
  "ar",
  "hi",
]

const required = [
  "Swag Drops",
  "Arcade rewards archive",
  "Swag drops by season",
  "Arcade 2026 rewards",
  "Google Skills Arcade 2026 swag drops",
  "See each tier's current reward lineup at a glance: revealed swag, officially promised rewards, live prize-slot availability, estimated remaining items, and historical context.",
  "Current reward lineup",
  "Revealed",
  "Officially promised",
  "Name not revealed yet",
  "No named 2026 item yet",
  "Projected package",
  "Known now",
  "Swag still unrevealed",
  "Details",
  "2026 rewards by tier",
  "Official pending",
  "Historical estimate",
  "Why are package totals marked with ≈?",
  "View the 2025 baseline used for the projection",
  "Hall of Swag Winners",
  "Prize slots left",
  "Live",
  "Total only",
  "Prize slots remaining",
  "Live crawler data",
  "Loading live data",
  "What we know about the 2026 package",
  "Compare all tiers",
  "Historical projection",
  "Historical reference only",
  "Official 2025 wrap-up",
  "Reward details",
  "Official announcement",
  "Ranger bonus reward",
  "Legend-only reward",
  "Included with the Champion collection",
  "Name/details not revealed yet",
  "2025 Season 2 final",
  "__swag:knownNow",
  "__swag:revealedPending",
  "__swag:totalPrizeSlots",
  "__swag:percentLeft",
  "__swag:baseline",
  "__swag:projectedItems",
]

const dynamicPlaceholders = {
  "__swag:knownNow": ["{known}", "{unrevealed}"],
  "__swag:revealedPending": ["{revealed}", "{pending}"],
  "__swag:totalPrizeSlots": ["{count}"],
  "__swag:percentLeft": ["{percent}"],
  "__swag:baseline": ["{count}"],
  "__swag:projectedItems": ["{count}"],
}

function readCatalog(locale) {
  return JSON.parse(
    readFileSync(
      new URL(`../public/i18n/locales/${locale}.json`, import.meta.url),
      "utf8",
    ),
  )
}

test("swag UI copy exists in every locale catalog", () => {
  for (const locale of locales) {
    const catalog = readCatalog(locale)
    for (const source of required) {
      assert.equal(
        typeof catalog.additional?.[source],
        "string",
        `${locale} missing swag translation: ${source}`,
      )
      assert.ok(
        catalog.additional[source].trim().length > 0,
        `${locale} has empty swag translation: ${source}`,
      )
    }
  }
})

test("dynamic swag translations preserve their runtime placeholders", () => {
  for (const locale of locales) {
    const catalog = readCatalog(locale)
    for (const [key, placeholders] of Object.entries(dynamicPlaceholders)) {
      const value = catalog.additional[key]
      for (const placeholder of placeholders) {
        assert.ok(
          value.includes(placeholder),
          `${locale} ${key} is missing placeholder ${placeholder}`,
        )
      }
    }
  }
})

test("dynamic swag translation patterns are wired through website i18n", () => {
  const source = readFileSync(
    new URL("../lib/website-i18n.ts", import.meta.url),
    "utf8",
  )
  for (const key of [
    "knownNow",
    "revealedPending",
    "totalPrizeSlots",
    "percentLeft",
    "baseline",
    "projectedItems",
  ]) {
    assert.match(source, new RegExp(`__swag:${key}`))
  }
})
