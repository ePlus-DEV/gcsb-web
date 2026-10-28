import assert from "node:assert/strict"
import test from "node:test"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { pathToFileURL } from "node:url"
import { evaluateTypeScript, readRepoFile } from "./helpers/typescript-source.mjs"

test("catalog request URLs include the build version and preserve preview prefixes", async () => {
  const oldFetch = globalThis.fetch
  const oldVersion = process.env.NEXT_PUBLIC_I18N_VERSION
  const oldBase = process.env.NEXT_PUBLIC_BASE_PATH
  try {
    process.env.NEXT_PUBLIC_I18N_VERSION = "catalog-revision-2"
    process.env.NEXT_PUBLIC_BASE_PATH = "/pr-preview/pr-103"
    let requestUrl
    globalThis.fetch = async url => { requestUrl = url; return { ok: true, json: async () => ({ messages: {} }) } }
    const { loadWebsiteCatalog } = evaluateTypeScript(readRepoFile("lib/website-i18n.ts"))
    await loadWebsiteCatalog("vi")
    assert.equal(requestUrl, "/pr-preview/pr-103/i18n/vi.json?v=catalog-revision-2")
  } finally {
    globalThis.fetch = oldFetch
    for (const [key, value] of [["NEXT_PUBLIC_I18N_VERSION", oldVersion], ["NEXT_PUBLIC_BASE_PATH", oldBase]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value
    }
  }
})
test("editing a translation invalidates the build's catalog version", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-version-"))
  try {
    const locales = path.join(dir, "public/i18n/locales")
    fs.mkdirSync(locales, { recursive: true })
    const file = path.join(locales, "vi.json")
    fs.writeFileSync(file, '{"hello":"Xin chào"}')
    const configUrl = pathToFileURL(path.resolve("next.config.mjs")).href
    const getVersion = () => execFileSync(process.execPath, ["--input-type=module", "-e", `import config from ${JSON.stringify(configUrl)}; process.stdout.write(config.env.NEXT_PUBLIC_I18N_VERSION)`], { cwd: dir, encoding: "utf8" })
    const first = getVersion()
    assert.equal(getVersion(), first)
    fs.writeFileSync(file, '{"hello":"Chào bạn"}')
    assert.notEqual(getVersion(), first)
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})
test("Vietnamese preview selectors follow the catalog after editorial changes", () => {
  const workflow = readRepoFile(".github/workflows/facilitator-i18n-preview.yml")
  assert.match(workflow, /vi\.additional\['__profileOption:participating'\]/)
  assert.match(workflow, /vi\.additional\['Bonus Milestone completed'\]/)
  assert.doesNotMatch(workflow, /hasText: 'Đang tham gia Facilitator Program'|getByText\('Xem 4 GEAR skill badge/)
})
