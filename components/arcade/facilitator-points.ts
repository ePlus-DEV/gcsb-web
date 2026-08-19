export type FacilitatorCounts = {
  games: number
  skills: number
}

export const FACILITATOR_BONUS_MILESTONE_POINTS = 10

const BONUS_MILESTONE_STORAGE_PREFIX =
  "arcade-facilitator-bonus-milestone-v1"
const DASHBOARD_STORAGE_KEY = "eplus-arcade-dashboard-v1"

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

type BonusMilestoneMetadata = {
  bonusMilestoneEnabled?: unknown
  bonusMilestoneAvailablePoints?: unknown
  bonusMilestoneCompleted?: unknown
  bonusMilestonePoints?: unknown
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

function readRuntimeBonusMilestoneMetadata(): BonusMilestoneMetadata | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as {
      result?: {
        facilitator?: BonusMilestoneMetadata
        beta?: { facilitator?: BonusMilestoneMetadata }
      }
    }

    return parsed.result?.facilitator ?? parsed.result?.beta?.facilitator ?? null
  } catch {
    return null
  }
}

function readRuntimeBonusMilestonePoints(completed: boolean): number {
  if (!completed) return 0

  const metadata = readRuntimeBonusMilestoneMetadata()
  if (!metadata) return FACILITATOR_BONUS_MILESTONE_POINTS

  if (metadata.bonusMilestoneEnabled === false) return 0

  const apiCompleted = metadata.bonusMilestoneCompleted
  const appliedPoints = Number(metadata.bonusMilestonePoints)
  if (
    apiCompleted === completed &&
    Number.isFinite(appliedPoints) &&
    appliedPoints >= 0
  ) {
    return appliedPoints
  }

  const availablePoints = Number(metadata.bonusMilestoneAvailablePoints)
  if (Number.isFinite(availablePoints) && availablePoints >= 0) {
    return availablePoints
  }

  // Compatibility only for API responses created before season-owned Bonus
  // Milestone metadata was introduced. Current/future seasons are API-owned.
  return FACILITATOR_BONUS_MILESTONE_POINTS
}

export function getFacilitatorAdjustedPoints(
  basePoints: number,
  counts: FacilitatorCounts,
  participating: boolean,
  bonusMilestoneCompleted = readRuntimeBonusMilestoneCompletion(),
) {
  const milestoneBonus = participating ? getFacilitatorMilestoneBonus(counts) : 0
  const bonusMilestone =
    participating && bonusMilestoneCompleted
      ? readRuntimeBonusMilestonePoints(bonusMilestoneCompleted)
      : 0
  const bonus = milestoneBonus + bonusMilestone

  return {
    basePoints,
    bonus,
    totalPoints: basePoints + bonus,
  }
}
