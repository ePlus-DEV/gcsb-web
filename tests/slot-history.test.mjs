import assert from "node:assert/strict"
import test from "node:test"
import { evaluateTypeScript, readRepoFile } from "./helpers/typescript-source.mjs"

const mod = evaluateTypeScript(readRepoFile("components/arcade/slot-history.ts"))
const counts = (trooper = 3514, ranger = 1760, champion = 1020, legend = 1511) => [
  { points: 50, slots: 6000, spotsLeft: trooper },
  { points: 75, slots: 4000, spotsLeft: ranger },
  { points: 95, slots: 3000, spotsLeft: champion },
  { points: 120, slots: 2500, spotsLeft: legend },
]
const sample = (at, tiers) => ({ at, tiers })
const two = {
  version: 1,
  snapshots: [
    sample("2026-09-22T00:00:00.000Z", counts()),
    sample("2026-09-23T00:00:00.000Z", counts(3718, 1622, 781, 1397)),
  ],
}

test("validates schema, bounds, ordering and the four official thresholds", () => {
  assert.deepEqual(mod.parseSlotHistory(two), two)
  assert.throws(() => mod.parseSlotHistory({ version: 2, snapshots: [] }), /Invalid or oversized/)
  assert.throws(() => mod.parseSlotHistory({ version: 1, snapshots: Array(513).fill(two.snapshots[0]) }), /oversized/)
  assert.throws(() => mod.parseSlotHistory({ version: 1, snapshots: [...two.snapshots].reverse() }), /timestamp/)
  assert.throws(() => mod.parseSlotHistory({ version: 1, snapshots: [
    sample(two.snapshots[0].at, counts(8000)),
  ] }), /count/)
  assert.throws(() => mod.parseSlotHistory({ version: 1, snapshots: [
    sample(two.snapshots[0].at, counts().slice(0, 3)),
  ] }), /tier set/)
})

test("last change is ± only if fresh and reconciled with the visible live count", () => {
  const feed = mod.parseSlotHistory(two)
  const now = Date.parse("2026-09-23T03:00:00Z")
  assert.equal(mod.latestSlotChange(feed, 50, 3718, now), 204)
  assert.equal(mod.latestSlotChange(feed, 75, 1622, now), -138)
  assert.equal(mod.latestSlotChange(feed, 95, 781, now), -239)
  assert.equal(mod.latestSlotChange(feed, 120, 1397, now), -114)
  assert.equal(mod.latestSlotChange(feed, 50, 3500, now), null)
  assert.equal(mod.latestSlotChange(feed, 50, 3718, now + 3 * 24 * 60 * 60_000), null)
  assert.equal(mod.latestSlotChange({ version: 1, snapshots: [two.snapshots[0]] }, 50, 3514, now), null)
})

test("7, 14, 21 and 30 day windows use actual observations", () => {
  const now = Date.parse("2026-09-23T06:00:00Z")
  const feed = mod.parseSlotHistory(two)
  assert.equal(mod.selectSlotWindow(feed, 50, "30d", now).delta, 204)
  assert.equal(mod.selectSlotWindow(feed, 95, "7d", now).delta, -239)
  for (const period of ["7d", "14d", "21d", "30d"]) {
    const selected = mod.selectSlotWindow(feed, 50, period, now)
    assert.equal(selected.delta, 204, period)
    assert.equal(selected.baselineAt, "2026-09-22T00:00:00.000Z", period)
  }
  const sparse = mod.selectSlotWindow({ version: 1, snapshots: [two.snapshots[1]] }, 50, "30d", now)
  assert.equal(sparse.delta, null)
  assert.equal(sparse.points.length, 1)
})

test("empty, out-of-window and stale feeds never show made-up changes", () => {
  const now = Date.parse("2026-10-23T00:00:00Z")
  const feed = mod.parseSlotHistory(two)
  const weekly = mod.selectSlotWindow(feed, 50, "7d", now)
  assert.equal(weekly.points.length, 0)
  assert.equal(weekly.delta, null)
  assert.equal(mod.selectSlotWindow({ version: 1, snapshots: [] }, 50, "30d", now).delta, null)
})

test("browser client and calculator share one real history URL", () => {
  const component = readRepoFile("components/arcade/tier-slot-history.tsx")
  const calculator = readRepoFile("app/redesign-calculator.tsx")
  assert.match(component, /MILESTONE_HISTORY_URL/)
  assert.match(calculator, /useTierSlotHistory/)
  assert.match(calculator, /<TierSlotHistoryPanel/)
  assert.match(calculator, /<SlotChangeBadge/)
  assert.match(component, /PERIODS: SlotPeriod\[\] = \["7d", "14d", "21d", "30d"\]/)
  assert.doesNotMatch(component, /"24h"/)
  assert.match(component, /<Dialog open=\{open\}/)
  assert.match(component, /<DialogTrigger asChild>/)
  assert.match(component, /<DialogContent/)
  assert.match(component, /<ChartContainer/)
  assert.match(component, /<LineChart/)
  assert.match(component, /<ToggleGroup/)
  assert.match(component, /<Accordion/)
})

test("404 means feed not yet published; other HTTP errors remain retryable failures", async () => {
  const pending = await mod.decodeSlotHistoryResponse({
    status: 404, ok: false, json: async () => { throw new Error("should not parse a 404") },
  })
  assert.deepEqual(pending, { status: "pending", feed: null })
  const ready = await mod.decodeSlotHistoryResponse({
    status: 200, ok: true, json: async () => ({ version: 1, snapshots: [] }),
  })
  assert.deepEqual(ready, { status: "ready", feed: { version: 1, snapshots: [] } })
  await assert.rejects(
    mod.decodeSlotHistoryResponse({ status: 503, ok: false, json: async () => ({}) }),
    /request failed: 503/,
  )
  await assert.rejects(
    mod.decodeSlotHistoryResponse({ status: 200, ok: true, json: async () => ({ snapshots: "bad" }) }),
    /Invalid or oversized/,
  )
})

test("preview always reads permanent crawler main and protects compiled JS against stale branch URLs", () => {
  const panel = readRepoFile("components/arcade/tier-slot-history.tsx")
  const workflow = readRepoFile(".github/workflows/pr-preview.yml")
  assert.match(panel, /status === "pending"/)
  assert.match(panel, /t\("pending"\)/)
  assert.match(panel, /decodeSlotHistoryResponse/)
  assert.match(workflow, /export NEXT_PUBLIC_ARCADE_MILESTONE_HISTORY_URL="https:\/\/raw\.githubusercontent\.com\/hoangsvit\/arcade-crawler\/main/)
  assert.match(workflow, /grep -R -F -q/)
  assert.match(workflow, /Stale deleted crawler branch leaked into compiled preview/)
  assert.match(workflow, /if \[ "\$\{PR_NUMBER\}" = "75" \]/)
  assert.doesNotMatch(workflow, /export NEXT_PUBLIC_ARCADE_MILESTONE_HISTORY_URL="https:\/\/raw\.githubusercontent\.com\/hoangsvit\/arcade-crawler\/feature\//)
  const model = readRepoFile("components/arcade/slot-history.ts")
  assert.match(model, /CANONICAL_MILESTONE_HISTORY_URL/)
  assert.match(panel, /MILESTONE_HISTORY_URL !== CANONICAL_MILESTONE_HISTORY_URL/)
})

test("daily unchanged checkpoints do not erase a recent real +/- movement", () => {
  const feed = mod.parseSlotHistory({
    version: 1,
    snapshots: [
      sample("2026-09-22T00:00:00.000Z", counts()),
      sample("2026-09-23T00:00:00.000Z", counts(3718, 1622, 781, 1397)),
      sample("2026-09-24T00:00:00.000Z", counts(3718, 1622, 781, 1397)),
    ],
  })
  const nextDay = Date.parse("2026-09-24T04:00:00Z")
  assert.equal(mod.latestSlotChange(feed, 50, 3718, nextDay), 204)
  assert.equal(mod.latestSlotChange(feed, 75, 1622, nextDay), -138)
  assert.equal(mod.latestSlotChange(feed, 95, 781, nextDay), -239)
  assert.equal(mod.latestSlotChange(feed, 120, 1397, nextDay), -114)
  assert.equal(mod.latestSlotChange(feed, 50, 3718, Date.parse("2026-09-25T03:00:00Z")), null)
  assert.equal(mod.latestSlotChange(feed, 50, 3500, nextDay), null)
})

test("daily observations with identical slots do not manufacture a change badge", () => {
  const unchanged = mod.parseSlotHistory({
    version: 1,
    snapshots: [
      sample("2026-09-22T00:00:00.000Z", counts()),
      sample("2026-09-23T00:00:00.000Z", counts()),
      sample("2026-09-24T00:00:00.000Z", counts()),
    ],
  })
  assert.equal(mod.latestSlotChange(unchanged, 50, 3514, Date.parse("2026-09-24T04:00:00Z")), null)
  assert.equal(mod.selectSlotWindow(unchanged, 50, "7d", Date.parse("2026-09-24T04:00:00Z")).delta, 0)
})

test("recovered Git snapshots retain a clearly labelled provenance", () => {
  const sha = "a".repeat(40)
  const source = { kind: "git-commit", sha }
  const original = {
    version: 1,
    snapshots: [
      { at: "2026-09-21T16:41:46.000Z", tiers: counts(), source },
      { at: "2026-09-23T03:39:30.748Z", tiers: counts(3718, 1622, 781, 1397) },
    ],
  }
  const parsed = mod.parseSlotHistory(original)
  assert.deepEqual(parsed, original)
  const window = mod.selectSlotWindow(parsed, 50, "30d", Date.parse("2026-09-23T04:00:00Z"))
  assert.deepEqual(window.points[0].source, source)
  assert.equal(window.points[1].source, undefined)
  assert.throws(() => mod.parseSlotHistory({
    version: 1, snapshots: [{ ...original.snapshots[0], source: { kind: "git-commit", sha: "bad" } }],
  }), /Invalid historical Git commit source/)
  const chart = readRepoFile("components/arcade/tier-slot-history.tsx")
  const publicChart = chart.slice(chart.indexOf("const PERIODS: SlotPeriod[]"))
  assert.doesNotMatch(publicChart, /Git commit|git-commit|crawler|Recovered history/i)
  assert.match(publicChart, /t\("aboutDates"\)/)
})

test("7, 14, 21 and 30 days select distinct recorded baselines", () => {
  const now = Date.parse("2026-09-23T06:00:00Z")
  const feed = mod.parseSlotHistory({
    version: 1,
    snapshots: [
      sample("2026-08-24T00:00:00.000Z", counts(4200)),
      sample("2026-09-01T00:00:00.000Z", counts(4000)),
      sample("2026-09-07T00:00:00.000Z", counts(3800)),
      sample("2026-09-14T00:00:00.000Z", counts(3514)),
      sample("2026-09-21T00:00:00.000Z", counts(3600)),
      sample("2026-09-23T00:00:00.000Z", counts(3718)),
    ],
  })
  const expected = [
    ["7d", "2026-09-14T00:00:00.000Z", 204],
    ["14d", "2026-09-07T00:00:00.000Z", -82],
    ["21d", "2026-09-01T00:00:00.000Z", -282],
    ["30d", "2026-08-24T00:00:00.000Z", -482],
  ]
  for (const [period, baseline, delta] of expected) {
    const result = mod.selectSlotWindow(feed, 50, period, now)
    assert.equal(result.baselineAt, baseline, period)
    assert.equal(result.delta, delta, period)
    assert.equal(result.points[result.points.length - 1].spotsLeft, 3718, period)
  }
})

test("history opens in an accessible, responsive modal with source info tucked away", () => {
  const component = readRepoFile("components/arcade/tier-slot-history.tsx")
  const css = readRepoFile("app/styles/tier-slot-history.css")
  assert.match(component, /aria-haspopup="dialog"/)
  assert.match(component, /<DialogTrigger asChild>/)
  assert.match(component, /<DialogContent/)
  assert.match(component, /<ChartContainer/)
  assert.match(component, /<LineChart/)
  assert.match(component, /<Accordion/)
  assert.match(component, /t\("aboutTitle"\)/)
  assert.match(component, /t\("chartSubtitle"/)
  assert.match(css, /html\.light \.tier-trends-dialog/)
})

test("history chart uses the existing shadcn, Radix, and Recharts components", () => {
  const manifest = JSON.parse(readRepoFile("package.json"))
  const ui = readRepoFile("components/arcade/tier-slot-history.tsx")
  assert.ok(manifest.dependencies["@radix-ui/react-dialog"])
  assert.ok(manifest.dependencies["recharts"])
  assert.match(ui, /from "@\/components\/ui\/dialog"/)
  assert.match(ui, /from "@\/components\/ui\/chart"/)
  assert.match(ui, /from "@\/components\/ui\/toggle-group"/)
  assert.match(ui, /from "recharts"/)
  assert.doesNotMatch(ui, /<svg/)
  assert.doesNotMatch(ui, /<dialog/)
})


test("all four tier series share observed dates and preserve Git provenance", () => {
  const sha = "b".repeat(40)
  const source = { kind: "git-commit", sha }
  const feed = mod.parseSlotHistory({
    version: 1,
    snapshots: [
      { at: "2026-09-14T00:00:00.000Z", tiers: counts(), source },
      { at: "2026-09-21T00:00:00.000Z", tiers: counts(3600, 1680, 950, 1490) },
      { at: "2026-09-23T00:00:00.000Z", tiers: counts(3718, 1622, 781, 1397) },
    ],
  })
  const history = mod.selectMultiTierSlotWindow(feed, "7d", Date.parse("2026-09-23T06:00:00Z"))
  assert.equal(history.points.length, 3)
  assert.equal(history.baselineAt, "2026-09-14T00:00:00.000Z")
  assert.deepEqual(history.points[0].source, source)
  assert.deepEqual(history.points.map(({trooper, ranger, champion, legend}) =>
    [trooper, ranger, champion, legend]), [
    [3514, 1760, 1020, 1511],
    [3600, 1680, 950, 1490],
    [3718, 1622, 781, 1397],
  ])
  assert.deepEqual(history.deltas, {
    trooper: 204,
    ranger: -138,
    champion: -239,
    legend: -114,
  })
})

test("multi-tier history handles no data, one point and unchanged checkpoints", () => {
  const empty = mod.selectMultiTierSlotWindow({version: 1, snapshots: []}, "30d",
    Date.parse("2026-09-23T06:00:00Z"))
  assert.deepEqual(empty.points, [])
  assert.deepEqual(empty.deltas, {trooper: null, ranger: null, champion: null, legend: null})
  const single = mod.selectMultiTierSlotWindow({version: 1, snapshots: [
    sample("2026-09-23T00:00:00.000Z", counts()),
  ]}, "7d", Date.parse("2026-09-23T06:00:00Z"))
  assert.equal(single.points.length, 1)
  assert.deepEqual(single.deltas, {trooper: null, ranger: null, champion: null, legend: null})
  const stable = mod.selectMultiTierSlotWindow({version: 1, snapshots: [
    sample("2026-09-21T00:00:00.000Z", counts()),
    sample("2026-09-23T00:00:00.000Z", counts()),
  ]}, "7d", Date.parse("2026-09-23T06:00:00Z"))
  assert.equal(stable.points.length, 2)
  assert.deepEqual(stable.deltas, {trooper: 0, ranger: 0, champion: 0, legend: 0})
})

test("all tier lines are enabled by default and can be independently toggled", () => {
  const ui = readRepoFile("components/arcade/tier-slot-history.tsx")
  const css = readRepoFile("app/styles/tier-slot-history.css")
  assert.ok(ui.includes("useState<TierKey[]>(ALL_TIERS)"))
  assert.ok(ui.includes('type="multiple" value={visibleTiers}'))
  assert.ok(ui.includes("setVisibleTiers(DISPLAY_TIERS.filter"))
  assert.ok(ui.includes("onClick={() => setVisibleTiers(ALL_TIERS)}"))
  assert.ok(ui.includes("DISPLAY_TIERS.filter((tier) => enabled.includes(tier.key)).map"))
  assert.match(ui, /<LineChart/)
  assert.match(ui, /<Line/)
  assert.match(ui, /t\("noSelection"\)/)
  assert.match(ui, /Trooper/)
  assert.match(ui, /Ranger/)
  assert.match(ui, /Champion/)
  assert.match(ui, /Legend/)
  assert.match(css, /tier-trends-swatch/)
  assert.match(css, /tier-trends-tier-card/)
})


test("history launcher does not squeeze text or overflow the 300px desktop tiers sidebar", () => {
  const ui = readRepoFile("components/arcade/tier-slot-history.tsx")
  const css = readRepoFile("app/styles/tier-slot-history.css")
  const responsive = readRepoFile("app/styles/redesign-responsive.css")
  assert.match(ui, /aria-label=\{t\("viewAria"\)\}/)
  assert.ok(ui.includes('<small>{t("subtitle")}</small>'))
  assert.doesNotMatch(ui, /View trends ↗<\/span>/)
  assert.match(css, /\.tier-list-panel \.tier-trends-trigger\{/)
  assert.match(css, /grid-template-columns:34px minmax\(0,1fr\) 24px/)
  assert.match(css, /\.tier-list-panel \.tier-trends-trigger-copy strong\{[^}]*text-overflow:ellipsis/)
  assert.match(css, /\.tier-list-panel \.tier-trends-trigger-copy small\{[^}]*text-overflow:ellipsis/)
  assert.match(responsive, /\.dashboard-content-grid\{grid-template-columns:minmax\(0,1fr\) 300px\}/)
  assert.match(css, /@media \(max-width:360px\)/)
})


test("all public slot history strings use a passed catalog and locale", () => {
  const ui = readRepoFile("components/arcade/tier-slot-history.tsx")
  const calc = readRepoFile("app/redesign-calculator.tsx")
  const home = readRepoFile("app/page.tsx")
  const translated = readRepoFile("app/[locale]/page.tsx")
  const visible = ui.slice(ui.indexOf("const PERIODS: SlotPeriod[]"))
  assert.match(calc, /historyCatalog: WebsiteCatalog/)
  assert.match(calc, /historyLocale: WebsiteLocale/)
  assert.equal((calc.match(/catalog=\{historyCatalog\}/g) ?? []).length, 4)
  assert.equal((calc.match(/locale=\{historyLocale\}/g) ?? []).length, 4)
  assert.ok(home.includes('historyCatalog={englishCatalog} historyLocale="en"'))
  assert.ok(translated.includes("historyCatalog={catalog}"))
  assert.ok(translated.includes("historyLocale={locale}"))
  assert.match(ui, /slotHistoryText\(catalog/)
  assert.match(ui, /getWebsiteLocaleInfo\(locale\)\.htmlLang/)
  assert.ok(ui.includes('dir={locale === "ar" ? "rtl" : "ltr"}'))
  assert.doesNotMatch(ui, /"en-US"/)
  assert.doesNotMatch(visible, /git-commit|Git commit|crawler|Recovered history/i)
})
