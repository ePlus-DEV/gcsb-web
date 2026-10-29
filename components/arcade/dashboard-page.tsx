import type { WebsiteCatalog, WebsiteLocale } from "@/lib/website-i18n"
import RedesignCalculator from "@/app/redesign-calculator"
import MonthlyGamesPanelGate from "./monthly-games-panel-gate"
import SwagDropsPreview from "./swag-drops-preview"
import FacilitatorAnalyzerOption from "./facilitator-analyzer-option"
import FacilitatorPanelGate from "./facilitator-panel-gate"
import FreshScoreCheckEnhancer from "./fresh-score-check-enhancer"
import ShareProfileEnhancer from "./share-profile-enhancer"
import TierStatusIconEnhancer from "./tier-status-icon-enhancer"

export default function DashboardPage({catalog, locale}: {catalog: WebsiteCatalog; locale: WebsiteLocale}) {
  return <>
    <RedesignCalculator historyCatalog={catalog} historyLocale={locale} />
    <MonthlyGamesPanelGate />
    <SwagDropsPreview />
    <FreshScoreCheckEnhancer />
    <TierStatusIconEnhancer />
    <ShareProfileEnhancer />
    <FacilitatorAnalyzerOption />
    <FacilitatorPanelGate />
  </>
}
