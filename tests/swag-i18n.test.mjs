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


const extendedSwagSources = ['Explore confirmed Google Skills Arcade rewards by year. Each season keeps its own tier requirements, prize-slot rules, and swag announcements so older rewards never get mixed into the current season.', "Google has not revealed this tier's item names yet.", 'Reward names stay prominent, while live prize slots and package progress sit in a separate status bar underneath each tier.', '≈ Historical estimate', "2026 estimates use this completed season plus Google's published Snowball relationships.", 'Verified community delivery photos from public Google Developer forum posts.', 'Source opens on click', 'Named 2026 rewards come only from official Google Developer forum announcements. Live prize-slot counts use the same continuously updated data source as the calculator. Totals marked ≈ are projections, not confirmed counts.', '2026 tiers', '2026 Snowball rules', 'Champion milestone swag', 'Community winner photo · 2024', 'Legend package delivery', 'Community delivery photo · 2025', 'Inherited from the Trooper pack', 'Historical projection, not final 2026 total', 'Swag unrevealed', 'Revealed rewards and officially promised items are separated from the historical projection.', 'Google has not published these 2026 item names. The count only reflects the prior-season package-size baseline.', '2026 package rule', 'Waterfall allocation', 'Prize slots are recipient capacity, not a published physical inventory count for each swag item. Live remaining slots are loaded from the latest available milestone data.', 'Official tier announcement', 'Official Snowball rules', 'Features announced for this reward', 'Eligible tiers & live availability', 'Combined prize-slot capacity', 'Maximum recipient capacity across the eligible tier pools. Live remaining counts are shown per tier because the pools fill independently. This is not a published stock count for the physical item.', 'Official Google reveal', 'A lightweight weather layer announced for the Arcade Champion and Arcade Legend tiers.', 'Light-rain and wind-resistant outer weave', 'Google Cloud chest branding and super cloud sleeve mark', 'High collar, adjustable cuffs, and elastic hem', 'Deep zippered hand-warmer pockets', 'Lightweight construction for everyday movement', 'Trooper is the foundational reward tier. Google describes it as a core swag pack, but the individual 2026 item names and final item count have not been published yet.', 'Trooper is the broadest 2026 prize pool. Waterfall can move eligible participants into this pool when higher-tier capacity is exhausted.', 'Core Trooper swag pack · historical estimate ≈5 items', "Official minimum: 1+ item from Google's core-pack wording. Historical estimate: about 5 items, because the official 2025 Season 2 Trooper package finished with 5 items.", 'Ranger receives everything from the Trooper reward family plus one additional bonus reward. The individual 2026 item names have not been published yet.', 'Ranger has its own prize-slot pool. Waterfall allocation is separate from the reward bundle inheritance between Ranger and Trooper.', 'Trooper pack + 1 Ranger bonus · historical estimate ≈6 items', 'Official minimum: 2+ items from the Snowball rule. Historical estimate: about 6 items if the 2026 Trooper pack follows the 2025 Trooper baseline of about 5, then Ranger adds one bonus reward.', 'Champion starts the upper-tier reward family. Google describes a high-tier collection of premium Arcade gear, with the Weather-Shield Jacket currently the first named 2026 item.', 'Champion has 3,000 prize slots. If a higher-tier pool fills, Waterfall determines how eligible participants roll into the next prize pool.', 'High-tier Champion collection · historical estimate ≈6 items', 'Official minimum: 1+ item because the Weather-Shield Jacket is confirmed. Historical estimate: about 6 items, matching the official final Champion package in 2025 Season 2.', 'Legend receives the complete Champion reward family plus one exclusive Legend-only reward. The Legend-exclusive item has not been named yet.', 'Legend is the highest 2026 prize tier with 2,500 slots. Waterfall applies to prize-slot allocation, not to which swag belongs to a tier.', 'Champion pack + 1 Legend exclusive · historical estimate ≈7 items', 'Official minimum: 2+ items, including the Champion Jacket plus the promised Legend-exclusive reward. Historical estimate: about 7 items, matching 2025 Season 2 and the 2026 Champion + 1 rule if Champion stays near 6.', 'See the current 2026 Trooper reward outlook, live prize-slot availability, revealed swag, officially promised items, projected package size, and the official 2025 package used as a historical reference.', 'See the current 2026 Ranger reward outlook, live prize-slot availability, revealed swag, officially promised items, projected package size, and the official 2025 package used as a historical reference.', 'See the current 2026 Champion reward outlook, live prize-slot availability, revealed swag, officially promised items, projected package size, and the official 2025 package used as a historical reference.', 'See the current 2026 Legend reward outlook, live prize-slot availability, revealed swag, officially promised items, projected package size, and the official 2025 package used as a historical reference.', 'Breadcrumb', 'September 15, 2026', 'September 16, 2026']
const extendedSwagDynamic = ['__swag:dropNumber', '__swag:arcadeDropNumber', '__swag:firstDrop', '__swag:revealedDate', '__swag:dropRevealed', '__swag:moreUnrevealed', '__swag:packageOutlook', '__swag:projectedRewards', '__swag:tierPackage', '__swag:allRewards', '__swag:allRewardsArrow', '__swag:seasonLabel', '__swag:confirmedDrops', '__swag:latest', '__swag:sharedBy', '__swag:verifiedCapacity', '__swag:capacityRemaining', '__swag:pointsLabel', '__swag:itemCount', '__swag:seasonTierDesc', '__swag:tierRewardsTitle', '__swag:historicalTierReference']

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
  "Live availability",
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
