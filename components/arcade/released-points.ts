import type { ArcadeBadge } from "./model"

export type ReleasedGame = {
  title: string
  aliases: string[]
  month: string
  points: number | null
  deadline: string | null
  joinUrl: string | null
  status: string
  imageUrl?: string | null
}

const normalize = (value: string) => value.normalize("NFKD").toLowerCase()
  .replace(/[^a-z0-9]+/g, " ").trim()
  .replace(/^(?:google skills )?arcade /, "")

const gameId = (game: ReleasedGame) => game.joinUrl?.match(/\/games\/(\d+)/)?.[1]
const names = (game: ReleasedGame) => [game.title, ...game.aliases].map(normalize).filter(Boolean)
const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]

function genericFamily(game: ReleasedGame): string | null {
  const monthName = monthNames[Number(game.month.slice(5)) - 1]
  const title = normalize(game.title)
  for (const family of ["adventure", "trail", "voyage"]) {
    if (title === `${family} ${monthName} ${game.month.slice(0, 4)}`) return family
  }
  return null
}

/** Merge observed and reconstructed versions, retaining all badge aliases. */
export function deduplicateReleasedGames(games: ReleasedGame[]): ReleasedGame[] {
  const result: ReleasedGame[] = []
  for (const game of games) {
    const existing = result.find((candidate) => {
      const leftId = gameId(candidate), rightId = gameId(game)
      if (leftId && rightId) return leftId === rightId
      if (candidate.month !== game.month) return false
      if (candidate.imageUrl && candidate.imageUrl === game.imageUrl) return true
      return names(candidate).some((name) => names(game).includes(name))
    })
    if (!existing) { result.push({ ...game, aliases: [...game.aliases] }); continue }
    mergeRelease(existing, game)
  }
  // Official archive cards sometimes use only “Adventure: September 2026” while
  // the observed game has its full topic title. Merge only a unique same-month family.
  return result.filter((game) => {
    const family = genericFamily(game)
    if (!family || gameId(game)) return true
    const candidates = result.filter((candidate) => candidate !== game && candidate.month === game.month
      && !genericFamily(candidate) && normalize(candidate.title).startsWith(`${family} `))
    if (candidates.length !== 1) return true
    mergeRelease(candidates[0], game)
    return false
  })
}

function mergeRelease(target: ReleasedGame, incoming: ReleasedGame) {
  target.aliases = [...new Set([...target.aliases, incoming.title, ...incoming.aliases])]
  target.points = target.points ?? incoming.points
  target.deadline = target.deadline ?? incoming.deadline
  target.joinUrl = target.joinUrl ?? incoming.joinUrl
  target.imageUrl = target.imageUrl ?? incoming.imageUrl
}

function earnedMonth(badge: ArcadeBadge): string | null {
  if (!badge.dateEarned) return null
  const date = new Date(badge.dateEarned)
  if (!Number.isFinite(date.getTime())) return null
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).formatToParts(date)
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`
}

export function parseReleasedGames(payload: unknown, month: string): ReleasedGame[] {
  if (!Array.isArray(payload)) throw new Error("Invalid history feed")
  return payload.map((value) => {
    if (!value || typeof value !== "object" || typeof value.title !== "string" || !value.title.trim()) {
      throw new Error("Invalid history game")
    }
    return {
      title: value.title.trim(),
      imageUrl: typeof value.imageUrl === "string" ? value.imageUrl : null,
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
  const releases = deduplicateReleasedGames(games)
  const usedBadges = new Set<number>()
  const owners = new Map<string, number>()
  for (const game of releases) {
    for (const name of new Set(names(game))) owners.set(name, (owners.get(name) ?? 0) + 1)
  }
  let total = 0, achieved = 0, available = 0, expired = 0, unknown = 0
  const months = new Set<string>()
  for (const game of releases) {
    months.add(game.month)
    if (game.points === null) { unknown++; continue }
    total += game.points
    const matched = badges.findIndex((badge, index) => {
      if (usedBadges.has(index)) return false
      const badgeMonth = earnedMonth(badge)
      if (badgeMonth && badgeMonth.slice(0, 4) !== game.month.slice(0, 4)) return false
      const name = normalize(badge.title)
      if (!name || !names(game).includes(name)) return false
      // Recurring aliases need an earned month to identify the correct release.
      return owners.get(name) === 1 || badgeMonth === game.month
    })
    if (matched !== -1) { usedBadges.add(matched); achieved += game.points; continue }
    const deadline = game.deadline ? Date.parse(game.deadline) : NaN
    if (Number.isFinite(deadline) && deadline > nowMs && game.status !== "game_over") available += game.points
    else expired += game.points
  }
  return { total, achieved, available, expired, unknown, months: months.size, percent: total > 0 ? achieved / total : 0 }
}
