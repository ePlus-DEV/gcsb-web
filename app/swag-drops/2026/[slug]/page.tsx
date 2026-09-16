import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, CheckCircle2, ExternalLink, Sparkles, Trophy } from "lucide-react"
import SwagArtwork from "@/components/arcade/swag-artwork"
import {
  ARCADE_SWAG_TIERS,
  getSwagDrop,
  getSwagDropsForSeason,
  getSwagDropsForTier,
  type ArcadeSwagTier,
} from "@/components/arcade/swag-drops"
import {
  CURRENT_SWAG_SEASON,
  SWAG_2025_FINAL_REFERENCE_URL,
  SWAG_TIER_META,
  swagProductPath,
  swagSeasonPath,
  swagTierPath,
} from "@/components/arcade/swag-seasons"
import InternalPageShell from "@/components/site/internal-page-shell"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"

const season = CURRENT_SWAG_SEASON

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return [
    ...ARCADE_SWAG_TIERS.map((slug) => ({ slug })),
    ...getSwagDropsForSeason(season).map((drop) => ({ slug: drop.id })),
  ]
}

function isTier(slug: string): slug is ArcadeSwagTier {
  return ARCADE_SWAG_TIERS.includes(slug as ArcadeSwagTier)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (isTier(slug)) {
    const meta = SWAG_TIER_META[slug]
    const canonical = new URL(swagTierPath(season, slug), WEBSITE_SITE_URL).toString()
    return {
      title: meta.title,
      description: meta.description,
      alternates: { canonical },
      openGraph: { title: meta.title, description: meta.description, url: canonical, type: "website" },
      twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
    }
  }

  const drop = getSwagDrop(season, slug)
  if (!drop) return {}

  const title = `Google Skills Arcade ${drop.shortName} ${season}`
  const description = `${drop.summary} See eligible ${season} tiers, reveal date, features, and the official Google announcement.`
  const canonical = new URL(swagProductPath(season, drop.id), WEBSITE_SITE_URL).toString()
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: [{ url: drop.imageUrl, alt: drop.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [drop.imageUrl] },
  }
}

function BreadcrumbJsonLd({ label, path }: { label: string; path: string }) {
  const data = {
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
        item: new URL(swagSeasonPath(season), WEBSITE_SITE_URL).toString(),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: label,
        item: new URL(path, WEBSITE_SITE_URL).toString(),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

function TierPage({ tier }: { tier: ArcadeSwagTier }) {
  const meta = SWAG_TIER_META[tier]
  const drops = getSwagDropsForTier(tier, season)
  const pending = meta.officialPendingRewards
  const knownNow = drops.length + pending.length
  const projectedRemaining = Math.max(meta.historicalEstimateItems - knownNow, 0)
  const path = swagTierPath(season, tier)

  return (
    <InternalPageShell
      eyebrow={`Arcade ${meta.label} · ${season}`}
      title={`Arcade ${meta.label} ${season} rewards`}
      description={`See the current ${season} ${meta.label} reward outlook, revealed swag, officially promised items, projected package size, and the official 2025 package used as a historical reference.`}
      updated="September 16, 2026"
    >
      <BreadcrumbJsonLd label={`Arcade ${meta.label}`} path={path} />

      <div className="not-prose space-y-8">
        <section className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-50 via-white to-violet-50 shadow-sm dark:from-cyan-950/20 dark:via-slate-950/80 dark:to-violet-950/20">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-cyan-800 dark:bg-cyan-300/10 dark:text-cyan-200">
                {season} package outlook
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {meta.historicalEstimateLabel} projected rewards
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {meta.rewardRule}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  {meta.pointsLabel}
                </span>
                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  {meta.slots.toLocaleString("en-US")} prize slots
                </span>
                <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-violet-700 dark:border-violet-300/15 dark:bg-violet-300/[0.04] dark:text-violet-200">
                  Historical projection, not final 2026 total
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 dark:border-emerald-300/15 dark:bg-white/[0.04]">
                <span className="block text-[9px] font-bold uppercase tracking-[.1em] text-emerald-700 dark:text-emerald-300">
                  Revealed
                </span>
                <strong className="mt-1 block text-2xl text-slate-950 dark:text-white">{drops.length}</strong>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-white/80 p-4 dark:border-amber-300/15 dark:bg-white/[0.04]">
                <span className="block text-[9px] font-bold uppercase tracking-[.1em] text-amber-700 dark:text-amber-300">
                  Official pending
                </span>
                <strong className="mt-1 block text-2xl text-slate-950 dark:text-white">{pending.length}</strong>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <span className="block text-[9px] font-bold uppercase tracking-[.1em] text-slate-500">
                  Est. remaining
                </span>
                <strong className="mt-1 block text-2xl text-slate-950 dark:text-white">≈{projectedRemaining}</strong>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="current-lineup-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="current-lineup-heading" className="text-2xl font-bold text-slate-950 dark:text-white">
                What we know about the {season} package
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Revealed rewards and officially promised items are separated from the historical projection.
              </p>
            </div>
            <Link
              href={swagSeasonPath(season)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
            >
              Compare all tiers <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {drops.map((drop) => (
              <Link
                key={drop.id}
                href={swagProductPath(season, drop.id)}
                className="group flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 transition hover:border-emerald-300 hover:shadow-md dark:border-emerald-300/15 dark:bg-emerald-300/[0.04]"
              >
                <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-black/20">
                  <SwagArtwork src={drop.imageUrl} alt="" className="h-full w-full object-contain" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[.1em] text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Revealed
                  </span>
                  <strong className="mt-1 block text-base text-slate-950 dark:text-white">{drop.shortName}</strong>
                  <span className="mt-1 block text-xs text-slate-500">2026 drop #{drop.dropNumber} · {drop.revealedOn}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            ))}

            {pending.map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-300/15 dark:bg-amber-300/[0.04]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[.1em] text-amber-700 dark:text-amber-300">
                    Officially promised
                  </span>
                  <strong className="mt-1 block text-sm text-slate-950 dark:text-white">{item}</strong>
                  <span className="mt-1 block text-xs text-slate-500">Name/details not revealed yet</span>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.02]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-slate-300 text-lg font-bold text-slate-400 dark:border-white/10">
                ?
              </span>
              <span className="mt-3 block text-[9px] font-bold uppercase tracking-[.1em] text-slate-500">
                Historical projection
              </span>
              <strong className="mt-1 block text-base text-slate-800 dark:text-slate-100">
                ≈{projectedRemaining} more item{projectedRemaining === 1 ? "" : "s"} still unrevealed
              </strong>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Google has not published these 2026 item names. The count only reflects the prior-season package-size baseline.
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-5 dark:border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[.12em] text-violet-700 dark:text-violet-300">
                Historical reference only
              </span>
              <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
                2025 {meta.label} package
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                These were the official final 2025 Season 2 items for this tier. They explain the {meta.historicalEstimateLabel} projection, but they are not confirmed as 2026 rewards.
              </p>
            </div>
            <a
              href={SWAG_2025_FINAL_REFERENCE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
            >
              Official 2025 wrap-up <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3 dark:bg-white/10">
            {meta.historicalReferenceItems.map((item, index) => (
              <div key={item} className="flex items-center gap-3 bg-white p-4 dark:bg-slate-950/70">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-bold text-violet-700 dark:bg-violet-300/10 dark:text-violet-200">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5 dark:border-violet-300/15 dark:bg-violet-300/[0.04]">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-violet-700 dark:text-violet-300" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">2026 package rule</h2>
            </div>
            <strong className="mt-3 block text-base text-slate-950 dark:text-white">{meta.packageRule}</strong>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{meta.knownMinimumNote}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.035]">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Waterfall allocation</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{meta.allocationNote}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Prize slots are recipient capacity, not a published physical inventory count for each swag item.
            </p>
          </article>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href={swagSeasonPath(season)} className="text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300">
            ← All {season} rewards
          </Link>
          <a
            href="https://discuss.google.dev/t/google-skills-arcade-2026-tiers/371066"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
          >
            Official tier announcement <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <a
            href="https://discuss.google.dev/t/swag-drop-the-arcade-weather-shield-jacket/397353"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
          >
            Official Snowball rules <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </InternalPageShell>
  )
}

function ProductPage({ slug }: { slug: string }) {
  const drop = getSwagDrop(season, slug)
  if (!drop) notFound()
  const path = swagProductPath(season, drop.id)
  const combinedPrizeSlotCapacity = drop.tiers.reduce(
    (total, tier) => total + SWAG_TIER_META[tier].slots,
    0,
  )

  return (
    <InternalPageShell
      eyebrow={`Arcade ${season} swag drop #${drop.dropNumber}`}
      title={drop.name}
      description={drop.summary}
      updated={drop.revealedOn}
    >
      <BreadcrumbJsonLd label={drop.shortName} path={path} />

      <div className="not-prose space-y-8">
        <section className="grid overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-50 via-white to-violet-50 dark:from-cyan-950/20 dark:via-slate-950/80 dark:to-violet-950/20 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex min-h-72 items-center justify-center bg-white/50 p-6 dark:bg-black/10">
            <SwagArtwork src={drop.imageUrl} alt={drop.name} className="h-72 w-full object-contain" />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-100 px-3 py-1.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-300/10 dark:text-cyan-200">
                2026 swag drop #{drop.dropNumber}
              </span>
              {drop.dropNumber === 1 ? (
                <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-800 dark:bg-violet-300/10 dark:text-violet-200">
                  First 2026 swag drop
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-sm font-semibold text-cyan-700 dark:text-cyan-300">Revealed {drop.revealedOn}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{drop.shortName}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{drop.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {drop.tiers.map((tier) => (
                <Link
                  key={tier}
                  href={swagTierPath(season, tier)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-cyan-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  Arcade {SWAG_TIER_META[tier].label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Features announced for this reward</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {drop.features.map((feature) => (
              <li key={feature} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-300" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.025]">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Eligible tiers</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {drop.tiers.map((tier) => (
                <Link
                  key={tier}
                  href={swagTierPath(season, tier)}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-cyan-300 dark:border-white/10 dark:bg-white/[0.035]"
                >
                  <span className="text-xs font-bold uppercase tracking-[.1em] text-cyan-700 dark:text-cyan-300">Arcade {SWAG_TIER_META[tier].label}</span>
                  <strong className="mt-1 block text-lg text-slate-950 dark:text-white">{SWAG_TIER_META[tier].slots.toLocaleString("en-US")} slots</strong>
                </Link>
              ))}
            </div>
          </article>
          <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-300/15 dark:bg-amber-300/[0.035]">
            <span className="text-xs font-bold uppercase tracking-[.12em] text-amber-700 dark:text-amber-300">Combined prize-slot capacity</span>
            <strong className="mt-2 block text-3xl text-slate-950 dark:text-white">{combinedPrizeSlotCapacity.toLocaleString("en-US")}</strong>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Maximum recipient capacity across the eligible tier pools. This is not a published stock count for the physical item.
            </p>
          </article>
        </section>

        <div className="flex flex-wrap gap-4">
          <a
            href={drop.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-cyan-300 dark:text-slate-950"
          >
            Official Google reveal <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link href={swagSeasonPath(season)} className="inline-flex items-center gap-2 px-2 py-2.5 text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300">
            All {season} rewards <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </InternalPageShell>
  )
}

export default async function SwagDetailPage({ params }: Props) {
  const { slug } = await params
  if (isTier(slug)) return <TierPage tier={slug} />
  if (getSwagDrop(season, slug)) return <ProductPage slug={slug} />
  notFound()
}
