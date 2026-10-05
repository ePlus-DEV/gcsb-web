import BreadcrumbJsonLd from "./breadcrumb-json-ld"
import { TIER_START_POINTS } from "./reward-model"
import ContentCard from "@/components/site/content-card"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react"
import LiveTierSlots from "@/components/arcade/live-tier-slots"
import SwagArtwork from "@/components/arcade/swag-artwork"
import { getSwagDrop } from "@/components/arcade/swag-drops"
import { CURRENT_SWAG_SEASON, SWAG_TIER_META, swagProductPath, swagSeasonPath, swagTierPath } from "@/components/arcade/swag-seasons"
import InternalPageShell from "@/components/site/internal-page-shell"

const season = CURRENT_SWAG_SEASON



export default function ProductPage({ slug }: { slug: string }) {
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
        <section className="grid overflow-hidden rounded-[var(--ui-radius-lg)] border border-cyan-300/20 bg-gradient-to-br from-cyan-50 via-white to-violet-50 dark:from-cyan-950/20 dark:via-slate-950/80 dark:to-violet-950/20 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex min-h-72 items-center justify-center bg-white/50 p-6 dark:bg-black/10">
            <SwagArtwork src={drop.imageUrl} alt={drop.name} className="h-72 w-full object-contain" />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-100 px-3 py-1.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-300/10 dark:text-cyan-200">
                {`${season} swag drop #${drop.dropNumber}`}
              </span>
              {drop.dropNumber === 1 ? (
                <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-800 dark:bg-violet-300/10 dark:text-violet-200">
                  First 2026 swag drop
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-sm font-semibold text-cyan-700 dark:text-cyan-300">{`Revealed ${drop.revealedOn}`}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{drop.shortName}</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{drop.summary}</p>
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
          <h2 className="text-2xl font-bold text-foreground">Features announced for this reward</h2>
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
          <ContentCard className="p-5">
            <h2 className="text-lg font-bold text-foreground">Eligible tiers & live availability</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {drop.tiers.map((tier) => (
                <div
                  key={tier}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.035]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={swagTierPath(season, tier)}
                      className="text-xs font-bold uppercase tracking-[.1em] text-cyan-700 hover:underline dark:text-cyan-300"
                    >
                      Arcade {SWAG_TIER_META[tier].label}
                    </Link>
                    <span className="text-[10px] text-slate-400">
                      {SWAG_TIER_META[tier].pointsLabel}
                    </span>
                  </div>
                  <div className="mt-3">
                    <LiveTierSlots
                      points={TIER_START_POINTS[tier]}
                      totalSlots={SWAG_TIER_META[tier].slots}
                      compact
                    />
                  </div>
                </div>
              ))}
            </div>
          </ContentCard>
          <article className="rounded-[var(--ui-radius-lg)] border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-300/15 dark:bg-amber-300/[0.035]">
            <span className="text-xs font-bold uppercase tracking-[.12em] text-amber-700 dark:text-amber-300">Combined prize-slot capacity</span>
            <strong className="mt-2 block text-3xl text-foreground">{combinedPrizeSlotCapacity.toLocaleString("en-US")}</strong>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Maximum recipient capacity across the eligible tier pools. Live remaining counts are shown per tier because the pools fill independently. This is not a published stock count for the physical item.
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
            {`All ${season} rewards`} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </InternalPageShell>
  )
}

