import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const REQUIRED_SWAG_URLS = [
  "https://arcade.eplus.dev/swag-drops/",
  "https://arcade.eplus.dev/swag-drops/2026/",
  "https://arcade.eplus.dev/swag-drops/2026/trooper/",
  "https://arcade.eplus.dev/swag-drops/2026/ranger/",
  "https://arcade.eplus.dev/swag-drops/2026/champion/",
  "https://arcade.eplus.dev/swag-drops/2026/legend/",
  "https://arcade.eplus.dev/swag-drops/2026/weather-shield-jacket/",
]

test("agentic discovery files expose every current swag route", () => {
  const llms = readRepoFile("public/llms.txt")
  const agents = readRepoFile("public/agents.md")

  for (const url of REQUIRED_SWAG_URLS) {
    assert.ok(llms.includes(url), `llms.txt is missing ${url}`)
    assert.ok(agents.includes(url), `agents.md is missing ${url}`)
  }

  assert.ok(llms.includes("https://arcade.eplus.dev/sitemap.xml"))
  assert.ok(llms.includes("https://arcade.eplus.dev/agents.md"))
  assert.ok(agents.includes("https://arcade.eplus.dev/llms.txt"))
  assert.ok(agents.includes("prize slots left"))
  assert.ok(agents.includes("estimates rather than confirmed 2026 item counts"))
})

test("sitemap continues to derive swag URLs from the season registry", () => {
  const sitemap = readRepoFile("app/sitemap.ts")

  assert.match(sitemap, /ARCADE_SWAG_SEASONS/)
  assert.match(sitemap, /ARCADE_SWAG_TIERS/)
  assert.match(sitemap, /swagSeasonPath/)
  assert.match(sitemap, /swagTierPath/)
  assert.match(sitemap, /swagProductPath/)
  assert.match(sitemap, /getSwagDropsForSeason/)
})
