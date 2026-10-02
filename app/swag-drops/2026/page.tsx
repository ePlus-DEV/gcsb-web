import type { Metadata } from "next"
import SwagDrops2026Page from "@/components/swag/season-page"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"
import { CURRENT_SWAG_SEASON } from "@/components/arcade/swag-seasons"

const season = CURRENT_SWAG_SEASON

const description =
  "Google Skills Arcade 2026 rewards by tier, showing revealed swag, officially promised rewards, projected package size, live prize slots, and community winner photos."
const title = "Google Skills Arcade 2026 Swag Drops & Rewards"
const canonical = new URL(`/swag-drops/${season}/`, WEBSITE_SITE_URL).toString()

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: "website" },
  twitter: { card: "summary_large_image", title, description },
}

export default SwagDrops2026Page
