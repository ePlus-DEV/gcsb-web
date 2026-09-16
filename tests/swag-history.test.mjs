import assert from "node:assert/strict"
import test from "node:test"
import {
  evaluateTypeScript,
  readRepoFile,
} from "./helpers/typescript-source.mjs"

const source = readRepoFile("components/arcade/swag-history.ts")
const {
  ARCADE_2025_SWAG_HISTORY,
  ARCADE_2025_SEASON_2_FINAL_WRAP_URL,
  ARCADE_2025_SEASON_2_SNOWBALL_SOURCE_URL,
  getHistoricalSwagSeason,
} = evaluateTypeScript(source, "swag-history.ts")

function packageFor(season, tier) {
  return season.packages.find((entry) => entry.tier === tier)
}

function itemFor(season, tier, name) {
  return packageFor(season, tier)?.items.find((item) => item.name === name)
}

test("2025 swag history keeps Season 1 and Season 2 separate", () => {
  assert.equal(ARCADE_2025_SWAG_HISTORY.length, 2)
  assert.deepEqual(
    ARCADE_2025_SWAG_HISTORY.map((entry) => entry.season),
    [1, 2],
  )

  const season1 = getHistoricalSwagSeason(2025, 1)
  const season2 = getHistoricalSwagSeason(2025, 2)

  assert.ok(season1)
  assert.ok(season2)
  assert.equal(season1.packages.length, 5)
  assert.equal(season2.packages.length, 5)
})

test("Season 1 package counts match the reconstructed historical record", () => {
  const season = getHistoricalSwagSeason(2025, 1)
  assert.ok(season)

  assert.equal(packageFor(season, "novice")?.items.length, 4)
  assert.equal(packageFor(season, "trooper")?.items.length, 5)
  assert.equal(packageFor(season, "ranger")?.items.length, 5)
  assert.equal(packageFor(season, "champion")?.items.length, 6)
  assert.equal(packageFor(season, "legend")?.items.length, 7)

  assert.equal(packageFor(season, "novice")?.pointsLabel, "20–39 points")
  assert.equal(packageFor(season, "trooper")?.pointsLabel, "40–64 points")
  assert.equal(packageFor(season, "legend")?.pointsLabel, "85+ points")

  const trooperBackpack = itemFor(season, "trooper", "The Arcade Trooper Backpack")
  assert.equal(trooperBackpack?.sourceKind, "delivery-evidence")
  assert.equal(trooperBackpack?.revealedOnIso, undefined)

  assert.equal(
    itemFor(season, "novice", "The Arcade Mug")?.revealedOnIso,
    "2025-05-09",
  )
  assert.equal(
    itemFor(season, "legend", "The Arcade Legend Backpack")?.revealedOnIso,
    "2025-06-27",
  )

  for (const entry of season.packages) {
    for (const item of entry.items) {
      assert.match(item.sourceUrl, /^https:\/\//)
      assert.ok(item.sourceKind)
      if (item.sourceKind === "official-announcement") {
        assert.match(item.sourceUrl, /^https:\/\/discuss\.google\.dev\//)
        assert.match(item.revealedOnIso, /^2025-\d{2}-\d{2}$/)
      }
    }
  }
})

test("Season 2 uses individual announcements plus the official final wrap-up", () => {
  const season = getHistoricalSwagSeason(2025, 2)
  assert.ok(season)

  assert.equal(packageFor(season, "novice")?.items.length, 4)
  assert.equal(packageFor(season, "trooper")?.items.length, 5)
  assert.equal(packageFor(season, "ranger")?.items.length, 5)
  assert.equal(packageFor(season, "champion")?.items.length, 6)
  assert.equal(packageFor(season, "legend")?.items.length, 7)

  assert.equal(packageFor(season, "novice")?.pointsLabel, "25–44 points")
  assert.equal(packageFor(season, "trooper")?.pointsLabel, "45–64 points")
  assert.equal(packageFor(season, "legend")?.pointsLabel, "95+ points")
  assert.equal(season.packageSourceUrl, ARCADE_2025_SEASON_2_FINAL_WRAP_URL)
  assert.match(season.packageSourceUrl, /that-s-a-wrap-on-google-skills-arcade-2025/)
  assert.match(ARCADE_2025_SEASON_2_SNOWBALL_SOURCE_URL, /swags-that-grow-with-your-skills/)

  assert.equal(
    itemFor(season, "ranger", "The Arcade USB Hub")?.revealedOnIso,
    "2025-10-13",
  )
  assert.equal(
    itemFor(season, "trooper", "The Arcade Trooper Backpack")?.revealedOnIso,
    "2025-12-26",
  )
  assert.match(
    itemFor(season, "legend", "The Arcade Legend Backpack")?.sourceUrl ?? "",
    /arcade-legend-backpack/,
  )

  for (const entry of season.packages) {
    for (const item of entry.items) {
      assert.equal(item.sourceKind, "official-announcement")
      assert.match(item.sourceUrl, /^https:\/\/discuss\.google\.dev\//)
      assert.match(item.revealedOnIso, /^2025-\d{2}-\d{2}$/)
    }
  }
})

test("2025 swag history is exposed as a sourced public archive page", () => {
  const page = readRepoFile("app/swag-drops/2025/page.tsx")
  const archive = readRepoFile("app/swag-drops/page.tsx")

  assert.match(page, /ARCADE_2025_SWAG_HISTORY/)
  assert.match(page, /Season 1 is reconstructed from official Yugali item announcements/)
  assert.match(page, /Season 2 package contents are verified against Google/)
  assert.match(page, /Official tier rules/)
  assert.match(page, /Official final package/)
  assert.match(page, /Snowball rule/)
  assert.match(page, /Delivery evidence/)
  assert.match(page, /item\.sourceUrl/)
  assert.match(page, /revealedOnIso/)
  assert.match(archive, /\/swag-drops\/2025\//)
  assert.match(archive, /ARCADE_2025_SWAG_HISTORY/)
})
