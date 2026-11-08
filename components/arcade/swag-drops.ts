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
    id: "arcade-techpack",
    season: 2026,
    dropNumber: 7,
    name: "The Arcade TechPack",
    shortName: "Arcade TechPack",
    revealedOn: "November 8, 2026",
    revealedOnIso: "2026-11-08",
    tiers: ["champion", "legend"],
    imageUrl:
      "/images/swag/2026/arcade-techpack.gif",
    sourceUrl:
      "https://discuss.google.dev/t/swag-drop-the-arcade-techpack/411969",
    summary:
      "A weather-resistant 21 L tech backpack with a 15.6-inch laptop compartment and 180° opening, confirmed for Arcade Champion and Legend.",
    features: [
      "Microfiber-lined padded compartment with dual elastic straps for laptops and tablets up to 15.6 inches",
      "180° clamshell zip opening with a quick-release magnetic flap",
      "Integrated slip pockets, pen loops, and a snap-tab key leash",
      "Two expandable side pockets for a water bottle or umbrella",
      "Weather-resistant matte shell with 21 L storage capacity",
      "Breathable 3D honeycomb back, contoured shoulder straps, and a trolley sleeve",
      "Embossed Google Cloud wordmark, front badge, and shoulder-strap silicone emblem",
    ],
  },
  {
    id: "arcade-lumisnap-magnetic-fill-light",
    season: 2026,
    dropNumber: 6,
    name: "The Arcade LumiSnap Magnetic Fill Light",
    shortName: "Arcade LumiSnap Magnetic Fill Light",
    revealedOn: "November 3, 2026",
    revealedOnIso: "2026-11-03",
    tiers: ["champion", "legend"],
    imageUrl:
      "/images/swag/2026/arcade-lumisnap-magnetic-fill-light.gif",
    sourceUrl:
      "https://discuss.google.dev/t/swag-drop-the-arcade-lumisnap-magnetic-fill-light/410531",
    summary:
      "A pocket-sized magnetic fill light with adjustable color temperature and a folding phone stand, confirmed for the Arcade Champion and Legend tiers.",
    features: [
      "Three color temperatures (warm, neutral, and cool) with adjustable brightness",
      "MagSafe-ready mounting, plus an adhesive magnetic ring for other phones",
      "360° rotating hinge and 45 mm extendable arm for front or rear cameras",
      "Integrated framing mirror and fold-out desk stand",
      "Rechargeable 800 mAh battery with USB-C to USB-C charging cable",
    ],
  },
  {
    id: "arcade-magic-mug",
    season: 2026,
    dropNumber: 5,
    name: "The Arcade Magic Mug",
    shortName: "Arcade Magic Mug",
    revealedOn: "October 23, 2026",
    revealedOnIso: "2026-10-23",
    tiers: ["trooper", "ranger"],
    imageUrl:
      "/images/swag/2026/arcade-magic-mug.gif",
    sourceUrl:
      "https://discuss.google.dev/t/swag-drop-the-arcade-magic-mug/407455",
    summary:
      "A heat-reactive white mug that reveals a hidden Arcade design when filled with a hot drink, confirmed for Trooper and Ranger tiers.",
    features: [
      "Minimal white appearance when cool",
      "Hidden Arcade artwork appears when heated by coffee or tea",
      "Solid, comfortable feel for everyday use",
      "Described as eco-friendly in the official announcement",
    ],
  },
  {
    id: "arcade-travel-bottle",
    season: 2026,
    dropNumber: 4,
    name: "The Arcade Travel Bottle",
    shortName: "Arcade Travel Bottle",
    revealedOn: "October 16, 2026",
    revealedOnIso: "2026-10-16",
    tiers: ["trooper", "ranger"],
    imageUrl:
      "/images/swag/2026/arcade-travel-bottle.gif",
    sourceUrl:
      "https://discuss.google.dev/t/swag-drop-the-arcade-travel-bottle/405316",
    summary:
      "A slim, leak-resistant insulated stainless-steel travel bottle announced for the Arcade Trooper and Ranger tiers.",
    features: [
      "Slim 5.5 cm profile for easy packing and everyday carry",
      "Lightweight, durable stainless-steel construction",
      "Sealing rings designed to prevent leaks",
      "Insulation to keep drinks hot or cold for hours",
      "Wide mouth for quick and easy cleaning",
    ],
  },
  {
    id: "arcade-popup-pro",
    season: 2026,
    dropNumber: 3,
    name: "The Arcade PopUp Pro",
    shortName: "Arcade PopUp Pro",
    revealedOn: "October 12, 2026",
    revealedOnIso: "2026-10-12",
    tiers: ["champion", "legend"],
    imageUrl:
      "/images/swag/2026/arcade-popup-pro.gif",
    sourceUrl:
      "https://discuss.google.dev/t/swag-drop-the-arcade-popup-pro/403522",
    summary:
      "A compact multi-connector travel toolkit confirmed for the Arcade Champion and Legend tiers.",
    features: [
      "Braided USB-C to USB-C fast-charging cable",
      "Swappable Lightning, Micro-USB, and USB-A adapters",
      "Built-in phone stand for portrait and landscape use",
      "Nano SIM and MicroSD slots with a SIM ejector pin",
      "Spring-loaded pocket case with a braided carry loop",
    ],
  },
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
      "/images/swag/2026/arcade-backpack.gif",
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
      "/images/swag/2026/weather-shield-jacket.gif",
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
