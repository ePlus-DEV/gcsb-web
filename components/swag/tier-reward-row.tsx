import { PREVIOUS_SEASON_COUNTS, TIER_START_POINTS, OFFICIAL_UNNAMED_REWARDS, TIER_TONE } from "./reward-model"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import LiveTierSlots from "@/components/arcade/live-tier-slots"
import SwagArtwork from "@/components/arcade/swag-artwork"
import { getSwagDropsForTier, type ArcadeSwagDrop, type ArcadeSwagTier } from "@/components/arcade/swag-drops"
import { CURRENT_SWAG_SEASON, SWAG_TIER_META, swagProductPath, swagTierPath } from "@/components/arcade/swag-seasons"

const season = CURRENT_SWAG_SEASON

function revealedRelationship(tier: ArcadeSwagTier, drop: ArcadeSwagDrop): string {
  if (tier === "legend" && drop.tiers.includes("champion")) {
    return "Included with the Champion collection"
  }
  if (tier === "ranger" && drop.tiers.includes("trooper")) {
    return "Inherited from the Trooper pack"
  }
  return `2026 swag drop #${drop.dropNumber}`
}

export default function TierRewardRow({ tier }: { tier: ArcadeSwagTier }) {
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
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 lg:pt-1">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${tone.badge}`}
          >
            Arcade {meta.label}
          </span>
          <h3 className="mt-2 text-xl font-bold text-foreground">
            {meta.pointsLabel}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {`${meta.slots.toLocaleString("en-US")} total prize slots`}
          </p>
        </div>

        <div className="min-w-0 lg:border-l lg:border-slate-200 lg:pl-5 dark:lg:border-white/10">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">
              Current reward lineup
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {`${knownCount} known now · ≈${projectedMystery} still unrevealed`}
            </span>
          </div>

          {drops.length + promised.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {drops.map((drop) => (
                <Link
                  key={drop.id}
                  href={swagProductPath(season, drop.id)}
                  className="group flex min-w-[240px] flex-1 items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 transition hover:border-emerald-300 dark:border-emerald-300/15 dark:bg-emerald-300/[0.04]"
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
                    <strong className="mt-0.5 block truncate text-sm text-foreground">
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
                  className="flex min-w-[240px] flex-1 items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 dark:border-amber-300/15 dark:bg-amber-300/[0.04]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[9px] font-bold uppercase tracking-[.1em] text-amber-700 dark:text-amber-300">
                      Officially promised
                    </span>
                    <strong className="mt-0.5 block truncate text-sm text-foreground">
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
      </div>

      <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-white/10 dark:bg-black/10 sm:px-5">
        <div className="grid items-center gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.35fr)_minmax(115px,.7fr)_minmax(115px,.7fr)_minmax(150px,.9fr)_auto]">
          <LiveTierSlots
            points={TIER_START_POINTS[tier]}
            totalSlots={meta.slots}
            compact
          />

          <div className="min-w-0 lg:border-l lg:border-slate-200 lg:pl-4 dark:lg:border-white/10">
            <span className="block text-[9px] font-bold uppercase tracking-[.1em] text-muted-foreground">
              Projected package
            </span>
            <strong className="mt-0.5 block text-base text-foreground">
              {`≈${meta.historicalEstimateItems} items`}
            </strong>
            <span className="block text-[10px] text-slate-500">
              {`2025 baseline: ${PREVIOUS_SEASON_COUNTS[tier]}`}
            </span>
          </div>

          <div className="min-w-0 lg:border-l lg:border-slate-200 lg:pl-4 dark:lg:border-white/10">
            <span className="block text-[9px] font-bold uppercase tracking-[.1em] text-muted-foreground">
              Known now
            </span>
            <strong className="mt-0.5 block text-base text-foreground">
              {knownCount}
            </strong>
            <span className="block text-[10px] text-slate-500">
              {`${drops.length} revealed · ${promised.length} pending`}
            </span>
          </div>

          <div className="min-w-0 lg:border-l lg:border-slate-200 lg:pl-4 dark:lg:border-white/10">
            <div className="flex items-end justify-between gap-2">
              <div>
                <span className="block whitespace-nowrap text-[9px] font-bold uppercase tracking-[.1em] text-muted-foreground">
                  Swag still unrevealed
                </span>
                <strong className="mt-0.5 block text-base text-foreground">
                  ≈{projectedMystery}
                </strong>
              </div>
              <span className="text-[10px] text-slate-500">
                {knownCount}/{meta.historicalEstimateItems}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/5">
              <div
                className={`h-full rounded-full ${tone.progress}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Link
            href={swagTierPath(season, tier)}
            className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-cyan-300 dark:hover:bg-cyan-300/[0.05]"
          >
            Details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}

