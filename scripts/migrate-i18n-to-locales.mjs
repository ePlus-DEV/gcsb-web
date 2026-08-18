import { execFileSync } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
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

const root = process.cwd()
const runtimeDir = path.join(root, "public", "i18n")
const localeSourceDir = path.join(runtimeDir, "locales")

// Generate the exact catalogs currently used by the site, including all legacy
// translation helpers, then promote those final catalogs to readable locale
// source files. This script is intentionally one-time migration tooling.
execFileSync(process.execPath, ["scripts/generate-website-i18n.mjs"], {
  cwd: root,
  stdio: "inherit",
})

await mkdir(localeSourceDir, { recursive: true })

for (const locale of LOCALES) {
  const runtimePath = path.join(runtimeDir, `${locale}.json`)
  const sourcePath = path.join(localeSourceDir, `${locale}.json`)
  const catalog = JSON.parse(await readFile(runtimePath, "utf8"))

  await writeFile(sourcePath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8")
}

console.log(`Expanded ${LOCALES.length} locale catalogs into public/i18n/locales/.`)
