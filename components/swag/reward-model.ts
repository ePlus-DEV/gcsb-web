import type { ArcadeSwagTier } from "@/components/arcade/swag-drops"

export const PREVIOUS_SEASON_COUNTS: Record<ArcadeSwagTier, number> = {
  trooper: 5,
  ranger: 5,
  champion: 6,
  legend: 7,
}

export const TIER_START_POINTS: Record<ArcadeSwagTier, number> = {
  trooper: 50,
  ranger: 75,
  champion: 95,
  legend: 120,
}

export const OFFICIAL_UNNAMED_REWARDS: Partial<
  Record<ArcadeSwagTier, readonly { title: string; note: string }[]>
> = {
  legend: [
    {
      title: "Legend-only reward",
      note: "Officially promised for Legend · name not revealed",
    },
  ],
}

export const TIER_TONE: Record<
  ArcadeSwagTier,
  { rail: string; badge: string; progress: string }
> = {
  trooper: {
    rail: "border-l-cyan-400",
    badge: "bg-cyan-50 text-cyan-700 dark:bg-cyan-300/[0.06] dark:text-cyan-200",
    progress: "bg-cyan-400",
  },
  ranger: {
    rail: "border-l-emerald-400",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-300/[0.06] dark:text-emerald-200",
    progress: "bg-emerald-400",
  },
  champion: {
    rail: "border-l-violet-400",
    badge:
      "bg-violet-50 text-violet-700 dark:bg-violet-300/[0.06] dark:text-violet-200",
    progress: "bg-violet-400",
  },
  legend: {
    rail: "border-l-amber-400",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-300/[0.06] dark:text-amber-200",
    progress: "bg-amber-400",
  },
}


