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

const EXPECTED_ENGLISH = {
  loadingAria: "Loading current Arcade games",
  loading: "Loading current Arcade games…",
  deadlineUnavailable: "Deadline unavailable",
  thisMonth: "This month",
  previousEndedWaiting: "The previous Arcade labs have ended. Waiting for this month's games to be published.",
  activeDescription: "Track the active Arcade games against badges already present on this public profile.",
  comingSoon: "Coming soon",
  newLabsNotPublished: "New labs not published yet",
  completedLower: "completed",
  analyzeProfileTracking: "Analyze profile to track completion",
  awaitingNewLabs: "Awaiting new Arcade labs",
  newGamesAuto: "New games will appear here automatically after they are published.",
  completed: "Completed",
  notCompleted: "Not completed",
  analyzeProfileCheck: "Analyze profile to check",
  accessCode: "Access code",
  copyAccessCode: "Copy access code",
  copied: "Copied",
  copy: "Copy",
  deadline: "Deadline",
  openGame: "Open game",
  comingSoonTitle: "{month} games are coming soon",
  previousEnded: "{month} labs have ended.",
  arcadePoint: "Arcade point: {count}",
  arcadePoints: "Arcade points: {count}",
  spotsLeft: "{count} spots left",
  deadlineAria: "Deadline: {value}",
}

const localeDir = new URL("../public/i18n/locales/", import.meta.url)
const panelUrl = new URL("../components/arcade/monthly-games-panel.tsx", import.meta.url)
const copyUrl = new URL("../components/arcade/monthly-games-copy.ts", import.meta.url)

const catalogs = Object.fromEntries(
  await Promise.all(
    LOCALES.map(async (locale) => [
      locale,
      JSON.parse(await readFile(new URL(`${locale}.json`, localeDir), "utf8")),
    ]),
  ),
)
const panel = await readFile(panelUrl, "utf8")
const copySource = await readFile(copyUrl, "utf8")

function placeholders(value) {
  return [...String(value).matchAll(/\{[A-Za-z0-9_]+\}/g)]
    .map((match) => match[0])
    .sort()
}

test("Monthly Labs copy is catalog-keyed in every locale", () => {
  for (const [key, english] of Object.entries(EXPECTED_ENGLISH)) {
    const catalogKey = `__monthlyGames:${key}`
    assert.ok(copySource.includes(`"${key}"`), `copy helper missing ${key}`)
    assert.equal(catalogs.en.additional[catalogKey], english, `en missing ${catalogKey}`)

    for (const locale of LOCALES.filter((item) => item !== "en")) {
      const translated = catalogs[locale].additional[catalogKey]
      assert.equal(typeof translated, "string", `${locale}: missing ${catalogKey}`)
      assert.ok(translated.length > 0, `${locale}: empty ${catalogKey}`)
      assert.notEqual(translated, english, `${locale}: untranslated ${catalogKey}`)
      assert.deepEqual(
        placeholders(translated),
        placeholders(english),
        `${locale}: ${catalogKey} changed placeholders`,
      )
    }
  }
})

test("MonthlyGamesPanel contains no catalog-owned English UI copy", () => {
  assert.match(panel, /monthlyGamesText/)
  assert.match(panel, /loadWebsiteCatalog\(locale\)/)

  for (const [key, english] of Object.entries(EXPECTED_ENGLISH)) {
    // Semantic key names such as "completed", "copy", and "deadline" may
    // intentionally equal their English value inside text("..."). Exclude
    // that exact helper call before checking whether the UI copy leaked into
    // the component as a literal.
    const withoutKeyCall = panel.replaceAll(`text("${key}")`, "")
    assert.equal(
      withoutKeyCall.includes(english),
      false,
      `MonthlyGamesPanel hardcodes catalog copy: ${english}`,
    )
  }

  assert.doesNotMatch(panel, />\s*(?:Completed|Copy|Deadline|Coming soon|Open game)\s*</)
  assert.doesNotMatch(panel, /(?:aria-label|title)="(?:Copy access code|Loading current Arcade games)"/)
})
