export type FacilitatorCounts = {
  games: number
  skills: number
}

export const FACILITATOR_BONUS_MILESTONE_POINTS = 10

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

export function getFacilitatorAdjustedPoints(
  basePoints: number,
  counts: FacilitatorCounts,
  participating: boolean,
) {
  const bonus = participating ? getFacilitatorMilestoneBonus(counts) : 0

  return {
    basePoints,
    bonus,
    totalPoints: basePoints + bonus,
  }
}
