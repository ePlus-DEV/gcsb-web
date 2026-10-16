import assert from "node:assert/strict"
import test from "node:test"
import { readdirSync } from "node:fs"
import ts from "typescript"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const required = [
  "publicDataOnly", "noSignIn", "pasteProfile", "profileUrl", "clearProfileUrl",
  "analyzing", "analyzeProfile", "findProfile", "resetResult", "installExtension",
  "automaticTracking", "nextGoal", "max", "topTierReached", "morePointsNeeded",
]

test("shared dashboard components have complete catalog copy in every locale", () => {
  for (const file of readdirSync("public/i18n/locales").filter(name => name.endsWith(".json"))) {
    const catalog = JSON.parse(readRepoFile(`public/i18n/locales/${file}`))
    for (const key of required) assert.ok(catalog.messages[key]?.trim(), `${file}: ${key}`)
    assert.ok(catalog.additional["__dashboard:programName"]?.trim(), `${file}: program name`)
    assert.ok(catalog.dynamic.progressToward?.includes("{value}"), `${file}: goal placeholder`)
  }
})

test("shared form, extension and next-goal copy cannot regress to English JSX literals", () => {
  for (const file of ["profile-analyzer", "extension-strip", "next-score-goal"]) {
    const source = ts.createSourceFile(file + ".tsx", readRepoFile(`components/arcade/${file}.tsx`), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    function visit(node) {
      if (ts.isJsxText(node)) {
        const value = node.text.trim()
        assert.ok(!/[A-Za-z]/.test(value) || ["Chrome", "Firefox"].includes(value), `${file}: hardcoded JSX ${value}`)
      }
      if (ts.isJsxAttribute(node) && ["aria-label", "title"].includes(node.name.getText(source))) {
        assert.ok(!node.initializer || !ts.isStringLiteral(node.initializer), `${file}: hardcoded ${node.name.getText(source)}`)
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
})

// Localized accessible names must never be used as integration identifiers.
test("profile integrations find the input independently of its translated name", () => {
  const analyzer = readRepoFile("components/arcade/profile-analyzer.tsx")
  assert.match(analyzer, /data-profile-url-input="true"/)
  assert.match(analyzer, /aria-label=\{messages.profileUrl\}/)
  for (const name of ["facilitator-analyzer-option", "fresh-score-check-enhancer"]) {
    const source = readRepoFile(`components/arcade/${name}.tsx`)
    assert.ok(source.includes("input[data-profile-url-input]"))
    assert.doesNotMatch(source, /input\[aria-label=/)
  }
})
