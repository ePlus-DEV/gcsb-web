import type { Metadata } from "next"
import FacilitatorPanel from "@/components/arcade/facilitator-panel"
import ArcadeRouteLinks from "@/components/app/arcade-route-links"
import SolutionRecommendationDemo from "@/components/extension/solution-recommendation-demo"
import SeoContent from "@/components/seo/seo-content"
import RedesignCalculator from "./redesign-calculator"

const siteUrl = "https://arcade.eplus.dev/"

export const metadata: Metadata = {
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    url: siteUrl,
  },
}

export default function Page() {
  return (
    <>
      <RedesignCalculator />
      <SolutionRecommendationDemo />
      <ArcadeRouteLinks />
      <FacilitatorPanel />
      <SeoContent />
    </>
  )
}
