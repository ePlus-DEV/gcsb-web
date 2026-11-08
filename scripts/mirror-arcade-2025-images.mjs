#!/usr/bin/env node
/**
 * Mirror the complete Google Skills Arcade 2025 historical gallery into local
 * static assets. The 2025 source announcements remain in swag-history.ts.
 *
 * Run: node scripts/mirror-arcade-2025-images.mjs
 * Safe to repeat. Remote download failures are reported and kept as remote URLs
 * so the gallery does not show a broken local path.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const registryPath = join(root, "components/arcade/swag-history-images.ts")
const publicFolder = join(root, "public")
const allowedHosts = new Set([
  "d2yds90mtvelsl.cloudfront.net",
  "discuss.google.dev",
  "whitesquarein.com",
])
const maxBytes = 30 * 1024 * 1024
const minimumBytes = 100

function imageExtension(url) {
  const extension = new URL(url).pathname.toLowerCase().match(/\.(gif|png)$/)?.[1]
  if (!extension) throw new Error("Unsupported image format: " + url)
  return extension
}

function validate(bytes, extension, label) {
  if (bytes.length <= minimumBytes || bytes.length > maxBytes) {
    throw new Error(label + ": invalid image byte length " + bytes.length)
  }
  const valid = extension === "gif"
    ? /^GIF(?:87a|89a)$/.test(bytes.subarray(0, 6).toString("ascii"))
    : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  if (!valid) throw new Error(label + ": invalid " + extension.toUpperCase() + " magic bytes")
}

async function fetchImage(url, extension, name) {
  const parsed = new URL(url)
  if (parsed.protocol !== "https:" || !allowedHosts.has(parsed.hostname)) {
    throw new Error(name + ": unapproved image URL " + url)
  }
  let lastError
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ePlus-DEV Arcade historical swag asset mirroring)",
          Referer: "https://discuss.google.dev/",
          Accept: "image/gif,image/png,image/*;q=0.8",
        },
        signal: AbortSignal.timeout(25_000),
      })
      if (!response.ok) throw new Error("HTTP " + response.status)
      const declaredSize = Number(response.headers.get("content-length") ?? 0)
      if (declaredSize > maxBytes) throw new Error("File too large: " + declaredSize)
      const bytes = Buffer.from(await response.arrayBuffer())
      validate(bytes, extension, name)
      return bytes
    } catch (error) {
      lastError = error
      console.warn(name + ": attempt " + attempt + " failed: " + error.message)
    }
  }
  throw new Error(name + ": download failed (" + lastError?.message + ")")
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

const original = await readFile(registryPath, "utf8")
const seasonOneStart = original.indexOf("\n  1: {")
const seasonTwoStart = original.indexOf("\n  2: {")
const registryEnd = original.indexOf("\n}\n", seasonTwoStart)
if (seasonOneStart < 0 || seasonTwoStart < 0 || registryEnd < 0) {
  throw new Error("Cannot locate Season 1 and Season 2 image records")
}

const entryPattern = /^(    "([^"]+)": )"([^"]+)"(,?)$/gm
const entries = [...original.matchAll(entryPattern)]
  .filter((match) => match.index > seasonOneStart && match.index < registryEnd)
  .map((match) => {
    const season = match.index < seasonTwoStart ? 1 : 2
    const [, prefix, name, url, trailingComma] = match
    const extension = url.startsWith("/") ? url.split(".").pop() : imageExtension(url)
    const imageUrl = "/images/swag/2025/season-" + season + "/" + slugify(name) + "." + extension
    return { prefix, name, url, trailingComma, season, imageUrl, extension }
  })

if (entries.length !== 36 ||
    entries.filter((entry) => entry.season === 1).length !== 24 ||
    entries.filter((entry) => entry.season === 2).length !== 12) {
  throw new Error("Unexpected number of historic swag images; expected 24 + 12, got " + entries.length)
}
if (new Set(entries.map((entry) => entry.imageUrl)).size !== entries.length) {
  throw new Error("Duplicate local destination path")
}

const results = new Map()
const failures = []
let completed = 0
let next = 0
async function worker() {
  while (next < entries.length) {
    const entry = entries[next++]
    const destination = join(publicFolder, entry.imageUrl.replace(/^\//, ""))
    try {
      if (entry.url === entry.imageUrl) {
        validate(await readFile(destination), entry.extension, entry.name)
        console.log("Verified " + entry.imageUrl)
      } else if (entry.url.startsWith("/")) {
        throw new Error("Unexpected local asset path: " + entry.url)
      } else {
        const bytes = await fetchImage(entry.url, entry.extension, entry.name)
        await mkdir(dirname(destination), { recursive: true })
        await writeFile(destination, bytes)
        console.log("Mirrored " + entry.name + ": " + bytes.length + " bytes -> " + entry.imageUrl)
      }
      results.set(entry.season + ":" + entry.name, entry.imageUrl)
    } catch (error) {
      failures.push(entry.season + ":" + entry.name + ": " + error.message)
      results.set(entry.season + ":" + entry.name, entry.url)
    }
    completed++
    console.log("Progress: " + completed + "/" + entries.length)
  }
}
await Promise.all(Array.from({ length: 5 }, () => worker()))

let seen = 0
const updated = original.replace(entryPattern, (matched, prefix, name, url, trailingComma, offset) => {
  if (offset <= seasonOneStart || offset >= registryEnd) return matched
  const season = offset < seasonTwoStart ? 1 : 2
  const newUrl = results.get(season + ":" + name)
  if (newUrl === undefined) throw new Error("Missing download result for " + season + ":" + name)
  seen++
  return prefix + '"' + newUrl + '"' + trailingComma
})
if (seen !== 36) throw new Error("Failed to rewrite all 36 registry entries")
if (updated !== original) await writeFile(registryPath, updated)
console.log("Verified/mirrored " + (entries.length - failures.length) + "/" + entries.length + " historical images.")
if (failures.length) {
  console.error("UNMIRRORED IMAGES: " + failures.length)
  for (const failure of failures) console.error(failure)
  process.exitCode = 1
}
