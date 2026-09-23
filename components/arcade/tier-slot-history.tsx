"use client"

import { useEffect, useMemo, useState } from "react"
import { Info } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import type { ArcadeMilestone } from "@/components/arcade/model"
import {
  MILESTONE_HISTORY_URL,
  CANONICAL_MILESTONE_HISTORY_URL,
  latestSlotChange,
  decodeSlotHistoryResponse,
  selectSlotWindow,
  type SlotHistoryFeed,
  type SlotPeriod,
  type SlotPoint,
} from "@/components/arcade/slot-history"

export type SlotHistoryState = {
  feed: SlotHistoryFeed | null
  status: "loading" | "ready" | "pending" | "unavailable"
  retry: () => void
}

const TIERS = [
  { points: 50, name: "Trooper" },
  { points: 75, name: "Ranger" },
  { points: 95, name: "Champion" },
  { points: 120, name: "Legend" },
] as const

export function useTierSlotHistory(): SlotHistoryState {
  const [feed, setFeed] = useState<SlotHistoryFeed | null>(null)
  const [status, setStatus] = useState<SlotHistoryState["status"]>("loading")
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12_000)
    setStatus("loading")

    void fetch(MILESTONE_HISTORY_URL, {
      cache: "no-store", signal: controller.signal,
    }).then((response) => {
      // Defensive fallback if an environment override points at a deleted
      // preview branch. The real public crawler/main feed is authoritative.
      if (response.status === 404 &&
          MILESTONE_HISTORY_URL !== CANONICAL_MILESTONE_HISTORY_URL) {
        return fetch(CANONICAL_MILESTONE_HISTORY_URL, {
          cache: "no-store", signal: controller.signal,
        })
      }
      return response
    }).then(decodeSlotHistoryResponse).then((result) => {
      if (active) {
        setFeed(result.feed)
        setStatus(result.status)
      }
    }).catch(() => {
      if (active) {
        setFeed(null)
        setStatus("unavailable")
      }
    }).finally(() => window.clearTimeout(timeout))

    return () => {
      active = false
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [attempt])

  return { feed, status, retry: () => setAttempt((count) => count + 1) }
}

export function SlotChangeBadge({
  feed, points, currentSpotsLeft,
}: {
  feed: SlotHistoryFeed | null
  points: number
  currentSpotsLeft: number | null
}) {
  const change = latestSlotChange(feed, points, currentSpotsLeft)
  if (change === null) return null
  const label = (change > 0 ? "+" : change < 0 ? "−" : "") +
    Math.abs(change).toLocaleString("en-US")
  return (
    <span
      className={"tier-slot-delta " + (change > 0 ? "is-up" : change < 0 ? "is-down" : "is-flat")}
      title="Change since the previous recorded observation. An increase does not prove new prizes were added."
      aria-label={"Change in remaining slots: " + label}
    >
      {change > 0 ? "↑ " : change < 0 ? "↓ " : ""}{label}
    </span>
  )
}

const PERIODS: SlotPeriod[] = ["7d", "14d", "21d", "30d"]

const chartConfig = {
  spotsLeft: { label: "Remaining slots", color: "#a78bfa" },
} satisfies ChartConfig

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function longDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  })
}

function HistoryChart({
  points, period, tier, now,
}: {
  points: SlotPoint[]
  period: SlotPeriod
  tier: string
  now: number
}) {
  const cutoff = now - Number.parseInt(period, 10) * 86_400_000
  const series = points.map((item) => ({
    at: item.at,
    ts: Math.max(cutoff, Date.parse(item.at)),
    spotsLeft: item.spotsLeft,
    source: item.source,
  }))
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[235px] w-full sm:h-[285px]">
      <AreaChart accessibilityLayer data={series} margin={{ top: 10, right: 8, left: -12, bottom: 4 }}>
        <defs>
          <linearGradient id="tierHistoryAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-spotsLeft)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-spotsLeft)" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="4 5" />
        <XAxis
          type="number" dataKey="ts" scale="time" domain={[cutoff, now]}
          tickLine={false} axisLine={false} minTickGap={26}
          tickFormatter={(value: number) => shortDate(new Date(value).toISOString())}
        />
        <YAxis
          tickLine={false} axisLine={false} width={56}
          tickFormatter={(value: number) => value.toLocaleString("en-US")}
          domain={["dataMin - 20", "dataMax + 20"]}
        />
        <ChartTooltip
          cursor={{ stroke: "#a78bfa", strokeDasharray: "4 4" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0].payload as (typeof series)[number]
            return (
              <div className="tier-trends-tooltip rounded-xl border px-3 py-2 text-xs shadow-xl">
                <p className="font-semibold">{longDate(item.at)}</p>
                <p className="mt-1 font-bold tabular-nums">
                  {item.spotsLeft.toLocaleString("en-US")} remaining
                </p>
                {item.source?.kind === "git-commit" && (
                  <p className="mt-1 text-[11px] opacity-75">Git commit date, not exact crawl time</p>
                )}
              </div>
            )
          }}
        />
        <Area
          type="linear" dataKey="spotsLeft"
          fill="url(#tierHistoryAreaGradient)" stroke="var(--color-spotsLeft)"
          strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }}
          connectNulls={false} isAnimationActive={false}
          name={"Arcade " + tier}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function TierSlotHistoryPanel({
  feed, status, retry, milestones,
}: SlotHistoryState & { milestones: ArcadeMilestone[] }) {
  const [open, setOpen] = useState(false)
  const [period, setPeriod] = useState<SlotPeriod>("30d")
  const [tierPoints, setTierPoints] = useState(50)
  const [now, setNow] = useState(0)

  const selected = TIERS.find((tier) => tier.points === tierPoints) ?? TIERS[0]
  const latest = feed?.snapshots[feed.snapshots.length - 1]
  const recorded = latest?.tiers.find((tier) => tier.points === tierPoints)
  const live = milestones.find((tier) => tier.points === tierPoints)?.spotsLeft
  const selectedWindow = useMemo(
    () => feed && now ? selectSlotWindow(feed, tierPoints, period, now) : null,
    [feed, now, period, tierPoints],
  )
  const comparison = (selectedWindow?.points.length ?? 0) >= 2
  const delta = comparison ? selectedWindow?.delta : null
  const recovered = selectedWindow?.points.some((item) => item.source?.kind === "git-commit") ?? false

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next)
      if (next) setNow(Date.now())
    }}>
      <div className="tier-history-panel" aria-label="Prize-slot history">
        <DialogTrigger asChild>
          <button type="button" className="tier-trends-trigger" aria-haspopup="dialog">
            <span className="tier-trends-trigger-mark" aria-hidden="true">↗</span>
            <span className="tier-trends-trigger-copy">
              <strong>Prize slot history</strong>
              <small>View saved changes across reward tiers</small>
            </span>
            <span className="tier-trends-trigger-action">View trends ↗</span>
          </button>
        </DialogTrigger>
      </div>

      <DialogContent className="tier-trends-dialog !w-[calc(100vw-20px)] !max-w-[800px] !gap-0 !rounded-2xl !p-0 max-h-[calc(100dvh-28px)] overflow-y-auto [&>button]:text-slate-400">
        <DialogHeader className="tier-trends-header px-5 pb-5 pt-6 text-left sm:px-8 sm:pt-7">
          <span className="text-[10px] font-bold uppercase tracking-[.16em] text-violet-300">
            ARCADE POINTS / 2026 REWARDS
          </span>
          <DialogTitle className="!mt-2 text-[23px] font-extrabold tracking-tight sm:text-[27px]">
            Prize slot history
          </DialogTitle>
          <DialogDescription className="!mt-2 max-w-lg !text-[13px] !leading-relaxed !text-slate-400">
            See how published remaining slots have changed over time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
          {status === "loading" ? (
            <p className="tier-trends-empty" role="status">Loading history…</p>
          ) : status === "pending" ? (
            <p className="tier-trends-empty" role="status">
              History has not been published yet.{" "}
              <button type="button" className="underline" onClick={retry}>Check again</button>
            </p>
          ) : status === "unavailable" ? (
            <p className="tier-trends-empty" role="status">
              Could not load history.{" "}
              <button type="button" className="underline" onClick={retry}>Retry</button>
            </p>
          ) : !feed?.snapshots.length ? (
            <p className="tier-trends-empty" role="status">Collecting observations. Check back later.</p>
          ) : (
            <>
              <div className="tier-trends-controls space-y-4">
                <div>
                  <p className="tier-trends-label">REWARD TIER</p>
                  <ToggleGroup
                    type="single" value={String(tierPoints)}
                    onValueChange={(value) => { if (value) setTierPoints(Number(value)) }}
                    aria-label="Select reward tier"
                    className="grid grid-cols-4 gap-1.5 rounded-xl p-1"
                  >
                    {TIERS.map((tier) => (
                      <ToggleGroupItem
                        key={tier.points} value={String(tier.points)}
                        className="tier-trends-filter min-w-0 rounded-lg px-2 py-2 text-xs sm:text-sm"
                      >
                        {tier.name}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                <div>
                  <p className="tier-trends-label">TIME RANGE</p>
                  <ToggleGroup
                    type="single" value={period}
                    onValueChange={(value) => {
                      if (value) { setPeriod(value as SlotPeriod); setNow(Date.now()) }
                    }}
                    aria-label="Select history range"
                    className="grid grid-cols-4 gap-1.5 rounded-xl p-1"
                  >
                    {PERIODS.map((value) => (
                      <ToggleGroupItem
                        key={value} value={value}
                        className="tier-trends-filter min-w-0 rounded-lg px-2 py-2 text-xs sm:text-sm"
                      >
                        {value.slice(0, -1)} days
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              </div>

              <section className="tier-trends-stats flex flex-wrap items-end justify-between gap-4 rounded-2xl p-5 sm:p-6">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                    Arcade {selected.name}
                  </p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <strong className="text-4xl font-extrabold tabular-nums sm:text-5xl">
                      {recorded?.spotsLeft.toLocaleString("en-US") ?? "—"}
                    </strong>
                    <span className="text-xs text-slate-400">remaining slots</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    Saved {latest ? longDate(latest.at) : "—"}
                    {live != null && live !== recorded?.spotsLeft ? " · Live count may differ" : ""}
                  </p>
                </div>
                {comparison && delta != null && (
                  <div className={"tier-trends-delta " + (delta > 0 ? "is-up" : delta < 0 ? "is-down" : "is-flat")}>
                    <strong className="block text-2xl font-extrabold tabular-nums">
                      {(delta > 0 ? "+" : delta < 0 ? "−" : "") +
                        Math.abs(delta).toLocaleString("en-US")}
                    </strong>
                    <span className="mt-1 block text-xs">
                      vs {selectedWindow?.baselineAt ? shortDate(selectedWindow.baselineAt) : "previous record"}
                    </span>
                  </div>
                )}
              </section>

              <section className="tier-trends-chart-card rounded-2xl border p-4 sm:p-5"
                aria-label="Remaining slots chart">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold">Remaining slots</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {period.slice(0, -1)} days · Saved observations
                    </p>
                  </div>
                  {recovered && (
                    <span className="tier-trends-source rounded-full px-2.5 py-1 text-[10px] font-semibold">
                      Recovered history
                    </span>
                  )}
                </div>
                {comparison && selectedWindow ? (
                  <HistoryChart
                    points={selectedWindow.points} period={period} tier={selected.name} now={now}
                  />
                ) : (
                  <div role="status" className="tier-trends-empty min-h-[170px]">
                    {selectedWindow?.latestAt && selectedWindow.points.length === 0
                      ? "No observations in this range. Try a longer period."
                      : "Not enough observations to compare. Try a longer period."}
                  </div>
                )}
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                  Points mark saved observations, not continuous measurements.
                </p>
              </section>

              <Accordion type="single" collapsible className="tier-trends-about rounded-xl border px-4">
                <AccordionItem value="source" className="border-0">
                  <AccordionTrigger className="gap-2 py-3 text-left text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Info size={15} aria-hidden="true" /> About these numbers
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-xs leading-relaxed">
                    <p>These are published remaining slot counts, not personal queue positions or reward forecasts.</p>
                    <p>Older points were recovered from saved Git commits. Their dates are commit times, not verified original crawl times. New observations use actual crawler timestamps.</p>
                    <p>The crawler checks every six hours, but values may stay unchanged for days. An increase does not prove Google added prizes.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
