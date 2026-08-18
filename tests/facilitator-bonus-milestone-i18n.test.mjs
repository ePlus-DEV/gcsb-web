import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import test from "node:test"

const LOCALES = [
  "en",
  "vi",
  "ja",
  "ko",
  "zh_CN",
  "fr",
  "de",
  "es",
  "pt_BR",
  "it",
  "ru",
  "ar",
  "hi",
]

const CATALOG_SECTIONS = ["messages", "additional", "dynamic"]
const REQUIRED_BONUS_SOURCES = [
  "Bonus Milestone completed",
  "+10 bonus applied. Open to review the completed steps.",
  "Completion is saved. Close the details again or undo if needed.",
  "Confirm after you finish all required steps above.",
  "Open details",
  "Close details",
  "Undo",
  "Mark completed",
  ...Array.from({ length: 5 }, (_, count) =>
    `View 4 GEAR skill badges · ${count}/4`,
  ),
  ...Array.from({ length: 5 }, (_, count) =>
    `Hide GEAR skill badges · ${count}/4`,
  ),
]

const localeDir = new URL("../public/i18n/locales/", import.meta.url)
const i18nDir = new URL("../public/i18n/", import.meta.url)
const generatorUrl = new URL(
  "../scripts/generate-website-i18n.mjs",
  import.meta.url,
)

const localeFiles = (await readdir(localeDir))
  .filter((name) => name.endsWith(".json"))
  .sort()
const catalogs = Object.fromEntries(
  await Promise.all(
    LOCALES.map(async (locale) => [
      locale,
      JSON.parse(await readFile(new URL(`${locale}.json`, localeDir), "utf8")),
    ]),
  ),
)

function placeholders(value) {
  return [...String(value).matchAll(/\{[A-Za-z0-9_]+\}/g)]
    .map((match) => match[0])
    .sort()
}

test("i18n source keeps one readable file per supported locale", () => {
  assert.deepEqual(
    localeFiles,
    LOCALES.map((locale) => `${locale}.json`).sort(),
  )

  const english = catalogs.en
  for (const locale of LOCALES) {
    const catalog = catalogs[locale]

    for (const section of CATALOG_SECTIONS) {
      const localeSection = catalog?.[section]
      assert.equal(
        typeof localeSection,
        "object",
        `${locale}: missing ${section}`,
      )

      for (const [key, translated] of Object.entries(localeSection)) {
        assert.equal(
          typeof translated,
          "string",
          `${locale}: ${section}.${key} is not a string`,
        )
        assert.ok(translated.length > 0, `${locale}: ${section}.${key} is empty`)

        const englishValue = english?.[section]?.[key]
        if (typeof englishValue === "string") {
          assert.deepEqual(
            placeholders(translated),
            placeholders(englishValue),
            `${locale}: ${section}.${key} changed placeholders`,
          )
        }
      }
    }
  }
})

test("Bonus Milestone copy is maintained inside every locale file", () => {
  for (const source of REQUIRED_BONUS_SOURCES) {
    assert.equal(
      catalogs.en.additional[source],
      source,
      `en: missing Bonus Milestone source ${source}`,
    )

    for (const locale of LOCALES.filter((item) => item !== "en")) {
      const translated = catalogs[locale].additional[source]
      assert.equal(typeof translated, "string", `${locale}: missing ${source}`)
      assert.ok(translated.length > 0, `${locale}: empty ${source}`)
      assert.notEqual(translated, source, `${locale}: untranslated ${source}`)
    }
  }
})

test("i18n source is readable and is not stored as compressed split catalogs", async () => {
  const topLevelFiles = await readdir(i18nDir)
  const compressedParts = topLevelFiles.filter((name) =>
    /^catalogs\.part\.\d+\.txt$/.test(name),
  )
  assert.deepEqual(compressedParts, [])

  const allowedRuntimeJson = new Set(LOCALES.map((locale) => `${locale}.json`))
  const unexpectedTopLevelJson = topLevelFiles
    .filter((name) => name.endsWith(".json") && !allowedRuntimeJson.has(name))
    .sort()
  assert.deepEqual(
    unexpectedTopLevelJson,
    [],
    `Do not add multi-locale feature resources: ${unexpectedTopLevelJson.join(", ")}`,
  )

  const generator = await readFile(generatorUrl, "utf8")
  assert.match(generator, /public["'],\s*["']i18n["'],\s*["']locales/)
  assert.doesNotMatch(generator, /gunzipSync|catalogs\.part|fresh-score-check\.json/)
})
