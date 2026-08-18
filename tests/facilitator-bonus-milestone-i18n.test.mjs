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

const REQUIRED_SOURCES = [
  "Bonus Milestone completed",
  "+10 bonus applied. Open to review the completed steps.",
  "Completion is saved. Close the details again or undo if needed.",
  "Confirm after you finish all required steps above.",
  "Open details",
  "Close details",
  "Undo",
  "Mark completed",
  "View 4 GEAR skill badges · {count}/4",
  "Hide GEAR skill badges · {count}/4",
]

const localeSources = Object.fromEntries(
  await Promise.all(
    LOCALES.map(async (locale) => {
      const resourceUrl = new URL(
        `../public/i18n/locales/${locale}.json`,
        import.meta.url,
      )
      return [locale, JSON.parse(await readFile(resourceUrl, "utf8"))]
    }),
  ),
)

test("i18n source keeps one file per locale with matching keys", () => {
  const englishAdditional = localeSources.en?.additional
  assert.equal(typeof englishAdditional, "object", "en: missing additional")

  const englishKeys = Object.keys(englishAdditional).sort()
  for (const source of REQUIRED_SOURCES) {
    assert.ok(
      Object.hasOwn(englishAdditional, source),
      `en: missing Bonus Milestone source ${source}`,
    )
  }

  for (const locale of LOCALES) {
    const additional = localeSources[locale]?.additional
    assert.equal(typeof additional, "object", `${locale}: missing additional`)
    assert.deepEqual(
      Object.keys(additional).sort(),
      englishKeys,
      `${locale}: locale key set differs from en`,
    )

    for (const source of englishKeys) {
      const translated = additional[source]
      assert.equal(typeof translated, "string", `${locale}: missing ${source}`)
      assert.ok(translated.length > 0, `${locale}: empty ${source}`)

      if (locale === "en") {
        assert.equal(
          translated,
          source,
          `${locale}: English additional text must match source`,
        )
      } else if (REQUIRED_SOURCES.includes(source)) {
        assert.notEqual(
          translated,
          source,
          `${locale}: untranslated Bonus Milestone text ${source}`,
        )
      }

      if (source.includes("{count}")) {
        assert.ok(
          translated.includes("{count}"),
          `${locale}: dropped {count} from ${source}`,
        )
      }
    }
  }
})

test("i18n source does not add feature-centric multi-locale JSON files", async () => {
  const i18nDir = new URL("../public/i18n/", import.meta.url)
  const topLevelFiles = await readdir(i18nDir)
  const allowedTopLevelJson = new Set([
    "fresh-score-check.json", // legacy resource; do not copy this pattern
    ...LOCALES.map((locale) => `${locale}.json`), // generated runtime catalogs
  ])
  const unexpectedJson = topLevelFiles
    .filter((name) => name.endsWith(".json") && !allowedTopLevelJson.has(name))
    .sort()

  assert.deepEqual(
    unexpectedJson,
    [],
    `Store translation source in public/i18n/locales/<locale>.json, not feature files: ${unexpectedJson.join(", ")}`,
  )
})
