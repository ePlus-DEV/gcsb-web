import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

test("2025 swag history uses sourced reveal imagery with graceful fallbacks", () => {
  const images = readRepoFile("components/arcade/swag-history-images.ts")
  const imageComponent = readRepoFile("components/arcade/historical-swag-image.tsx")
  const page = readRepoFile("app/swag-drops/2025/page.tsx")

  const sourcedImages = images.match(/https:\/\/[^\"\s]+\.(?:gif|png|jpg|jpeg)/g) ?? []
  assert.ok(sourcedImages.length >= 30)

  assert.match(images, /The Arcade Mug/)
  assert.match(images, /The Arcade Ranger Backpack/)
  assert.match(images, /The Arcade Sticker Sheet/)
  assert.match(images, /uploads\/short-url\/vQRYo7ryrrdFqQMoAI97N9eW6ob\.gif/)
  assert.match(images, /The Arcade Ranger Vacuum Cleaner/)
  assert.match(images, /uploads\/short-url\/AaLOkqdVnrduusTouPcsx7u62Oi\.gif/)
  assert.match(images, /The Arcade Champion Vacuum Cleaner/)
  assert.match(images, /uploads\/short-url\/vKf11ZcXRMe5yuuX1ndX7vTWdyQ\.gif/)
  assert.match(images, /The Arcade Legend Vacuum Cleaner/)
  assert.match(images, /uploads\/short-url\/q1F6OlahODKw1VsA3tWH0tixbT3\.gif/)
  assert.match(images, /The Arcade Pen Duo/)
  assert.match(images, /The Arcade Hoodie/)
  assert.match(images, /The Arcade Legend Backpack/)
  assert.doesNotMatch(images, /d3byx8b92xw3lq\.cloudfront\.net/)

  assert.match(imageComponent, /onError=\{\(\) => setFailed\(true\)\}/)
  assert.match(imageComponent, /if \(!src \|\| failed\)/)
  assert.match(imageComponent, /loading="lazy"/)
  assert.match(imageComponent, /decoding="async"/)
  assert.match(imageComponent, /Trophy/)

  assert.match(page, /HistoricalSwagImage/)
  assert.match(page, /getHistoricalSeasonPreviewImages/)
  assert.match(page, /getHistoricalSwagImage/)
  assert.match(page, /getUniqueSeasonItems/)
  assert.match(page, /uniqueItems\.map/)
  assert.match(page, /overflow-x-auto/)
  assert.match(page, /snap-x snap-mandatory/)
  assert.doesNotMatch(page, /getHistoricalSeasonPreviewImages\(season\.season, 4\)/)
  assert.match(page, /object-contain/)
  assert.match(page, /grid-cols-\[128px_minmax\(0,1fr\)\]/)
  assert.match(page, /sm:grid-cols-\[144px_minmax\(0,1fr\)\]/)
  assert.match(page, /sm:max-h-36/)
})
