import {
  getWebsiteLocaleHref,
  getWebsiteLocaleInfo,
  type WebsiteLocale,
} from "@/lib/website-i18n"

const siteUrl = "https://arcade.eplus.dev/"
const defaultDescription =
  "Google Cloud Arcade points calculator, badge tracker, and Facilitator milestone dashboard for public Google Skills profiles."

type SeoContentProps = {
  locale?: WebsiteLocale
  title?: string
  description?: string
}

export default function SeoContent({
  locale = "en",
  title = "Arcade Points by ePlus.DEV",
  description = defaultDescription,
}: SeoContentProps) {
  const localeInfo = getWebsiteLocaleInfo(locale)
  const pageUrl = new URL(getWebsiteLocaleHref(locale), siteUrl).toString()
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${pageUrl}#website`,
        url: pageUrl,
        name: title,
        description,
        publisher: {
          "@id": "https://eplus.dev/#organization",
        },
        inLanguage: localeInfo.htmlLang,
      },
      {
        "@type": "Organization",
        "@id": "https://eplus.dev/#organization",
        name: "ePlus.DEV",
        url: "https://eplus.dev/",
      },
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#application`,
        name: title,
        url: pageUrl,
        isPartOf: {
          "@id": `${pageUrl}#website`,
        },
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "Google Cloud learning progress tracker",
        operatingSystem: "Any",
        browserRequirements: "Requires a modern web browser with JavaScript enabled",
        description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        creator: {
          "@id": "https://eplus.dev/#organization",
        },
        featureList: [
          "Google Cloud Arcade point estimation",
          "Google Skills public profile analysis",
          "Earned badge review",
          "Arcade reward tier comparison",
          "Arcade Facilitator milestone tracking",
        ],
        inLanguage: localeInfo.htmlLang,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
