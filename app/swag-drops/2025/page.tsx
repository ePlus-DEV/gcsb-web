import type { Metadata } from "next"
import SwagHistory2025Page from "@/components/swag/history-page"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"

const description =
  "Browse the reconstructed Google Skills Arcade 2025 Season 1 swag packages and the official final Season 2 packages, with tier thresholds and source links for every reward."
const title = "Google Skills Arcade 2025 Swag History — Season 1 & Season 2"
const canonical = new URL("/swag-drops/2025/", WEBSITE_SITE_URL).toString()

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: "website" },
  twitter: { card: "summary_large_image", title, description },
}

export default SwagHistory2025Page
