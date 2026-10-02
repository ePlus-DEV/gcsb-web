import ContentLink from "@/components/site/content-link"
import TierRewardRow from "./tier-reward-row"
import { PREVIOUS_SEASON_COUNTS } from "./reward-model"
import Link from "next/link"
import { ArrowRight, ExternalLink, Sparkles, Trophy } from "lucide-react"
import SwagArtwork from "@/components/arcade/swag-artwork"
import { ARCADE_SWAG_TIERS, getSwagDropsForSeason } from "@/components/arcade/swag-drops"
import { CURRENT_SWAG_SEASON, SWAG_2025_FINAL_REFERENCE_URL, SWAG_TIER_META, swagProductPath, swagTierPath } from "@/components/arcade/swag-seasons"
import InternalPageShell from "@/components/site/internal-page-shell"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"

const season = CURRENT_SWAG_SEASON
const canonical = new URL(`/swag-drops/${season}/`, WEBSITE_SITE_URL).toString()

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
      updated="September 24, 2026"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="not-prose space-y-8">
        {latest ? (
          <section className="grid overflow-hidden rounded-[var(--ui-radius-lg)] border border-cyan-300/20 bg-gradient-to-br from-cyan-50 via-white to-violet-50 shadow-md dark:from-cyan-950/20 dark:via-slate-950/80 dark:to-violet-950/20 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex min-h-48 items-center justify-center bg-white/50 p-4 dark:bg-black/10">
              <SwagArtwork
                src={latest.imageUrl}
                alt={latest.name}
                className="h-44 w-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-center p-5 sm:p-7">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-cyan-800 dark:bg-cyan-300/10 dark:text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {`${season} swag drop #${latest.dropNumber}`}
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {latest.shortName}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
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
                <ContentLink
                  href={swagProductPath(season, latest.id)}
                >
                  Reward details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </ContentLink>
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
                className="text-2xl font-bold text-foreground"
              >
                2026 rewards by tier
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                Reward names stay prominent, while live prize slots and package progress sit in a separate status bar underneath each tier.
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

        <details className="site-surface group rounded-[var(--ui-radius-lg)] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.025]">
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
                  <strong className="mt-1 block text-lg text-foreground">
                    {`${PREVIOUS_SEASON_COUNTS[tier]} items`}
                  </strong>
                  <span className="mt-0.5 block text-[10px] text-slate-500">
                    2025 Season 2 final
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
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
                  className="text-xl font-bold text-foreground"
                >
                  Hall of Swag Winners
                </h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
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
                className="group grid overflow-hidden rounded-[var(--ui-radius-lg)] border border-slate-200 bg-white transition hover:border-cyan-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-[132px_1fr]"
              >
                <div className="h-28 overflow-hidden bg-slate-100 dark:bg-black/20 sm:h-full sm:min-h-24">
                  <SwagArtwork
                    src={item.imageUrl}
                    alt={`${item.title} shared by ${item.author}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex min-w-0 items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-foreground">
                      {item.title}
                    </strong>
                    <span className="mt-1 block text-xs text-slate-500">{item.subtitle}</span>
                    <span className="mt-1.5 block text-[10px] font-semibold text-slate-500">
                      {`Shared by ${item.author}`}
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
            Named 2026 rewards come only from official Google Developer forum announcements. Live prize-slot counts use the same continuously updated data source as the calculator. Totals marked ≈ are projections, not confirmed counts.
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
