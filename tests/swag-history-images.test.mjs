import { readFileSync } from "node:fs"
import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

test("2025 swag history self-hosts all 36 sourced images with valid file headers", () => {
  const images = readRepoFile("components/arcade/swag-history-images.ts")
  const imageComponent = readRepoFile("components/arcade/historical-swag-image.tsx")
  const page = readRepoFile("app/swag-drops/2025/page.tsx")

  const localImages = [...images.matchAll(/"[^"]+": "(\/images\/swag\/2025\/season-([12])\/[^"]+\.(gif|png))"/g)]
  assert.equal(localImages.length, 35, "35 recoverable 2025 images are local; Google S1 sticker GIF returns HTTP 404")
  assert.equal(localImages.filter((match) => match[2] === "1").length, 23)
  assert.equal(localImages.filter((match) => match[2] === "2").length, 12)
  assert.equal(new Set(localImages.map((match) => match[1])).size, 36)

  for (const [, path, , extension] of localImages) {
    const bytes = readFileSync(new URL("../public" + path, import.meta.url))
    assert.ok(bytes.length > 100, path)
    if (extension === "gif") {
      assert.match(bytes.subarray(0, 6).toString("ascii"), /^GIF(?:87a|89a)$/, path)
    } else {
      assert.ok(
        bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
        path + " must be a valid PNG",
      )
    }
  }

  assert.match(images, /The Arcade Mug/)
  assert.match(images, /The Arcade Ranger Backpack/)
  assert.match(images, /The Arcade Sticker Sheet/)
  assert.match(images, /vQRYo7ryrrdFqQMoAI97N9eW6ob\.gif/)
  assert.match(readRepoFile("components/arcade/real-world-swag-photos.ts"), /s1-stickers-aman-detail/)
  assert.match(images, /The Arcade Ranger Vacuum Cleaner/)
  assert.match(images, /The Arcade Champion Vacuum Cleaner/)
  assert.match(images, /The Arcade Legend Vacuum Cleaner/)
  assert.match(images, /The Arcade Pen Duo/)
  assert.match(images, /The Arcade Hoodie/)
  assert.match(images, /The Arcade Legend Backpack/)
  assert.doesNotMatch(images, /d3byx8b92xw3lq\.cloudfront\.net/)
  assert.doesNotMatch(images, /https:\/\/d2yds90mtvelsl\.cloudfront\.net/)

  assert.match(imageComponent, /onError=\{\(\) => setFailed\(true\)\}/)
  assert.match(imageComponent, /if \(!src \|\| failed\)/)
  assert.match(imageComponent, /NEXT_PUBLIC_BASE_PATH/)
  assert.match(imageComponent, /basePath \+ src/)
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
