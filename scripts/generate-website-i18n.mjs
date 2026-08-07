import { gunzipSync } from "node:zlib"
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"
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
applyVietnameseFacilitatorPolish(catalogs)
applyFacilitatorRuntimeFragments(catalogs)
applyPublicProfileTranslations(catalogs)
applyMonthlyGamesTranslations(catalogs)

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