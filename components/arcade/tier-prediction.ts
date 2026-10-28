/** Google allocation uses its milestone timestamp, never our check timestamp. */
export const PREDICTION_VERSION = 1
export const PREDICTION_SEASON = 2026
export const TIERS_DESC = [120, 95, 75, 50] as const
export const MAX_SLOT_AGE_MS = 48 * 60 * 60 * 1000
export type ScoreCheck = { at: string; points: number; complete: boolean }
export type TierObservation = ScoreCheck & {
  version: 1
  season: 2026
  slotsAt: string | null
  slots: Array<{ points: number; spotsLeft: number }>
}
export type Prediction = {
  scoreTier: number | null
  supportedTier: number | null
  evidenceAt: string | null
  fallbackTier: number | null
  state: "review" | "below" | "supported" | "uncertain"
}

function validTime(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
}
export function validObservation(value: unknown): value is TierObservation {
  if (!value || typeof value !== "object") return false
  const x = value as TierObservation
  return x.version === 1 && x.season === 2026 && validTime(x.at) &&
    Number.isFinite(x.points) && x.points >= 0 && x.points <= 10000 &&
    typeof x.complete === "boolean" && (x.slotsAt === null || validTime(x.slotsAt)) &&
    Array.isArray(x.slots) && x.slots.length <= 4 &&
    x.slots.every(s => s && typeof s === "object") &&
    new Set(x.slots.map(s => s.points)).size === x.slots.length &&
    x.slots.every(s => TIERS_DESC.includes(s.points as typeof TIERS_DESC[number]) &&
      Number.isInteger(s.spotsLeft) && s.spotsLeft >= 0 && s.spotsLeft <= 10000)
}
function witnesses(x: TierObservation, tier: number): boolean {
  const age = x.slotsAt ? Date.parse(x.at) - Date.parse(x.slotsAt) : Infinity
  return validObservation(x) && x.complete && x.points >= tier &&
    new Date(x.at).getUTCFullYear() === PREDICTION_SEASON &&
    age >= 0 && age <= MAX_SLOT_AGE_MS &&
    x.slots.some(s => s.points === tier && s.spotsLeft > 0)
}

/** Retain earliest useful evidence even when the recent-check window is full. */
export function mergeObservations(old: TierObservation[], next: TierObservation): TierObservation[] {
  const all = [...old, next].filter(validObservation)
    .filter(x => new Date(x.at).getUTCFullYear() === PREDICTION_SEASON)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
  const unique = [...new Map(all.map(x => [x.at, x])).values()]
  const firstEvidence = TIERS_DESC.map(tier => unique.find(x => witnesses(x, tier))).filter(Boolean) as TierObservation[]
  return [...new Map([...firstEvidence, ...unique.slice(-40)].map(x => [x.at, x])).values()]
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}

export function predictTier(current: ScoreCheck, history: TierObservation[], slots: TierObservation | null): Prediction {
  const scoreTier = TIERS_DESC.find(tier => current.points >= tier) ?? null
  const output: Prediction = { scoreTier, supportedTier: null, evidenceAt: null, fallbackTier: null, state: "uncertain" }
  if (!current.complete || !Number.isFinite(current.points) || current.points < 0) return { ...output, state: "review" }
  const observations = history.filter(validObservation).filter(x => Date.parse(x.at) <= Date.parse(current.at))
  // A lower recalculated score invalidates our inference; never silently erase history.
  if (observations.some(x => x.complete && x.points > current.points)) return { ...output, state: "review" }
  if (scoreTier === null) return { ...output, state: "below" }
  for (const tier of TIERS_DESC.filter(t => t <= scoreTier)) {
    const evidence = observations.find(x => witnesses(x, tier))
    if (evidence) {
      output.supportedTier = tier
      output.evidenceAt = evidence.at
      break
    }
  }
  if (output.supportedTier === scoreTier) output.state = "supported"
  // This is a present-slot scenario only, not an inferred official allocation.
  if (slots && validObservation(slots) && slots.slotsAt &&
      Date.parse(current.at) - Date.parse(slots.slotsAt) >= 0 &&
      Date.parse(current.at) - Date.parse(slots.slotsAt) <= MAX_SLOT_AGE_MS) {
    for (const tier of TIERS_DESC.filter(t => t <= scoreTier)) {
      const entry = slots.slots.find(s => s.points === tier)
      if (!entry) break // Unknown is never treated as zero.
      if (entry.spotsLeft > 0) { output.fallbackTier = tier; break }
    }
  }
  return output
}
