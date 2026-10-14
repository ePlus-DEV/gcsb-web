import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { pathToFileURL } from "node:url"

function attributes(markup) {
  const result = {}
  for (const match of markup.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4]
  }
  return result
}

/** Inspect emitted static HTML; exclude script bodies from meta-element scanning. */
export function verifyAnalyticsHtml(html, expectedId) {
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)].map((match) => match[1])
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<!--[\s\S]*?-->/g, "")
  const meta = [...markup.matchAll(/<meta\b([^>]*)>/gi)].map((match) => attributes(match[1]))
  const initializers = scripts.filter((body) => /gtag\(["']config["']/.test(body) && body.includes(expectedId))
  assert.equal(initializers.length, 1, `Expected exactly one Google Analytics initializer for ${expectedId}`)
  const initializer = initializers[0]
  assert.ok(initializer.includes(`https://www.googletagmanager.com/gtag/js?id=${expectedId}`), "Missing expected Google Analytics loader URL")
  assert.ok(initializer.includes('document.createElement("script")'), "Missing guarded dynamic script loader")
  assert.ok(initializer.includes("window.location.pathname") && initializer.includes("widgetPathPattern"), "Missing widget exclusion guard")
  for (const [name, expected] of [["google-analytics-id", expectedId], ["analytics-mode", "always-enabled"], ["cookie-notice-storage", "arcade-cookie-notice-v1"]]) {
    assert.deepEqual(meta.filter((item) => item.name === name).map((item) => item.content), [expected], `Expected one ${name} marker`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [file, expectedId] = process.argv.slice(2)
  assert.ok(file && expectedId, "Usage: node scripts/verify-google-analytics-html.mjs <html-path> <GA-ID>")
  verifyAnalyticsHtml(await readFile(file, "utf8"), expectedId)
  console.log(`Verified that Google Analytics ${expectedId} loads by default and skips the embed widget route.`)
}
