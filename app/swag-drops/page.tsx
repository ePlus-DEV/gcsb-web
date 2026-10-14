import type { Metadata } from "next"
import SwagDropsArchivePage from "@/components/swag/archive-page"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"

const description =
  "Browse Google Skills Arcade swag drops, reward tiers, prize slots, and confirmed or sourced historical reward announcements by season."
const title = "Google Skills Arcade Swag Drops & Rewards by Year"
const canonical = new URL("/swag-drops/", WEBSITE_SITE_URL).toString()

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: "website" },
  twitter: { card: "summary_large_image", title, description },
}

export default SwagDropsArchivePage
