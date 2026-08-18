import { gunzipSync } from "node:zlib"
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { applyCoreUiTranslationPolish } from "./core-ui-translations-polish.mjs"
import { applyFacilitatorLabelTranslations } from "./apply-facilitator-label-translations.mjs"
import { applyCompleteFacilitatorTranslations } from "./facilitator-translations-complete.mjs"
import { applyFacilitatorRuntimeFragments } from "./facilitator-translations-runtime-fragments.mjs"
import { applyVietnameseFacilitatorPolish } from "./facilitator-translations-vi-polish.mjs"
import { applyFacilitatorTranslations } from "./facilitator-translations.mjs"
import { applyMonthlyGamesTranslations } from "./monthly-games-translations.mjs"
import { applyPublicProfileTranslations } from "./public-profile-translations.mjs"

const root = process.cwd()
const sourceDir = path.join(root, "public", "i18n")
const outputDir = sourceDir
const partNames = (await readdir(sourceDir))
  .filter((name) => /^catalogs\.part\.\d+\.txt$/.test(name))
  .sort()

if (partNames.length === 0) {
  throw new Error("No website locale catalog parts were found.")
}

const encoded = (
  await Promise.all(
    partNames.map((name) => readFile(path.join(sourceDir, name), "utf8")),
  )
).join("")
const catalogs = JSON.parse(
  gunzipSync(Buffer.from(encoded, "base64")).toString("utf8"),
)
const catalogMessageResources = JSON.parse(
  await readFile(path.join(sourceDir, "fresh-score-check.json"), "utf8"),
)
const additionalTranslationResources = JSON.parse(
  await readFile(
    path.join(sourceDir, "facilitator-bonus-milestone.json"),
    "utf8",
  ),
)

function applyAdditionalTranslationResources(
  catalogs,
  resources,
  resourceName,
) {
  const locales = Object.keys(catalogs)

  for (const [key, resource] of Object.entries(resources)) {
    const source = resource?.source
    const translations = resource?.translations

    if (!source || typeof source !== "string") {
      throw new Error(`${resourceName}.${key} is missing a source string.`)
    }
    if (!translations || typeof translations !== "object") {
      throw new Error(`${resourceName}.${key} is missing translations.`)
    }

    const missingLocales = locales.filter(
      (locale) =>
        typeof translations[locale] !== "string" || !translations[locale],
    )
    if (missingLocales.length > 0) {
      throw new Error(
        `${resourceName}.${key} is missing locales: ${missingLocales.join(", ")}.`,
      )
    }

    if (translations.en !== source) {
      throw new Error(`${resourceName}.${key} English text must match source.`)
    }

    const countTemplate = source.includes("{count}")
    if (
      countTemplate &&
      locales.some((locale) => !translations[locale].includes("{count}"))
    ) {
      throw new Error(
        `${resourceName}.${key} must keep the {count} placeholder in every locale.`,
      )
    }

    const counts = countTemplate ? [0, 1, 2, 3, 4] : [null]
    for (const [locale, catalog] of Object.entries(catalogs)) {
      catalog.additional ??= {}

      for (const count of counts) {
        const translatedSource =
          count === null ? source : source.replaceAll("{count}", String(count))
        const translatedTarget =
          count === null
            ? translations[locale]
            : translations[locale].replaceAll("{count}", String(count))
        catalog.additional[translatedSource] = translatedTarget
      }
    }
  }
}

for (const [locale, catalog] of Object.entries(catalogs)) {
  const fallbackTitle = `${catalog.messages.heroTitleTop ?? "CHECK YOUR"} ${
    catalog.messages.heroTitleBottom ?? "ARCADE SCORE"
  } – Google Cloud Arcade 2026`

  catalog.messages.pageTitle =
    locale === "en"
      ? "Google Cloud Arcade Points Calculator & Badge Tracker 2026"
      : locale === "vi"
        ? "Máy tính điểm Google Cloud Arcade & Theo dõi huy hiệu 2026"
        : fallbackTitle
}

applyFacilitatorTranslations(catalogs)
applyFacilitatorLabelTranslations(catalogs)
applyCompleteFacilitatorTranslations(catalogs)
applyAdditionalTranslationResources(
  catalogs,
  additionalTranslationResources,
  "facilitator-bonus-milestone.json",
)
applyVietnameseFacilitatorPolish(catalogs)
applyFacilitatorRuntimeFragments(catalogs)
applyPublicProfileTranslations(catalogs)
applyMonthlyGamesTranslations(catalogs)
applyCoreUiTranslationPolish(catalogs)

for (const [messageKey, translations] of Object.entries(catalogMessageResources)) {
  const missingLocales = Object.keys(catalogs).filter(
    (locale) => typeof translations?.[locale] !== "string" || !translations[locale],
  )

  if (missingLocales.length > 0) {
    throw new Error(
      `Website i18n resource ${messageKey} is missing locales: ${missingLocales.join(", ")}.`,
    )
  }

  for (const [locale, catalog] of Object.entries(catalogs)) {
    catalog.messages[messageKey] = translations[locale]
  }
}

const englishMessages = catalogs.en?.messages
if (!englishMessages) {
  throw new Error("The English website locale catalog is missing.")
}

const sourceKeys = new Map()
for (const [key, value] of Object.entries(englishMessages)) {
  const existingKey = sourceKeys.get(value)
  if (existingKey) {
    throw new Error(
      `English website messages ${existingKey} and ${key} share the source text ${JSON.stringify(value)}.`,
    )
  }
  sourceKeys.set(value, key)
}

await mkdir(outputDir, { recursive: true })
await Promise.all(
  Object.entries(catalogs).map(([locale, catalog]) =>
    writeFile(
      path.join(outputDir, `${locale}.json`),
      `${JSON.stringify(catalog)}\n`,
      "utf8",
    ),
  ),
)

console.log(`Generated ${Object.keys(catalogs).length} website locale files.`)
