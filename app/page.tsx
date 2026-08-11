import type { Metadata } from "next"
import FacilitatorAnalyzerOption from "@/components/arcade/facilitator-analyzer-option"
import FacilitatorPanelGate from "@/components/arcade/facilitator-panel-gate"
import FreshScoreCheckEnhancer from "@/components/arcade/fresh-score-check-enhancer"
import MonthlyGamesPanelGate from "@/components/arcade/monthly-games-panel-gate"
import ShareProfileEnhancer from "@/components/arcade/share-profile-enhancer"
import ArcadeRouteLinks from "@/components/app/arcade-route-links"
import SeoContent from "@/components/seo/seo-content"
import {
  getWebsiteLanguageAlternates,
  WEBSITE_SITE_URL,
} from "@/lib/website-i18n"
import RedesignCalculator from "./redesign-calculator"

export const metadata: Metadata = {
  alternates: {
    canonical: WEBSITE_SITE_URL,
    languages: getWebsiteLanguageAlternates(),
  },
  openGraph: {
    url: WEBSITE_SITE_URL,
    locale: "en_US",
  },
}

/** Renders the default English calculator homepage. */
export default function Page() {
  return (
    <>
      <RedesignCalculator />
      <FreshScoreCheckEnhancer />
      <MonthlyGamesPanelGate />
      <ShareProfileEnhancer />
      <FacilitatorAnalyzerOption />
      <ArcadeRouteLinks />
      <FacilitatorPanelGate />
      <SeoContent />
    </>
  )
}
