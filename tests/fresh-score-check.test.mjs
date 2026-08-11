import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const enhancer = readFileSync(
  new URL("../components/arcade/fresh-score-check-enhancer.tsx", import.meta.url),
  "utf8",
)
const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")
const localizedPage = readFileSync(
  new URL("../app/[locale]/page.tsx", import.meta.url),
  "utf8",
)

test("manual website score checks request a forced refresh", () => {
  assert.match(enhancer, /\.analyze-button/)
  assert.match(enhancer, /event\.key !== "Enter"/)
  assert.match(enhancer, /force: true/)
  assert.match(enhancer, /url\.pathname\.startsWith\("\/api\/arcade"\)/)
})

test("automatic refresh remains cache-friendly and explains the cache behavior", () => {
  assert.match(enhancer, /Automatic refresh may use a recent cached snapshot/)
  assert.match(enhancer, /Fresh checks bypass Hub cache and are rate-limited/)
  assert.match(enhancer, /Tự động làm mới có thể dùng dữ liệu cache gần đây/)
})

test("the fresh check enhancer is mounted on default and localized calculator pages", () => {
  assert.match(page, /FreshScoreCheckEnhancer/)
  assert.match(page, /<FreshScoreCheckEnhancer \/>/)
  assert.match(localizedPage, /FreshScoreCheckEnhancer/)
  assert.match(localizedPage, /<FreshScoreCheckEnhancer \/>/)
})
