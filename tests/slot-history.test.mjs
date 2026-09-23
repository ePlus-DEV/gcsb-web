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

test("24h, 7d and 30d windows compare real samples, not fabricated time intervals", () => {
  const now = Date.parse("2026-09-23T06:00:00Z")
  const feed = mod.parseSlotHistory(two)
  assert.equal(mod.selectSlotWindow(feed, 50, "30d", now).delta, 204)
  assert.equal(mod.selectSlotWindow(feed, 95, "7d", now).delta, -239)
  const daily = mod.selectSlotWindow(feed, 50, "24h", now)
  assert.equal(daily.delta, 204) // prior observation is the last known baseline
  assert.equal(daily.baselineAt, "2026-09-22T00:00:00.000Z")
  const sparse = mod.selectSlotWindow({ version: 1, snapshots: [two.snapshots[1]] }, 50, "30d", now)
  assert.equal(sparse.delta, null)
  assert.equal(sparse.points.length, 1)
})

test("empty, out-of-window and stale feeds never show made-up changes", () => {
  const now = Date.parse("2026-10-23T00:00:00Z")
  const feed = mod.parseSlotHistory(two)
  const daily = mod.selectSlotWindow(feed, 50, "24h", now)
  assert.equal(daily.points.length, 0)
  assert.equal(daily.delta, null)
  assert.equal(mod.selectSlotWindow({ version: 1, snapshots: [] }, 50, "30d", now).delta, null)
})

test("browser client and calculator share one real history URL", () => {
  const component = readRepoFile("components/arcade/tier-slot-history.tsx")
  const calculator = readRepoFile("app/redesign-calculator.tsx")
  assert.match(component, /MILESTONE_HISTORY_URL/)
  assert.match(calculator, /useTierSlotHistory/)
  assert.match(calculator, /<TierSlotHistoryPanel/)
  assert.match(calculator, /<SlotChangeBadge/)
  assert.match(component, /24h/)
  assert.match(component, /7d/)
  assert.match(component, /30d/)
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

test("preview uses real crawler PR branch only until main history is published", () => {
  const panel = readRepoFile("components/arcade/tier-slot-history.tsx")
  const workflow = readRepoFile(".github/workflows/pr-preview.yml")
  assert.match(panel, /status === "pending"/)
  assert.match(panel, /Waiting for the crawler to publish its first history feed/)
  assert.match(panel, /decodeSlotHistoryResponse/)
  assert.match(workflow, /history_main="https:\/\/raw\.githubusercontent\.com\/hoangsvit\/arcade-crawler\/main/)
  assert.match(workflow, /feature\/milestone-slot-history-20260923\/data\/arcade_milestones_history\/latest\.json/)
  assert.match(workflow, /if \[ "\$\{PR_NUMBER\}" = "75" \]/)
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
