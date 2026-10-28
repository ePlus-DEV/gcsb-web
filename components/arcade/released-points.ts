import type { ArcadeBadge } from "./model"

export type ReleasedGame = {
  title: string
  aliases: string[]
  month: string
  points: number | null
  deadline: string | null
  joinUrl: string | null
  status: string
}

const normalize = (value: string) => value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

export function parseReleasedGames(payload: unknown, month: string): ReleasedGame[] {
  if (!Array.isArray(payload)) throw new Error("Invalid history feed")
  return payload.map((value) => {
    if (!value || typeof value !== "object" || typeof value.title !== "string" || !value.title.trim()) {
      throw new Error("Invalid history game")
    }
    return {
      title: value.title.trim(),
      aliases: Array.isArray(value.aliases) ? value.aliases.filter((alias: unknown): alias is string => typeof alias === "string") : [],
      month,
      points: typeof value.points === "number" && Number.isFinite(value.points) && value.points >= 0 ? value.points : null,
      deadline: typeof value.deadline === "string" ? value.deadline : null,
      joinUrl: typeof value.joinUrl === "string" ? value.joinUrl : null,
      status: typeof value.status === "string" ? value.status : "",
    }
  })
}

export function summarizeReleasedPoints(games: ReleasedGame[], badges: ArcadeBadge[], nowMs: number) {
  const seen = new Set<string>()
  const earned = new Set(badges.map((badge) => normalize(badge.title)))
  // Ambiguous aliases (for example a recurring Certification Zone title) cannot identify a release.
  const owners = new Map<string, Set<string>>()
  for (const game of games) {
    for (const title of [game.title, ...game.aliases]) {
      const key = normalize(title)
      const months = owners.get(key) ?? new Set<string>()
      months.add(game.month)
      owners.set(key, months)
    }
  }
  let total = 0, achieved = 0, available = 0, expired = 0, unknown = 0
  const months = new Set<string>()
  for (const game of games) {
    const identity = game.joinUrl?.match(/\/games\/(\d+)/)?.[1] ?? normalize(game.title)
    const key = `${game.month}:${identity}`
    if (seen.has(key)) continue
    seen.add(key)
    months.add(game.month)
    if (game.points === null) { unknown++; continue }
    total += game.points
    const completed = [game.title, ...game.aliases].some((title) => {
      const normalized = normalize(title)
      return owners.get(normalized)?.size === 1 && earned.has(normalized)
    })
    if (completed) { achieved += game.points; continue }
    const deadline = game.deadline ? Date.parse(game.deadline) : NaN
    if (Number.isFinite(deadline) && deadline > nowMs && game.status !== "game_over") available += game.points
    else expired += game.points
  }
  return { total, achieved, available, expired, unknown, months: months.size, percent: total > 0 ? achieved / total : 0 }
}
