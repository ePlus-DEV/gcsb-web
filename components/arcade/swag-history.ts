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
  revealedOnIso?: string
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
const S2_USB_HUB =
  "https://discuss.google.dev/t/swag-drop-the-arcade-usb-hub/273056"
const S2_PEN_DUO =
  "https://discuss.google.dev/t/swag-drop-the-arcade-pen-duo/274906"
const S2_HOODIE =
  "https://discuss.google.dev/t/the-most-awaited-swag-drop-in-2025/276774"
const S2_BOTTLE =
  "https://discuss.google.dev/t/swag-drop-the-arcade-refresh-water-bottle/283341"
const S2_LAPTOP_SLEEVE =
  "https://discuss.google.dev/t/swag-drop-the-arcade-laptop-sleeve/286273"
const S2_DRY_FIT =
  "https://discuss.google.dev/t/swag-drop-the-arcade-dry-fit-t-shirt/288919"
const S2_TUMBLER =
  "https://discuss.google.dev/t/swag-drop-the-arcade-tumbler-led-lantern/291961"
const S2_STICKERS =
  "https://discuss.google.dev/t/swag-drop-the-arcade-sticker-sheet/295887"
const S2_DIY_LOGO =
  "https://discuss.google.dev/t/swag-drop-the-google-cloud-diy-logo/297749"
const S2_LEGEND_BACKPACK =
  "https://discuss.google.dev/t/swag-drop-the-arcade-legend-backpack/298441"
const S2_MAGNETS =
  "https://discuss.google.dev/t/swag-drop-the-arcade-magnets/299029"
const S2_TROOPER_BACKPACK =
  "https://discuss.google.dev/t/swag-drop-the-arcade-trooper-backpack/300389"

function announcement(
  name: string,
  sourceUrl: string,
  revealedOnIso: string,
): HistoricalSwagItem {
  return {
    name,
    sourceUrl,
    sourceKind: "official-announcement",
    revealedOnIso,
  }
}

function deliveryEvidence(name: string, sourceUrl: string): HistoricalSwagItem {
  return { name, sourceUrl, sourceKind: "delivery-evidence" }
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
          announcement("The Arcade Novice T-Shirt", S1_NOVICE_SHIRT, "2025-06-06"),
          announcement("The Arcade Mug", S1_NOVICE_BASE, "2025-05-09"),
          announcement("The Arcade Laptop Stand", S1_NOVICE_BASE, "2025-05-09"),
          announcement("Google Cloud Pin Badges", S1_PINS_STICKERS, "2025-06-26"),
        ],
      },
      {
        tier: "trooper",
        pointsLabel: "40–64 points",
        items: [
          announcement(
            "The Arcade Trooper Long-Sleeved T-Shirt",
            S1_TROOPER_SHIRT,
            "2025-05-30",
          ),
          deliveryEvidence("The Arcade Trooper Backpack", S1_TROOPER_DELIVERY),
          announcement("The Arcade Fold & Glow Lamp", S1_FOLD_GLOW, "2025-06-18"),
          announcement("Google Cloud Pin Badges", S1_PINS_STICKERS, "2025-06-26"),
          announcement("The Arcade Sticker Sheet", S1_PINS_STICKERS, "2025-06-26"),
        ],
      },
      {
        tier: "ranger",
        pointsLabel: "65–74 points",
        items: [
          announcement("The Arcade Ranger Polo T-Shirt", S1_POLO, "2025-05-22"),
          announcement("The Arcade Ranger Backpack", S1_BACKPACKS, "2025-06-27"),
          announcement("The Arcade Ranger Vacuum Cleaner", S1_VACUUMS, "2025-06-23"),
          announcement(
            "The Arcade Screen Cleaner with Refill",
            S1_RANGER_BASE,
            "2025-05-16",
          ),
          announcement("The Arcade Color Palette Pen Set", S1_RANGER_BASE, "2025-05-16"),
        ],
      },
      {
        tier: "champion",
        pointsLabel: "75–84 points",
        items: [
          announcement("The Arcade Champion Polo T-Shirt", S1_POLO, "2025-05-22"),
          announcement("The Arcade Champion Backpack", S1_BACKPACKS, "2025-06-27"),
          announcement("The Arcade Champion Vacuum Cleaner", S1_VACUUMS, "2025-06-23"),
          announcement("The Arcade USB Hub", S1_USB_HUB, "2025-06-13"),
          announcement("The Arcade Pen Duo", S1_PENS_DIARY, "2025-06-25"),
          announcement("The Arcade Lego Diary", S1_PENS_DIARY, "2025-06-25"),
        ],
      },
      {
        tier: "legend",
        pointsLabel: "85+ points",
        items: [
          announcement("The Arcade Legend Polo T-Shirt", S1_POLO, "2025-05-22"),
          announcement("The Arcade Legend Backpack", S1_BACKPACKS, "2025-06-27"),
          announcement("The Arcade Legend Vacuum Cleaner", S1_VACUUMS, "2025-06-23"),
          announcement("The Arcade Thermal Printer", S1_THERMAL_PRINTER, "2025-06-19"),
          announcement("The Arcade 20-in-1 Cleaning Kit", S1_CLEANING_KIT, "2025-06-20"),
          announcement("The Arcade Lumin", S1_LUMIN, "2025-06-24"),
          announcement("The Arcade Pen Duo", S1_PENS_DIARY, "2025-06-25"),
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
          announcement("The Arcade Magnets", S2_MAGNETS, "2025-12-22"),
          announcement("The Arcade Sticker Sheet", S2_STICKERS, "2025-12-10"),
          announcement("The Arcade Dry-Fit T-Shirt", S2_DRY_FIT, "2025-11-19"),
          announcement("The Arcade Refresh Water Bottle", S2_BOTTLE, "2025-11-04"),
        ],
      },
      {
        tier: "trooper",
        pointsLabel: "45–64 points",
        items: [
          announcement("The Arcade Trooper Backpack", S2_TROOPER_BACKPACK, "2025-12-26"),
          announcement("The Arcade Magnets", S2_MAGNETS, "2025-12-22"),
          announcement("The Arcade Sticker Sheet", S2_STICKERS, "2025-12-10"),
          announcement("The Arcade Dry-Fit T-Shirt", S2_DRY_FIT, "2025-11-19"),
          announcement("The Arcade Refresh Water Bottle", S2_BOTTLE, "2025-11-04"),
        ],
      },
      {
        tier: "ranger",
        pointsLabel: "65–74 points",
        items: [
          announcement("The Google Cloud DIY Logo", S2_DIY_LOGO, "2025-12-17"),
          announcement("The Arcade Tumbler LED Lantern", S2_TUMBLER, "2025-11-28"),
          announcement("The Arcade Laptop Sleeve", S2_LAPTOP_SLEEVE, "2025-11-12"),
          announcement("The Arcade USB Hub", S2_USB_HUB, "2025-10-13"),
          announcement("The Arcade Pen Duo", S2_PEN_DUO, "2025-10-17"),
        ],
      },
      {
        tier: "champion",
        pointsLabel: "75–94 points",
        items: [
          announcement("The Google Cloud DIY Logo", S2_DIY_LOGO, "2025-12-17"),
          announcement("The Arcade Tumbler LED Lantern", S2_TUMBLER, "2025-11-28"),
          announcement("The Arcade Laptop Sleeve", S2_LAPTOP_SLEEVE, "2025-11-12"),
          announcement("The Arcade USB Hub", S2_USB_HUB, "2025-10-13"),
          announcement("The Arcade Hoodie", S2_HOODIE, "2025-10-21"),
          announcement("The Arcade Pen Duo", S2_PEN_DUO, "2025-10-17"),
        ],
      },
      {
        tier: "legend",
        pointsLabel: "95+ points",
        items: [
          announcement("The Arcade Legend Backpack", S2_LEGEND_BACKPACK, "2025-12-19"),
          announcement("The Google Cloud DIY Logo", S2_DIY_LOGO, "2025-12-17"),
          announcement("The Arcade Tumbler LED Lantern", S2_TUMBLER, "2025-11-28"),
          announcement("The Arcade Laptop Sleeve", S2_LAPTOP_SLEEVE, "2025-11-12"),
          announcement("The Arcade USB Hub", S2_USB_HUB, "2025-10-13"),
          announcement("The Arcade Hoodie", S2_HOODIE, "2025-10-21"),
          announcement("The Arcade Pen Duo", S2_PEN_DUO, "2025-10-17"),
        ],
      },
    ],
  },
] as const

export const ARCADE_2025_SEASON_2_SNOWBALL_SOURCE_URL = S2_SNOWBALL
export const ARCADE_2025_SEASON_2_FINAL_WRAP_URL = S2_WRAP

export function getHistoricalSwagSeason(
  year: number,
  season: number,
): HistoricalSwagSeason | undefined {
  return ARCADE_2025_SWAG_HISTORY.find(
    (entry) => entry.year === year && entry.season === season,
  )
}
