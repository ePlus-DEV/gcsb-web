"use client"

import { useEffect, useMemo, useState } from "react"
import { ARCADE_MILESTONES_URL, numeric } from "@/components/arcade/model"

type LiveTierSlotsProps = {
  points: number
  totalSlots: number
  compact?: boolean
}

type LiveSlotState = {
  spotsLeft: number | null
  slots: number
  live: boolean
}

const REQUEST_TIMEOUT_MS = 10_000

const MOBILE_REWARD_LINEUP_STYLES = `
  @media (max-width: 639px) {
    section[aria-labelledby="tier-rewards-heading"] article > div:first-child > div:nth-child(2) > div.flex.flex-wrap.gap-2:not(.mb-2) {
      display: grid !important;
      grid-auto-flow: column;
      grid-auto-columns: minmax(82%, 82%);
      gap: 0.5rem;
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-inline: contain;
      scroll-snap-type: x mandatory;
      scroll-padding-inline: 0;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding-bottom: 0.25rem;
      padding-right: 1rem;
      margin-right: -1rem;
    }

    section[aria-labelledby="tier-rewards-heading"] article > div:first-child > div:nth-child(2) > div.flex.flex-wrap.gap-2:not(.mb-2)::-webkit-scrollbar {
      display: none;
    }

    section[aria-labelledby="tier-rewards-heading"] article > div:first-child > div:nth-child(2) > div.flex.flex-wrap.gap-2:not(.mb-2) > * {
      min-width: 0 !important;
      width: auto !important;
      flex: none !important;
      scroll-snap-align: start;
      scroll-snap-stop: always;
    }
  }

  @media (min-width: 640px) and (max-width: 1023px) {
    section[aria-labelledby="tier-rewards-heading"] article > div:first-child > div:nth-child(2) > div.flex.flex-wrap.gap-2:not(.mb-2) {
      display: grid !important;
      grid-auto-flow: column;
      grid-auto-columns: minmax(46%, 46%);
      gap: 0.5rem;
      overflow-x: auto;
      overscroll-behavior-inline: contain;
      scroll-snap-type: x proximity;
      scrollbar-width: thin;
      padding-bottom: 0.35rem;
    }

    section[aria-labelledby="tier-rewards-heading"] article > div:first-child > div:nth-child(2) > div.flex.flex-wrap.gap-2:not(.mb-2) > * {
      min-width: 0 !important;
      width: auto !important;
      flex: none !important;
      scroll-snap-align: start;
    }
  }
`

export default function LiveTierSlots({
  points,
  totalSlots,
  compact = false,
}: LiveTierSlotsProps) {
  const [state, setState] = useState<LiveSlotState>({
    spotsLeft: null,
    slots: totalSlots,
    live: false,
  })

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    async function loadSlots() {
      try {
        const response = await fetch(ARCADE_MILESTONES_URL, {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) return

        const payload: unknown = await response.json()
        if (!Array.isArray(payload)) return

        const candidate = payload.find(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            numeric((item as { points?: unknown }).points) === points,
        ) as Record<string, unknown> | undefined

        if (!candidate) return

        const slots = numeric(candidate.slots)
        const spotsLeft = numeric(candidate.spotsLeft)
        if (slots <= 0 || spotsLeft < 0 || spotsLeft > slots) return

        if (active) {
          setState({ spotsLeft, slots, live: true })
        }
      } catch {
        // Keep the verified total-slot fallback when live data is unavailable.
      } finally {
        window.clearTimeout(timeoutId)
      }
    }

    void loadSlots()

    return () => {
      active = false
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [points])

  const remainingPercent = useMemo(() => {
    if (state.spotsLeft === null || state.slots <= 0) return null
    return Math.max(0, Math.min(100, (state.spotsLeft / state.slots) * 100))
  }, [state.slots, state.spotsLeft])

  const format = (value: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)

  if (compact) {
    return (
      <>
        <style>{MOBILE_REWARD_LINEUP_STYLES}</style>
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="font-bold uppercase tracking-[.1em] text-slate-500 dark:text-slate-400">
              Prize slots left
            </span>
            <span className={state.live ? "font-semibold text-emerald-600 dark:text-emerald-300" : "font-medium text-slate-400"}>
              {state.live ? "Live" : "Total only"}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <strong className="text-base text-slate-950 dark:text-white">
              {state.spotsLeft === null ? "—" : format(state.spotsLeft)}
            </strong>
            <span className="text-[10px] text-slate-500">/ {format(state.slots)}</span>
            {remainingPercent !== null ? (
              <span className="ml-auto text-[10px] text-slate-500">
                {`${remainingPercent.toFixed(0)}% left`}
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
            <div
              className="h-full rounded-full bg-emerald-400 transition-[width] duration-500"
              style={{ width: `${remainingPercent ?? 0}%` }}
            />
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-300/15 dark:bg-emerald-300/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[.12em] text-emerald-700 dark:text-emerald-300">
            Prize slots remaining
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <strong className="text-3xl text-slate-950 dark:text-white">
              {state.spotsLeft === null ? "—" : format(state.spotsLeft)}
            </strong>
            <span className="text-sm text-slate-500">/ {format(state.slots)}</span>
          </div>
        </div>
        <span className={state.live ? "rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200" : "rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-slate-500 dark:bg-white/5 dark:text-slate-400"}>
          {state.live ? "Live availability" : "Loading live data"}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white dark:bg-white/5">
        <div
          className="h-full rounded-full bg-emerald-400 transition-[width] duration-500"
          style={{ width: `${remainingPercent ?? 0}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {state.spotsLeft === null
          ? `Verified capacity: ${format(totalSlots)} total slots. Live remaining count is temporarily unavailable.`
          : `${remainingPercent?.toFixed(1)}% of the current tier capacity remains.`}
      </p>
    </div>
  )
}
