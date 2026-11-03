import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import ts from "typescript"
import { readRepoFile } from "./helpers/typescript-source.mjs"

test("reusable analyzer and dashboard kit contain no hardcoded interface copy", () => {
  for (const path of ["components/arcade/profile-analyzer.tsx", "components/arcade/ui/dashboard-kit.tsx"]) {
    const file = ts.createSourceFile(path, readRepoFile(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    function visit(node) {
      if (ts.isJsxText(node)) assert.equal(node.text.trim(), "", path)
      if (ts.isJsxAttribute(node) && /^(aria-label|placeholder|title)$/.test(node.name.getText(file))) {
        assert.ok(!node.initializer || !ts.isStringLiteral(node.initializer), `${path}: catalog-owned accessible text`)
      }
      ts.forEachChild(node, visit)
    }
    visit(file)
  }
  const keys = ["pasteProfile", "profileUrl", "clearProfileUrl", "analyzing", "analyzeProfile", "findProfile", "resetResult", "openNavigation", "closeNavigation", "backToCalculator", "publicDataOnly", "noSignIn", "installChrome", "installFirefox"]
  for (const name of fs.readdirSync("public/i18n/locales")) {
    const catalog = JSON.parse(readRepoFile(`public/i18n/locales/${name}`))
    for (const key of keys) assert.ok(catalog.messages[key], `${name}: ${key}`)
  }
})

test("analyzer retains enhancement anchors and exposes validation and loading semantics", () => {
  const source = readRepoFile("components/arcade/profile-analyzer.tsx")
  for (const token of ["profile-analyzer-card", "profile-input", "analyze-button", "analyzer-help-row"]) assert.ok(source.includes(token))
  assert.match(source, /htmlFor="arcade-profile-url"/)
  assert.match(source, /id="arcade-profile-url"/)
  assert.match(source, /aria-invalid=\{Boolean\(error\)\}/)
  assert.match(source, /aria-busy=\{loading\}/)
  assert.match(source, /disabled=\{loading\}/)
})

test("component extraction preserves the established dashboard hierarchy", () => {
  const source = readRepoFile("app/redesign-calculator.tsx")
  assert.match(source, /className="dashboard-panel tier-status-panel"/)
  assert.match(source, /<Stat value=\{scoreNumber\(points\)\}/)
  assert.ok(source.indexOf("{extensionStrip}") < source.indexOf("<GuestDashboard"))
  assert.match(source, /aria-controls="arcade-primary-navigation"/)
  assert.match(source, /event.key !== "Escape"/)
  const style = readRepoFile("app/styles/interface-refresh.css")
  assert.doesNotMatch(style, /--ui-page|grid-template-areas|points-total|hero-heading/)
})

test("profile enhancers use the same locale-independent input anchor as the analyzer", () => {
  const source = readRepoFile("components/arcade/profile-analyzer.tsx")
  assert.match(source, /data-arcade-profile-input="true"/)
  for (const path of ["components/arcade/facilitator-analyzer-option.tsx", "components/arcade/fresh-score-check-enhancer.tsx"]) {
    const enhancer = readRepoFile(path)
    assert.match(enhancer, /input\[data-arcade-profile-input="true"\]/)
    assert.doesNotMatch(enhancer, /input\[aria-label=/)
  }
})


test("shared-profile CI uses a valid single-segment locale path glob", () => {
  const workflow = readRepoFile(".github/workflows/shared-profile-preview.yml")
  assert.ok(workflow.includes('"app/*/profile/**"'))
  assert.ok(!workflow.includes("[[]locale[]]"))
})
