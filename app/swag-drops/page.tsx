/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Calendar, Trophy } from "lucide-react"
import {
  ARCADE_SWAG_SEASONS,
  getSwagDropsForSeason,
} from "@/components/arcade/swag-drops"
import { ARCADE_2025_SWAG_HISTORY } from "@/components/arcade/swag-history"
import { getHistoricalSeasonPreviewImages } from "@/components/arcade/swag-history-images"
import { swagSeasonPath } from "@/components/arcade/swag-seasons"
import InternalPageShell from "@/components/site/internal-page-shell"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"

const title = "Google Skills Arcade Swag Drops & Rewards by Year"
const description =
  "Browse Google Skills Arcade swag drops, reward tiers, prize slots, and confirmed or sourced historical reward announcements by season."
const canonical = new URL("/swag-drops/", WEBSITE_SITE_URL).toString()

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: "website" },
  twitter: { card: "summary_large_image", title, description },
}

export default function SwagDropsArchivePage() {
  const historicalPreview = [
    ...getHistoricalSeasonPreviewImages(1, 2),
    ...getHistoricalSeasonPreviewImages(2, 2),
  ]

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Google Skills Arcade swag seasons",
    itemListElement: [
      ...ARCADE_SWAG_SEASONS.map((season) => ({
        name: `Google Skills Arcade ${season} swag drops`,
        url: new URL(swagSeasonPath(season), WEBSITE_SITE_URL).toString(),
      })),
      {
        name: "Google Skills Arcade 2025 swag history",
        url: new URL("/swag-drops/2025/", WEBSITE_SITE_URL).toString(),
      },
    ].map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      ...entry,
    })),
  }

  return (
    <InternalPageShell
      eyebrow="Arcade rewards archive"
      title="Swag drops by season"
      description="Explore current and historical Google Skills Arcade rewards by year. Each season keeps its own tier requirements and reward rules so older swag never gets mixed into the current season."
      updated="September 16, 2026"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />

      <div className="not-prose grid gap-5 md:grid-cols-2">
        {ARCADE_SWAG_SEASONS.map((season) => {
          const drops = getSwagDropsForSeason(season)
          const latest = drops[0]

          return (
            <Link
              key={season}
              href={swagSeasonPath(season)}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-400/40"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200">
                  <Trophy className="h-6 w-6" aria-hidden="true" />
                </span>
                <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-cyan-600" aria-hidden="true" />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-cyan-700 dark:text-cyan-300">
                {`Season ${season}`}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                Google Skills Arcade {season}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {`Trooper, Ranger, Champion, and Legend requirements plus every confirmed ${season} swag drop.`}
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-white/5">
                  {`${drops.length} confirmed ${drops.length === 1 ? "drop" : "drops"}`}
                </span>
                {latest ? (
                  <span className="rounded-full bg-violet-50 px-3 py-1.5 text-violet-700 dark:bg-violet-300/10 dark:text-violet-200">
                    {`Latest: ${latest.shortName}`}
                  </span>
                ) : null}
              </div>
            </Link>
          )
        })}

        <Link
          href="/swag-drops/2025/"
          className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-violet-400/40"
        >
          <div className="grid h-32 grid-cols-4 gap-px bg-slate-100 dark:bg-white/10">
            {historicalPreview.map((preview) => (
              <div key={preview.url} className="overflow-hidden bg-white dark:bg-slate-950">
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

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-300/10 dark:text-violet-200">
                <Calendar className="h-6 w-6" aria-hidden="true" />
              </span>
              <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-600" aria-hidden="true" />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-violet-700 dark:text-violet-300">
              Historical archive
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
              Google Skills Arcade 2025
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Season 1 and Season 2 tier packages reconstructed from official announcements, the final 2025 wrap-up, and clearly labeled supporting evidence.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-white/5">
                {ARCADE_2025_SWAG_HISTORY.length} historical seasons
              </span>
              <span className="rounded-full bg-violet-50 px-3 py-1.5 text-violet-700 dark:bg-violet-300/10 dark:text-violet-200">
                Season 1 + Season 2
              </span>
            </div>
          </div>
        </Link>
      </div>
    </InternalPageShell>
  )
}
