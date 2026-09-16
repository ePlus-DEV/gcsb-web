import type { ArcadeSwagTier } from "@/components/arcade/swag-drops"

export const CURRENT_SWAG_SEASON = 2026

export const SWAG_TIER_META: Record<
  ArcadeSwagTier,
  {
    label: string
    title: string
    description: string
    pointsLabel: string
    slots: number
    rewardRule: string
    allocationNote: string
  }
> = {
  trooper: {
    label: "Trooper",
    title: "Google Skills Arcade Trooper 2026 Rewards & Swag",
    description:
      "Arcade Trooper 2026 requirements, prize slots, reward rules, Waterfall behavior, and confirmed Google Skills Arcade swag announcements.",
    pointsLabel: "50–74 points",
    slots: 6000,
    rewardRule:
      "Trooper is the foundational reward tier. Individual 2026 items have not been publicly revealed yet.",
    allocationNote:
      "Trooper is the broadest 2026 prize pool. Waterfall can move eligible participants into this pool when higher-tier capacity is exhausted.",
  },
  ranger: {
    label: "Ranger",
    title: "Google Skills Arcade Ranger 2026 Rewards & Swag",
    description:
      "Arcade Ranger 2026 requirements, prize slots, reward rules, Waterfall behavior, and confirmed Google Skills Arcade swag announcements.",
    pointsLabel: "75–94 points",
    slots: 4000,
    rewardRule:
      "Ranger builds on the Trooper reward family with an additional bonus reward. Individual 2026 Ranger items have not been publicly revealed yet.",
    allocationNote:
      "Ranger has its own prize-slot pool. Waterfall allocation is separate from the reward bundle inheritance between Ranger and Trooper.",
  },
  champion: {
    label: "Champion",
    title: "Google Skills Arcade Champion 2026 Rewards & Swag",
    description:
      "Arcade Champion 2026 requirements, 3,000 prize slots, confirmed swag drops, and the Google Skills Arcade Waterfall and Snowball rules.",
    pointsLabel: "95–119 points",
    slots: 3000,
    rewardRule:
      "Champion starts the upper-tier reward family. Trooper and Ranger rewards do not snowball into Champion or Legend.",
    allocationNote:
      "Champion has 3,000 prize slots. If a higher-tier pool fills, Waterfall determines how eligible participants roll into the next prize pool.",
  },
  legend: {
    label: "Legend",
    title: "Google Skills Arcade Legend 2026 Rewards & Swag",
    description:
      "Arcade Legend 2026 requirements, 2,500 prize slots, confirmed swag drops, and how Legend relates to Champion rewards.",
    pointsLabel: "120+ points",
    slots: 2500,
    rewardRule:
      "Legend includes the Champion reward family plus a Legend-only reward when Google reveals it for the season.",
    allocationNote:
      "Legend is the highest 2026 prize tier with 2,500 slots. Waterfall applies to prize-slot allocation, not to which swag belongs to a tier.",
  },
}

export function swagSeasonPath(season: number): string {
  return `/swag-drops/${season}/`
}

export function swagTierPath(season: number, tier: ArcadeSwagTier): string {
  return `/swag-drops/${season}/${tier}/`
}

export function swagProductPath(season: number, id: string): string {
  return `/swag-drops/${season}/${id}/`
}
