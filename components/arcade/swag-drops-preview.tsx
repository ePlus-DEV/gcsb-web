"use client"

import Link from "next/link"
import { ArrowRight, Trophy } from "lucide-react"
import { createPortal } from "react-dom"
import SwagArtwork from "@/components/arcade/swag-artwork"
import { ARCADE_SWAG_DROPS } from "@/components/arcade/swag-drops"
import { CURRENT_SWAG_SEASON, swagSeasonPath } from "@/components/arcade/swag-seasons"
import { usePortalTarget } from "@/components/use-portal-target"

export default function SwagDropsPreview() {
  const tierPanel = usePortalTarget(".tier-list-panel")
  const emptyDashboard = usePortalTarget(".dashboard-empty-state")
  const target = tierPanel ?? emptyDashboard
  const latest = ARCADE_SWAG_DROPS.find((drop) => drop.season === CURRENT_SWAG_SEASON)

  if (!target || !latest) return null

  return createPortal(
    <div
      className={
        tierPanel
          ? "swag-drops-preview mt-5"
          : "swag-drops-preview mx-auto mt-6 w-full max-w-5xl px-4 sm:px-0"
      }
    >
      <Link
        href={swagSeasonPath(CURRENT_SWAG_SEASON)}
        aria-label={`Open ${latest.name}`}
        className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-cyan-50/70 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg dark:border-white/10 dark:from-slate-950/80 dark:to-cyan-950/20 dark:hover:border-cyan-400/40 sm:grid-cols-[116px_1fr]"
      >
        <div className="flex min-h-28 items-center justify-center bg-slate-100/80 p-3 dark:bg-black/20">
          <SwagArtwork
            src={latest.imageUrl}
            alt={latest.name}
            className="h-24 w-full object-contain"
          />
        </div>
        <div className="flex min-w-0 items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> {CURRENT_SWAG_SEASON}
            </span>
            <strong className="block truncate text-base text-slate-950 dark:text-white">
              {latest.shortName}
            </strong>
            <span className="mt-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              {latest.tiers
                .map((tier) => `Arcade ${tier.charAt(0).toUpperCase() + tier.slice(1)}`)
                .join(" · ")}
            </span>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-hover:border-cyan-300 group-hover:text-cyan-700 dark:border-white/10 dark:text-slate-400 dark:group-hover:border-cyan-400/40 dark:group-hover:text-cyan-200">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </div>,
    target,
  )
}
