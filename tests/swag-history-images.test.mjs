import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

test("2025 swag history uses sourced reveal imagery instead of decorative placeholders", () => {
  const images = readRepoFile("components/arcade/swag-history-images.ts")
  const page = readRepoFile("app/swag-drops/2025/page.tsx")

  const cloudfrontImages = images.match(
    /https:\/\/d2yds90mtvelsl\.cloudfront\.net\/original\/[^\"\s]+/g,
  ) ?? []

  assert.ok(cloudfrontImages.length >= 30)
  assert.match(images, /The Arcade Mug/)
  assert.match(images, /The Arcade Ranger Backpack/)
  assert.match(images, /The Arcade Hoodie/)
  assert.match(images, /The Arcade Legend Backpack/)
  assert.doesNotMatch(images, /d3byx8b92xw3lq\.cloudfront\.net/)

  assert.match(page, /getHistoricalSeasonPreviewImages/)
  assert.match(page, /getHistoricalSwagImage/)
  assert.match(page, /loading="lazy"/)
  assert.match(page, /object-contain/)
  assert.match(page, /grid-cols-\[92px_minmax\(0,1fr\)\]/)
})
