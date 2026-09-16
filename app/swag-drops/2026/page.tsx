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
  "Google Skills Arcade 2026 rewards by tier, confirmed swag drops, historical package-size estimates, and community swag photos."
const canonical = new URL(`/swag-drops/${season}/`, WEBSITE_SITE_URL).toString()

const PREVIOUS_SEASON_COUNTS: Record<ArcadeSwagTier, number> = {
  trooper: 5,
  ranger: 5,
  champion: 6,
  legend: 7,
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

function TierSnapshot({ tier }: { tier: ArcadeSwagTier }) {
  const meta = SWAG_TIER_META[tier]
  const drops = getSwagDropsForTier(tier, season)
  const waiting = Math.max(meta.historicalEstimateItems - drops.length, 0)

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-400/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-cyan-700 dark:text-cyan-300">
            Arcade {meta.label}
          </span>
          <h3 className="mt-1.5 text-lg font-bold text-slate-950 dark:text-white">
            {meta.pointsLabel}
          </h3>
        </div>
        <Link
          href={swagTierPath(season, tier)}
          aria-label={`View Arcade ${meta.label} ${season} rewards`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-white/10"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/70 p-3 dark:border-violet-300/15 dark:bg-violet-300/[0.04]">
        <span className="block text-[10px] font-bold uppercase tracking-[.12em] text-violet-700 dark:text-violet-300">
          Projected package
        </span>
        <div className="mt-1 flex items-end justify-between gap-2">
          <strong className="text-2xl text-slate-950 dark:text-white">
            {meta.historicalEstimateLabel}
          </strong>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            estimate
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-emerald-50 px-2 py-2.5 dark:bg-emerald-300/[0.04]">
          <span className="block text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Named</span>
          <strong className="mt-1 block text-sm text-slate-950 dark:text-white">{drops.length}</strong>
        </div>
        <div className="rounded-lg bg-amber-50 px-2 py-2.5 dark:bg-amber-300/[0.04]">
          <span className="block text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Waiting</span>
          <strong className="mt-1 block text-sm text-slate-950 dark:text-white">≈{waiting}</strong>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-2.5 dark:bg-white/[0.035]">
          <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-500">Slots</span>
          <strong className="mt-1 block text-sm text-slate-950 dark:text-white">
            {meta.slots.toLocaleString("en-US")}
          </strong>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
        2025 final package: {PREVIOUS_SEASON_COUNTS[tier]} items. {meta.packageRule}.
      </p>

      <Link
        href={swagTierPath(season, tier)}
        className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
      >
        View {meta.label} details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
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
      description="See the 2026 tier packages at a glance, track every named swag drop, compare with the final 2025 packages, and browse community winner photos."
      updated="September 16, 2026"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="not-prose space-y-12">
        {latest ? (
          <section className="grid overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-50 via-white to-violet-50 shadow-lg dark:from-cyan-950/20 dark:via-slate-950/80 dark:to-violet-950/20 lg:grid-cols-[0.9fr_1.1fr]">
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
                  Official announcement <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="tier-snapshot-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 id="tier-snapshot-heading" className="text-2xl font-bold text-slate-950 dark:text-white">2026 tier snapshot</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Projected package size, named rewards, estimated unrevealed items, and prize slots in one view.
              </p>
            </div>
            <a
              href={SWAG_2025_FINAL_REFERENCE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden shrink-0 items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300 sm:inline-flex"
            >
              2025 baseline <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ARCADE_SWAG_TIERS.map((tier) => <TierSnapshot key={tier} tier={tier} />)}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.025]">Trooper → Ranger: +1 bonus</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.025]">Champion → Legend: +1 exclusive</span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-800 dark:border-amber-300/15 dark:bg-amber-300/[0.035] dark:text-amber-200">Estimates are not confirmed 2026 totals</span>
          </div>
        </section>

        <section aria-labelledby="revealed-heading">
          <div className="mb-5">
            <h2 id="revealed-heading" className="text-2xl font-bold text-slate-950 dark:text-white">2026 revealed swag</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Only named rewards publicly announced by Google appear here.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {drops.map((drop) => (
              <Link
                key={drop.id}
                href={swagProductPath(season, drop.id)}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.035]"
              >
                <div className="flex h-48 items-center justify-center bg-slate-50 p-4 dark:bg-black/10">
                  <SwagArtwork src={drop.imageUrl} alt={drop.name} className="h-full w-full object-contain" />
                </div>
                <div className="p-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Drop #{drop.dropNumber} revealed
                  </span>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <strong className="text-base text-slate-950 dark:text-white">{drop.shortName}</strong>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{drop.tiers.map((tier) => `Arcade ${SWAG_TIER_META[tier].label}`).join(" · ")}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="past-season-heading" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="past-season-heading" className="text-xl font-bold text-slate-950 dark:text-white">2025 final package reference</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The closest official completed season used for the 2026 projections.</p>
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
              <div key={tier} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">Arcade {SWAG_TIER_META[tier].label}</span>
                <strong className="mt-1 block text-xl text-slate-950 dark:text-white">{PREVIOUS_SEASON_COUNTS[tier]} items</strong>
                <span className="mt-1 block text-xs text-slate-500">2025 Season 2 final</span>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="hall-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
                <h2 id="hall-heading" className="text-2xl font-bold text-slate-950 dark:text-white">Hall of Swag Winners</h2>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Real community delivery photos sourced from public Google Developer forum posts. Each card links back to the original post.
              </p>
            </div>
          </div>

          <div className="columns-1 gap-4 md:columns-2">
            {COMMUNITY_SWAG_GALLERY.map((item) => (
              <a
                key={item.sourceUrl}
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.035]"
              >
                <div className="overflow-hidden bg-slate-100 dark:bg-black/20">
                  <SwagArtwork
                    src={item.imageUrl}
                    alt={`${item.title} shared by ${item.author}`}
                    className="h-auto w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="block text-sm text-slate-950 dark:text-white">{item.title}</strong>
                      <span className="mt-1 block text-xs text-slate-500">{item.subtitle}</span>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  </div>
                  <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">Shared by {item.author}</span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-white/[0.025] dark:text-slate-400">
            Gallery entries are intentionally limited to public posts with a traceable source. More verified community photos can be added without copying another site&apos;s gallery assets.
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
