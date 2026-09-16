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
    historicalEstimateItems: number
    historicalEstimateBasis: string
  }
> = {
  trooper: {
    label: "Trooper",
    title: "Google Skills Arcade Trooper 2026 Rewards & Swag",
    description:
      "Arcade Trooper 2026 requirements, prize slots, reward rules, Waterfall behavior, historical package-size estimate, and confirmed Google Skills Arcade swag announcements.",
    pointsLabel: "50–74 points",
    slots: 6000,
    rewardRule:
      "Trooper is the foundational reward tier. Google describes it as a core swag pack, but the individual 2026 item names and final item count have not been published yet.",
    allocationNote:
      "Trooper is the broadest 2026 prize pool. Waterfall can move eligible participants into this pool when higher-tier capacity is exhausted.",
    packageRule: "Core Trooper swag pack · projected ≈5 items",
    knownMinimumItems: "1+",
    knownMinimumNote:
      "Official minimum: 1+ item from Google's core-pack wording. Historical projection: about 5 items, because the official 2025 Season 2 Trooper package finished with 5 items.",
    waitingNote: "Core Trooper pack — individual 2026 item names have not been revealed yet.",
    historicalEstimateItems: 5,
    historicalEstimateBasis:
      "2025 Season 2 Trooper finished with 5 items; used as the closest same-tier baseline for the 2026 foundational Trooper pack.",
  },
  ranger: {
    label: "Ranger",
    title: "Google Skills Arcade Ranger 2026 Rewards & Swag",
    description:
      "Arcade Ranger 2026 requirements, prize slots, reward rules, Waterfall behavior, historical package-size estimate, and confirmed Google Skills Arcade swag announcements.",
    pointsLabel: "75–94 points",
    slots: 4000,
    rewardRule:
      "Ranger receives everything from the Trooper reward family plus one additional bonus reward. The individual 2026 item names have not been published yet.",
    allocationNote:
      "Ranger has its own prize-slot pool. Waterfall allocation is separate from the reward bundle inheritance between Ranger and Trooper.",
    packageRule: "Trooper pack + 1 Ranger bonus · projected ≈6 items",
    knownMinimumItems: "2+",
    knownMinimumNote:
      "Official minimum: 2+ items from the Snowball rule. Historical projection: about 6 items if the 2026 Trooper pack follows the 2025 Trooper baseline of about 5, then Ranger adds one bonus reward.",
    waitingNote: "Ranger bonus reward — item name and details have not been revealed yet.",
    historicalEstimateItems: 6,
    historicalEstimateBasis:
      "2026 officially defines Ranger as Trooper + 1. Using the 2025 Season 2 Trooper package of 5 items as the baseline gives an estimated 6-item Ranger package.",
  },
  champion: {
    label: "Champion",
    title: "Google Skills Arcade Champion 2026 Rewards & Swag",
    description:
      "Arcade Champion 2026 requirements, 3,000 prize slots, historical package-size estimate, confirmed swag drops, and the Google Skills Arcade Waterfall and Snowball rules.",
    pointsLabel: "95–119 points",
    slots: 3000,
    rewardRule:
      "Champion starts the upper-tier reward family. Google describes a high-tier collection of premium Arcade gear, with the Weather-Shield Jacket currently the first named 2026 item.",
    allocationNote:
      "Champion has 3,000 prize slots. If a higher-tier pool fills, Waterfall determines how eligible participants roll into the next prize pool.",
    packageRule: "High-tier Champion collection · projected ≈6 items",
    knownMinimumItems: "1+",
    knownMinimumNote:
      "Official minimum: 1+ item because the Weather-Shield Jacket is confirmed. Historical projection: about 6 items, matching the official final Champion package in 2025 Season 2.",
    waitingNote: "Champion collection — only the Weather-Shield Jacket has been named so far.",
    historicalEstimateItems: 6,
    historicalEstimateBasis:
      "The official 2025 Season 2 Champion package contained 6 items, so 6 is used as a historical estimate until Google completes the 2026 lineup.",
  },
  legend: {
    label: "Legend",
    title: "Google Skills Arcade Legend 2026 Rewards & Swag",
    description:
      "Arcade Legend 2026 requirements, 2,500 prize slots, historical package-size estimate, confirmed swag drops, and how Legend relates to Champion rewards.",
    pointsLabel: "120+ points",
    slots: 2500,
    rewardRule:
      "Legend receives the complete Champion reward family plus one exclusive Legend-only reward. The Legend-exclusive item has not been named yet.",
    allocationNote:
      "Legend is the highest 2026 prize tier with 2,500 slots. Waterfall applies to prize-slot allocation, not to which swag belongs to a tier.",
    packageRule: "Champion pack + 1 Legend exclusive · projected ≈7 items",
    knownMinimumItems: "2+",
    knownMinimumNote:
      "Official minimum: 2+ items, including the Champion Jacket plus the promised Legend-exclusive reward. Historical projection: about 7 items, matching 2025 Season 2 and the 2026 Champion + 1 rule if Champion stays near 6.",
    waitingNote: "Legend-only reward — item name and details have not been revealed yet.",
    historicalEstimateItems: 7,
    historicalEstimateBasis:
      "The official 2025 Season 2 Legend package contained 7 items. The 2026 rule again defines Legend as the Champion package + 1 exclusive reward, supporting a roughly 7-item projection if Champion remains near 6.",
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
