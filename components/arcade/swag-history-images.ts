export type HistoricalSwagSeasonNumber = 1 | 2

const IMAGE_BY_SEASON: Record<HistoricalSwagSeasonNumber, Record<string, string>> = {
  1: {
    "The Arcade Novice T-Shirt": "/images/swag/2025/season-1/the-arcade-novice-t-shirt.gif",
    "The Arcade Mug": "/images/swag/2025/season-1/the-arcade-mug.gif",
    "The Arcade Laptop Stand": "/images/swag/2025/season-1/the-arcade-laptop-stand.gif",
    "Google Cloud Pin Badges": "/images/swag/2025/season-1/google-cloud-pin-badges.gif",
    "The Arcade Sticker Sheet": "https://discuss.google.dev/uploads/short-url/vQRYo7ryrrdFqQMoAI97N9eW6ob.gif",
    "The Arcade Trooper Long-Sleeved T-Shirt": "/images/swag/2025/season-1/the-arcade-trooper-long-sleeved-t-shirt.gif",
    "The Arcade Fold & Glow Lamp": "/images/swag/2025/season-1/the-arcade-fold-glow-lamp.gif",
    "The Arcade Ranger Polo T-Shirt": "/images/swag/2025/season-1/the-arcade-ranger-polo-t-shirt.gif",
    "The Arcade Champion Polo T-Shirt": "/images/swag/2025/season-1/the-arcade-champion-polo-t-shirt.gif",
    "The Arcade Legend Polo T-Shirt": "/images/swag/2025/season-1/the-arcade-legend-polo-t-shirt.gif",
    "The Arcade Ranger Backpack": "/images/swag/2025/season-1/the-arcade-ranger-backpack.gif",
    "The Arcade Champion Backpack": "/images/swag/2025/season-1/the-arcade-champion-backpack.gif",
    "The Arcade Legend Backpack": "/images/swag/2025/season-1/the-arcade-legend-backpack.gif",
    "The Arcade Ranger Vacuum Cleaner": "https://piarcadecompass.vercel.app/images/2025%20C1/Ranger%20Vacuum%20Cleaner.png",
    "The Arcade Champion Vacuum Cleaner": "https://piarcadecompass.vercel.app/images/2025%20C1/Champion%20Vacuum%20Cleaner.png",
    "The Arcade Legend Vacuum Cleaner": "https://piarcadecompass.vercel.app/images/2025%20C1/Legend%20Vacuum%20Cleaner.png",
    "The Arcade Screen Cleaner with Refill": "/images/swag/2025/season-1/the-arcade-screen-cleaner-with-refill.gif",
    "The Arcade Pen Set": "/images/swag/2025/season-1/the-arcade-pen-set.gif",
    "The Arcade USB Hub": "/images/swag/2025/season-1/the-arcade-usb-hub.gif",
    "The Arcade Pen Duo": "/images/swag/2025/season-1/the-arcade-pen-duo.gif",
    "The Arcade Lego Diary": "/images/swag/2025/season-1/the-arcade-lego-diary.gif",
    "The Arcade Thermal Printer": "/images/swag/2025/season-1/the-arcade-thermal-printer.gif",
    "The Arcade 20-in-1 Cleaning Kit": "/images/swag/2025/season-1/the-arcade-20-in-1-cleaning-kit.gif",
    "The Arcade Lumin": "/images/swag/2025/season-1/the-arcade-lumin.gif",
  },
  2: {
    "The Arcade Magnets": "/images/swag/2025/season-2/the-arcade-magnets.gif",
    "The Arcade Sticker Sheet": "/images/swag/2025/season-2/the-arcade-sticker-sheet.gif",
    "The Arcade Dry-Fit T-Shirt": "/images/swag/2025/season-2/the-arcade-dry-fit-t-shirt.gif",
    "The Arcade Refresh Water Bottle": "/images/swag/2025/season-2/the-arcade-refresh-water-bottle.gif",
    "The Arcade Trooper Backpack": "/images/swag/2025/season-2/the-arcade-trooper-backpack.gif",
    "The Google Cloud DIY Logo": "/images/swag/2025/season-2/the-google-cloud-diy-logo.gif",
    "The Arcade Tumbler LED Lantern": "/images/swag/2025/season-2/the-arcade-tumbler-led-lantern.gif",
    "The Arcade Laptop Sleeve": "/images/swag/2025/season-2/the-arcade-laptop-sleeve.gif",
    "The Arcade USB Hub": "/images/swag/2025/season-2/the-arcade-usb-hub.gif",
    "The Arcade Pen Duo": "/images/swag/2025/season-2/the-arcade-pen-duo.gif",
    "The Arcade Hoodie": "/images/swag/2025/season-2/the-arcade-hoodie.gif",
    "The Arcade Legend Backpack": "/images/swag/2025/season-2/the-arcade-legend-backpack.gif",
  },
}

export function getHistoricalSwagImage(
  season: HistoricalSwagSeasonNumber,
  itemName: string,
): string | undefined {
  return IMAGE_BY_SEASON[season][itemName]
}

export function getHistoricalSeasonPreviewImages(
  season: HistoricalSwagSeasonNumber,
  limit = 4,
): Array<{ name: string; url: string }> {
  return Object.entries(IMAGE_BY_SEASON[season])
    .slice(0, Math.max(0, limit))
    .map(([name, url]) => ({ name, url }))
}
