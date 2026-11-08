#!/usr/bin/env node
/**
 * Mirror official 2026 Google Skills Arcade GIFs into public assets.
 * Run: node scripts/mirror-arcade-swag-images.mjs
 * Idempotent; preserves original official sourceUrl fields for attribution.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const registryPath = join(root, "components/arcade/swag-drops.ts")
const assetDirectory = join(root, "public/images/swag/2026")
const assetPublicPrefix = "/images/swag/2026"
const officialImageHost = "d2yds90mtvelsl.cloudfront.net"
const gifHeader = /^(GIF87a|GIF89a)$/
const minSize = 100
const maxSize = 20 * 1024 * 1024

function validateGif(bytes, label) {
  if (bytes.length < minSize || bytes.length > maxSize) {
    throw new Error(label + ": unexpected GIF size (" + bytes.length + " bytes)")
  }
  if (!gifHeader.test(bytes.subarray(0, 6).toString("ascii"))) {
    throw new Error(label + ": downloaded content is not a GIF image")
  }
}

async function fetchGif(url, id) {
  const parsed = new URL(url)
  if (parsed.protocol !== "https:" || parsed.hostname !== officialImageHost) {
    throw new Error(id + ": unsupported external image source: " + url)
  }
  let lastError
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ePlus-DEV Arcade swag asset mirroring)",
          Referer: "https://discuss.google.dev/",
        },
        signal: AbortSignal.timeout(45_000),
      })
      if (!response.ok) throw new Error("HTTP " + response.status)
      const length = Number(response.headers.get("content-length") ?? 0)
      if (length > maxSize) throw new Error("GIF too large: " + length + " bytes")
      const bytes = Buffer.from(await response.arrayBuffer())
      validateGif(bytes, id)
      return bytes
    } catch (error) {
      lastError = error
      console.error(id + ": attempt " + attempt + " failed: " + error.message)
    }
  }
  throw new Error(id + ": unable to retrieve official GIF (" + lastError?.message + ")")
}

const source = await readFile(registryPath, "utf8")
const entryPattern = /(    id: "([a-z0-9-]+)",[\s\S]*?    imageUrl:\s*\n      )"([^"]+)"(,)/g
const matches = [...source.matchAll(entryPattern)]
if (matches.length < 7) {
  throw new Error("Expected at least 7 confirmed 2026 image entries, found " + matches.length)
}
const ids = matches.map((match) => match[2])
if (new Set(ids).size !== ids.length) {
  throw new Error("Duplicate swag identifiers found; refusing to write assets")
}
await mkdir(assetDirectory, { recursive: true })

const replacements = new Map()
for (const [, , id, url] of matches) {
  const publicPath = assetPublicPrefix + "/" + id + ".gif"
  const diskPath = join(assetDirectory, id + ".gif")
  if (url === publicPath) {
    validateGif(await readFile(diskPath), id)
    console.log("Verified existing: " + publicPath)
    continue
  }
  if (!url.startsWith("https://")) {
    throw new Error(id + ": unexpected imageUrl: " + url)
  }
  const bytes = await fetchGif(url, id)
  await writeFile(diskPath, bytes)
  console.log("Mirrored " + id + ": " + bytes.length + " bytes -> " + publicPath)
  replacements.set(id, publicPath)
}

if (replacements.size > 0) {
  const updated = source.replace(entryPattern, (text, prefix, id, url, comma) => {
    return prefix + '"' + (replacements.get(id) ?? url) + '"' + comma
  })
  if (updated === source) throw new Error("No registry replacements were made")
  await writeFile(registryPath, updated)
}
console.log("Validated " + matches.length + " gift GIFs; mirrored " + replacements.size + ".")
