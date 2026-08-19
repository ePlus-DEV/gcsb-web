import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const LOCALES = [
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

const enhancer = readFileSync(
  new URL("../components/arcade/fresh-score-check-enhancer.tsx", import.meta.url),
  "utf8",
)
const generator = readFileSync(
  new URL("../scripts/generate-website-i18n.mjs", import.meta.url),
  "utf8",
)
const localeCatalogs = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    JSON.parse(
      readFileSync(
        new URL(`../public/i18n/locales/${locale}.json`, import.meta.url),
        "utf8",
      ),
    ),
  ]),
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

test("rate-limited fresh checks show a persistent countdown without blocking the button", () => {
  assert.match(enhancer, /COOLDOWN_STORAGE_KEY/)
  assert.match(enhancer, /window\.sessionStorage\.setItem\(COOLDOWN_STORAGE_KEY/)
  assert.match(enhancer, /response\.status === 429/)
  assert.match(enhancer, /response\.headers\.get\("retry-after"\)/)
  assert.match(enhancer, /Fresh score check available in \{cooldownSeconds\}s\./)
  assert.doesNotMatch(enhancer, /button\.disabled\s*=/)
  assert.doesNotMatch(enhancer, /freshScoreCooldown/)
  assert.doesNotMatch(enhancer, /stopImmediatePropagation\(\)/)
  assert.doesNotMatch(enhancer, /addEventListener\("submit"/)
})

test("fresh score note translations live in each locale catalog", () => {
  const noteTranslations = Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      localeCatalogs[locale]?.messages?.freshScoreCacheNote,
    ]),
  )

  assert.deepEqual(Object.keys(noteTranslations).sort(), [...LOCALES].sort())
  for (const locale of LOCALES) {
    assert.equal(
      typeof noteTranslations[locale],
      "string",
      `${locale}: missing freshScoreCacheNote`,
    )
    assert.ok(noteTranslations[locale].length > 0)
  }

  assert.match(
    noteTranslations.en,
    /Automatic refresh may use a recent cached snapshot/,
  )
  assert.match(
    noteTranslations.vi,
    /Tự động làm mới có thể dùng dữ liệu cache gần đây/,
  )
  assert.match(generator, /public["'],\s*["']i18n["'],\s*["']locales/)
  assert.doesNotMatch(generator, /fresh-score-check\.json|gunzipSync|catalogs\.part/)
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
  assert.match(
    enhancer,
    /if \(!noteTarget \|\| \(!note && cooldownSeconds <= 0\)\) return null/,
  )
})

test("the fresh check enhancer is mounted on default and localized calculator pages", () => {
  assert.match(page, /FreshScoreCheckEnhancer/)
  assert.match(page, /<FreshScoreCheckEnhancer \/>/)
  assert.match(localizedPage, /FreshScoreCheckEnhancer/)
  assert.match(localizedPage, /<FreshScoreCheckEnhancer \/>/)
})
