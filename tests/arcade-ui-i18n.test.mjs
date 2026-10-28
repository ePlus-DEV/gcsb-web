import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import ts from "typescript"

test("shared UI surfaces introduce no unlocalized visible or assistive copy", () => {
  const file = ts.createSourceFile("surface.tsx", fs.readFileSync("components/arcade/ui/surface.tsx", "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  function visit(node) {
    if (ts.isJsxText(node)) assert.equal(node.text.trim(), "", "UI copy belongs in locale catalogs")
    if (ts.isJsxAttribute(node) && /^(title|aria-label|placeholder)$/.test(node.name.getText(file))) {
      assert.ok(!node.initializer || !ts.isStringLiteral(node.initializer), "Assistive copy must come from the caller's catalog")
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
})

test("shared reward tier labels exist in English and Vietnamese", () => {
  for (const locale of ["en", "vi"]) {
    const catalog = JSON.parse(fs.readFileSync(`public/i18n/locales/${locale}.json`, "utf8"))
    for (const key of ["arcadeTiers", "liveSlots", "totalSlotsOnly", "tierNote"]) assert.ok(catalog.messages[key], `${locale}: ${key}`)
    for (const key of ["leftOf", "totalSlots"]) assert.match(catalog.dynamic[key], /\{count\}/)
  }
})
