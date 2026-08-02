import type { Metadata } from "next"
import FacilitatorPanel from "@/components/arcade/facilitator-panel"
import ArcadeRouteLinks from "@/components/app/arcade-route-links"
import SeoContent from "@/components/seo/seo-content"
import { getWebsiteLanguageAlternates } from "@/lib/website-i18n"
import RedesignCalculator from "./redesign-calculator"

const siteUrl = "https://arcade.eplus.dev/"

export const metadata: Metadata = {
  alternates: {
    canonical: siteUrl,
    languages: getWebsiteLanguageAlternates(),
  },
  openGraph: {
    url: siteUrl,
    locale: "en_US",
  },
}

export default function Page() {
  return (
    <>
      <RedesignCalculator />
      <ArcadeRouteLinks />
      <FacilitatorPanel />
      <SeoContent />
    </>
  )
}
