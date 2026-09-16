import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Trophy,
} from "lucide-react"
import SwagArtwork from "@/components/arcade/swag-artwork"
import {
  ARCADE_SWAG_TIERS,
  getSwagDropsForSeason,
  getSwagDropsForTier,
  type ArcadeSwagTier,
} from "@/components/arcade/swag-drops"
import {
  CURRENT_SWAG_SEASON,
  SWAG_2025_FINAL_REFERENCE_URL,
  SWAG_TIER_META,
  swagProductPath,
  swagTierPath,
} from "@/components/arcade/swag-seasons"
import InternalPageShell from "@/components/site/internal-page-shell"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"

const season = CURRENT_SWAG_SEASON
const title = "Google Skills Arcade 2026 Swag Drops & Rewards"
const description =
  "Google Skills Arcade 2026 rewards by Trooper, Ranger, Champion, and Legend tier, with confirmed swag, prize slots, Snowball rules, and historical package-size estimates."
const canonical = new URL(`/swag-drops/${season}/`, WEBSITE_SITE_URL).toString()

const TIER_CARD_SUMMARY: Record<ArcadeSwagTier, string> = {
  trooper: "The foundational 2026 reward tier.",
  ranger: "Trooper rewards plus one Ranger bonus reward.",
  champion: "The upper-tier collection starts here.",
  legend: "Champion rewards plus one Legend-exclusive reward.",
}

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: "website" },
  twitter: { card: "summary_large_image", title, description },
}

function TierCard({ tier }: { tier: ArcadeSwagTier }) {
  const meta = SWAG_TIER_META[tier]
  const tierDrops = getSwagDropsForTier(tier, season)
  const estimatedWaiting = Math.max(meta.historicalEstimateItems - tierDrops.length, 0)

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-cyan-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-400/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[.14em] text-cyan-700 dark:text-cyan-300">
            Arcade {meta.label}
          </span>
          <h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{meta.pointsLabel}</h3>
        </div>
        <Link
          href={swagTierPath(season, tier)}
          aria-label={`View Arcade ${meta.label} ${season} rewards`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-white/10"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <p className="mt-3 min-h-6 text-sm text-slate-600 dark:text-slate-300">
        {TIER_CARD_SUMMARY[tier]}
      </p>

      <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-300/15 dark:bg-violet-300/[0.04]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[.12em] text-violet-700 dark:text-violet-300">
              Projected package
            </span>
            <strong className="mt-1 block text-2xl text-slate-950 dark:text-white">
              {meta.historicalEstimateLabel}
            </strong>
          </div>
          <span className="rounded-full border border-violet-200 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:border-violet-300/15 dark:bg-white/5 dark:text-violet-200">
            Historical estimate
          </span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Based on the official final 2025 Season 2 package and the published 2026 Snowball rule. Not a confirmed 2026 total.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.035]">
          <span className="block text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">Prize slots</span>
          <strong className="mt-1 block text-sm text-slate-950 dark:text-white">
            {meta.slots.toLocaleString("en-US")}
          </strong>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-300/[0.04]">
          <span className="block text-[10px] font-bold uppercase tracking-[.1em] text-emerald-700 dark:text-emerald-300">Named</span>
          <strong className="mt-1 block text-sm text-slate-950 dark:text-white">{tierDrops.length}</strong>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-300/[0.04]">
          <span className="block text-[10px] font-bold uppercase tracking-[.1em] text-amber-700 dark:text-amber-300">Est. waiting</span>
          <strong className="mt-1 block text-sm text-slate-950 dark:text-white">≈{estimatedWaiting}</strong>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-cyan-200/70 bg-cyan-50/60 px-3 py-2.5 dark:border-cyan-300/10 dark:bg-cyan-300/[0.035]">
        <span className="block text-[10px] font-bold uppercase tracking-[.1em] text-cyan-700 dark:text-cyan-300">2026 package rule</span>
        <strong className="mt-0.5 block text-sm text-slate-950 dark:text-white">{meta.packageRule}</strong>
      </div>

      <div className="mt-5 flex flex-1 flex-col border-t border-slate-200 pt-4 dark:border-white/10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-[.12em] text-slate-500 dark:text-slate-400">Swag lineup</span>
          <span className="text-[11px] font-semibold text-slate-400">Named + projected waiting</span>
        </div>

        <div className="space-y-2">
          {tierDrops.map((drop) => (
            <Link
              key={drop.id}
              href={swagProductPath(season, drop.id)}
              className="group/reward flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 transition hover:border-emerald-300 dark:border-emerald-300/15 dark:bg-emerald-300/[0.04]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-black/20">
                <SwagArtwork src={drop.imageUrl} alt="" className="h-full w-full object-contain" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Drop #{drop.dropNumber} revealed
                </span>
                <strong className="mt-0.5 block truncate text-sm text-slate-950 dark:text-white">{drop.shortName}</strong>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover/reward:translate-x-1" aria-hidden="true" />
            </Link>
          ))}

          <div className="flex min-h-[74px] items-center gap-3 rounded-xl border border-dashed border-amber-300/70 bg-amber-50/60 p-3 dark:border-amber-300/15 dark:bg-amber-300/[0.035]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[.1em] text-amber-700 dark:text-amber-300">
                ≈{estimatedWaiting} projected item{estimatedWaiting === 1 ? "" : "s"} still unrevealed
              </span>
              <span className="mt-0.5 block text-sm leading-5 text-slate-600 dark:text-slate-300">{meta.waitingNote}</span>
            </span>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Link
            href={swagTierPath(season, tier)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-white/10 dark:text-slate-200 dark:hover:border-cyan-400/40 dark:hover:text-cyan-200"
          >
            View {meta.label} details <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function SwagDrops2026Page() {
  const drops = getSwagDropsForSeason(season)
  const latest = drops[0]
  const tiersWithNamedSwag = ARCADE_SWAG_TIERS.filter(
    (tier) => getSwagDropsForTier(tier, season).length > 0,
  ).length

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
      description="Track the 2026 reward packages by tier, including named swag, projected package size based on the prior season, and what is still waiting for an official reveal."
      updated="September 16, 2026"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="not-prose space-y-10">
        {latest ? (
          <section className="grid overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-50 via-white to-violet-50 shadow-lg dark:from-cyan-950/20 dark:via-slate-950/80 dark:to-violet-950/20 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex min-h-64 items-center justify-center bg-white/50 p-6 dark:bg-black/10">
              <SwagArtwork src={latest.imageUrl} alt={latest.name} className="h-64 w-full object-contain" />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-9">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.12em] text-cyan-800 dark:bg-cyan-300/10 dark:text-cyan-200">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> 2026 swag drop #{latest.dropNumber}
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{latest.shortName}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{latest.summary}</p>
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

        <section aria-labelledby="season-overview-heading">
          <div className="mb-4">
            <h2 id="season-overview-heading" className="text-xl font-bold text-slate-950 dark:text-white">2026 reward overview</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Google has not published the final 2026 item counts yet. The estimates below use the official final 2025 Season 2 packages as a baseline, then apply the published 2026 Snowball relationships.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ARCADE_SWAG_TIERS.map((tier) => {
              const meta = SWAG_TIER_META[tier]
              const named = getSwagDropsForTier(tier, season).length
              return (
                <div key={tier} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.035]">
                  <span className="text-xs font-bold uppercase tracking-[.12em] text-slate-500 dark:text-slate-400">Arcade {meta.label}</span>
                  <strong className="mt-2 block text-2xl text-slate-950 dark:text-white">{meta.historicalEstimateLabel}</strong>
                  <span className="mt-1 block text-xs text-slate-500">
                    {named} named · ≈{Math.max(meta.historicalEstimateItems - named, 0)} waiting
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.025] dark:text-slate-400">
            <span>{drops.length} unique 2026 swag item named so far · {tiersWithNamedSwag}/{ARCADE_SWAG_TIERS.length} tiers currently have named swag.</span>
            <a
              href={SWAG_2025_FINAL_REFERENCE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
            >
              2025 final package baseline <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section aria-labelledby="package-rules-heading">
          <div className="mb-4">
            <h2 id="package-rules-heading" className="text-xl font-bold text-slate-950 dark:text-white">How the 2026 packages stack</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Yugali describes two Snowball families. The estimated totals are historical projections; the inheritance rules themselves are official for 2026.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.035]">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-cyan-600 dark:text-cyan-300" aria-hidden="true" />
                <h3 className="font-bold text-slate-950 dark:text-white">Trooper → Ranger</h3>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.035]">
                  <span className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Trooper</span>
                  <strong className="mt-1 block text-xl text-slate-950 dark:text-white">≈5 items</strong>
                  <span className="mt-1 block text-xs text-slate-500">2025 Trooper baseline: 5</span>
                </div>
                <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-slate-400 sm:rotate-0" aria-hidden="true" />
                <div className="rounded-xl bg-cyan-50 p-4 dark:bg-cyan-300/[0.04]">
                  <span className="text-xs font-bold uppercase tracking-[.1em] text-cyan-700 dark:text-cyan-300">Ranger</span>
                  <strong className="mt-1 block text-xl text-slate-950 dark:text-white">≈6 items</strong>
                  <span className="mt-1 block text-xs text-slate-500">Official rule: Trooper pack + 1 bonus</span>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.035]">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-violet-600 dark:text-violet-300" aria-hidden="true" />
                <h3 className="font-bold text-slate-950 dark:text-white">Champion → Legend</h3>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.035]">
                  <span className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Champion</span>
                  <strong className="mt-1 block text-xl text-slate-950 dark:text-white">≈6 items</strong>
                  <span className="mt-1 block text-xs text-slate-500">2025 Champion baseline: 6</span>
                </div>
                <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-slate-400 sm:rotate-0" aria-hidden="true" />
                <div className="rounded-xl bg-violet-50 p-4 dark:bg-violet-300/[0.04]">
                  <span className="text-xs font-bold uppercase tracking-[.1em] text-violet-700 dark:text-violet-300">Legend</span>
                  <strong className="mt-1 block text-xl text-slate-950 dark:text-white">≈7 items</strong>
                  <span className="mt-1 block text-xs text-slate-500">Official rule: Champion pack + 1 exclusive</span>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-6 text-slate-600 dark:border-amber-300/15 dark:bg-amber-300/[0.035] dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <strong className="text-slate-950 dark:text-white">Estimate only:</strong> 5 / 6 / 6 / 7 are projected package sizes, not confirmed 2026 totals. Named items are only added after Google announces them.
            </span>
            <a
              href="https://discuss.google.dev/t/swag-drop-the-arcade-weather-shield-jacket/397353"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
            >
              Official 2026 Snowball rules <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section aria-labelledby="tier-heading">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-300/10 dark:text-violet-200">
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="tier-heading" className="text-2xl font-bold text-slate-950 dark:text-white">2026 rewards by tier</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                See projected package size, named swag, and approximately how many items are still waiting for a reveal.
              </p>
            </div>
          </div>

          <div className="grid auto-rows-fr gap-4 md:grid-cols-2">
            {ARCADE_SWAG_TIERS.map((tier) => <TierCard key={tier} tier={tier} />)}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.025]">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Sources and estimate policy</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Google Developer forum announcements are the source of truth for named 2026 rewards and Snowball rules. Package totals marked with ≈ are historical estimates based on the official final 2025 Season 2 packages and are replaced when Google publishes definitive 2026 totals.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <a
              href="https://discuss.google.dev/t/google-skills-arcade-2026-tiers/371066"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-cyan-700 hover:underline dark:text-cyan-300"
            >
              Official 2026 tiers <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <a
              href="https://discuss.google.dev/t/swag-drop-the-arcade-weather-shield-jacket/397353"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-cyan-700 hover:underline dark:text-cyan-300"
            >
              2026 Snowball & first drop <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <a
              href={SWAG_2025_FINAL_REFERENCE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-cyan-700 hover:underline dark:text-cyan-300"
            >
              Official 2025 final packages <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </InternalPageShell>
  )
}
