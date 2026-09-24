export type ArcadeSwagTier = "trooper" | "ranger" | "champion" | "legend"

export const ARCADE_SWAG_SEASONS = [2026] as const
export const ARCADE_SWAG_TIERS: readonly ArcadeSwagTier[] = [
  "trooper",
  "ranger",
  "champion",
  "legend",
]

export type ArcadeSwagDrop = {
  id: string
  season: number
  dropNumber: number
  name: string
  shortName: string
  revealedOn: string
  revealedOnIso: string
  tiers: readonly ArcadeSwagTier[]
  imageUrl: string
  sourceUrl: string
  summary: string
  features: readonly string[]
}

/**
 * Confirmed Google Skills Arcade swag only.
 * Keep unrevealed items out of this list so the UI never mixes prior-season
 * rewards or speculation with Google's current announcements.
 */
export const ARCADE_SWAG_DROPS: readonly ArcadeSwagDrop[] = [
  {
    id: "arcade-backpack",
    season: 2026,
    dropNumber: 2,
    name: "The Arcade Backpack",
    shortName: "Arcade Backpack",
    revealedOn: "September 24, 2026",
    revealedOnIso: "2026-09-24",
    tiers: ["ranger"],
    imageUrl:
      "https://d2yds90mtvelsl.cloudfront.net/original/4X/c/4/8/c48e27878cf37a9368b63e7f8ba5e28eae209f30.gif",
    sourceUrl:
      "https://discuss.google.dev/t/swag-drop-the-arcade-backpack/399232",
    summary:
      "A water-resistant everyday backpack announced for the Arcade Ranger tier, with a padded sleeve for laptops up to 15 inches.",
    features: [
      "Water-resistant polyester for unexpected rain",
      "Two main zip compartments with a padded laptop sleeve for devices up to 15 inches",
      "Padded ergonomic shoulder straps and a ventilated mesh back panel",
      "Roomy daily-carry storage plus an exterior zippered quick-access pocket",
      "Black-and-grey color-blocked design with subtle Google Cloud branding",
    ],
  },
  {
    id: "weather-shield-jacket",
    season: 2026,
    dropNumber: 1,
    name: "The Arcade Weather-Shield Jacket",
    shortName: "Weather-Shield Jacket",
    revealedOn: "September 15, 2026",
    revealedOnIso: "2026-09-15",
    tiers: ["champion", "legend"],
    imageUrl:
      "https://d2yds90mtvelsl.cloudfront.net/original/4X/c/d/1/cd1f29603f7b53e485bede1ff9044751ae1ee722.gif",
    sourceUrl:
      "https://discuss.google.dev/t/swag-drop-the-arcade-weather-shield-jacket/397353",
    summary:
      "A lightweight weather layer announced for the Arcade Champion and Arcade Legend tiers.",
    features: [
      "Light-rain and wind-resistant outer weave",
      "Google Cloud chest branding and super cloud sleeve mark",
      "High collar, adjustable cuffs, and elastic hem",
      "Deep zippered hand-warmer pockets",
      "Lightweight construction for everyday movement",
    ],
  },
]

export function getSwagDropsForSeason(season: number): ArcadeSwagDrop[] {
  return ARCADE_SWAG_DROPS.filter((drop) => drop.season === season)
}

export function getSwagDropsForTier(
  tier: ArcadeSwagTier,
  season?: number,
): ArcadeSwagDrop[] {
  return ARCADE_SWAG_DROPS.filter(
    (drop) => drop.tiers.includes(tier) && (season === undefined || drop.season === season),
  )
}

export function getSwagDrop(season: number, id: string): ArcadeSwagDrop | undefined {
  return ARCADE_SWAG_DROPS.find((drop) => drop.season === season && drop.id === id)
}
