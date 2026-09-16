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
  "Historical archive",
  "Historical reward archive",
  "Google Skills Arcade 2025 swag",
  "Season 1 and Season 2 used different tier thresholds and reward rules. This archive keeps them separate and links each reward back to the strongest source found during the historical crawl.",
  "Season 1",
  "Season 2",
  "5 tiers · 27 tier-item entries",
  "Google Skills Arcade 2025 · Season 1",
  "Google Skills Arcade 2025 · Season 2",
  "January–June 2025",
  "July–December 2025",
  "Official tier rules",
  "Official final package",
  "Snowball rule",
  "Season 1 is reconstructed from official Yugali item announcements. The Trooper backpack is supported by delivery evidence because no standalone official announcement was found in this crawl.",
  "Season 2 package contents are verified against Google's official 2025 final wrap-up; individual items link to their original Yugali reveal posts.",
  "Official wrap-up",
  "Fulfillment source",
  "Delivery evidence",
  "Each tier had its own package. Higher tiers did not automatically inherit every lower-tier package.",
  "Novice and Trooper shared a base family, while Ranger, Champion, and Legend used a separate snowball family. Trooper added one reward to Novice; Champion added to Ranger; Legend added to the Champion collection.",
  "Explore current and historical Google Skills Arcade rewards by year. Each season keeps its own tier requirements and reward rules so older swag never gets mixed into the current season.",
  "Season 1 and Season 2 tier packages reconstructed from official announcements, the final 2025 wrap-up, and clearly labeled supporting evidence.",
  "2 historical seasons",
  "Season 1 + Season 2",
]

function readCatalog(locale) {
  return JSON.parse(
    readFileSync(
      new URL(`../public/i18n/locales/${locale}.json`, import.meta.url),
      "utf8",
    ),
  )
}

test("2025 swag history copy exists in every locale catalog", () => {
  for (const locale of locales) {
    const catalog = readCatalog(locale)
    for (const source of required) {
      const value = catalog.additional?.[source]
      assert.equal(
        typeof value,
        "string",
        `${locale} missing 2025 swag history translation: ${source}`,
      )
      assert.ok(
        value.trim().length > 0,
        `${locale} has empty 2025 swag history translation: ${source}`,
      )
      if (locale !== "en") {
        assert.notEqual(
          value,
          source,
          `${locale} still falls back to English for: ${source}`,
        )
      }
    }
  }
})
