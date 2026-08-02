const siteUrl = "https://arcade.eplus.dev/"

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      url: siteUrl,
      name: "Arcade Points by ePlus.DEV",
      description:
        "Google Cloud Arcade points calculator, badge tracker, and Facilitator milestone dashboard for public Google Skills profiles.",
      publisher: {
        "@id": "https://eplus.dev/#organization",
      },
      inLanguage: "en",
    },
    {
      "@type": "Organization",
      "@id": "https://eplus.dev/#organization",
      name: "ePlus.DEV",
      url: "https://eplus.dev/",
    },
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}#application`,
      name: "Arcade Points by ePlus.DEV",
      url: siteUrl,
      isPartOf: {
        "@id": `${siteUrl}#website`,
      },
      applicationCategory: "EducationalApplication",
      applicationSubCategory: "Google Cloud learning progress tracker",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern web browser with JavaScript enabled",
      description:
        "Analyze a public Google Skills profile to estimate Google Cloud Arcade points, review earned badges, and compare progress with Arcade and Facilitator milestones.",
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
      inLanguage: "en",
    },
  ],
}

export default function SeoContent() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
