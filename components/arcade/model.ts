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

export const STORAGE_KEY = "eplus-arcade-calculator-v1"
export const PROFILE_URL_PATTERN =
  /^https:\/\/(?:www\.)?(?:skills\.google|cloudskillsboost\.google)\/public_profiles\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/?$/i

export const TIERS = [
  { points: 0, name: "Arcade Explorer" },
  { points: 50, name: "Arcade Trooper" },
  { points: 75, name: "Arcade Ranger" },
  { points: 95, name: "Arcade Champion" },
  { points: 120, name: "Arcade Legend" },
]

export const DEMO_SNAPSHOT: CalculatorSnapshot = {
  profileUrl: "",
  currentPoints: 37,
  gameBadges: 6,
  triviaBadges: 12,
  skillBadges: 38,
  targetPoints: 50,
  userName: "Demo learner",
  milestone: "Arcade Explorer",
  scoreComplete: true,
  unknownBadgeCount: 0,
  updatedAt: "",
}

export const SAMPLE_BADGES: ArcadeBadge[] = [
  { title: "Arcade Base Camp", points: 1, dateEarned: "Demo" },
  { title: "Arcade Adventure", points: 1, dateEarned: "Demo" },
  { title: "Manage Kubernetes in Google Cloud", points: 0.5, dateEarned: "Demo" },
]

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

export function getTier(points: number) {
  return [...TIERS].reverse().find((tier) => points >= tier.points) ?? TIERS[0]
}

export function getNextTier(points: number, target: number) {
  const officialNext = TIERS.find((tier) => tier.points > points)
  if (officialNext) return officialNext

  return {
    points: Math.max(target, Math.ceil(points / 25) * 25 + 25),
    name: "Next personal goal",
  }
}
