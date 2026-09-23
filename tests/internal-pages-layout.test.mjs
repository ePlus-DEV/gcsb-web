import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const about = readRepoFile("app/about/page.tsx")
const guide = readRepoFile("app/guide/page.tsx")

test("About presents actual sections and useful native navigation", () => {
  for (const heading of [
    "What the tool does", "Why it exists", "Privacy by design",
    "Independent community project", "How calculations should be understood",
  ]) {
    assert.ok(about.includes(heading), "About missing " + heading)
  }
  assert.match(about, /md:grid-cols-2/)
  assert.match(about, /sm:p-8/)
  assert.match(about, /href="\/guide\/"/)
  assert.match(about, /href="\/privacy\/"/)
  assert.match(about, /href="\/"/)
  assert.match(about, /dark:text-white/)
  assert.match(about, /text-slate-950/)
  assert.match(about, /not-prose space-y-10/)
})

test("Guide cards have contrasting light and dark themes", () => {
  assert.match(guide, /bg-slate-50 dark:bg-white\/\[0\.035\]/)
  assert.match(guide, /text-slate-950 dark:text-white/)
  assert.match(guide, /text-slate-600 dark:text-slate-300/)
  assert.match(guide, /border-slate-200 dark:border-white\/10/)
  assert.match(guide, /lg:grid-cols-2/)
  assert.match(guide, /href="\/swag-drops\/2026\/"/)
})
