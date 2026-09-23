import Link from "next/link"
import { GraduationCap, ShieldCheck, Trophy } from "lucide-react"
import type { WebsiteCatalog } from "@/lib/website-i18n"

type Props = { catalog: WebsiteCatalog }

/**
 * Short, readable entry points for visitors and crawlers, not a duplicate
 * article underneath the calculator. Detailed guidance lives on linked pages.
 */
export default function HomeSearchGuide({ catalog }: Props) {
  const m = catalog.messages
  const rewardsTitle =
    catalog.additional["Arcade 2026 rewards"] ?? "Arcade 2026 rewards"

  return (
    <section
      id="arcade-seo-guide"
      aria-labelledby="arcade-seo-guide-title"
      className="relative z-[1] mx-auto mt-6 pb-4 sm:mt-8 sm:pb-2"
      style={{ width: "min(1280px, calc(100% - 40px))" }}
    >
      <h2
        id="arcade-seo-guide-title"
        className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200"
      >
        {m.aboutArcade}
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        <article
          data-home-discovery-card="guide"
          className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white/95 p-4 transition-colors hover:border-cyan-300 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-300/40 sm:p-5"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-300">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
            </span>
            <h3 className="text-base font-bold leading-6 text-slate-900 dark:text-white">
              {m.stepGuide}
            </h3>
          </div>
          <ol className="mt-3 space-y-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
            <li>{m.openProfile}</li>
            <li>{m.makePublic}</li>
            <li>{m.copyUrl}</li>
          </ol>
          <Link
            href="/guide/"
            className="mt-auto inline-flex min-h-10 items-center gap-1.5 pt-4 text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
          >
            {m.guide} <span aria-hidden="true">↗</span>
          </Link>
        </article>
        <article
          data-home-discovery-card="rewards"
          className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white/95 p-4 transition-colors hover:border-violet-300 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-violet-300/40 sm:p-5"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-300/20 dark:bg-violet-300/10 dark:text-violet-300">
              <Trophy className="h-4 w-4" aria-hidden="true" />
            </span>
            <h3 className="text-base font-bold leading-6 text-slate-900 dark:text-white">
              {m.arcadeTiers}
            </h3>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
            {m.tierNote}
          </p>
          <Link
            href="/swag-drops/2026/"
            className="mt-auto inline-flex min-h-10 items-center gap-1.5 pt-4 text-sm font-semibold text-violet-700 hover:underline dark:text-violet-300"
          >
            {rewardsTitle} <span aria-hidden="true">↗</span>
          </Link>
        </article>
        <article
          data-home-discovery-card="accuracy"
          className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white/95 p-4 transition-colors hover:border-emerald-300 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-emerald-300/40 sm:p-5"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <h3 className="text-base font-bold leading-6 text-slate-900 dark:text-white">
              {m.accuracyOfficial}
            </h3>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
            {m.unknownShown}
          </p>
          <Link
            href="/about/"
            className="mt-auto inline-flex min-h-10 items-center gap-1.5 pt-4 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
          >
            {m.aboutArcade} <span aria-hidden="true">↗</span>
          </Link>
        </article>
      </div>
    </section>
  )
}
