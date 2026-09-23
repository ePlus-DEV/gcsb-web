export const MILESTONE_HISTORY_URL =
  process.env.NEXT_PUBLIC_ARCADE_MILESTONE_HISTORY_URL ??
  "https://raw.githubusercontent.com/hoangsvit/arcade-crawler/main/data/arcade_milestones_history/latest.json"

export type SlotHistoryTier = {
  points: number
  slots: number
  spotsLeft: number
}

export type SlotSnapshot = {
  at: string
  tiers: SlotHistoryTier[]
}

export type SlotHistoryFeed = {
  version: 1
  snapshots: SlotSnapshot[]
}

export type SlotPeriod = "24h" | "7d" | "30d"
export type SlotPoint = { at: string; spotsLeft: number; slots: number }
export type SlotWindow = {
  points: SlotPoint[]
  delta: number | null
  baselineAt: string | null
  latestAt: string | null
}

const PERIOD_MS: Record<SlotPeriod, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
}
const EXPECTED_POINTS = [50, 75, 95, 120]

function finiteSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value)
}

export function parseSlotHistory(payload: unknown): SlotHistoryFeed {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid slot-history response.")
  }
  const object = payload as Record<string, unknown>
  if (object.version !== 1 || !Array.isArray(object.snapshots) || object.snapshots.length > 512) {
    throw new Error("Invalid or oversized slot-history feed.")
  }
  let previousTimestamp = -Infinity
  const snapshots: SlotSnapshot[] = object.snapshots.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error("Invalid slot-history observation.")
    }
    const entry = raw as Record<string, unknown>
    const at = entry.at
    if (typeof at !== "string" || !Number.isFinite(Date.parse(at)) ||
        new Date(at).toISOString() !== at || Date.parse(at) <= previousTimestamp ||
        !Array.isArray(entry.tiers) || entry.tiers.length !== 4) {
      throw new Error("Invalid slot-history timestamp or tier set.")
    }
    previousTimestamp = Date.parse(at)
    const tiers = (entry.tiers as unknown[]).map((rawTier) => {
      if (!rawTier || typeof rawTier !== "object" || Array.isArray(rawTier)) {
        throw new Error("Invalid slot-history tier.")
      }
      const tier = rawTier as Record<string, unknown>
      if (!finiteSafeInteger(tier.points) || !finiteSafeInteger(tier.slots) ||
          tier.slots <= 0 || !finiteSafeInteger(tier.spotsLeft) ||
          tier.spotsLeft < 0 || tier.spotsLeft > tier.slots) {
        throw new Error("Invalid slot-history count.")
      }
      return { points: tier.points, slots: tier.slots, spotsLeft: tier.spotsLeft }
    }).sort((a, b) => a.points - b.points)
    if (!tiers.every((tier, index) => tier.points === EXPECTED_POINTS[index])) {
      throw new Error("Unexpected prize-tier thresholds.")
    }
    return { at, tiers }
  })
  return { version: 1, snapshots }
}

/**
 * A 404 before the crawler PR is merged is an expected unpublished-feed state,
 * not a transient network failure. Never fabricate history as a fallback.
 */
export async function decodeSlotHistoryResponse(
  response: Pick<Response, "ok" | "status" | "json">,
): Promise<
  | { status: "pending"; feed: null }
  | { status: "ready"; feed: SlotHistoryFeed }
> {
  if (response.status === 404) return { status: "pending", feed: null }
  if (!response.ok) throw new Error("Slot history request failed: " + response.status)
  return {
    status: "ready",
    feed: parseSlotHistory(await response.json() as unknown),
  }
}

export function latestSlotChange(
  feed: SlotHistoryFeed | null,
  points: number,
  currentSpotsLeft: number | null,
  nowMs = Date.now(),
): number | null {
  if (!feed || currentSpotsLeft === null || feed.snapshots.length < 2) return null
  const snapshots = feed.snapshots
  const latest = snapshots[snapshots.length - 1]
  const currentTier = latest.tiers.find((tier) => tier.points === points)
  if (!currentTier || currentTier.spotsLeft !== currentSpotsLeft) return null
  const latestAge = nowMs - Date.parse(latest.at)
  if (latestAge < -5 * 60_000 || latestAge > 48 * 60 * 60_000) return null

  // The crawler also records a real daily checkpoint when nothing changes.
  // Skip those identical checkpoints to show the latest actual slot movement,
  // never a misleading "+0" just because a stable day was recorded.
  let previousIndex = snapshots.length - 2
  while (previousIndex >= 0) {
    const candidate = snapshots[previousIndex].tiers.find((tier) => tier.points === points)
    if (!candidate) return null
    if (candidate.spotsLeft !== currentTier.spotsLeft) break
    previousIndex -= 1
  }
  if (previousIndex < 0) return null
  const prior = snapshots[previousIndex].tiers.find((tier) => tier.points === points)
  if (!prior) return null
  const changeAt = snapshots[previousIndex + 1].at
  const changeAge = nowMs - Date.parse(changeAt)
  if (changeAge < -5 * 60_000 || changeAge > 48 * 60 * 60_000) return null
  return currentTier.spotsLeft - prior.spotsLeft
}

export function selectSlotWindow(
  feed: SlotHistoryFeed,
  points: number,
  period: SlotPeriod,
  nowMs = Date.now(),
): SlotWindow {
  const cutoff = nowMs - PERIOD_MS[period]
  const valid = feed.snapshots.filter((item) => Date.parse(item.at) <= nowMs + 5 * 60_000)
  const inWindow = valid.filter((item) => Date.parse(item.at) >= cutoff)
  const previous = [...valid].reverse().find((item) => Date.parse(item.at) < cutoff)
  if (inWindow.length === 0) {
    return { points: [], delta: null, baselineAt: null, latestAt: valid[valid.length - 1]?.at ?? null }
  }
  const candidates = previous ? [previous, ...inWindow] : inWindow
  const values = candidates.map((item) => {
    const tier = item.tiers.find((candidate) => candidate.points === points)
    if (!tier) throw new Error("Missing tier observation.")
    return { at: item.at, spotsLeft: tier.spotsLeft, slots: tier.slots }
  })
  const latest = values[values.length - 1]
  const baseline = values.length >= 2 ? values[0] : null
  return {
    points: values,
    delta: baseline ? latest.spotsLeft - baseline.spotsLeft : null,
    baselineAt: baseline?.at ?? null,
    latestAt: latest.at,
  }
}
