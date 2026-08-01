import type { Metadata } from "next"
import FacilitatorPanel from "@/components/arcade/facilitator-panel"
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
      <FacilitatorPanel />
      <SeoContent />
    </>
  )
}
