import { readFileSync } from "node:fs"
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
  assert.equal(ARCADE_SWAG_DROPS.length, 7)
  assert.equal(new Set(ARCADE_SWAG_DROPS.map((drop) => drop.id)).size, 7)

  const techpack = ARCADE_SWAG_DROPS[0]
  assert.equal(techpack.id, "arcade-techpack")
  assert.equal(techpack.dropNumber, 7)
  assert.equal(techpack.revealedOnIso, "2026-11-08")
  assert.deepEqual(techpack.tiers, ["champion", "legend"])
  assert.match(techpack.sourceUrl, /swag-drop-the-arcade-techpack\/411969$/)
  assert.equal(techpack.imageUrl, "/images/swag/2026/arcade-techpack.gif")
  assert.equal(techpack.features.length, 7)

  const lumi = ARCADE_SWAG_DROPS[1]
  assert.equal(lumi.id, "arcade-lumisnap-magnetic-fill-light")
  assert.equal(lumi.dropNumber, 6)
  assert.equal(lumi.revealedOnIso, "2026-11-03")
  assert.deepEqual(lumi.tiers, ["champion", "legend"])
  assert.match(lumi.sourceUrl, /swag-drop-the-arcade-lumisnap-magnetic-fill-light\/410531$/)
  assert.equal(lumi.imageUrl, "/images/swag/2026/arcade-lumisnap-magnetic-fill-light.gif")
  assert.equal(lumi.features.length, 5)

  const mug = ARCADE_SWAG_DROPS[2]
  assert.equal(mug.id, "arcade-magic-mug")
  assert.equal(mug.dropNumber, 5)
  assert.equal(mug.revealedOnIso, "2026-10-23")
  assert.deepEqual(mug.tiers, ["trooper", "ranger"])
  assert.match(mug.sourceUrl, /swag-drop-the-arcade-magic-mug\/407455$/)

  const bottle = ARCADE_SWAG_DROPS[3]
  assert.equal(bottle.id, "arcade-travel-bottle")
  assert.equal(bottle.dropNumber, 4)
  assert.equal(bottle.revealedOnIso, "2026-10-16")
  assert.deepEqual(bottle.tiers, ["trooper", "ranger"])
  assert.match(bottle.sourceUrl, /swag-drop-the-arcade-travel-bottle\/405316$/)
  assert.equal(bottle.imageUrl, "/images/swag/2026/arcade-travel-bottle.gif")
  assert.equal(bottle.features.length, 5)

  const popup = ARCADE_SWAG_DROPS[4]
  assert.equal(popup.id, "arcade-popup-pro")
  assert.equal(popup.dropNumber, 3)
  assert.equal(popup.revealedOnIso, "2026-10-12")
  assert.deepEqual(popup.tiers, ["champion", "legend"])
  assert.match(popup.sourceUrl, /swag-drop-the-arcade-popup-pro\/403522$/)
  assert.equal(popup.imageUrl, "/images/swag/2026/arcade-popup-pro.gif")
  assert.equal(popup.features.length, 5)

  const backpack = ARCADE_SWAG_DROPS[5]
  assert.equal(backpack.id, "arcade-backpack")
  assert.equal(backpack.season, 2026)
  assert.equal(backpack.dropNumber, 2)
  assert.equal(backpack.revealedOnIso, "2026-09-24")
  assert.deepEqual(backpack.tiers, ["ranger"])
  assert.match(backpack.sourceUrl, /swag-drop-the-arcade-backpack\/399232$/)
  assert.equal(backpack.imageUrl, "/images/swag/2026/arcade-backpack.gif")
  assert.equal(backpack.features.length, 5)

  const jacket = ARCADE_SWAG_DROPS[6]
  assert.equal(jacket.id, "weather-shield-jacket")
  assert.equal(jacket.dropNumber, 1)
  assert.deepEqual(jacket.tiers, ["champion", "legend"])
  assert.equal(
    ARCADE_SWAG_DROPS.some((drop) => drop.revealedOnIso.startsWith("2025-")),
    false,
  )
})

test("every 2026 swag image is locally hosted and preserves the GIF format", () => {
  for (const drop of ARCADE_SWAG_DROPS) {
    const expectedImageUrl = "/images/swag/2026/" + drop.id + ".gif"
    assert.equal(drop.imageUrl, expectedImageUrl, drop.id + " must use a local asset")
    const bytes = readFileSync(new URL("../public" + expectedImageUrl, import.meta.url))
    assert.ok(bytes.length > 100, drop.id + " must have non-empty image bytes")
    assert.match(bytes.subarray(0, 6).toString("ascii"), /^GIF(?:87a|89a)$/, drop.id)
    assert.match(drop.sourceUrl, /^https:\/\/discuss\.google\.dev\//)
  }

  const artwork = readRepoFile("components/arcade/swag-artwork.tsx")
  assert.match(artwork, /NEXT_PUBLIC_BASE_PATH/)
  assert.match(artwork, /basePath \+ src/)
})

test("swag registry groups confirmed rewards by season and tier", () => {
  assert.equal(getSwagDropsForSeason(2026).length, 7)
  assert.equal(getSwagDropsForSeason(2025).length, 0)
  assert.deepEqual(getSwagDropsForTier("trooper", 2026).map((item) => item.id), ["arcade-magic-mug", "arcade-travel-bottle"])
  assert.deepEqual(getSwagDropsForTier("ranger", 2026).map((item) => item.id), ["arcade-magic-mug", "arcade-travel-bottle", "arcade-backpack"])
  assert.deepEqual(getSwagDropsForTier("champion", 2026).map((item) => item.id), ["arcade-techpack", "arcade-lumisnap-magnetic-fill-light", "arcade-popup-pro", "weather-shield-jacket"])
  assert.deepEqual(getSwagDropsForTier("legend", 2026).map((item) => item.id), ["arcade-techpack", "arcade-lumisnap-magnetic-fill-light", "arcade-popup-pro", "weather-shield-jacket"])
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

test("swag pages expose live remaining prize-slot data", () => {
  const liveSlots = readRepoFile("components/arcade/live-tier-slots.tsx")
  const seasonPage = readRepoFile("app/swag-drops/2026/page.tsx")
  const detailPage = readRepoFile("app/swag-drops/2026/[slug]/page.tsx")

  assert.match(liveSlots, /ARCADE_MILESTONES_URL/)
  assert.match(liveSlots, /cache: "no-store"/)
  assert.match(liveSlots, /candidate\.spotsLeft/)
  assert.match(liveSlots, /Prize slots left/)
  assert.match(liveSlots, /Prize slots remaining/)
  assert.match(liveSlots, /Live availability/)
  assert.match(liveSlots, /% left/)

  assert.match(seasonPage, /LiveTierSlots/)
  assert.match(seasonPage, /Swag still unrevealed/)
  assert.match(detailPage, /LiveTierSlots/)
  assert.match(detailPage, /Eligible tiers & live availability/)
})

test("season hub exposes a balanced reward board without hiding tier rewards", () => {
  const archivePage = readRepoFile("app/swag-drops/page.tsx")
  const seasonPage = readRepoFile("app/swag-drops/2026/page.tsx")
  const detailPage = readRepoFile("app/swag-drops/2026/[slug]/page.tsx")
  const seasonMeta = readRepoFile("components/arcade/swag-seasons.ts")

  assert.match(archivePage, /Swag drops by season/)
  assert.match(archivePage, /HistoricalSwagImage/)
  assert.match(archivePage, /const previews = drops\.slice\(0, 4\)/)
  assert.equal((archivePage.match(/flex h-32 gap-px/g) ?? []).length, 2)
  assert.equal((archivePage.match(/flex h-full flex-col overflow-hidden/g) ?? []).length, 2)
  assert.equal((archivePage.match(/mt-auto flex flex-wrap gap-2 pt-6/g) ?? []).length, 2)
  assert.match(seasonPage, /Google Skills Arcade 2026 swag drops/)
  assert.match(seasonPage, /2026 rewards by tier/)
  assert.match(seasonPage, /Current reward lineup/)
  assert.match(seasonPage, /Projected package/)
  assert.match(seasonPage, /Known now/)
  assert.match(seasonPage, /Swag still unrevealed/)
  assert.match(seasonPage, /Officially promised/)
  assert.doesNotMatch(seasonPage, /title: "Ranger bonus reward"/)
  assert.match(seasonPage, /Legend-only reward/)
  assert.match(seasonPage, /No named 2026 item yet/)
  assert.match(seasonPage, /revealedRelationship/)
  assert.match(seasonPage, /swagProductPath\(season, drop\.id\)/)
  assert.match(seasonPage, /lg:grid-cols-\[180px_minmax\(0,1fr\)\]/)
  assert.match(
    seasonPage,
    /lg:grid-cols-\[minmax\(220px,1\.35fr\)_minmax\(115px,\.7fr\)_minmax\(115px,\.7fr\)_minmax\(150px,\.9fr\)_auto\]/,
  )
  assert.match(seasonPage, /min-w-\[240px\] flex-1/)
  assert.doesNotMatch(seasonPage, /lg:grid-cols-\[170px_minmax\(0,1fr\)_210px\]/)
  assert.doesNotMatch(seasonPage, /Unrevealed item \{index \+ 1\}/)
  assert.doesNotMatch(seasonPage, /auto-rows-fr/)

  assert.match(seasonPage, /Why are package totals marked with ≈\?/)
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
  assert.match(seasonMeta, /historicalReferenceItems/)
  assert.match(seasonMeta, /The Arcade Trooper Backpack/)
  assert.match(seasonMeta, /The Arcade Refresh Water Bottle/)
  assert.match(seasonMeta, /The Arcade Legend Backpack/)
  assert.match(seasonMeta, /officialPendingRewards/)
  assert.match(seasonMeta, /2025 Season 2 Champion package contained 6 items/)
  assert.match(seasonMeta, /that-s-a-wrap-on-google-skills-arcade-2025/)

  assert.match(detailPage, /generateStaticParams/)
  assert.match(detailPage, /BreadcrumbList/)
  assert.match(detailPage, /package outlook/)
  assert.match(detailPage, /What we know about the \$\{season\} package/)
  assert.match(detailPage, /Historical reference only/)
  assert.match(detailPage, /historicalReferenceItems\.map/)
  assert.match(detailPage, /projectedRemaining/)
  assert.match(detailPage, /Officially promised/)
  assert.match(detailPage, /Waterfall allocation/)
  assert.match(detailPage, /Official Google reveal/)
  assert.match(detailPage, /Combined prize-slot capacity/)
})


test("2026 TechPack is the latest official drop for Champion and Legend", () => {
  const preview = readRepoFile("components/arcade/swag-drops-preview.tsx")
  const seasonPage = readRepoFile("app/swag-drops/2026/page.tsx")
  const detailPage = readRepoFile("app/swag-drops/2026/[slug]/page.tsx")
  const seasonMeta = readRepoFile("components/arcade/swag-seasons.ts")
  assert.equal(getSwagDropsForSeason(2026)[0]?.id, "arcade-techpack")
  assert.equal(getSwagDropsForTier("ranger", 2026).length, 3)
  assert.equal(getSwagDropsForTier("champion", 2026).length, 4)
  assert.equal(getSwagDropsForTier("legend", 2026).length, 4)
  assert.match(preview, /latest\.tiers/)
  assert.doesNotMatch(preview, /Arcade Champion · Arcade Legend/)
  assert.match(seasonPage, /updated=\{latest\?\.revealedOn/)
  assert.match(detailPage, /getSwagDropsForSeason\(season\)\.map/)
  assert.match(seasonMeta, /the Arcade Travel Bottle and Arcade Magic Mug, plus the exclusive Ranger bonus reward/)
  assert.match(seasonMeta, /officialPendingRewards: \[\]/)
  assert.match(seasonMeta, /Weather-Shield Jacket, Arcade PopUp Pro, LumiSnap Magnetic Fill Light, and Arcade TechPack are confirmed/)
  assert.match(seasonMeta, /knownMinimumItems: "4\+"/)
})
