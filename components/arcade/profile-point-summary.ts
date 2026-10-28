import type { ArcadeApiResponse } from "./model"

export type ProfilePointSummary = {
  games: number | null
  skills: number | null
  triviaSpecial: number | null
  regular: number | null
  bonus: number
  total: number | null
}

function points(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null
  return value
}

/** Use the scoring API's point totals, never raw badge counts or history matches. */
export function profilePointSummary(result: ArcadeApiResponse | null, bonus: number): ProfilePointSummary | null {
  if (!result) return null
  const score = result.arcadePoints
  const extras = [score?.triviaPoints, score?.specialPoints, score?.completionPoints].map(points)
  const regular = points(score?.totalPoints)
  const appliedBonus = points(bonus) ?? 0
  return {
    games: points(score?.gamePoints),
    skills: points(score?.skillPoints),
    triviaSpecial: extras.some((value) => value === null) ? null : extras.reduce<number>((sum, value) => sum + (value ?? 0), 0),
    regular,
    bonus: appliedBonus,
    total: regular === null ? null : regular + appliedBonus,
  }
}
