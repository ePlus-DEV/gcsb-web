export type ArcadeBadge = {
  title: string
  dateEarned?: string
  imageURL?: string
  badgeURL?: string
  points?: number | string
}

export type ArcadeApiResponse = {
  success: boolean
  message?: string
  userDetails?: Array<{
    url?: string
    profileImage?: string
    userName?: string
    memberSince?: string
    league?: string
    points?: string
  }>
  badges?: ArcadeBadge[]
  game?: ArcadeBadge[]
  trivia?: ArcadeBadge[]
  skill?: ArcadeBadge[]
  completion?: ArcadeBadge[]
  special?: ArcadeBadge[]
  arcadePoints?: {
    totalPoints?: number
    gamePoints?: number
    triviaPoints?: number
    skillPoints?: number
    specialPoints?: number
    completionPoints?: number
  }
  milestone?: string
  faciCounts?: {
    faciGame?: number
    faciTrivia?: number
    faciSkill?: number
    faciCompletion?: number
  }
  beta?: {
    scoreComplete?: boolean
    unknownBadgeCount?: number
    unknownBadges?: string[]
    profileBadgeCount?: number
    eligibleBadgeCount?: number
    tier?: string
  }
}

export type ArcadeMilestone = {
  points: number
  maxPoints: number | null
  league: string
  slots: number
  spotsLeft: number | null
}

export type CalculatorSnapshot = {
  profileUrl: string
  currentPoints: number
  gameBadges: number
  triviaBadges: number
  skillBadges: number
  targetPoints: number
  userName: string
  milestone: string
  scoreComplete: boolean
  unknownBadgeCount: number
  updatedAt: string
}

export type BadgeFilter = "all" | "game" | "trivia" | "skill" | "special"

export const API_URL =
  process.env.NEXT_PUBLIC_ARCADE_API_URL ??
  "https://hub.eplus.dev/api/arcade-public"

export const ARCADE_MILESTONES_URL =
  process.env.NEXT_PUBLIC_ARCADE_MILESTONES_URL ??
  "https://raw.githubusercontent.com/hoangsvit/arcade-crawler/main/data/arcade_milestones.json"

export const STORAGE_KEY = "eplus-arcade-calculator-v2"
export const LEGACY_STORAGE_KEY = "eplus-arcade-calculator-v1"
export const PROFILE_URL_PATTERN =
  /^https:\/\/(?:www\.)?(?:skills\.google|cloudskillsboost\.google)\/public_profiles\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/i

export const OFFICIAL_MILESTONES: ArcadeMilestone[] = [
  { points: 50, maxPoints: 74, league: "Arcade Trooper", slots: 6000, spotsLeft: null },
  { points: 75, maxPoints: 94, league: "Arcade Ranger", slots: 4000, spotsLeft: null },
  { points: 95, maxPoints: 119, league: "Arcade Champion", slots: 3000, spotsLeft: null },
  { points: 120, maxPoints: null, league: "Arcade Legend", slots: 2500, spotsLeft: null },
]

export const EMPTY_SNAPSHOT: CalculatorSnapshot = {
  profileUrl: "",
  currentPoints: 0,
  gameBadges: 0,
  triviaBadges: 0,
  skillBadges: 0,
  targetPoints: 120,
  userName: "",
  milestone: "",
  scoreComplete: false,
  unknownBadgeCount: 0,
  updatedAt: "",
}

export function numeric(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

export function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)
}

export function getTier(points: number) {
  const milestone = [...OFFICIAL_MILESTONES]
    .reverse()
    .find((tier) => points >= tier.points)

  return milestone
    ? { points: milestone.points, name: milestone.league }
    : { points: 0, name: "No tier yet" }
}

export function getNextTier(points: number) {
  return (
    OFFICIAL_MILESTONES.find((tier) => tier.points > points) ??
    OFFICIAL_MILESTONES[OFFICIAL_MILESTONES.length - 1]
  )
}

export function tierRangeLabel(milestone: ArcadeMilestone): string {
  return milestone.maxPoints === null
    ? `${milestone.points}+ points`
    : `${milestone.points}–${milestone.maxPoints} points`
}
