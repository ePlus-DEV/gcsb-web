import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const enhancer = readFileSync(
  new URL("../components/arcade/fresh-score-check-enhancer.tsx", import.meta.url),
  "utf8",
)
const generator = readFileSync(
  new URL("../scripts/generate-website-i18n.mjs", import.meta.url),
  "utf8",
)
const translations = JSON.parse(
  readFileSync(
    new URL("../public/i18n/fresh-score-check.json", import.meta.url),
    "utf8",
  ),
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

test("fresh score note translations live in the website i18n catalog resource", () => {
  const noteTranslations = translations.freshScoreCacheNote
  const expectedLocales = [
    "ar",
    "de",
    "en",
    "es",
    "fr",
    "hi",
    "it",
    "ja",
    "ko",
    "pt_BR",
    "ru",
    "vi",
    "zh_CN",
  ]

  assert.deepEqual(Object.keys(noteTranslations).sort(), expectedLocales.sort())
  assert.match(noteTranslations.en, /Automatic refresh may use a recent cached snapshot/)
  assert.match(noteTranslations.vi, /Tự động làm mới có thể dùng dữ liệu cache gần đây/)
  assert.match(generator, /fresh-score-check\.json/)
  assert.match(generator, /catalog\.messages\[messageKey\] = translations\[locale\]/)
  assert.match(enhancer, /loadWebsiteCatalog\(locale\)/)
  assert.match(enhancer, /catalog\.messages\[FRESH_SCORE_MESSAGE_KEY\]/)
  assert.doesNotMatch(enhancer, /Tự động làm mới/)
  assert.doesNotMatch(enhancer, /自動更新/)
})

test("locale changes hide stale fresh score notes until the new catalog loads", () => {
  const syncNoteStart = enhancer.indexOf("const syncNote = () => {")
  const clearNote = enhancer.indexOf('setNote("")', syncNoteStart)
  const loadCatalog = enhancer.indexOf("void loadWebsiteCatalog(locale)", syncNoteStart)

  assert.notEqual(syncNoteStart, -1)
  assert.notEqual(clearNote, -1)
  assert.notEqual(loadCatalog, -1)
  assert.ok(clearNote < loadCatalog)
  assert.match(enhancer, /if \(!noteTarget \|\| !note\) return null/)
})

test("the fresh check enhancer is mounted on default and localized calculator pages", () => {
  assert.match(page, /FreshScoreCheckEnhancer/)
  assert.match(page, /<FreshScoreCheckEnhancer \/>/)
  assert.match(localizedPage, /FreshScoreCheckEnhancer/)
  assert.match(localizedPage, /<FreshScoreCheckEnhancer \/>/)
})
