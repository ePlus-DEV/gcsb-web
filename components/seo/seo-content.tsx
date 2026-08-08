import {
  getWebsiteCanonicalUrl,
  getWebsiteLocaleInfo,
  type WebsiteLocale,
} from "@/lib/website-i18n"

const defaultDescription =
  "Google Cloud Arcade points calculator, badge tracker, and Facilitator milestone dashboard for public Google Skills profiles."

type SeoContentProps = {
  locale?: WebsiteLocale
  title?: string
  description?: string
}

/** Renders localized WebSite, WebPage, Organization, and WebApplication JSON-LD. */
export default function SeoContent({
  locale = "en",
  title = "Arcade Points by ePlus.DEV",
  description = defaultDescription,
}: SeoContentProps) {
  const localeInfo = getWebsiteLocaleInfo(locale)
  const pageUrl = getWebsiteCanonicalUrl(locale)
  const websiteId = `${pageUrl}#website`
  const webpageId = `${pageUrl}#webpage`
  const applicationId = `${pageUrl}#application`
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: pageUrl,
        name: title,
        description,
        publisher: {
          "@id": "https://eplus.dev/#organization",
        },
        inLanguage: localeInfo.htmlLang,
      },
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: pageUrl,
        name: title,
        description,
        isPartOf: {
          "@id": websiteId,
        },
        mainEntity: {
          "@id": applicationId,
        },
        about: {
          "@id": applicationId,
        },
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
        "@id": applicationId,
        name: title,
        url: pageUrl,
        mainEntityOfPage: {
          "@id": webpageId,
        },
        isPartOf: {
          "@id": websiteId,
        },
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "Google Cloud learning progress tracker",
        operatingSystem: "Any",
        browserRequirements: "Requires a modern web browser with JavaScript enabled",
        description,
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: 0,
          priceCurrency: "USD",
        },
        creator: {
          "@id": "https://eplus.dev/#organization",
        },
        featureList: [
          "Google Cloud Arcade point calculation with Facilitator milestone bonuses",
          "Google Skills public profile analysis",
          "Earned badge review and completion tracking",
          "Current monthly Arcade games, access codes, deadlines, and completion tracking",
          "Arcade reward tier and live remaining-slot comparison",
          "Arcade Facilitator milestone and syllabus tracking",
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
