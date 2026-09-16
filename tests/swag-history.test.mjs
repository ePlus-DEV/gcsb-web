import assert from "node:assert/strict"
import test from "node:test"
import {
  evaluateTypeScript,
  readRepoFile,
} from "./helpers/typescript-source.mjs"

const source = readRepoFile("components/arcade/swag-history.ts")
const {
  ARCADE_2025_SWAG_HISTORY,
  ARCADE_2025_SEASON_2_SNOWBALL_SOURCE_URL,
  getHistoricalSwagSeason,
} = evaluateTypeScript(source, "swag-history.ts")

function packageFor(season, tier) {
  return season.packages.find((entry) => entry.tier === tier)
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

  const trooperBackpack = packageFor(season, "trooper")?.items.find(
    (item) => item.name === "The Arcade Trooper Backpack",
  )
  assert.equal(trooperBackpack?.sourceKind, "delivery-evidence")

  for (const entry of season.packages) {
    for (const item of entry.items) {
      assert.match(item.sourceUrl, /^https:\/\//)
      assert.ok(item.sourceKind)
    }
  }
})

test("Season 2 uses the official final wrap-up package counts", () => {
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
  assert.match(season.packageSourceUrl, /that-s-a-wrap-on-google-skills-arcade-2025/)
  assert.match(ARCADE_2025_SEASON_2_SNOWBALL_SOURCE_URL, /swags-that-grow-with-your-skills/)

  for (const entry of season.packages) {
    for (const item of entry.items) {
      assert.equal(item.sourceKind, "official-wrap-up")
    }
  }
})
