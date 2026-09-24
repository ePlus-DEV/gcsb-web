import type { Metadata } from "next"
import FacilitatorAnalyzerOption from "@/components/arcade/facilitator-analyzer-option"
import FacilitatorPanelGate from "@/components/arcade/facilitator-panel-gate"
import FreshScoreCheckEnhancer from "@/components/arcade/fresh-score-check-enhancer"
import MonthlyGamesPanelGate from "@/components/arcade/monthly-games-panel-gate"
import ProgramCountdown from "@/components/arcade/program-countdown"
import ShareProfileEnhancer from "@/components/arcade/share-profile-enhancer"
import SwagDropsPreview from "@/components/arcade/swag-drops-preview"
import TierStatusIconEnhancer from "@/components/arcade/tier-status-icon-enhancer"
import HomeSearchGuide from "@/components/seo/home-search-guide"
import englishCatalog from "@/public/i18n/locales/en.json"
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
      <RedesignCalculator historyCatalog={englishCatalog} historyLocale="en" footerContent={<HomeSearchGuide catalog={englishCatalog} />} />
      <ProgramCountdown />
      <FreshScoreCheckEnhancer />
      <TierStatusIconEnhancer />
      <SwagDropsPreview />
      <MonthlyGamesPanelGate />
      <ShareProfileEnhancer />
      <FacilitatorAnalyzerOption />
      <FacilitatorPanelGate />
      <SeoContent />
    </>
  )
}
