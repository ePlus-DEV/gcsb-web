import type { Metadata } from "next"
import ProgramCountdown from "@/components/arcade/program-countdown"
import HomeSearchGuide from "@/components/seo/home-search-guide"
import englishCatalog from "@/public/i18n/locales/en.json"
import SeoContent from "@/components/seo/seo-content"
import {
  getWebsiteLanguageAlternates,
  WEBSITE_SITE_URL,
} from "@/lib/website-i18n"
import HomePage from "@/components/arcade/home-page"

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
      <HomePage catalog={englishCatalog} locale="en"><HomeSearchGuide catalog={englishCatalog} /></HomePage>
      <ProgramCountdown />
      <SeoContent />
    </>
  )
}
