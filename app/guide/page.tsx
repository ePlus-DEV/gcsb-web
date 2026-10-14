import type { Metadata } from "next"
import GuidePage from "@/components/content/guide-page"

const pageUrl = "https://arcade.eplus.dev/guide/"

export const metadata: Metadata = {
  title: "How to Check Google Cloud Arcade Points",
  description:
    "Step-by-step guide to find your public Google Skills profile URL, calculate Google Cloud Arcade points, review badges, and understand reward tiers.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "How to Check Google Cloud Arcade Points",
    description:
      "Find your public Google Skills profile URL and use Arcade Points to review badges, score estimates, and milestone progress.",
    url: pageUrl,
  },
}

export default GuidePage
