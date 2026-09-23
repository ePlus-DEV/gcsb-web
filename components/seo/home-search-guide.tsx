import Link from "next/link"
import type { WebsiteCatalog } from "@/lib/website-i18n"

type Props = { catalog: WebsiteCatalog }

/** Useful, localized, crawlable HTML even before client hydration. */
export default function HomeSearchGuide({ catalog }: Props) {
  const m = catalog.messages
  const rewardsTitle = catalog.additional["Arcade 2026 rewards"] ?? "Arcade 2026 rewards"

  return (
    <section
      id="arcade-seo-guide"
      aria-labelledby="arcade-seo-guide-title"
      className="relative mx-auto mt-12 w-full max-w-6xl px-4 pb-12 sm:px-6"
    >
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 text-slate-900 shadow-sm dark:border-white/10 dark:bg-slate-950/85 dark:text-slate-100 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 id="arcade-seo-guide-title" className="text-xl font-bold sm:text-2xl">{m.stepGuide}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{m.heroDescription}</p>
            <ul className="mt-5 space-y-3">
              {[m.openProfile, m.makePublic, m.copyUrl, m.analyzeTheProfile, m.readScore].map((step) => (
                <li key={step} className="border-l-2 border-cyan-500/70 pl-3 text-sm leading-6">{step}</li>
              ))}
            </ul>
            <Link href="/guide/" className="mt-5 inline-block text-sm font-semibold text-cyan-700 underline underline-offset-4 dark:text-cyan-300">{m.guide}</Link>
          </div>
          <div className="space-y-7">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">{m.arcadeTiers}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{m.tierNote}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{m.allocationMessage}</p>
              <Link href="/swag-drops/2026/" className="mt-3 inline-block text-sm font-semibold text-cyan-700 underline underline-offset-4 dark:text-cyan-300">{rewardsTitle}</Link>
            </div>
            <div>
              <h2 className="text-lg font-bold">{m.accuracyOfficial}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{m.unofficial}</p>
              <Link href="/about/" className="mt-3 inline-block text-sm font-semibold text-cyan-700 underline underline-offset-4 dark:text-cyan-300">{m.aboutArcade}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
