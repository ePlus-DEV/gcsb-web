export type FacilitatorCounts = {
  games: number
  skills: number
}

export const FACILITATOR_BONUS_MILESTONE_POINTS = 10

const BONUS_MILESTONE_STORAGE_PREFIX =
  "arcade-facilitator-bonus-milestone-v1"
const DASHBOARD_STORAGE_KEY = "eplus-arcade-dashboard-v1"
const API_SCORE_CONTEXT_STORAGE_PREFIX = "arcade-api-score-context-v1"
const API_SCORE_CONTEXT_WINDOW_KEY = "__eplusArcadeLatestScoreContext"

export const FACILITATOR_MILESTONES = [
  {
    id: "1",
    label: "Milestone 1",
    bonus: 5,
    requirements: { games: 6, skills: 18 },
  },
  {
    id: "2",
    label: "Milestone 2",
    bonus: 15,
    requirements: { games: 8, skills: 34 },
  },
  {
    id: "3",
    label: "Milestone 3",
    bonus: 25,
    requirements: { games: 10, skills: 50 },
  },
  {
    id: "ultimate",
    label: "Ultimate Milestone",
    bonus: 35,
    requirements: { games: 12, skills: 66 },
  },
] as const

export type FacilitatorMilestone = (typeof FACILITATOR_MILESTONES)[number]

type ApiScoreContext = {
  profileUrl: string
  participating: boolean
  bonusMilestoneCompleted: boolean
  baseTotalPoints: number
  totalPoints: number
  facilitatorBonusPoints: number
}

export function getHighestFacilitatorMilestone(
  counts: FacilitatorCounts,
): FacilitatorMilestone | null {
  return (
    [...FACILITATOR_MILESTONES]
      .reverse()
      .find(
        (milestone) =>
          counts.games >= milestone.requirements.games &&
          counts.skills >= milestone.requirements.skills,
      ) ?? null
  )
}

export function getFacilitatorMilestoneBonus(counts: FacilitatorCounts): number {
  return getHighestFacilitatorMilestone(counts)?.bonus ?? 0
}

function readRuntimeBonusMilestoneCompletion(): boolean {
  if (typeof window === "undefined") return false

  try {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get("bonus") === "1") return true

    // Shared profile pages must only trust the explicit share parameter so a
    // locally checked profile cannot leak +10 into somebody else's shared URL.
    const isSharedProfilePage = /\/(?:profiles\/[^/]+|profile)\/?$/i.test(
      window.location.pathname,
    )
    if (isSharedProfilePage) return false

    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!raw) return false

    const parsed = JSON.parse(raw) as { profileUrl?: unknown }
    const profileUrl =
      typeof parsed.profileUrl === "string"
        ? parsed.profileUrl.trim().replace(/\/$/, "")
        : ""
    if (!profileUrl) return false

    return (
      window.localStorage.getItem(
        `${BONUS_MILESTONE_STORAGE_PREFIX}:${profileUrl}`,
      ) === "true"
    )
  } catch {
    return false
  }
}

function parseApiScoreContext(value: unknown): ApiScoreContext | null {
  if (typeof value !== "object" || value === null) return null
  const candidate = value as Partial<ApiScoreContext>
  const baseTotalPoints = Number(candidate.baseTotalPoints)
  const totalPoints = Number(candidate.totalPoints)
  const facilitatorBonusPoints = Number(candidate.facilitatorBonusPoints)

  if (
    typeof candidate.profileUrl !== "string" ||
    typeof candidate.participating !== "boolean" ||
    typeof candidate.bonusMilestoneCompleted !== "boolean" ||
    !Number.isFinite(baseTotalPoints) ||
    !Number.isFinite(totalPoints) ||
    !Number.isFinite(facilitatorBonusPoints)
  ) {
    return null
  }

  return {
    profileUrl: candidate.profileUrl,
    participating: candidate.participating,
    bonusMilestoneCompleted: candidate.bonusMilestoneCompleted,
    baseTotalPoints,
    totalPoints,
    facilitatorBonusPoints,
  }
}

function readApiScoreContext(basePoints: number): ApiScoreContext | null {
  if (typeof window === "undefined") return null

  try {
    const runtimeWindow = window as typeof window & {
      __eplusArcadeLatestScoreContext?: unknown
    }
    const latest = parseApiScoreContext(
      runtimeWindow[
        API_SCORE_CONTEXT_WINDOW_KEY as "__eplusArcadeLatestScoreContext"
      ],
    )
    if (latest && latest.totalPoints === basePoints) return latest

    const rawDashboard = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!rawDashboard) return null
    const dashboard = JSON.parse(rawDashboard) as { profileUrl?: unknown }
    const profileUrl =
      typeof dashboard.profileUrl === "string"
        ? dashboard.profileUrl.trim().replace(/\/$/, "")
        : ""
    if (!profileUrl) return null

    const rawContext = window.localStorage.getItem(
      `${API_SCORE_CONTEXT_STORAGE_PREFIX}:${profileUrl}`,
    )
    if (!rawContext) return null
    const stored = parseApiScoreContext(JSON.parse(rawContext))
    return stored?.totalPoints === basePoints ? stored : null
  } catch {
    return null
  }
}

export function getFacilitatorAdjustedPoints(
  basePoints: number,
  counts: FacilitatorCounts,
  participating: boolean,
  bonusMilestoneCompleted = readRuntimeBonusMilestoneCompletion(),
) {
  const apiScore = readApiScoreContext(basePoints)

  // When the response was scored by the API for the same participation state,
  // use that result directly. If the user toggled participation or the manual
  // +10 completion after the last request, recompute from the API's recorded
  // base total instead of adding a second bonus on top of an adjusted total.
  if (
    apiScore &&
    apiScore.participating === participating &&
    apiScore.bonusMilestoneCompleted === bonusMilestoneCompleted
  ) {
    return {
      basePoints: apiScore.baseTotalPoints,
      bonus: apiScore.facilitatorBonusPoints,
      totalPoints: apiScore.totalPoints,
    }
  }

  const scoringBasePoints = apiScore?.baseTotalPoints ?? basePoints
  const milestoneBonus = participating ? getFacilitatorMilestoneBonus(counts) : 0
  const bonusMilestone =
    participating && bonusMilestoneCompleted
      ? FACILITATOR_BONUS_MILESTONE_POINTS
      : 0
  const bonus = milestoneBonus + bonusMilestone

  return {
    basePoints: scoringBasePoints,
    bonus,
    totalPoints: scoringBasePoints + bonus,
  }
}
