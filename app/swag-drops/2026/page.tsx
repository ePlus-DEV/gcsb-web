import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Trophy,
} from "lucide-react"
import LiveTierSlots from "@/components/arcade/live-tier-slots"
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
  "Google Skills Arcade 2026 rewards by tier, showing revealed swag, officially promised rewards, projected package size, live prize slots, and community winner photos."
const canonical = new URL(`/swag-drops/${season}/`, WEBSITE_SITE_URL).toString()

const PREVIOUS_SEASON_COUNTS: Record<ArcadeSwagTier, number> = {
  trooper: 5,
  ranger: 5,
  champion: 6,
  legend: 7,
}

const TIER_START_POINTS: Record<ArcadeSwagTier, number> = {
  trooper: 50,
  ranger: 75,
  champion: 95,
  legend: 120,
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

const TIER_TONE: Record<
  ArcadeSwagTier,
  { rail: string; badge: string; progress: string }
> = {
  trooper: {
    rail: "border-l-cyan-400",
    badge: "bg-cyan-50 text-cyan-700 dark:bg-cyan-300/[0.06] dark:text-cyan-200",
    progress: "bg-cyan-400",
  },
  ranger: {
    rail: "border-l-emerald-400",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-300/[0.06] dark:text-emerald-200",
    progress: "bg-emerald-400",
  },
  champion: {
    rail: "border-l-violet-400",
    badge:
      "bg-violet-50 text-violet-700 dark:bg-violet-300/[0.06] dark:text-violet-200",
    progress: "bg-violet-400",
  },
  legend: {
    rail: "border-l-amber-400",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-300/[0.06] dark:text-amber-200",
    progress: "bg-amber-400",
  },
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
    return "Included with the Champion collection"
  }
  if (tier === "ranger" && drop.tiers.includes("trooper")) {
    return "Inherited from the Trooper pack"
  }
  return `2026 swag drop #${drop.dropNumber}`
}

function TierRewardRow({ tier }: { tier: ArcadeSwagTier }) {
  const meta = SWAG_TIER_META[tier]
  const drops = getSwagDropsForTier(tier, season)
  const promised = OFFICIAL_UNNAMED_REWARDS[tier] ?? []
  const knownCount = drops.length + promised.length
  const projectedMystery = Math.max(meta.historicalEstimateItems - knownCount, 0)
  const progress = Math.min(
    100,
    Math.round((knownCount / meta.historicalEstimateItems) * 100),
  )
  const tone = TIER_TONE[tier]

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-slate-200 border-l-4 ${tone.rail} bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/15`}
    >
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[170px_minmax(0,1fr)_210px] lg:items-center">
        <div className="min-w-0">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${tone.badge}`}
          >
            Arcade {meta.label}
          </span>
          <h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
            {meta.pointsLabel}
          </h3>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{meta.slots.toLocaleString("en-US")} total prize slots</span>
            <span>≈{meta.historicalEstimateItems} projected items</span>
          </div>
        </div>

        <div className="min-w-0 border-y border-slate-200 py-4 dark:border-white/10 lg:border-x lg:border-y-0 lg:px-5 lg:py-0">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 dark:text-slate-400">
              Current reward lineup
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {knownCount} known now
            </span>
          </div>

          {drops.length + promised.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {drops.map((drop) => (
                <Link
                  key={drop.id}
                  href={swagProductPath(season, drop.id)}
                  className="group flex min-w-0 items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 transition hover:border-emerald-300 dark:border-emerald-300/15 dark:bg-emerald-300/[0.04]"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-black/20">
                    <SwagArtwork
                      src={drop.imageUrl}
                      alt={drop.name}
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[.1em] text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Revealed
                    </span>
                    <strong className="mt-0.5 block truncate text-sm text-slate-950 dark:text-white">
                      {drop.shortName}
                    </strong>
                    <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                      {revealedRelationship(tier, drop)}
                    </span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              ))}

              {promised.map((item) => (
                <div
                  key={item.title}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 dark:border-amber-300/15 dark:bg-amber-300/[0.04]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[9px] font-bold uppercase tracking-[.1em] text-amber-700 dark:text-amber-300">
                      Officially promised
                    </span>
                    <strong className="mt-0.5 block truncate text-sm text-slate-950 dark:text-white">
                      {item.title}
                    </strong>
                    <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                      Name not revealed yet
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-3 py-3 dark:border-white/10 dark:bg-white/[0.02]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm font-bold text-slate-400 dark:border-white/10">
                ?
              </span>
              <div className="min-w-0">
                <strong className="block text-sm text-slate-700 dark:text-slate-200">
                  No named 2026 item yet
                </strong>
                <span className="mt-0.5 block text-[10px] text-slate-500">
                  Google has not revealed this tier&apos;s item names yet.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <LiveTierSlots
            points={TIER_START_POINTS[tier]}
            totalSlots={meta.slots}
            compact
          />

          <div className="mt-3 border-t border-slate-200 pt-3 dark:border-white/10">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 dark:text-slate-400">
                  Swag still unrevealed
                </span>
                <strong className="mt-1 block text-xl text-slate-950 dark:text-white">
                  ≈{projectedMystery}
                </strong>
              </div>
              <span className="text-right text-[10px] leading-4 text-slate-500">
                {knownCount}/{meta.historicalEstimateItems}
                <br />known vs projected
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
              <div
                className={`h-full rounded-full ${tone.progress}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[10px] leading-4 text-slate-500">
              2025 baseline: {PREVIOUS_SEASON_COUNTS[tier]} items
            </span>
            <Link
              href={swagTierPath(season, tier)}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
            >
              Details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
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
      description="See each tier's current reward lineup at a glance: revealed swag, officially promised rewards, live prize-slot availability, estimated remaining items, and historical context."
      updated="September 16, 2026"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="not-prose space-y-8">
        {latest ? (
          <section className="grid overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-50 via-white to-violet-50 shadow-md dark:from-cyan-950/20 dark:via-slate-950/80 dark:to-violet-950/20 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex min-h-48 items-center justify-center bg-white/50 p-4 dark:bg-black/10">
              <SwagArtwork
                src={latest.imageUrl}
                alt={latest.name}
                className="h-44 w-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-center p-5 sm:p-7">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-cyan-800 dark:bg-cyan-300/10 dark:text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> 2026 swag drop #{latest.dropNumber}
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                {latest.shortName}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {latest.summary}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {latest.tiers.map((tier) => (
                  <Link
                    key={tier}
                    href={swagTierPath(season, tier)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-700 hover:border-cyan-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  >
                    Arcade {tier}
                  </Link>
                ))}
                <Link
                  href={swagProductPath(season, latest.id)}
                  className="ml-0 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white dark:bg-cyan-300 dark:text-slate-950 sm:ml-2"
                >
                  Reward details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <a
                  href={latest.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
                >
                  Official announcement <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="tier-rewards-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="tier-rewards-heading"
                className="text-2xl font-bold text-slate-950 dark:text-white"
              >
                2026 rewards by tier
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                One row per tier: requirements and total capacity on the left, currently known rewards in the middle, and live remaining prize slots plus unrevealed swag on the right.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-[.08em]">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1.5 text-emerald-700 dark:bg-emerald-300/[0.05] dark:text-emerald-300">
                Revealed
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1.5 text-amber-700 dark:bg-amber-300/[0.05] dark:text-amber-300">
                Official pending
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                ≈ Historical estimate
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {ARCADE_SWAG_TIERS.map((tier) => (
              <TierRewardRow key={tier} tier={tier} />
            ))}
          </div>
        </section>

        <details className="group rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.025]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-sm font-semibold text-slate-800 marker:hidden dark:text-slate-100">
            <span>
              Why are package totals marked with ≈?
              <span className="ml-2 font-normal text-slate-500">
                View the 2025 baseline used for the projection
              </span>
            </span>
            <span className="text-xs text-slate-400 transition group-open:rotate-90">→</span>
          </summary>
          <div className="border-t border-slate-200 p-4 dark:border-white/10">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {ARCADE_SWAG_TIERS.map((tier) => (
                <div
                  key={tier}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <span className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-500">
                    Arcade {SWAG_TIER_META[tier].label}
                  </span>
                  <strong className="mt-1 block text-lg text-slate-950 dark:text-white">
                    {PREVIOUS_SEASON_COUNTS[tier]} items
                  </strong>
                  <span className="mt-0.5 block text-[10px] text-slate-500">
                    2025 Season 2 final
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>
                2026 estimates use this completed season plus Google&apos;s published Snowball relationships.
              </span>
              <a
                href={SWAG_2025_FINAL_REFERENCE_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
              >
                Official 2025 wrap-up <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </details>

        <section aria-labelledby="hall-heading">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
                <h2
                  id="hall-heading"
                  className="text-xl font-bold text-slate-950 dark:text-white"
                >
                  Hall of Swag Winners
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Verified community delivery photos from public Google Developer forum posts.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">
              Source opens on click
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {COMMUNITY_SWAG_GALLERY.map((item) => (
              <a
                key={item.sourceUrl}
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-cyan-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-[150px_1fr]"
              >
                <div className="h-32 overflow-hidden bg-slate-100 dark:bg-black/20 sm:h-full sm:min-h-28">
                  <SwagArtwork
                    src={item.imageUrl}
                    alt={`${item.title} shared by ${item.author}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex min-w-0 items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-slate-950 dark:text-white">
                      {item.title}
                    </strong>
                    <span className="mt-1 block text-xs text-slate-500">{item.subtitle}</span>
                    <span className="mt-2 block text-[10px] font-semibold text-slate-500">
                      Shared by {item.author}
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                </div>
              </a>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-[11px] text-slate-500 dark:border-white/10 dark:text-slate-400">
          <span>
            Named 2026 rewards come only from official Google Developer forum announcements. Live prize-slot counts come from the same automated crawler feed used by the calculator. Totals marked ≈ are projections, not confirmed counts.
          </span>
          <div className="flex flex-wrap gap-3 font-semibold">
            <a
              href="https://discuss.google.dev/t/google-skills-arcade-2026-tiers/371066"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-cyan-700 hover:underline dark:text-cyan-300"
            >
              2026 tiers <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
            <a
              href="https://discuss.google.dev/t/swag-drop-the-arcade-weather-shield-jacket/397353"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-cyan-700 hover:underline dark:text-cyan-300"
            >
              2026 Snowball rules <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </InternalPageShell>
  )
}
