"use client"

import { useEffect, useMemo, useState } from "react"
import { Info } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
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
  selectMultiTierSlotWindow,
  type SlotHistoryFeed,
  type SlotPeriod,
  type MultiTierSlotPoint,
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

const DISPLAY_TIERS = [
  { key: "trooper", name: "Trooper", points: 50, color: "#3ccfbd" },
  { key: "ranger", name: "Ranger", points: 75, color: "#7fa1ff" },
  { key: "champion", name: "Champion", points: 95, color: "#f5bd5b" },
  { key: "legend", name: "Legend", points: 120, color: "#c391ff" },
] as const
type TierKey = typeof DISPLAY_TIERS[number]["key"]
const ALL_TIERS: TierKey[] = DISPLAY_TIERS.map((tier) => tier.key)

const chartConfig = {
  trooper: { label: "Trooper", color: "#3ccfbd" },
  ranger: { label: "Ranger", color: "#7fa1ff" },
  champion: { label: "Champion", color: "#f5bd5b" },
  legend: { label: "Legend", color: "#c391ff" },
} satisfies ChartConfig

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function longDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  })
}

function MultiTierHistoryChart({
  points, enabled, period, now,
}: {
  points: MultiTierSlotPoint[]
  enabled: TierKey[]
  period: SlotPeriod
  now: number
}) {
  const cutoff = now - Number.parseInt(period, 10) * 86_400_000
  const series = points.map((item) => ({
    ...item,
    // Older anchor provides the true comparison baseline; show it at the
    // left edge but preserve its actual date in the hover tooltip.
    ts: Math.max(cutoff, Date.parse(item.at)),
  }))
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full sm:h-[320px]">
      <LineChart
        accessibilityLayer data={series}
        margin={{ top: 14, right: 12, left: -8, bottom: 6 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 5" />
        <XAxis
          type="number" dataKey="ts" scale="time" domain={[cutoff, now]}
          tickLine={false} axisLine={false} minTickGap={32}
          tickFormatter={(value: number) => shortDate(new Date(value).toISOString())}
        />
        <YAxis
          tickLine={false} axisLine={false} width={57}
          tickFormatter={(value: number) => value.toLocaleString("en-US")}
          domain={["dataMin - 50", "dataMax + 50"]}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ stroke: "#98a6cb", strokeDasharray: "4 4" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0].payload as (typeof series)[number]
            return (
              <div className="tier-trends-tooltip rounded-xl border px-3 py-2.5 text-xs shadow-xl">
                <p className="font-semibold">{longDate(item.at)}</p>
                <div className="mt-2 grid gap-1.5">
                  {DISPLAY_TIERS.filter((tier) => enabled.includes(tier.key)).map((tier) => (
                    <div className="flex items-center justify-between gap-5" key={tier.key}>
                      <span className="flex items-center gap-2">
                        <span className="inline-block size-2 rounded-full" style={{ backgroundColor: tier.color }} />
                        {tier.name}
                      </span>
                      <strong className="tabular-nums">{item[tier.key].toLocaleString("en-US")}</strong>
                    </div>
                  ))}
                </div>
                {item.source?.kind === "git-commit" && (
                  <p className="mt-2 text-[11px] opacity-75">Git commit date, not exact crawl time</p>
                )}
              </div>
            )
          }}
        />
        {DISPLAY_TIERS.filter((tier) => enabled.includes(tier.key)).map((tier) => (
          <Line
            key={tier.key} type="linear" dataKey={tier.key}
            name={tier.name} stroke={tier.color} strokeWidth={2.6}
            dot={{ r: 3.5, strokeWidth: 1.5, fill: tier.color }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )
}

export function TierSlotHistoryPanel({
  feed, status, retry, milestones,
}: SlotHistoryState & { milestones: ArcadeMilestone[] }) {
  const [open, setOpen] = useState(false)
  const [period, setPeriod] = useState<SlotPeriod>("30d")
  // All four reward tiers are visible by default; users may hide any or all.
  const [visibleTiers, setVisibleTiers] = useState<TierKey[]>(ALL_TIERS)
  const [now, setNow] = useState(0)

  const latest = feed?.snapshots[feed.snapshots.length - 1]
  const selectedWindow = useMemo(
    () => feed && now ? selectMultiTierSlotWindow(feed, period, now) : null,
    [feed, now, period],
  )
  const comparison = (selectedWindow?.points.length ?? 0) >= 2
  const recovered = selectedWindow?.points.some((item) => item.source?.kind === "git-commit") ?? false

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next)
      if (next) setNow(Date.now())
    }}>
      <div className="tier-history-panel" aria-label="Prize-slot history">
        <DialogTrigger asChild>
          <button type="button" className="tier-trends-trigger"
            aria-haspopup="dialog" aria-label="View prize slot history">
            <span className="tier-trends-trigger-mark" aria-hidden="true">↗</span>
            <span className="tier-trends-trigger-copy">
              <strong>Prize slot history</strong>
              <small>Compare reward tiers</small>
            </span>
            <span className="tier-trends-trigger-action" aria-hidden="true">↗</span>
          </button>
        </DialogTrigger>
      </div>

      <DialogContent className="tier-trends-dialog !w-[calc(100vw-20px)] !max-w-[900px] !gap-0 !rounded-2xl !p-0 max-h-[calc(100dvh-28px)] overflow-y-auto [&>button]:text-slate-400">
        <DialogHeader className="tier-trends-header px-5 pb-5 pt-6 text-left sm:px-8 sm:pt-7">
          <span className="text-[10px] font-bold uppercase tracking-[.16em] text-violet-300">
            ARCADE POINTS / 2026 REWARDS
          </span>
          <DialogTitle className="!mt-2 text-[23px] font-extrabold tracking-tight sm:text-[27px]">
            Prize slot history
          </DialogTitle>
          <DialogDescription className="!mt-2 max-w-lg !text-[13px] !leading-relaxed !text-slate-400">
            Compare remaining slots across tiers. Tap any tier to show or hide its line.
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="tier-trends-label !mb-0">TIME RANGE</span>
                <ToggleGroup
                  type="single" value={period}
                  onValueChange={(value) => {
                    if (value) { setPeriod(value as SlotPeriod); setNow(Date.now()) }
                  }}
                  aria-label="Select history range"
                  className="grid w-full grid-cols-4 gap-1.5 rounded-xl p-1 sm:w-auto"
                >
                  {PERIODS.map((value) => (
                    <ToggleGroupItem
                      key={value} value={value}
                      className="tier-trends-filter min-w-0 rounded-lg px-3 py-2 text-xs sm:text-sm"
                    >
                      {value.slice(0, -1)} days
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <section aria-label="Toggle reward tiers" className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="tier-trends-label !mb-0">REWARD TIERS</span>
                  <button
                    type="button" className="tier-trends-show-all"
                    onClick={() => setVisibleTiers(ALL_TIERS)}
                    disabled={visibleTiers.length === ALL_TIERS.length}
                  >
                    Show all
                  </button>
                </div>
                <ToggleGroup
                  type="multiple" value={visibleTiers}
                  onValueChange={(values) => {
                    setVisibleTiers(DISPLAY_TIERS.filter((tier) => values.includes(tier.key)).map((tier) => tier.key))
                  }}
                  aria-label="Show or hide tier lines"
                  className="tier-trends-tier-grid grid grid-cols-2 gap-2 sm:grid-cols-4"
                >
                  {DISPLAY_TIERS.map((tier) => {
                    const active = visibleTiers.includes(tier.key)
                    const count = latest?.tiers.find((entry) => entry.points === tier.points)?.spotsLeft
                    const live = milestones.find((entry) => entry.points === tier.points)?.spotsLeft
                    const delta = comparison ? selectedWindow?.deltas[tier.key] : null
                    return (
                      <ToggleGroupItem
                        key={tier.key} value={tier.key}
                        className="tier-trends-tier-card group flex h-auto min-h-[105px] min-w-0 flex-col items-start gap-1.5 rounded-xl border p-3 text-left !shadow-none"
                        aria-label={tier.name + (active ? ", visible" : ", hidden")}
                      >
                        <span className="flex w-full items-center justify-between gap-1 text-xs font-bold">
                          <span className="flex min-w-0 items-center gap-2 truncate">
                            <span className="tier-trends-swatch" style={{ backgroundColor: tier.color }} />
                            {tier.name}
                          </span>
                          <span className="tier-trends-check" aria-hidden="true">{active ? "✓" : "+"}</span>
                        </span>
                        <strong className="mt-1 text-xl font-extrabold tabular-nums">
                          {count?.toLocaleString("en-US") ?? "—"}
                        </strong>
                        <span className="flex w-full items-center justify-between gap-1 text-[11px]">
                          <span className="tier-trends-tier-detail">remaining</span>
                          {delta != null ? (
                            <span
                              className={"tier-trends-tier-delta " + (delta > 0 ? "is-up" : delta < 0 ? "is-down" : "is-flat")}
                            >
                              {(delta > 0 ? "+" : delta < 0 ? "−" : "") +
                                Math.abs(delta).toLocaleString("en-US")}
                            </span>
                          ) : null}
                        </span>
                        {live != null && count != null && live !== count ? (
                          <span className="text-[10px] text-amber-300">Live count differs</span>
                        ) : null}
                      </ToggleGroupItem>
                    )
                  })}
                </ToggleGroup>
                <p className="tier-trends-selection-note">
                  {visibleTiers.length} of 4 tiers visible
                  {comparison && selectedWindow?.baselineAt
                    ? " · Change versus " + shortDate(selectedWindow.baselineAt)
                    : ""}
                </p>
              </section>

              <section className="tier-trends-chart-card rounded-2xl border p-4 sm:p-5"
                aria-label="Remaining slots comparison chart">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold">Remaining slots</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {period.slice(0, -1)} days · Recorded observations
                    </p>
                  </div>
                  {recovered && (
                    <span className="tier-trends-source rounded-full px-2.5 py-1 text-[10px] font-semibold">
                      Recovered history
                    </span>
                  )}
                </div>
                {visibleTiers.length === 0 ? (
                  <div role="status" className="tier-trends-empty min-h-[220px]">
                    All tiers are hidden. Select a tier above or click Show all.
                  </div>
                ) : selectedWindow && selectedWindow.points.length > 0 ? (
                  <MultiTierHistoryChart
                    points={selectedWindow.points} enabled={visibleTiers} period={period} now={now}
                  />
                ) : (
                  <div role="status" className="tier-trends-empty min-h-[220px]">
                    {selectedWindow?.latestAt && selectedWindow.points.length === 0
                      ? "No observations in this range. Try a longer period."
                      : "Not enough observations to display yet. Try a longer period."}
                  </div>
                )}
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                  Colored dots show saved observations. Lines join the known points; gaps were not continuously measured.
                  {latest ? " Latest saved: " + longDate(latest.at) + "." : ""}
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
                    <p>Counts show published remaining slots, not personal queue positions or reward forecasts.</p>
                    <p>Each color represents a reward tier. All lines use the same saved observation dates. Counts are absolute remaining slots, not percentages; each tier has a different total capacity.</p>
                    <p>Earlier points were recovered from saved Git commits. Their dates are commit times, not verified original crawl times. New observations use actual crawler timestamps.</p>
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
