import type { WebsiteCatalog } from "@/lib/website-i18n"

export const MONTHLY_GAMES_TEXT_KEYS = [
  "loadingAria",
  "loading",
  "deadlineUnavailable",
  "thisMonth",
  "previousEndedWaiting",
  "activeDescription",
  "comingSoon",
  "newLabsNotPublished",
  "completedLower",
  "analyzeProfileTracking",
  "awaitingNewLabs",
  "newGamesAuto",
  "completed",
  "notCompleted",
  "analyzeProfileCheck",
  "accessCode",
  "copyAccessCode",
  "copied",
  "copy",
  "deadline",
  "openGame",
  "comingSoonTitle",
  "previousEnded",
  "arcadePoint",
  "arcadePoints",
  "spotsLeft",
  "deadlineAria",
] as const

export type MonthlyGamesTextKey = (typeof MONTHLY_GAMES_TEXT_KEYS)[number]

export function monthlyGamesText(
  catalog: WebsiteCatalog,
  key: MonthlyGamesTextKey,
  params?: Record<string, string | number>,
): string {
  const template = catalog.additional[`__monthlyGames:${key}`] ?? ""
  if (!params) return template

  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (placeholder, name: string) =>
    params[name] === undefined ? placeholder : String(params[name]),
  )
}
