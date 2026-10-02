import type { Metadata } from "next"
import AboutPage from "@/components/content/about-page"

const pageUrl = "https://arcade.eplus.dev/about/"

export const metadata: Metadata = {
  title: "About Arcade Points",
  description:
    "Learn how Arcade Points by ePlus.DEV analyzes public Google Skills profiles, estimates Google Cloud Arcade points, and tracks badges and Facilitator milestones.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "About Arcade Points",
    description:
      "Learn how the Arcade points calculator, badge tracker, and Facilitator milestone dashboard work.",
    url: pageUrl,
  },
}

export default AboutPage
