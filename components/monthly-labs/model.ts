import knownRoutes from "@/data/monthly-lab-routes.json"
import type { MonthlyArcadeGame } from "@/components/arcade/model"

export type MonthlyLab = MonthlyArcadeGame & {
  slug: string
  month: string
  sourceUrl: string | null
  reconstructed: boolean
  status: string | null
}

export function httpsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.href : null
  } catch { return null }
}

export function parseMonthlyLabs(month: string, payload: unknown): MonthlyLab[] {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || !Array.isArray(payload)) return []
  const seen = new Set<string>()
  return payload.flatMap((item): MonthlyLab[] => {
    if (!item || typeof item !== "object") return []
    const data = item as Record<string, unknown>
    const title = typeof data.title === "string" ? data.title.trim() : ""
    if (!title || (data.month && data.month !== month)) return []
    const joinUrl = httpsUrl(data.joinUrl)
    const gameId = joinUrl ? new URL(joinUrl).pathname.match(/^\/games\/(\d+)\/?$/)?.[1] : null
    const slug = gameId ? `game-${gameId}` : `badge-${title.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`
    if (slug === "badge-" || seen.has(slug)) return []
    seen.add(slug)
    const str = (key: string) => typeof data[key] === "string" && String(data[key]).trim() ? String(data[key]).trim() : null
    const number = (key: string) => (typeof data[key] === "number" || typeof data[key] === "string") && String(data[key]).trim() && Number.isFinite(Number(data[key])) && Number(data[key]) >= 0 ? Number(data[key]) : null
    let deadlineTimeZone = str("deadlineTimeZone")
    try { if (deadlineTimeZone) new Intl.DateTimeFormat("en", { timeZone: deadlineTimeZone }).format(0) } catch { deadlineTimeZone = null }
    return [{ title, slug, month, joinUrl, sourceUrl: httpsUrl(data.sourceUrl), imageUrl: httpsUrl(data.imageUrl), accessCode: str("accessCode"), deadline: str("deadline"), deadlineTimeZone, description: str("description"), points: number("points"), spotsRemaining: number("spotsRemaining"), reconstructed: data.reconstructed === true, status: str("status") }]
  })
}

export function monthlyLabMonthPath(month: string) {
  return `/monthly-labs/${month.replace("-", "/")}/`
}
export function monthlyLabPath(lab: MonthlyLab) {
  return `${monthlyLabMonthPath(lab.month)}${lab.slug}/`
}
export function labState(lab: MonthlyLab, now = Date.now()): "labArchived" | "labActive" | "labUnknown" {
  const deadline = lab.deadline ? Date.parse(lab.deadline) : NaN
  const parts = new Intl.DateTimeFormat("en", { year: "numeric", month: "2-digit", timeZone: "Asia/Kolkata" }).formatToParts(now)
  const currentMonth = `${parts.find(p => p.type === "year")?.value}-${parts.find(p => p.type === "month")?.value}`
  if (lab.status === "game_over" || lab.month < currentMonth || (Number.isFinite(deadline) && deadline <= now)) return "labArchived"
  return lab.status === "active" || Number.isFinite(deadline) ? "labActive" : "labUnknown"
}
export function monthLabel(month: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${month}-15T12:00:00Z`))
}

/** Feed month wins over viewer time; legacy feeds use the deadline's source zone. */
export function monthlyGameDetailPath(game: MonthlyArcadeGame, routes: string[] = knownRoutes): string | null {
  let month = game.month
  if (!month && game.deadline && Number.isFinite(Date.parse(game.deadline))) {
    const parts = new Intl.DateTimeFormat("en", { year: "numeric", month: "2-digit", timeZone: game.deadlineTimeZone ?? "UTC" }).formatToParts(new Date(game.deadline))
    month = `${parts.find(p => p.type === "year")?.value}-${parts.find(p => p.type === "month")?.value}`
  }
  if (!month) return null
  const lab = parseMonthlyLabs(month, [game])[0]
  const path = lab ? monthlyLabPath(lab) : null
  return path && routes.includes(path) ? path : null
}
