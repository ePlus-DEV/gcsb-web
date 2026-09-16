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
    packageRule: string
    knownMinimumItems: string
    knownMinimumNote: string
    waitingNote: string
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
      "Trooper is the foundational reward tier. Google describes it as a core swag pack, but the individual 2026 item names and final item count have not been published yet.",
    allocationNote:
      "Trooper is the broadest 2026 prize pool. Waterfall can move eligible participants into this pool when higher-tier capacity is exhausted.",
    packageRule: "Core Trooper swag pack",
    knownMinimumItems: "1+",
    knownMinimumNote:
      "At least one item is implied by the official core-pack description; the final package size is still TBA.",
    waitingNote: "Core Trooper pack — individual item names have not been revealed yet.",
  },
  ranger: {
    label: "Ranger",
    title: "Google Skills Arcade Ranger 2026 Rewards & Swag",
    description:
      "Arcade Ranger 2026 requirements, prize slots, reward rules, Waterfall behavior, and confirmed Google Skills Arcade swag announcements.",
    pointsLabel: "75–94 points",
    slots: 4000,
    rewardRule:
      "Ranger receives everything from the Trooper reward family plus one additional bonus reward. The individual 2026 item names have not been published yet.",
    allocationNote:
      "Ranger has its own prize-slot pool. Waterfall allocation is separate from the reward bundle inheritance between Ranger and Trooper.",
    packageRule: "Trooper pack + 1 Ranger bonus reward",
    knownMinimumItems: "2+",
    knownMinimumNote:
      "The minimum follows from the official Snowball rule: at least one Trooper-pack item plus one additional Ranger reward.",
    waitingNote: "Ranger bonus reward — item name and details have not been revealed yet.",
  },
  champion: {
    label: "Champion",
    title: "Google Skills Arcade Champion 2026 Rewards & Swag",
    description:
      "Arcade Champion 2026 requirements, 3,000 prize slots, confirmed swag drops, and the Google Skills Arcade Waterfall and Snowball rules.",
    pointsLabel: "95–119 points",
    slots: 3000,
    rewardRule:
      "Champion starts the upper-tier reward family. Google describes a high-tier collection of premium Arcade gear, with the Weather-Shield Jacket currently the first named 2026 item.",
    allocationNote:
      "Champion has 3,000 prize slots. If a higher-tier pool fills, Waterfall determines how eligible participants roll into the next prize pool.",
    packageRule: "High-tier Champion collection",
    knownMinimumItems: "1+",
    knownMinimumNote:
      "The Weather-Shield Jacket is confirmed. Google has not published the final number of items in the Champion collection.",
    waitingNote: "Champion collection — only the Weather-Shield Jacket has been named so far.",
  },
  legend: {
    label: "Legend",
    title: "Google Skills Arcade Legend 2026 Rewards & Swag",
    description:
      "Arcade Legend 2026 requirements, 2,500 prize slots, confirmed swag drops, and how Legend relates to Champion rewards.",
    pointsLabel: "120+ points",
    slots: 2500,
    rewardRule:
      "Legend receives the complete Champion reward family plus one exclusive Legend-only reward. The Legend-exclusive item has not been named yet.",
    allocationNote:
      "Legend is the highest 2026 prize tier with 2,500 slots. Waterfall applies to prize-slot allocation, not to which swag belongs to a tier.",
    packageRule: "Champion pack + 1 Legend-only reward",
    knownMinimumItems: "2+",
    knownMinimumNote:
      "The minimum includes the confirmed Champion Jacket plus the officially promised Legend-exclusive reward.",
    waitingNote: "Legend-only reward — item name and details have not been revealed yet.",
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
