import type { Metadata } from "next"
import {
  CheckCircle2,
  ExternalLink,
  Gift,
  Info,
  Layers3,
  Trophy,
} from "lucide-react"
import SwagArtwork from "@/components/arcade/swag-artwork"
import {
  ARCADE_SWAG_DROPS,
  getSwagDropsForTier,
  type ArcadeSwagTier,
} from "@/components/arcade/swag-drops"
import {
  OFFICIAL_MILESTONES,
  formatInteger,
  tierRangeLabel,
} from "@/components/arcade/model"
import InternalPageShell from "@/components/site/internal-page-shell"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"

const title = "Google Skills Arcade 2026 Swag Drops by Tier"
const description =
  "Track confirmed Google Skills Arcade 2026 swag reveals by Trooper, Ranger, Champion, and Legend tier without mixing in previous-season rewards."
const canonical = new URL("/swag-drops/", WEBSITE_SITE_URL).toString()

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

const TIER_DETAILS: Record<
  ArcadeSwagTier,
  { rule: string; accent: string; badge: string }
> = {
  trooper: {
    rule: "Google describes Trooper as the foundational core swag pack. Individual 2026 items for this tier have not been revealed yet.",
    accent: "border-amber-300/40 bg-amber-50/70 dark:border-amber-300/15 dark:bg-amber-300/[0.04]",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-300/10 dark:text-amber-200",
  },
  ranger: {
    rule: "Ranger includes the Trooper swag pack plus an additional bonus reward. Individual 2026 Ranger items have not been revealed yet.",
    accent: "border-emerald-300/40 bg-emerald-50/70 dark:border-emerald-300/15 dark:bg-emerald-300/[0.04]",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-200",
  },
  champion: {
    rule: "Champion starts the upper-tier collection. Google notes that Trooper and Ranger rewards do not snowball into Champion or Legend.",
    accent: "border-violet-300/40 bg-violet-50/70 dark:border-violet-300/15 dark:bg-violet-300/[0.04]",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-300/10 dark:text-violet-200",
  },
  legend: {
    rule: "Legend includes the Champion collection plus an exclusive Legend-only reward at the top of the tier system.",
    accent: "border-cyan-300/40 bg-cyan-50/70 dark:border-cyan-300/15 dark:bg-cyan-300/[0.04]",
    badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-300/10 dark:text-cyan-200",
  },
}

function tierKey(league: string): ArcadeSwagTier {
  return league.replace("Arcade ", "").toLowerCase() as ArcadeSwagTier
}

export default function SwagDropsPage() {
  const latest = ARCADE_SWAG_DROPS[0]

  return (
    <InternalPageShell
      eyebrow="Arcade 2026 rewards"
      title="Swag drops by tier"
      description="A verified view of the rewards Google has actually revealed for the 2026 Arcade season, grouped by prize tier. Unannounced items stay unannounced instead of being filled with last year's swag."
      updated="September 16, 2026"
    >
      <div className="not-prose space-y-10">
        {latest ? (
          <section className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-50 via-white to-violet-50 shadow-xl shadow-cyan-950/5 dark:from-cyan-950/20 dark:via-slate-950/80 dark:to-violet-950/20 dark:shadow-black/20">
            <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="flex min-h-72 items-center justify-center bg-white/55 p-6 dark:bg-black/15 sm:p-10">
                <SwagArtwork
                  src={latest.imageUrl}
                  alt={latest.name}
                  className="h-64 w-full object-contain sm:h-80"
                />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-10">
                <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-cyan-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.12em] text-cyan-800 dark:bg-cyan-300/10 dark:text-cyan-200">
                  <Gift className="h-4 w-4" aria-hidden="true" /> First confirmed 2026 drop
                </span>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Revealed {latest.revealedOn}
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  {latest.shortName}
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                  {latest.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {latest.tiers.map((tier) => (
                    <span
                      key={tier}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold capitalize text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                      Arcade {tier}
                    </span>
                  ))}
                </div>
                <ul className="mt-6 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                  {latest.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-300" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={latest.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                >
                  Official reveal <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="tier-rewards-heading">
          <div className="mb-5 flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-300/10 dark:text-violet-200">
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="tier-rewards-heading" className="text-2xl font-bold text-slate-950 dark:text-white">
                2026 rewards by level
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Confirmed drops are listed below. Empty tiers are intentionally left as not yet revealed.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {OFFICIAL_MILESTONES.map((milestone) => {
              const key = tierKey(milestone.league)
              const drops = getSwagDropsForTier(key)
              const details = TIER_DETAILS[key]

              return (
                <article
                  key={milestone.points}
                  className={`rounded-2xl border p-5 shadow-sm ${details.accent}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${details.badge}`}>
                        {milestone.league.replace("Arcade ", "")}
                      </span>
                      <h3 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">
                        {tierRangeLabel(milestone)}
                      </h3>
                    </div>
                    <div className="text-right">
                      <strong className="block text-lg text-slate-950 dark:text-white">
                        {formatInteger(milestone.slots)}
                      </strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400">prize slots</span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {details.rule}
                  </p>

                  <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-white/10">
                    {drops.length > 0 ? (
                      <div className="space-y-3">
                        {drops.map((drop) => (
                          <a
                            key={drop.id}
                            href={drop.sourceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 transition hover:border-cyan-300 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-cyan-400/40"
                          >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-black/20">
                              <SwagArtwork
                                src={drop.imageUrl}
                                alt=""
                                className="h-full w-full object-contain"
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <strong className="block truncate text-sm text-slate-950 dark:text-white">
                                {drop.shortName}
                              </strong>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Revealed {drop.revealedOn}
                              </span>
                            </span>
                            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white/45 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.025] dark:text-slate-400">
                        <Gift className="h-5 w-5 shrink-0" aria-hidden="true" />
                        No individual 2026 swag item has been publicly revealed for this tier yet.
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.035]">
            <div className="flex items-center gap-2 text-slate-950 dark:text-white">
              <Layers3 className="h-5 w-5 text-violet-600 dark:text-violet-300" aria-hidden="true" />
              <h2 className="text-lg font-bold">Snowball: what is inside each reward tier</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Ranger builds on Trooper. Legend builds on Champion. Google explicitly says the Trooper/Ranger reward family does not snowball into the Champion/Legend reward family.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.035]">
            <div className="flex items-center gap-2 text-slate-950 dark:text-white">
              <Info className="h-5 w-5 text-cyan-600 dark:text-cyan-300" aria-hidden="true" />
              <h2 className="text-lg font-bold">Waterfall: who gets a prize slot</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Waterfall is a separate allocation rule. If a higher tier fills, eligible players roll down to the next prize pool. It should not be confused with the swag bundle inheritance above.
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.025]">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Sources and update policy</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Google Developer forum announcements are treated as the source of truth. Community trackers are useful secondary references, but they can lag behind a new reveal. This page only adds a 2026 item after Google has publicly announced it.
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
              href={latest?.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-cyan-700 hover:underline dark:text-cyan-300"
            >
              Latest official swag drop <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <a
              href="https://arcadepoints.vercel.app/swag-drops"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:underline dark:text-slate-400"
            >
              Community swag reference <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </InternalPageShell>
  )
}
