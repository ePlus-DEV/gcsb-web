import assert from "node:assert/strict"
import test from "node:test"
import {
  evaluateTypeScript,
  readRepoFile,
} from "./helpers/typescript-source.mjs"

const swagSource = readRepoFile("components/arcade/swag-drops.ts")
const {
  ARCADE_SWAG_DROPS,
  getSwagDropsForTier,
} = evaluateTypeScript(swagSource, "swag-drops.ts")

test("2026 swag registry contains only currently confirmed drops", () => {
  assert.equal(ARCADE_SWAG_DROPS.length, 1)

  const jacket = ARCADE_SWAG_DROPS[0]
  assert.equal(jacket.id, "weather-shield-jacket")
  assert.equal(jacket.revealedOnIso, "2026-09-15")
  assert.deepEqual(jacket.tiers, ["champion", "legend"])
  assert.match(jacket.sourceUrl, /^https:\/\/discuss\.google\.dev\//)
  assert.equal(
    ARCADE_SWAG_DROPS.some((drop) => drop.revealedOnIso.startsWith("2025-")),
    false,
  )
})

test("swag registry groups the confirmed jacket by tier", () => {
  assert.equal(getSwagDropsForTier("trooper").length, 0)
  assert.equal(getSwagDropsForTier("ranger").length, 0)
  assert.equal(getSwagDropsForTier("champion")[0]?.id, "weather-shield-jacket")
  assert.equal(getSwagDropsForTier("legend")[0]?.id, "weather-shield-jacket")
})

test("homepage variants and sitemap expose the swag experience", () => {
  assert.match(readRepoFile("app/page.tsx"), /<SwagDropsPreview \/>/)
  assert.match(readRepoFile("app/[locale]/page.tsx"), /<SwagDropsPreview \/>/)
  assert.match(readRepoFile("app/sitemap.ts"), /\/swag-drops\//)
})
