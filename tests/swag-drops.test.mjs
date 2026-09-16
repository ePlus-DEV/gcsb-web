import assert from "node:assert/strict"
import test from "node:test"
import {
  evaluateTypeScript,
  readRepoFile,
} from "./helpers/typescript-source.mjs"

const swagSource = readRepoFile("components/arcade/swag-drops.ts")
const {
  ARCADE_SWAG_DROPS,
  ARCADE_SWAG_SEASONS,
  ARCADE_SWAG_TIERS,
  getSwagDropsForSeason,
  getSwagDropsForTier,
} = evaluateTypeScript(swagSource, "swag-drops.ts")

test("2026 swag registry contains only currently confirmed drops", () => {
  assert.deepEqual(ARCADE_SWAG_SEASONS, [2026])
  assert.deepEqual(ARCADE_SWAG_TIERS, ["trooper", "ranger", "champion", "legend"])
  assert.equal(ARCADE_SWAG_DROPS.length, 1)

  const jacket = ARCADE_SWAG_DROPS[0]
  assert.equal(jacket.id, "weather-shield-jacket")
  assert.equal(jacket.season, 2026)
  assert.equal(jacket.dropNumber, 1)
  assert.equal(jacket.revealedOnIso, "2026-09-15")
  assert.deepEqual(jacket.tiers, ["champion", "legend"])
  assert.match(jacket.sourceUrl, /^https:\/\/discuss\.google\.dev\//)
  assert.equal(
    ARCADE_SWAG_DROPS.some((drop) => drop.revealedOnIso.startsWith("2025-")),
    false,
  )
})

test("swag registry groups confirmed rewards by season and tier", () => {
  assert.equal(getSwagDropsForSeason(2026).length, 1)
  assert.equal(getSwagDropsForSeason(2025).length, 0)
  assert.equal(getSwagDropsForTier("trooper", 2026).length, 0)
  assert.equal(getSwagDropsForTier("ranger", 2026).length, 0)
  assert.equal(getSwagDropsForTier("champion", 2026)[0]?.id, "weather-shield-jacket")
  assert.equal(getSwagDropsForTier("legend", 2026)[0]?.id, "weather-shield-jacket")
})

test("homepage and sitemap expose the season-aware swag experience", () => {
  assert.match(readRepoFile("app/page.tsx"), /<SwagDropsPreview \/>/)
  assert.match(readRepoFile("app/[locale]/page.tsx"), /<SwagDropsPreview \/>/)

  const preview = readRepoFile("components/arcade/swag-drops-preview.tsx")
  assert.match(preview, /swagSeasonPath\(CURRENT_SWAG_SEASON\)/)

  const sitemap = readRepoFile("app/sitemap.ts")
  assert.match(sitemap, /ARCADE_SWAG_SEASONS/)
  assert.match(sitemap, /swagTierPath/)
  assert.match(sitemap, /swagProductPath/)
})

test("season hub exposes each tier reward lineup without opening detail pages", () => {
  const archivePage = readRepoFile("app/swag-drops/page.tsx")
  const seasonPage = readRepoFile("app/swag-drops/2026/page.tsx")
  const detailPage = readRepoFile("app/swag-drops/2026/[slug]/page.tsx")
  const seasonMeta = readRepoFile("components/arcade/swag-seasons.ts")

  assert.match(archivePage, /Swag drops by season/)
  assert.match(seasonPage, /Google Skills Arcade 2026 swag drops/)
  assert.match(seasonPage, /2026 rewards by tier/)
  assert.match(seasonPage, /What this tier currently includes/)
  assert.match(seasonPage, /Projected package/)
  assert.match(seasonPage, /Official pending/)
  assert.match(seasonPage, /Projected mystery/)
  assert.match(seasonPage, /Officially promised/)
  assert.match(seasonPage, /Ranger bonus reward/)
  assert.match(seasonPage, /Legend-only reward/)
  assert.match(seasonPage, /Placeholder from the 2025 package-size baseline/)
  assert.match(seasonPage, /revealedRelationship/)
  assert.match(seasonPage, /swagProductPath\(season, drop\.id\)/)
  assert.match(seasonPage, /lg:grid-cols-2/)

  assert.match(seasonPage, /2025 final package reference/)
  assert.match(seasonPage, /Hall of Swag Winners/)
  assert.match(seasonPage, /COMMUNITY_SWAG_GALLERY/)
  assert.match(seasonPage, /Shared by/)
  assert.match(seasonPage, /SyncWithAni/)
  assert.match(seasonPage, /Premal_Bhagat/)
  assert.match(seasonPage, /SWAG_2025_FINAL_REFERENCE_URL/)

  assert.match(seasonMeta, /historical estimate ≈5 items/)
  assert.match(seasonMeta, /historical estimate ≈6 items/)
  assert.match(seasonMeta, /historical estimate ≈7 items/)
  assert.match(seasonMeta, /historicalEstimateLabel: "≈5 items"/)
  assert.match(seasonMeta, /historicalEstimateLabel: "≈6 items"/)
  assert.match(seasonMeta, /historicalEstimateLabel: "≈7 items"/)
  assert.match(seasonMeta, /2025 Season 2 Champion package contained 6 items/)
  assert.match(seasonMeta, /that-s-a-wrap-on-google-skills-arcade-2025/)

  assert.match(detailPage, /generateStaticParams/)
  assert.match(detailPage, /BreadcrumbList/)
  assert.match(detailPage, /Package rule/)
  assert.match(detailPage, /Final package total: TBA/)
  assert.match(detailPage, /Waterfall allocation/)
  assert.match(detailPage, /Official Google reveal/)
  assert.match(detailPage, /Combined prize-slot capacity/)
})
