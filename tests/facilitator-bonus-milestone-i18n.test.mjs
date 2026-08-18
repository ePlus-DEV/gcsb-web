import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
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

const REQUIRED_KEYS = [
  "completedTitle",
  "bonusApplied",
  "completionSaved",
  "confirmCompleted",
  "openDetails",
  "closeDetails",
  "undo",
  "markCompleted",
  "viewGear",
  "hideGear",
]

const resourceUrl = new URL(
  "../public/i18n/facilitator-bonus-milestone.json",
  import.meta.url,
)
const resources = JSON.parse(await readFile(resourceUrl, "utf8"))

test("Bonus Milestone translations live in a dedicated i18n resource", () => {
  assert.deepEqual(Object.keys(resources).sort(), [...REQUIRED_KEYS].sort())

  for (const key of REQUIRED_KEYS) {
    const resource = resources[key]
    assert.equal(typeof resource?.source, "string", `${key}: missing source`)
    assert.ok(resource.source.length > 0, `${key}: empty source`)
    assert.equal(
      typeof resource?.translations,
      "object",
      `${key}: missing translations`,
    )

    for (const locale of LOCALES) {
      const translated = resource.translations[locale]
      assert.equal(typeof translated, "string", `${key}: missing ${locale}`)
      assert.ok(translated.length > 0, `${key}: empty ${locale}`)

      if (locale === "en") {
        assert.equal(
          translated,
          resource.source,
          `${key}: English text must match source`,
        )
      } else {
        assert.notEqual(
          translated,
          resource.source,
          `${key}: untranslated ${locale} text`,
        )
      }
    }

    if (resource.source.includes("{count}")) {
      for (const locale of LOCALES) {
        assert.ok(
          resource.translations[locale].includes("{count}"),
          `${key}: ${locale} dropped {count}`,
        )
      }
    }
  }
})
