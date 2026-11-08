import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

test("real 2025 swag gallery credits recipients and separates community photos from official artwork", () => {
  const data = readRepoFile("components/arcade/real-world-swag-photos.ts")
  const page = readRepoFile("app/swag-drops/2025/page.tsx")

  const ids = [...data.matchAll(/id: "(s[12]-[^"]+)"/g)].map((match) => match[1])
  assert.equal(ids.length, 5)
  assert.equal(new Set(ids).size, ids.length)
  assert.match(data, /season: 1/)
  assert.match(data, /season: 2/)
  assert.match(data, /sourcePlatform: "LinkedIn"/)
  assert.match(data, /sourcePlatform: "Google Developer Forum"/)
  assert.match(data, /sourcePlatform: "Reddit"/)
  assert.match(data, /preview\.redd\.it/)
  assert.match(data, /media\.licdn\.com/)
  assert.match(data, /discuss\.google\.dev/)
  assert.match(data, /actual delivered|actual 2025|actual Legend|Actual Legend|Real-world/)
  assert.match(data, /original contributors/)
  assert.match(page, /Real-world photos from Arcade winners/)
  assert.match(page, /REAL_WORLD_2025_SWAG_PHOTOS\.map/)
  assert.match(page, /src=\{photo\.imageUrl\}/)
  assert.match(page, /href=\{photo\.sourceUrl\}/)
  assert.match(page, /Photo by \{photo\.author\}/)
  assert.match(page, /not official Google marketing renders/)
})
