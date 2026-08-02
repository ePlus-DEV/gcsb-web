import { gunzipSync } from "node:zlib"
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"

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
