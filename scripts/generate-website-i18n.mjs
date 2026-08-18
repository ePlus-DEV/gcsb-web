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
const localeSourceDir = path.join(sourceDir, "locales")
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

const localeSources = Object.fromEntries(
  await Promise.all(
    Object.keys(catalogs).map(async (locale) => {
      const filePath = path.join(localeSourceDir, `${locale}.json`)
      const source = JSON.parse(await readFile(filePath, "utf8"))
      return [locale, source]
    }),
  ),
)

const LOCALE_SOURCE_SECTIONS = ["messages", "additional", "dynamic"]

function validateLocaleSources(catalogs, localeSources) {
  const locales = Object.keys(catalogs)
  const englishSource = localeSources.en

  if (!englishSource) {
    throw new Error("Missing public/i18n/locales/en.json.")
  }

  for (const section of LOCALE_SOURCE_SECTIONS) {
    const englishSection = englishSource[section] ?? {}
    const expectedKeys = Object.keys(englishSection).sort()

    for (const locale of locales) {
      const localeSource = localeSources[locale]
      if (!localeSource) {
        throw new Error(`Missing public/i18n/locales/${locale}.json.`)
      }

      const localeSection = localeSource[section] ?? {}
      const localeKeys = Object.keys(localeSection).sort()

      if (JSON.stringify(localeKeys) !== JSON.stringify(expectedKeys)) {
        throw new Error(
          `Locale source key mismatch in ${locale}.json ${section}. Expected: ${expectedKeys.join(
            ", ",
          )}; received: ${localeKeys.join(", ")}.`,
        )
      }

      for (const key of expectedKeys) {
        const value = localeSection[key]
        if (typeof value !== "string" || !value) {
          throw new Error(
            `Locale source ${locale}.json ${section}.${key} must be a non-empty string.`,
          )
        }

        if (key.includes("{count}") && !value.includes("{count}")) {
          throw new Error(
            `Locale source ${locale}.json ${section}.${key} dropped the {count} placeholder.`,
          )
        }
      }
    }

    if (section === "additional") {
      for (const [source, translated] of Object.entries(englishSection)) {
        if (source !== translated) {
          throw new Error(
            `English additional translation must match its source text: ${source}.`,
          )
        }
      }
    }
  }
}

function applyLocaleSources(catalogs, localeSources) {
  for (const [locale, catalog] of Object.entries(catalogs)) {
    const localeSource = localeSources[locale]

    for (const section of LOCALE_SOURCE_SECTIONS) {
      const entries = Object.entries(localeSource[section] ?? {})
      if (entries.length === 0) continue

      catalog[section] ??= {}

      for (const [source, translated] of entries) {
        if (section === "additional" && source.includes("{count}")) {
          for (let count = 0; count <= 4; count += 1) {
            catalog.additional[source.replaceAll("{count}", String(count))] =
              translated.replaceAll("{count}", String(count))
          }
          continue
        }

        catalog[section][source] = translated
      }
    }
  }
}

validateLocaleSources(catalogs, localeSources)

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
applyLocaleSources(catalogs, localeSources)
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
