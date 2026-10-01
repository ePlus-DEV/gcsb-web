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

const STATIC_SOURCES = [
  "Loading current Arcade games",
  "Loading current Arcade games…",
  "Deadline unavailable",
  "This month",
  "The previous Arcade labs have ended. Waiting for this month's games to be published.",
  "Track the active Arcade games against badges already present on this public profile.",
  "Coming soon",
  "New labs not published yet",
  "completed",
  "Analyze profile to track completion",
  "Awaiting new Arcade labs",
  "New games will appear here automatically after they are published.",
  "Completed",
  "Not completed",
  "Analyze profile to check",
  "Access code",
  "Copy access code",
  "Copied",
  "Copy",
  "Deadline",
  "Open game",
]

const TEMPLATES = {
  "__monthlyGames:comingSoonTitle": "{month} games are coming soon",
  "__monthlyGames:previousEnded": "{month} labs have ended.",
  "__monthlyGames:arcadePoint": "Arcade point: {count}",
  "__monthlyGames:arcadePoints": "Arcade points: {count}",
  "__monthlyGames:spotsLeft": "{count} spots left",
  "__monthlyGames:deadlineAria": "Deadline: {value}",
}

const localeDir = new URL("../public/i18n/locales/", import.meta.url)
const panelUrl = new URL("../components/arcade/monthly-games-panel.tsx", import.meta.url)
const websiteI18nUrl = new URL("../lib/website-i18n.ts", import.meta.url)

const catalogs = Object.fromEntries(
  await Promise.all(
    LOCALES.map(async (locale) => [
      locale,
      JSON.parse(await readFile(new URL(`${locale}.json`, localeDir), "utf8")),
    ]),
  ),
)
const panel = await readFile(panelUrl, "utf8")
const websiteI18n = await readFile(websiteI18nUrl, "utf8")

function placeholders(value) {
  return [...String(value).matchAll(/\{[A-Za-z0-9_]+\}/g)]
    .map((match) => match[0])
    .sort()
}

test("Monthly Labs user-facing copy exists in every locale", () => {
  for (const source of STATIC_SOURCES) {
    assert.ok(panel.includes(source), `MonthlyGamesPanel no longer contains expected source: ${source}`)
    assert.equal(catalogs.en.additional[source], source, `en missing source: ${source}`)

    for (const locale of LOCALES.filter((item) => item !== "en")) {
      const translated = catalogs[locale].additional[source]
      assert.equal(typeof translated, "string", `${locale}: missing ${source}`)
      assert.ok(translated.length > 0, `${locale}: empty ${source}`)
      assert.notEqual(translated, source, `${locale}: untranslated ${source}`)
    }
  }
})

test("Monthly Labs dynamic copy keeps localized templates in every locale", () => {
  for (const [key, english] of Object.entries(TEMPLATES)) {
    assert.equal(catalogs.en.additional[key], english, `en missing ${key}`)

    for (const locale of LOCALES.filter((item) => item !== "en")) {
      const translated = catalogs[locale].additional[key]
      assert.equal(typeof translated, "string", `${locale}: missing ${key}`)
      assert.ok(translated.length > 0, `${locale}: empty ${key}`)
      assert.notEqual(translated, english, `${locale}: untranslated ${key}`)
      assert.deepEqual(
        placeholders(translated),
        placeholders(english),
        `${locale}: ${key} changed placeholders`,
      )
    }
  }

  assert.match(websiteI18n, /monthlyGamesTemplate/)
  assert.match(websiteI18n, /games are coming soon/)
  assert.match(websiteI18n, /labs have ended/)
  assert.match(websiteI18n, /Arcade point/)
  assert.match(websiteI18n, /spots left/)
  assert.match(websiteI18n, /deadlineAria/)
})
