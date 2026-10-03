import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync, readdirSync } from "node:fs"
import ts from "typescript"
import { evaluateTypeScript, readRepoFile } from "./helpers/typescript-source.mjs"

const model = evaluateTypeScript(readRepoFile("components/monthly-labs/model.ts").replace('import knownRoutes from "@/data/monthly-lab-routes.json"', `const knownRoutes = ${readRepoFile("data/monthly-lab-routes.json")}`))
const snapshot = JSON.parse(readRepoFile("data/monthly-labs.json"))

test("monthly lab archive produces unique stable routes for every recorded month", () => {
  assert.ok(Object.keys(snapshot.months).includes("2026-09"))
  assert.ok(Object.keys(snapshot.months).includes("2026-10"))
  const routes = new Set()
  for (const [month, entries] of Object.entries(snapshot.months)) {
    const labs = model.parseMonthlyLabs(month, entries)
    assert.ok(labs.length > 0)
    for (const lab of labs) {
      const path = model.monthlyLabPath(lab)
      assert.ok(!routes.has(path), path)
      routes.add(path)
      assert.match(path, /^\/monthly-labs\/\d{4}\/\d{2}\/[a-z0-9-]+\/$/)
    }
  }
  assert.deepEqual([...routes].sort(), JSON.parse(readRepoFile("data/monthly-lab-routes.json")).sort())
  const september = model.parseMonthlyLabs("2026-09", snapshot.months["2026-09"])
  const game = september.find(lab => lab.joinUrl?.includes("/games/7441"))
  assert.equal(model.monthlyLabPath(game), "/monthly-labs/2026/09/game-7441/")
})

test("monthly lab parser rejects invalid months, unsafe URLs, foreign months and duplicate game IDs", () => {
  const bad = { title: "Test", imageUrl: "javascript:alert(1)", joinUrl: "http://example.com/games/1", points: " ", spotsRemaining: -1, deadlineTimeZone: "Bad/Zone" }
  assert.deepEqual(model.parseMonthlyLabs("2026-13", [bad]), [])
  assert.deepEqual(model.parseMonthlyLabs("2026-09", [{ title: "", month: "2026-09" }, { title: "Wrong", month: "2026-10" }]), [])
  const [lab] = model.parseMonthlyLabs("2026-09", [bad])
  assert.equal(lab.joinUrl, null)
  assert.equal(lab.imageUrl, null)
  assert.equal(lab.points, null)
  assert.equal(lab.spotsRemaining, null)
  assert.equal(lab.deadlineTimeZone, null)
  assert.equal(model.parseMonthlyLabs("2026-09", [{ title: "One", joinUrl: "https://www.skills.google/games/1" }, { title: "Alias", joinUrl: "https://www.skills.google/games/1" }]).length, 1)
})

test("lab status cannot promote old active snapshots or reconstructed records into current enrollment", () => {
  const now = Date.parse("2026-10-02T12:00:00Z")
  const base = model.parseMonthlyLabs("2026-09", [{ title: "Old", status: "active", deadline: "2026-09-30T17:29:17Z" }])[0]
  assert.equal(model.labState(base, now), "labArchived")
  assert.equal(model.labState({ ...base, month: "2026-10", status: "active", deadline: "2026-10-31T17:29:17Z" }, now), "labActive")
  assert.equal(model.labState({ ...base, month: "2026-10", status: null, deadline: null }, now), "labUnknown")
  assert.equal(model.labState({ ...base, month: "2026-10", status: "game_over", deadline: null }, now), "labArchived")
})

test("month routing uses source timezone and preserves feed month instead of the viewer month", () => {
  const game = { title: "Boundary", joinUrl: "https://www.skills.google/games/99", deadline: "2026-09-30T20:00:00Z", deadlineTimeZone: "Asia/Kolkata" }
  assert.equal(model.monthlyGameDetailPath(game, ["/monthly-labs/2026/10/game-99/"]), "/monthly-labs/2026/10/game-99/")
  assert.equal(model.monthlyGameDetailPath({ ...game, month: "2026-09" }, ["/monthly-labs/2026/09/game-99/"]), "/monthly-labs/2026/09/game-99/")
  assert.equal(model.monthlyGameDetailPath(game), null)
  assert.equal(model.monthlyGameDetailPath({ title: "Unknown", deadline: null }), null)
  assert.equal(model.monthLabel("2026-09", "en"), "September 2026")
  assert.match(model.monthLabel("2026-09", "vi"), /9.*2026/)
})

test("all monthly page copy has translated catalogs with matching placeholders and no English JSX literals", () => {
  const catalogs = readdirSync("public/i18n/locales").filter(name => name.endsWith(".json")).map(name => [name, JSON.parse(readFileSync(`public/i18n/locales/${name}`, "utf8"))])
  const en = catalogs.find(([name]) => name === "en.json")[1]
  const keys = ["labArchiveDescription", "labMonthDescription", "labDetails", "labArchived", "labActive", "labUnknown", "labSourceDescription", "labMissingDescription", "labHistoricalNotice", "labHistoricalSlots", "labSource", "labCount", "labBreadcrumb", "labCopyFailed"]
  const placeholders = value => [...value.matchAll(/\{[^}]+\}/g)].map(match => match[0]).sort()
  for (const [name, catalog] of catalogs) for (const key of keys) {
    assert.ok(catalog.messages[key]?.trim(), `${name}: ${key}`)
    assert.deepEqual(placeholders(catalog.messages[key]), placeholders(en.messages[key]), `${name}: ${key}`)
    if (name !== "en.json") assert.notEqual(catalog.messages[key], en.messages[key], `${name}: ${key}`)
  }
  const source = readRepoFile("components/monthly-labs/pages.tsx")
  const file = ts.createSourceFile("pages.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const english = new Set(keys.map(key => en.messages[key]))
  const leaks = []
  function visit(node) {
    if (ts.isJsxText(node) && english.has(node.getText(file).trim())) leaks.push(node.getText(file))
    if (ts.isStringLiteral(node) && english.has(node.text)) leaks.push(node.text)
    ts.forEachChild(node, visit)
  }
  visit(file)
  assert.deepEqual(leaks, [])
  assert.match(source, /useSiteCatalog/)
  assert.match(source, /lab\.deadlineTimeZone \?\? "UTC"/)
  assert.match(source, /labState\(lab, now\) !== "labArchived"/)
  assert.match(readRepoFile("app/sitemap.ts"), /monthlyLabPath/)
})

test("monthly labs use one responsive UI hierarchy across archive, month and detail pages", () => {
  const source = readRepoFile("components/monthly-labs/pages.tsx")
  const styles = readRepoFile("app/styles/site-ui.css")

  for (const className of [
    "monthly-lab-archive-grid",
    "monthly-lab-month-card",
    "monthly-lab-game-grid",
    "monthly-lab-game-card",
    "monthly-lab-detail-card",
    "monthly-lab-fact-grid",
    "monthly-lab-history-note",
  ]) {
    assert.ok(source.includes(className), `monthly lab JSX missing ${className}`)
    assert.ok(styles.includes(`.${className}`), `monthly lab CSS missing ${className}`)
  }

  assert.match(source, /href="\/monthly-labs\/" className="monthly-lab-back-link"/)
  assert.match(source, /className="monthly-lab-detail-actions"/)
  assert.match(styles, /@media \(max-width: 640px\)[\s\S]*monthly-lab-game-grid/)
  assert.doesNotMatch(source, /className="grid gap-4 md:grid-cols-2"/)
})

