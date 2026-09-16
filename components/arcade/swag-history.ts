export type HistoricalSwagTier =
  | "novice"
  | "trooper"
  | "ranger"
  | "champion"
  | "legend"

export type HistoricalSwagSourceKind =
  | "official-announcement"
  | "official-wrap-up"
  | "official-fulfillment"
  | "delivery-evidence"

export type HistoricalSwagItem = {
  name: string
  sourceUrl: string
  sourceKind: HistoricalSwagSourceKind
}

export type HistoricalSwagPackage = {
  tier: HistoricalSwagTier
  pointsLabel: string
  items: readonly HistoricalSwagItem[]
}

export type HistoricalSwagSeason = {
  year: 2025
  season: 1 | 2
  label: string
  periodLabel: string
  tierSourceUrl: string
  packageSourceUrl?: string
  distributionRule: string
  packages: readonly HistoricalSwagPackage[]
}

const S1_TIERS =
  "https://discuss.google.dev/t/the-skills-boost-arcade-2025-tiers/186701"
const S1_NOVICE_BASE =
  "https://discuss.google.dev/t/back-in-the-game-the-arcade-mug-and-the-arcade-laptop-stand/188803"
const S1_RANGER_BASE =
  "https://discuss.google.dev/t/back-in-the-game-the-arcade-screen-cleaner-and-the-arcade-pen-set/189366"
const S1_POLO =
  "https://discuss.google.dev/t/arcade-polo-t-shirts/189783/1"
const S1_TROOPER_SHIRT =
  "https://discuss.google.dev/t/arcade-trooper-t-shirt/190502"
const S1_NOVICE_SHIRT =
  "https://discuss.google.dev/t/the-arcade-novice-t-shirt/191042"
const S1_USB_HUB =
  "https://discuss.google.dev/t/swag-drop-elevate-your-connectivity-the-arcade-usb-hub/191618"
const S1_FOLD_GLOW =
  "https://discuss.google.dev/t/swag-drop-the-arcade-fold-glow-lamp/191994"
const S1_THERMAL_PRINTER =
  "https://discuss.google.dev/t/swag-drop-the-arcade-thermal-printer/192082"
const S1_CLEANING_KIT =
  "https://discuss.google.dev/t/swag-drop-the-arcade-20-in-1-cleaning-kit/192192"
const S1_VACUUMS =
  "https://discuss.google.dev/t/swag-drop-the-ranger-champion-and-legend-vacuum-cleaners/192391"
const S1_LUMIN =
  "https://discuss.google.dev/t/swag-drop-the-arcade-lumin/192499"
const S1_PENS_DIARY =
  "https://discuss.google.dev/t/swag-drop-the-arcade-pen-duo-and-the-arcade-lego-diary/192633"
const S1_PINS_STICKERS =
  "https://discuss.google.dev/t/swag-drop-the-google-cloud-pin-badges-and-the-arcade-sticker-sheet/192760"
const S1_BACKPACKS =
  "https://discuss.google.dev/t/swag-drop-the-arcade-backpacks/192830"
const S1_TROOPER_DELIVERY =
  "https://www.linkedin.com/posts/konduru-lalitha-sree-6801b724a_googlecloud-googlecloudskillsboost-arcade-activity-7391115622669062145-fsKG"

const S2_TIERS =
  "https://discuss.google.dev/t/meet-the-new-skills-boost-arcade-tiers/255811"
const S2_SNOWBALL =
  "https://discuss.google.dev/t/swags-that-grow-with-your-skills/268483"
const S2_WRAP =
  "https://discuss.google.dev/t/that-s-a-wrap-on-google-skills-arcade-2025/311521"

function official(name: string, sourceUrl: string): HistoricalSwagItem {
  return { name, sourceUrl, sourceKind: "official-announcement" }
}

function wrap(name: string): HistoricalSwagItem {
  return { name, sourceUrl: S2_WRAP, sourceKind: "official-wrap-up" }
}

export const ARCADE_2025_SWAG_HISTORY: readonly HistoricalSwagSeason[] = [
  {
    year: 2025,
    season: 1,
    label: "Google Skills Arcade 2025 Season 1",
    periodLabel: "January–June 2025",
    tierSourceUrl: S1_TIERS,
    distributionRule:
      "Each tier had its own package. Higher tiers did not automatically inherit every lower-tier package.",
    packages: [
      {
        tier: "novice",
        pointsLabel: "20–39 points",
        items: [
          official("The Arcade Novice T-Shirt", S1_NOVICE_SHIRT),
          official("The Arcade Mug", S1_NOVICE_BASE),
          official("The Arcade Laptop Stand", S1_NOVICE_BASE),
          official("Google Cloud Pin Badges", S1_PINS_STICKERS),
        ],
      },
      {
        tier: "trooper",
        pointsLabel: "40–64 points",
        items: [
          official("The Arcade Trooper Long-Sleeved T-Shirt", S1_TROOPER_SHIRT),
          {
            name: "The Arcade Trooper Backpack",
            sourceUrl: S1_TROOPER_DELIVERY,
            sourceKind: "delivery-evidence",
          },
          official("The Arcade Fold & Glow Lamp", S1_FOLD_GLOW),
          official("Google Cloud Pin Badges", S1_PINS_STICKERS),
          official("The Arcade Sticker Sheet", S1_PINS_STICKERS),
        ],
      },
      {
        tier: "ranger",
        pointsLabel: "65–74 points",
        items: [
          official("The Arcade Ranger Polo T-Shirt", S1_POLO),
          official("The Arcade Ranger Backpack", S1_BACKPACKS),
          official("The Arcade Ranger Vacuum Cleaner", S1_VACUUMS),
          official("The Arcade Screen Cleaner with Refill", S1_RANGER_BASE),
          official("The Arcade Color Palette Pen Set", S1_RANGER_BASE),
        ],
      },
      {
        tier: "champion",
        pointsLabel: "75–84 points",
        items: [
          official("The Arcade Champion Polo T-Shirt", S1_POLO),
          official("The Arcade Champion Backpack", S1_BACKPACKS),
          official("The Arcade Champion Vacuum Cleaner", S1_VACUUMS),
          official("The Arcade USB Hub", S1_USB_HUB),
          official("The Arcade Pen Duo", S1_PENS_DIARY),
          official("The Arcade Lego Diary", S1_PENS_DIARY),
        ],
      },
      {
        tier: "legend",
        pointsLabel: "85+ points",
        items: [
          official("The Arcade Legend Polo T-Shirt", S1_POLO),
          official("The Arcade Legend Backpack", S1_BACKPACKS),
          official("The Arcade Legend Vacuum Cleaner", S1_VACUUMS),
          official("The Arcade Thermal Printer", S1_THERMAL_PRINTER),
          official("The Arcade 20-in-1 Cleaning Kit", S1_CLEANING_KIT),
          official("The Arcade Lumin", S1_LUMIN),
          official("The Arcade Pen Duo", S1_PENS_DIARY),
        ],
      },
    ],
  },
  {
    year: 2025,
    season: 2,
    label: "Google Skills Arcade 2025 Season 2",
    periodLabel: "July–December 2025",
    tierSourceUrl: S2_TIERS,
    packageSourceUrl: S2_WRAP,
    distributionRule:
      "Novice and Trooper shared a base family, while Ranger, Champion, and Legend used a separate snowball family. Trooper added one reward to Novice; Champion added to Ranger; Legend added to the Champion collection.",
    packages: [
      {
        tier: "novice",
        pointsLabel: "25–44 points",
        items: [
          wrap("The Arcade Magnets"),
          wrap("The Arcade Sticker Sheet"),
          wrap("The Arcade Dry-Fit T-Shirt"),
          wrap("The Arcade Refresh Water Bottle"),
        ],
      },
      {
        tier: "trooper",
        pointsLabel: "45–64 points",
        items: [
          wrap("The Arcade Trooper Backpack"),
          wrap("The Arcade Magnets"),
          wrap("The Arcade Sticker Sheet"),
          wrap("The Arcade Dry-Fit T-Shirt"),
          wrap("The Arcade Refresh Water Bottle"),
        ],
      },
      {
        tier: "ranger",
        pointsLabel: "65–74 points",
        items: [
          wrap("The Google Cloud DIY Logo"),
          wrap("The Arcade Tumbler LED Lantern"),
          wrap("The Arcade Laptop Sleeve"),
          wrap("The Arcade USB Hub"),
          wrap("The Arcade Pen Duo"),
        ],
      },
      {
        tier: "champion",
        pointsLabel: "75–94 points",
        items: [
          wrap("The Google Cloud DIY Logo"),
          wrap("The Arcade Tumbler LED Lantern"),
          wrap("The Arcade Laptop Sleeve"),
          wrap("The Arcade USB Hub"),
          wrap("The Arcade Hoodie"),
          wrap("The Arcade Pen Duo"),
        ],
      },
      {
        tier: "legend",
        pointsLabel: "95+ points",
        items: [
          wrap("The Arcade Legend Backpack"),
          wrap("The Google Cloud DIY Logo"),
          wrap("The Arcade Tumbler LED Lantern"),
          wrap("The Arcade Laptop Sleeve"),
          wrap("The Arcade USB Hub"),
          wrap("The Arcade Hoodie"),
          wrap("The Arcade Pen Duo"),
        ],
      },
    ],
  },
] as const

export const ARCADE_2025_SEASON_2_SNOWBALL_SOURCE_URL = S2_SNOWBALL

export function getHistoricalSwagSeason(
  year: number,
  season: number,
): HistoricalSwagSeason | undefined {
  return ARCADE_2025_SWAG_HISTORY.find(
    (entry) => entry.year === year && entry.season === season,
  )
}
