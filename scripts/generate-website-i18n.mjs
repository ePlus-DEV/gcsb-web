import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"

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
const root = process.cwd()
const sourceDir = path.join(root, "public", "i18n", "locales")
const outputDir = path.join(root, "public", "i18n")

function placeholders(value) {
  return [...String(value).matchAll(/\{[A-Za-z0-9_]+\}/g)]
    .map((match) => match[0])
    .sort()
}

function sameArray(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

const expectedFiles = LOCALES.map((locale) => `${locale}.json`).sort()
const sourceFiles = (await readdir(sourceDir))
  .filter((name) => name.endsWith(".json"))
  .sort()

if (!sameArray(sourceFiles, expectedFiles)) {
  throw new Error(
    `Locale source files must be exactly: ${expectedFiles.join(", ")}. Found: ${sourceFiles.join(", ")}.`,
  )
}

const catalogs = Object.fromEntries(
  await Promise.all(
    LOCALES.map(async (locale) => {
      const filePath = path.join(sourceDir, `${locale}.json`)
      return [locale, JSON.parse(await readFile(filePath, "utf8"))]
    }),
  ),
)

const englishCatalog = catalogs.en
if (!englishCatalog) {
  throw new Error("Missing public/i18n/locales/en.json.")
}

for (const locale of LOCALES) {
  const catalog = catalogs[locale]

  for (const section of CATALOG_SECTIONS) {
    const localeSection = catalog?.[section]
    if (!localeSection || typeof localeSection !== "object") {
      throw new Error(`${locale}.json is missing the ${section} catalog section.`)
    }

    for (const [key, translatedValue] of Object.entries(localeSection)) {
      if (typeof translatedValue !== "string" || translatedValue.length === 0) {
        throw new Error(`${locale}.json ${section}.${key} must be a non-empty string.`)
      }

      const englishValue = englishCatalog[section]?.[key]
      if (typeof englishValue !== "string") continue

      const expectedPlaceholders = placeholders(englishValue)
      const actualPlaceholders = placeholders(translatedValue)
      if (!sameArray(actualPlaceholders, expectedPlaceholders)) {
        throw new Error(
          `${locale}.json ${section}.${key} changed placeholders. Expected ${expectedPlaceholders.join(", ") || "none"}; received ${actualPlaceholders.join(", ") || "none"}.`,
        )
      }
    }
  }
}

await mkdir(outputDir, { recursive: true })
await Promise.all(
  LOCALES.map((locale) =>
    writeFile(
      path.join(outputDir, `${locale}.json`),
      `${JSON.stringify(catalogs[locale])}\n`,
      "utf8",
    ),
  ),
)

console.log(
  `Generated ${LOCALES.length} website locale files from public/i18n/locales/.`,
)
