import assert from "node:assert/strict"
import test from "node:test"
import fs from "node:fs"
import { evaluateTypeScript, readRepoFile } from "./helpers/typescript-source.mjs"
const { parseReleasedGames, summarizeReleasedPoints } = evaluateTypeScript(readRepoFile("components/arcade/released-points.ts"))
const now = Date.parse("2026-10-28T00:00:00Z")
const game = (title, points, extra = {}) => ({ title, points, ...extra })

test("compares the same released games, deduplicates releases and separates remaining points", () => {
  const rows = parseReleasedGames([
    game("Game A", 2, { joinUrl: "https://www.skills.google/games/1?x=1" }),
    game("Game A", 2, { joinUrl: "https://www.skills.google/games/1?x=2" }),
    game("Game B", 1, { deadline: "2026-10-31T00:00:00Z" }),
    game("Game C", 3, { deadline: "2026-10-01T00:00:00Z" }),
    game("Game D", null),
    game("Game E", -1),
  ], "2026-10")
  assert.deepEqual(summarizeReleasedPoints(rows, [{ title: "GAME A" }, { title: "Unrelated skill badge", points: 100 }], now),
    { total: 6, achieved: 2, available: 1, expired: 3, unknown: 2, months: 1, percent: 1/3 })
})
test("ambiguous recurring aliases never award multiple months", () => {
  const rows = [
    ...parseReleasedGames([game("January Certification", 1, { aliases: ["Certification"] })], "2026-01"),
    ...parseReleasedGames([game("February Certification", 1, { aliases: ["Certification"] })], "2026-02"),
  ]
  assert.equal(summarizeReleasedPoints(rows, [{ title: "Certification" }], now).achieved, 0)
  assert.equal(summarizeReleasedPoints(rows, [{ title: "January Certification" }], now).achieved, 1)
})
test("invalid history fails instead of silently reducing the published total", () => {
  assert.throws(() => parseReleasedGames({}, "2026-01"))
  assert.throws(() => parseReleasedGames([{}], "2026-01"))
  assert.equal(summarizeReleasedPoints([], [], now).percent, 0)
})
test("all released points copy is catalog-owned and translated with intact placeholders", () => {
  const source = readRepoFile("components/arcade/released-points-panel.tsx")
  const catalogs = fs.readdirSync("public/i18n/locales").filter((name) => name.endsWith(".json")).map((name) => JSON.parse(readRepoFile(`public/i18n/locales/${name}`)))
  const english = JSON.parse(readRepoFile("public/i18n/locales/en.json")).additional
  const keys = Object.keys(english).filter((key) => key.startsWith("__releasedPoints:"))
  assert.equal(keys.length, 11)
  const placeholders = (value) => [...value.matchAll(/\{\w+\}/g)].map((match) => match[0]).sort()
  for (const key of keys) {
    assert.ok(!source.includes(english[key]), `hardcoded ${key}`)
    for (const catalog of catalogs) {
      assert.ok(catalog.additional[key])
      assert.deepEqual(placeholders(catalog.additional[key]), placeholders(english[key]))
    }
  }
})

test("English and Vietnamese panels render matching localized point summaries", async () => {
  const ts = (await import("typescript")).default
  const React = await import("react")
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { createRequire } = await import("node:module")
  const require = createRequire(import.meta.url)
  const rows = parseReleasedGames([game("Test game", 2, { deadline: "2026-10-31T00:00:00Z" })], "2026-10")
  const compiled = ts.transpileModule(readRepoFile("components/arcade/released-points-panel.tsx"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText
  for (const [locale, heading, earned] of [["en", "Arcade released points", "Your earned points"], ["vi", "Điểm Arcade đã phát hành", "Điểm bạn đã đạt"]]) {
    let stateIndex = 0
    const module = { exports: {} }
    new Function("require", "module", "exports", compiled)((id) => {
      if (id === "react") return { ...React, useEffect: () => {}, useState: () => [stateIndex++ === 0 ? rows : false, () => {}] }
      if (id === "lucide-react") return Object.fromEntries(["Trophy", "Check", "Clock", "Circle"].map((name) => [name, (props) => React.createElement("svg", props)]))
      if (id === "./released-points") return { parseReleasedGames, summarizeReleasedPoints }
      return require(id)
    }, module, module.exports)
    const catalog = JSON.parse(readRepoFile(`public/i18n/locales/${locale}.json`))
    const html = renderToStaticMarkup(React.createElement(module.exports.default, { badges: [{ title: "Test game" }], hasProfile: true, catalog, locale, nowMs: now }))
    assert.ok(html.includes(heading))
    assert.ok(html.includes(earned))
    assert.ok(html.includes('<dd>2</dd>'))
    assert.ok(html.includes('value="1"'))
  }
})
