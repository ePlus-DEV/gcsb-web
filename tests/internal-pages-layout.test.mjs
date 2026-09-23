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

const privacy = readRepoFile("app/privacy/page.tsx")
const terms = readRepoFile("app/terms/page.tsx")

test("Privacy remains complete and uses responsive cards", () => {
  for (const heading of ["Information processed", "How information is used",
    "Essential browser storage", "Analytics and cookies", "Service requests",
    "Third-party services", "Data sharing", "Your controls", "Contact"]) {
    assert.ok(privacy.includes(heading), "Privacy missing " + heading)
  }
  assert.ok(privacy.includes("<CookiePreferencesButton />"))
  assert.ok(privacy.includes("does not include an analytics disable control"))
  assert.ok(privacy.includes("We do not sell personal information"))
  assert.ok(privacy.includes("privacy@eplus.dev"))
  assert.ok(privacy.includes("not-prose space-y-10"))
  assert.ok(privacy.includes("md:grid-cols-2"))
  assert.ok(privacy.includes("dark:text-white"))
})

test("Terms keeps all numbered sections and matching light and dark layout", () => {
  for (const heading of ["Community tool", "Estimates and availability",
    "Acceptable use", "Public profile responsibility", "Intellectual property",
    "No warranty", "Limitation of liability", "Changes", "Contact"]) {
    assert.ok(terms.includes(heading), "Terms missing " + heading)
  }
  assert.ok(terms.includes("support@eplus.dev"))
  assert.ok(terms.includes("not-prose space-y-10"))
  assert.ok(terms.includes("md:grid-cols-2"))
  assert.ok(terms.includes("dark:text-white"))
})
