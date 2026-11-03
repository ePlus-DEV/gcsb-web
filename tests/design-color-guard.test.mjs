import test from "node:test"
import assert from "node:assert/strict"
import { analyzeDiff, colorLiterals } from "../scripts/design-color-guard.mjs"

const patch = (file, removed, added) => [
  `diff --git a/${file} b/${file}`,
  `--- a/${file}`,
  `+++ b/${file}`,
  "@@ -1,1 +1,1 @@",
  ...removed.map(s => "-" + s),
  ...added.map(s => "+" + s),
].join("\n")

test("new raw hex colors are blocked in UI source", () => {
  assert.deepEqual(analyzeDiff(patch("components/test.tsx", [], ['<button style={{ backgroundColor: "#22d3ee" }} />']))
    .map(x => x.token), ["hex:#22d3ee"])
})

test("new Tailwind palette classes are blocked while semantic classes remain allowed", () => {
  assert.equal(analyzeDiff(patch("app/page.tsx", [], ['<div className="bg-purple-600 text-slate-500" />'])).length, 2)
  assert.equal(analyzeDiff(patch("app/page.tsx", [], ['<div className="bg-primary text-foreground" />'])).length, 0)
})

test("CSS functions are blocked but semantic var() is accepted", () => {
  assert.equal(analyzeDiff(patch("app/styles/new.css", [], ["a { background: rgba(12, 23, 34, .8); }"])).length, 1)
  assert.equal(analyzeDiff(patch("app/styles/new.css", [], ["a { color: var(--ds-text); }"])).length, 0)
})

test("existing unchanged colors are grandfathered when a line is reformatted", () => {
  assert.equal(analyzeDiff(patch("app/styles/legacy.css", ["color:#fff;background:#6d28d9;"], ["color: #fff; background: #6d28d9;"])).length, 0)
})

test("additional hardcoded copies are blocked even if the same color existed", () => {
  assert.equal(analyzeDiff(patch("app/styles/legacy.css", ["color: #fff"], ["color: #fff; background: #fff"])).length, 1)
})

test("token file is the only automatic exception", () => {
  assert.equal(analyzeDiff(patch("app/styles/design-tokens.css", [], ["--ds-primary: #6d28d9;"])).length, 0)
  assert.equal(analyzeDiff(patch("app/styles/another-token.css", [], ["--random-primary: #6d28d9;"])).length, 1)
})

test("explicit same-line design exception is allowed but undocumented exceptions are not", () => {
  assert.equal(analyzeDiff(patch("components/tier.tsx", [], ['const gold = "#ffd43b" // design-color-exception: external tier rank color'])).length, 0)
  assert.equal(analyzeDiff(patch("components/tier.tsx", [], ['const gold = "#ffd43b" // exception'])).length, 1)
})

test("unchanged files outside UI and markdown docs are exempt", () => {
  assert.equal(analyzeDiff(patch("docs/ui/DESIGN_SYSTEM.md", [], ["Primary #6d28d9"])).length, 0)
  assert.equal(analyzeDiff(patch("public/i18n/locales/en.json", [], ['"theme":"#fff"'])).length, 0)
})

test("palette scanner does not treat CSS hashes or fragments as colors", () => {
  assert.deepEqual(colorLiterals(".nav a[href='#profile']:focus-visible { color: var(--ds-link) }"), [])
})
