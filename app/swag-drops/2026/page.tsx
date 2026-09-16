import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ExternalLink, Sparkles, Trophy } from "lucide-react"
import SwagArtwork from "@/components/arcade/swag-artwork"
import {
  ARCADE_SWAG_TIERS,
  getSwagDropsForSeason,
  getSwagDropsForTier,
} from "@/components/arcade/swag-drops"
import {
  CURRENT_SWAG_SEASON,
  SWAG_TIER_META,
  swagProductPath,
  swagTierPath,
} from "@/components/arcade/swag-seasons"
import InternalPageShell from "@/components/site/internal-page-shell"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"

const season = CURRENT_SWAG_SEASON
const title = "Google Skills Arcade 2026 Swag Drops & Rewards"
const description =
  "Google Skills Arcade 2026 rewards by Trooper, Ranger, Champion, and Legend tier, including prize slots, requirements, and confirmed swag drops."
const canonical = new URL(`/swag-drops/${season}/`, WEBSITE_SITE_URL).toString()

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: "website" },
  twitter: { card: "summary_large_image", title, description },
}

export default function SwagDrops2026Page() {
  const drops = getSwagDropsForSeason(season)
  const latest = drops[0]
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Swag Drops",
        item: new URL("/swag-drops/", WEBSITE_SITE_URL).toString(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: String(season),
        item: canonical,
      },
    ],
  }

  return (
    <InternalPageShell
      eyebrow="Arcade 2026 rewards"
      title="Google Skills Arcade 2026 swag drops"
      description="The season hub for 2026 tier requirements, prize slots, reward rules, and swag items confirmed by Google."
      updated="September 16, 2026"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="not-prose space-y-10">
        {latest ? (
          <section className="grid overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-50 via-white to-violet-50 shadow-lg dark:from-cyan-950/20 dark:via-slate-950/80 dark:to-violet-950/20 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex min-h-64 items-center justify-center bg-white/50 p-6 dark:bg-black/10">
              <SwagArtwork
                src={latest.imageUrl}
                alt={latest.name}
                className="h-64 w-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-9">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.12em] text-cyan-800 dark:bg-cyan-300/10 dark:text-cyan-200">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Latest confirmed drop
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                {latest.shortName}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {latest.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {latest.tiers.map((tier) => (
                  <Link
                    key={tier}
                    href={swagTierPath(season, tier)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold capitalize text-slate-700 hover:border-cyan-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  >
                    Arcade {tier}
                  </Link>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={swagProductPath(season, latest.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-cyan-300 dark:text-slate-950"
                >
                  View reward details <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={latest.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 px-2 py-2.5 text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
                >
                  Official Google announcement <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="tier-heading">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-300/10 dark:text-violet-200">
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="tier-heading" className="text-2xl font-bold text-slate-950 dark:text-white">
                2026 rewards by tier
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Each tier has its own indexable guide and confirmed reward list.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {ARCADE_SWAG_TIERS.map((tier) => {
              const meta = SWAG_TIER_META[tier]
              const tierDrops = getSwagDropsForTier(tier, season)
              return (
                <Link
                  key={tier}
                  href={swagTierPath(season, tier)}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-400/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[.14em] text-cyan-700 dark:text-cyan-300">
                        Arcade {meta.label}
                      </span>
                      <h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                        {meta.pointsLabel}
                      </h3>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-cyan-600" aria-hidden="true" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                      {meta.slots.toLocaleString("en-US")} prize slots
                    </span>
                    <span className="rounded-full bg-violet-50 px-3 py-1.5 text-violet-700 dark:bg-violet-300/10 dark:text-violet-200">
                      {tierDrops.length} confirmed {tierDrops.length === 1 ? "drop" : "drops"}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {meta.rewardRule}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.025]">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">How this archive is maintained</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Only rewards publicly announced by Google are added. Waterfall describes prize-slot allocation between tiers, while Snowball describes which reward families build on one another.
          </p>
        </section>
      </div>
    </InternalPageShell>
  )
}
