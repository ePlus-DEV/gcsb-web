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
  type ArcadeSwagDrop,
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
  "Google Skills Arcade 2026 rewards by tier, showing revealed swag, officially promised rewards, projected package slots, and community swag photos."
const canonical = new URL(`/swag-drops/${season}/`, WEBSITE_SITE_URL).toString()

const PREVIOUS_SEASON_COUNTS: Record<ArcadeSwagTier, number> = {
  trooper: 5,
  ranger: 5,
  champion: 6,
  legend: 7,
}

const OFFICIAL_UNNAMED_REWARDS: Partial<
  Record<ArcadeSwagTier, readonly { title: string; note: string }[]>
> = {
  ranger: [
    {
      title: "Ranger bonus reward",
      note: "Officially promised by the 2026 Snowball rule · name not revealed",
    },
  ],
  legend: [
    {
      title: "Legend-only reward",
      note: "Officially promised for Legend · name not revealed",
    },
  ],
}

const COMMUNITY_SWAG_GALLERY = [
  {
    title: "Champion milestone swag",
    subtitle: "Community winner photo · 2024",
    author: "SyncWithAni",
    imageUrl:
      "https://d2yds90mtvelsl.cloudfront.net/original/3X/d/b/db905524eb5bb71d154749c50f929617fd9e1cb7.jpeg",
    sourceUrl:
      "https://discuss.google.dev/t/the-arcade-facilitators-are-here/185568?page=2#post_30",
  },
  {
    title: "Legend package delivery",
    subtitle: "Community delivery photo · 2025",
    author: "Premal_Bhagat",
    imageUrl:
      "https://d2yds90mtvelsl.cloudfront.net/original/3X/5/9/597d96aa9455deebe4f8b38da4fb9fae14d61111.jpeg",
    sourceUrl:
      "https://discuss.google.dev/t/swag-drop-the-arcade-pen-duo/274906?page=2#post_28",
  },
] as const

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: "website" },
  twitter: { card: "summary_large_image", title, description },
}

function revealedRelationship(tier: ArcadeSwagTier, drop: ArcadeSwagDrop): string {
  if (tier === "legend" && drop.tiers.includes("champion")) {
    return "Revealed · included with the Champion collection"
  }
  if (tier === "ranger" && drop.tiers.includes("trooper")) {
    return "Revealed · inherited from the Trooper pack"
  }
  return `2026 drop #${drop.dropNumber} · revealed`
}

function TierRewardCard({ tier }: { tier: ArcadeSwagTier }) {
  const meta = SWAG_TIER_META[tier]
  const drops = getSwagDropsForTier(tier, season)
  const promised = OFFICIAL_UNNAMED_REWARDS[tier] ?? []
  const projectedMystery = Math.max(
    meta.historicalEstimateItems - drops.length - promised.length,
    0,
  )

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-cyan-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-400/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-cyan-700 dark:text-cyan-300">
            Arcade {meta.label}
          </span>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">{meta.pointsLabel}</h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {meta.slots.toLocaleString("en-US")} prize slots
            </span>
          </div>
        </div>
        <Link
          href={swagTierPath(season, tier)}
          aria-label={`View Arcade ${meta.label} ${season} rewards`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-white/10"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-violet-50 p-3 dark:bg-violet-300/[0.04]">
          <span className="block text-[9px] font-bold uppercase tracking-[.1em] text-violet-700 dark:text-violet-300">
            Projected package
          </span>
          <strong className="mt-1 block text-lg text-slate-950 dark:text-white">
            {meta.historicalEstimateLabel}
          </strong>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-300/[0.04]">
          <span className="block text-[9px] font-bold uppercase tracking-[.1em] text-emerald-700 dark:text-emerald-300">
            Revealed
          </span>
          <strong className="mt-1 block text-lg text-slate-950 dark:text-white">{drops.length}</strong>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-300/[0.04]">
          <span className="block text-[9px] font-bold uppercase tracking-[.1em] text-amber-700 dark:text-amber-300">
            Official pending
          </span>
          <strong className="mt-1 block text-lg text-slate-950 dark:text-white">{promised.length}</strong>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.035]">
          <span className="block text-[9px] font-bold uppercase tracking-[.1em] text-slate-500">
            Projected mystery
          </span>
          <strong className="mt-1 block text-lg text-slate-950 dark:text-white">≈{projectedMystery}</strong>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-white/10">
        <h4 className="text-sm font-bold text-slate-950 dark:text-white">What this tier currently includes</h4>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Revealed rewards first, then official pending items and historical projections.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {drops.map((drop) => (
            <Link
              key={drop.id}
              href={swagProductPath(season, drop.id)}
              className="group/reward overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/70 transition hover:border-emerald-300 hover:shadow-sm dark:border-emerald-300/15 dark:bg-emerald-300/[0.04]"
            >
              <div className="flex h-20 items-center justify-center bg-white/80 p-2 dark:bg-black/15">
                <SwagArtwork src={drop.imageUrl} alt={drop.name} className="h-full w-full object-contain" />
              </div>
              <div className="p-2.5">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[.1em] text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Revealed
                </span>
                <strong className="mt-1 block text-xs leading-4 text-slate-950 dark:text-white">{drop.shortName}</strong>
                <span className="mt-1 block text-[10px] leading-4 text-slate-500">
                  {revealedRelationship(tier, drop)}
                </span>
              </div>
            </Link>
          ))}

          {promised.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-300/15 dark:bg-amber-300/[0.04]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="mt-3 block text-[9px] font-bold uppercase tracking-[.1em] text-amber-700 dark:text-amber-300">
                Officially promised
              </span>
              <strong className="mt-1 block text-xs leading-4 text-slate-950 dark:text-white">{item.title}</strong>
              <span className="mt-1 block text-[10px] leading-4 text-slate-500">{item.note}</span>
            </div>
          ))}

          {Array.from({ length: projectedMystery }, (_, index) => (
            <div
              key={`projected-${tier}-${index}`}
              className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.02]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm font-bold text-slate-400 dark:border-white/10">
                ?
              </span>
              <span className="mt-3 block text-[9px] font-bold uppercase tracking-[.1em] text-slate-500">
                Projected mystery
              </span>
              <strong className="mt-1 block text-xs leading-4 text-slate-700 dark:text-slate-200">
                Unrevealed item {index + 1}
              </strong>
              <span className="mt-1 block text-[10px] leading-4 text-slate-500">
                Placeholder from the 2025 package-size baseline
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3 dark:border-white/10">
        <div className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">2026 rule:</span> {meta.packageRule}
        </div>
        <Link
          href={swagTierPath(season, tier)}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
        >
          Full {meta.label} details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
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
      description="See what every 2026 tier currently includes without opening a detail page: revealed rewards, officially promised items, projected mystery slots, prize capacity, and historical context."
      updated="September 16, 2026"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="not-prose space-y-9">
        {latest ? (
          <section className="grid overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-50 via-white to-violet-50 shadow-lg dark:from-cyan-950/20 dark:via-slate-950/80 dark:to-violet-950/20 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex min-h-56 items-center justify-center bg-white/50 p-5 dark:bg-black/10">
              <SwagArtwork src={latest.imageUrl} alt={latest.name} className="h-52 w-full object-contain" />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.12em] text-cyan-800 dark:bg-cyan-300/10 dark:text-cyan-200">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> 2026 swag drop #{latest.dropNumber}
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{latest.shortName}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{latest.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
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
              <div className="mt-5 flex flex-wrap gap-3">
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
                  Official announcement <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="tier-rewards-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="tier-rewards-heading" className="text-2xl font-bold text-slate-950 dark:text-white">2026 rewards by tier</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                See every currently known reward in-place. Green cards are revealed, amber cards are officially promised but unnamed, and dashed cards are historical projections only.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[.08em]">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1.5 text-emerald-700 dark:bg-emerald-300/[0.05] dark:text-emerald-300">Revealed</span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1.5 text-amber-700 dark:bg-amber-300/[0.05] dark:text-amber-300">Official pending</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-slate-500 dark:bg-white/5 dark:text-slate-400">Projected mystery</span>
            </div>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-2">
            {ARCADE_SWAG_TIERS.map((tier) => <TierRewardCard key={tier} tier={tier} />)}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.025]">Trooper → Ranger: +1 bonus</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.025]">Champion → Legend: +1 exclusive</span>
            <a
              href={SWAG_2025_FINAL_REFERENCE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-violet-700 hover:underline dark:border-violet-300/15 dark:bg-violet-300/[0.035] dark:text-violet-200"
            >
              Projection baseline: official 2025 final packages <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section aria-labelledby="past-season-heading" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="past-season-heading" className="text-xl font-bold text-slate-950 dark:text-white">2025 final package reference</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The closest official completed season used only as the package-size projection baseline.</p>
            </div>
            <a
              href={SWAG_2025_FINAL_REFERENCE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
            >
              Official 2025 wrap-up <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ARCADE_SWAG_TIERS.map((tier) => (
              <div key={tier} className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                <span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">Arcade {SWAG_TIER_META[tier].label}</span>
                <strong className="mt-1 block text-xl text-slate-950 dark:text-white">{PREVIOUS_SEASON_COUNTS[tier]} items</strong>
                <span className="mt-1 block text-xs text-slate-500">2025 Season 2 final</span>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="hall-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
                <h2 id="hall-heading" className="text-2xl font-bold text-slate-950 dark:text-white">Hall of Swag Winners 🏆</h2>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Verified community delivery photos from public Google Developer forum posts.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Tap a photo to view its source</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {COMMUNITY_SWAG_GALLERY.map((item) => (
              <a
                key={item.sourceUrl}
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.035]"
              >
                <div className="h-40 overflow-hidden bg-slate-100 dark:bg-black/20 sm:h-44">
                  <SwagArtwork
                    src={item.imageUrl}
                    alt={`${item.title} shared by ${item.author}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-slate-950 dark:text-white">{item.title}</strong>
                    <span className="mt-1 block text-xs text-slate-500">{item.subtitle}</span>
                    <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">Shared by {item.author}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.035]">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Sources & estimate policy</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Google Developer forum announcements remain the source of truth for named 2026 rewards and Snowball rules. Package totals marked with ≈ are historical projections based on the official final 2025 packages, not confirmed 2026 totals.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
            <a href="https://discuss.google.dev/t/google-skills-arcade-2026-tiers/371066" target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-cyan-700 hover:underline dark:text-cyan-300">Official 2026 tiers <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a href="https://discuss.google.dev/t/swag-drop-the-arcade-weather-shield-jacket/397353" target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-cyan-700 hover:underline dark:text-cyan-300">2026 Snowball & first drop <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a href={SWAG_2025_FINAL_REFERENCE_URL} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-cyan-700 hover:underline dark:text-cyan-300">Official 2025 final packages <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
          </div>
        </section>
      </div>
    </InternalPageShell>
  )
}
