import assert from "node:assert/strict"
import test from "node:test"

import { applyFacilitatorBonusMilestoneControlTranslations } from "../scripts/facilitator-bonus-milestone-control-translations.mjs"

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

const CONTROL_SOURCES = [
  "Bonus Milestone completed",
  "+10 bonus applied. Open to review the completed steps.",
  "Completion is saved. Close the details again or undo if needed.",
  "Confirm after you finish all required steps above.",
  "Open details",
  "Close details",
  "Undo",
  "Mark completed",
]

test("Bonus Milestone completion controls cover every website locale", () => {
  const catalogs = Object.fromEntries(
    LOCALES.map((locale) => [locale, { additional: {} }]),
  )

  applyFacilitatorBonusMilestoneControlTranslations(catalogs)

  for (const locale of LOCALES) {
    const additional = catalogs[locale].additional

    for (const source of CONTROL_SOURCES) {
      const translated = additional[source]
      assert.equal(typeof translated, "string", `${locale}: missing ${source}`)
      assert.ok(translated.length > 0, `${locale}: empty ${source}`)

      if (locale === "en") {
        assert.equal(translated, source, `${locale}: English source changed`)
      } else {
        assert.notEqual(
          translated,
          source,
          `${locale}: untranslated control text ${source}`,
        )
      }
    }

    for (let count = 0; count <= 4; count += 1) {
      const toggleSources = [
        `View 4 GEAR skill badges · ${count}/4`,
        `Hide GEAR skill badges · ${count}/4`,
      ]

      for (const source of toggleSources) {
        const translated = additional[source]
        assert.equal(typeof translated, "string", `${locale}: missing ${source}`)
        assert.ok(translated.length > 0, `${locale}: empty ${source}`)

        if (locale === "en") {
          assert.equal(translated, source, `${locale}: English source changed`)
        } else {
          assert.notEqual(
            translated,
            source,
            `${locale}: untranslated GEAR toggle ${source}`,
          )
        }
      }
    }
  }
})
