const siteUrl = "https://eplus-dev.github.io/gcsb-web/"

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section
        aria-labelledby="arcade-calculator-guide"
        className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 id="arcade-calculator-guide" className="text-2xl font-bold text-white sm:text-3xl">
            Google Cloud Arcade points calculator and badge tracker
          </h2>
          <p className="mt-4 max-w-4xl leading-7 text-slate-300">
            Arcade Points by ePlus.DEV helps Google Cloud learners turn a public Google Skills
            profile into a clearer view of estimated Arcade points, completed badges, milestone
            progress, and Facilitator reward eligibility. It is designed for quick checks without
            requiring access to your Google account.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <article>
              <h3 className="text-lg font-semibold text-white">Calculate Arcade points</h3>
              <p className="mt-2 leading-6 text-slate-400">
                Paste a public profile URL to review supported badges and estimate the points that
                contribute to your Google Cloud Arcade progress.
              </p>
            </article>
            <article>
              <h3 className="text-lg font-semibold text-white">Track badges and milestones</h3>
              <p className="mt-2 leading-6 text-slate-400">
                See which badges were detected, how your score compares with milestone thresholds,
                and which goals may still require more activity.
              </p>
            </article>
            <article>
              <h3 className="text-lg font-semibold text-white">Review Facilitator progress</h3>
              <p className="mt-2 leading-6 text-slate-400">
                Use the dedicated Facilitator view to compare points with reward tiers while keeping
                limited-slot milestone rules in mind.
              </p>
            </article>
          </div>

          <div className="mt-10 border-t border-white/10 pt-8">
            <h2 className="text-xl font-bold text-white">Frequently asked questions</h2>
            <div className="mt-5 space-y-5">
              {faqs.map((item) => (
                <details key={item.question} className="group rounded-xl border border-white/10 p-4">
                  <summary className="cursor-pointer font-semibold text-white marker:text-slate-500">
                    {item.question}
                  </summary>
                  <p className="mt-3 leading-6 text-slate-400">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <p className="mt-8 text-sm leading-6 text-slate-500">
            Google, Google Cloud, Google Skills, and Google Cloud Skills Boost are trademarks of
            Google LLC. This independent community project is not affiliated with or endorsed by
            Google. Calculated results are estimates and may differ from official program records.
          </p>
        </div>
      </section>
    </>
  )
}
