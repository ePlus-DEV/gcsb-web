const siteUrl = "https://arcade.eplus.dev/"

const faqs = [
  {
    question: "What is the Google Cloud Arcade points calculator?",
    answer:
      "It analyzes badge information from a public Google Skills profile and summarizes estimated Arcade points, completed badges, and progress toward available milestones.",
  },
  {
    question: "How do I calculate my Google Cloud Arcade points?",
    answer:
      "Open your public Google Skills profile, copy its URL, and paste it into the calculator. The tool reviews supported badges and presents the estimated point total and milestone progress.",
  },
  {
    question: "Does the calculator support Arcade Facilitator milestones?",
    answer:
      "Yes. The dashboard includes a separate Facilitator progress view to help compare your current score with milestone requirements and limited reward tiers.",
  },
  {
    question: "Is this an official Google tool?",
    answer:
      "No. Arcade Points by ePlus.DEV is an independent community tool and is not affiliated with or endorsed by Google.",
  },
]

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}#application`,
      name: "Arcade Points by ePlus.DEV",
      url: siteUrl,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern web browser",
      description:
        "A Google Cloud Arcade points calculator and badge tracker for public Google Skills profiles, including Arcade Facilitator milestone progress.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      creator: {
        "@type": "Organization",
        name: "ePlus.DEV",
        url: "https://eplus.dev",
      },
      featureList: [
        "Google Cloud Arcade point estimation",
        "Google Skills public profile analysis",
        "Badge completion summary",
        "Arcade Facilitator milestone tracking",
        "Chrome and Firefox extension links",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}#faq`,
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
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
