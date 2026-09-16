/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next"
import { Calendar, ExternalLink, Trophy } from "lucide-react"
import {
  ARCADE_2025_SEASON_2_SNOWBALL_SOURCE_URL,
  ARCADE_2025_SWAG_HISTORY,
  type HistoricalSwagSourceKind,
} from "@/components/arcade/swag-history"
import {
  getHistoricalSeasonPreviewImages,
  getHistoricalSwagImage,
} from "@/components/arcade/swag-history-images"
import InternalPageShell from "@/components/site/internal-page-shell"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"

const title = "Google Skills Arcade 2025 Swag History — Season 1 & Season 2"
const description =
  "Browse the reconstructed Google Skills Arcade 2025 Season 1 swag packages and the official final Season 2 packages, with tier thresholds and source links for every reward."
const canonical = new URL("/swag-drops/2025/", WEBSITE_SITE_URL).toString()

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: "website" },
  twitter: { card: "summary_large_image", title, description },
}

const TIER_TONE = {
  novice: "border-sky-300/60 bg-sky-50/70 dark:border-sky-300/15 dark:bg-sky-300/[0.035]",
  trooper: "border-cyan-300/60 bg-cyan-50/70 dark:border-cyan-300/15 dark:bg-cyan-300/[0.035]",
  ranger: "border-emerald-300/60 bg-emerald-50/70 dark:border-emerald-300/15 dark:bg-emerald-300/[0.035]",
  champion: "border-violet-300/60 bg-violet-50/70 dark:border-violet-300/15 dark:bg-violet-300/[0.035]",
  legend: "border-amber-300/60 bg-amber-50/70 dark:border-amber-300/15 dark:bg-amber-300/[0.035]",
} as const

function sourceLabel(kind: HistoricalSwagSourceKind): string {
  switch (kind) {
    case "official-announcement":
      return "Official announcement"
    case "official-wrap-up":
      return "Official wrap-up"
    case "official-fulfillment":
      return "Fulfillment source"
    case "delivery-evidence":
      return "Delivery evidence"
  }
}

function getUniqueSeasonItems(
  season: (typeof ARCADE_2025_SWAG_HISTORY)[number],
) {
  const items = new Map<
    string,
    (typeof season.packages)[number]["items"][number]
  >()

  for (const tier of season.packages) {
    for (const item of tier.items) {
      if (!items.has(item.name)) items.set(item.name, item)
    }
  }

  return Array.from(items.values())
}

export default function SwagHistory2025Page() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Google Skills Arcade 2025 swag seasons",
    itemListElement: ARCADE_2025_SWAG_HISTORY.map((season, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: season.label,
      url: `${canonical}#season-${season.season}`,
    })),
  }

  return (
    <InternalPageShell
      eyebrow="Historical reward archive"
      title="Google Skills Arcade 2025 swag"
      description="Season 1 and Season 2 used different tier thresholds and reward rules. This archive keeps them separate and links each reward back to the strongest source found during the historical crawl."
      updated="September 16, 2026"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />

      <div className="not-prose space-y-10">
        <section className="grid gap-3 sm:grid-cols-2">
          {ARCADE_2025_SWAG_HISTORY.map((season) => {
            const totalPackageItems = season.packages.reduce(
              (sum, tier) => sum + tier.items.length,
              0,
            )
            const uniqueItems = getUniqueSeasonItems(season)
            const previews = getHistoricalSeasonPreviewImages(season.season, 3)

            return (
              <a
                key={season.season}
                href={`#season-${season.season}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-cyan-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="grid h-28 grid-cols-3 overflow-hidden border-b border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-black/20">
                  {previews.map((preview) => (
                    <div
                      key={preview.url}
                      className="relative overflow-hidden border-r border-white/70 last:border-r-0 dark:border-white/10"
                    >
                      <img
                        src={preview.url}
                        alt={preview.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-[1.04]"
                      />
                    </div>
                  ))}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200">
                      <Calendar className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
                      {season.periodLabel}
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                    {`Season ${season.season}`}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {`${uniqueItems.length} items · ${season.packages.length} tiers · ${totalPackageItems} tier-item entries`}
                  </p>
                </div>
              </a>
            )
          })}
        </section>

        {ARCADE_2025_SWAG_HISTORY.map((season) => {
          const uniqueItems = getUniqueSeasonItems(season)

          return (
            <section
              key={season.season}
              id={`season-${season.season}`}
              aria-labelledby={`season-${season.season}-heading`}
              className="scroll-mt-24"
            >
              <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.025]">
                <div className="border-b border-slate-200 bg-slate-100/80 p-3 dark:border-white/10 dark:bg-black/20">
                  <div className="mb-2 flex items-center justify-between gap-3 px-1">
                    <span className="text-xs font-bold uppercase tracking-[.12em] text-slate-500 dark:text-slate-400">
                      {`${uniqueItems.length} items`}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      Swipe / scroll →
                    </span>
                  </div>
                  <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {uniqueItems.map((item) => {
                      const imageUrl = getHistoricalSwagImage(
                        season.season,
                        item.name,
                      )

                      return (
                        <a
                          key={item.name}
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="group relative w-[72vw] max-w-[220px] shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md sm:w-[190px] dark:border-white/10 dark:bg-slate-950"
                        >
                          <span className="flex h-36 items-center justify-center overflow-hidden bg-slate-50 p-3 dark:bg-black/20">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.name}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.05]"
                              />
                            ) : (
                              <Trophy
                                className="h-8 w-8 text-slate-300 dark:text-slate-600"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                          <span className="block min-h-14 border-t border-slate-100 px-3 py-2 text-xs font-semibold leading-4 text-slate-800 dark:border-white/10 dark:text-slate-100">
                            {item.name}
                          </span>
                        </a>
                      )
                    })}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-cyan-700 dark:text-cyan-300">
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        {season.periodLabel}
                      </div>
                      <h2
                        id={`season-${season.season}-heading`}
                        className="mt-2 text-2xl font-bold text-slate-950 dark:text-white"
                      >
                        {`Google Skills Arcade 2025 · Season ${season.season}`}
                      </h2>
                      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {season.distributionRule}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={season.tierSourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:border-cyan-300 dark:border-white/10 dark:bg-white/5 dark:text-cyan-300"
                      >
                        Official tier rules <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                      {season.packageSourceUrl ? (
                        <a
                          href={season.packageSourceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:border-cyan-300 dark:border-white/10 dark:bg-white/5 dark:text-cyan-300"
                        >
                          Official final package <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                      {season.season === 2 ? (
                        <a
                          href={ARCADE_2025_SEASON_2_SNOWBALL_SOURCE_URL}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:border-cyan-300 dark:border-white/10 dark:bg-white/5 dark:text-cyan-300"
                        >
                          Snowball rule <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 dark:border-amber-300/15 dark:bg-amber-300/[0.05] dark:text-amber-100">
                    {season.season === 1
                      ? "Season 1 is reconstructed from official Yugali item announcements. The Trooper backpack is supported by delivery evidence because no standalone official announcement was found in this crawl."
                      : "Season 2 package contents are verified against Google's official 2025 final wrap-up; individual items link to their original Yugali reveal posts."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {season.packages.map((tier) => (
                  <article
                    key={tier.tier}
                    className={`rounded-2xl border p-4 sm:p-5 ${TIER_TONE[tier.tier]}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-700 shadow-sm dark:bg-black/20 dark:text-slate-200">
                          <Trophy className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <h3 className="text-lg font-bold capitalize text-slate-950 dark:text-white">
                            {`Arcade ${tier.tier}`}
                          </h3>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {tier.pointsLabel}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm dark:bg-black/20 dark:text-slate-300">
                        {`${tier.items.length} items`}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {tier.items.map((item) => {
                        const imageUrl = getHistoricalSwagImage(
                          season.season,
                          item.name,
                        )

                        return (
                          <a
                            key={`${tier.tier}-${item.name}`}
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="group grid min-w-0 grid-cols-[92px_minmax(0,1fr)] overflow-hidden rounded-xl border border-white/70 bg-white/85 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md dark:border-white/10 dark:bg-black/15 dark:hover:border-cyan-300/30"
                          >
                            <span className="flex min-h-28 items-center justify-center overflow-hidden border-r border-slate-100 bg-slate-50 p-2 dark:border-white/10 dark:bg-black/20">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={item.name}
                                  loading="lazy"
                                  decoding="async"
                                  className="h-full max-h-28 w-full object-contain transition duration-300 group-hover:scale-[1.05]"
                                />
                              ) : (
                                <Trophy
                                  className="h-7 w-7 text-slate-300 dark:text-slate-600"
                                  aria-hidden="true"
                                />
                              )}
                            </span>

                            <span className="flex min-w-0 items-start justify-between gap-3 px-3 py-3">
                              <span className="min-w-0">
                                <strong className="block text-sm leading-5 text-slate-900 dark:text-white">
                                  {item.name}
                                </strong>
                                <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                                  <span>{sourceLabel(item.sourceKind)}</span>
                                  {item.revealedOnIso ? (
                                    <time dateTime={item.revealedOnIso}>{item.revealedOnIso}</time>
                                  ) : null}
                                </span>
                              </span>
                              <ExternalLink
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-cyan-600"
                                aria-hidden="true"
                              />
                            </span>
                          </a>
                        )
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </InternalPageShell>
  )
}
