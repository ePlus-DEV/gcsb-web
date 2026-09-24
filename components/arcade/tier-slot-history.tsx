"use client"

import { useEffect, useMemo, useState } from "react"
import { Info } from "lucide-react"
import { Area, Brush, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import type { ArcadeMilestone } from "@/components/arcade/model"
import { slotHistoryText, type SlotHistoryTextKey } from "@/components/arcade/slot-history-copy"
import { getWebsiteLocaleInfo, type WebsiteCatalog, type WebsiteLocale } from "@/lib/website-i18n"
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
  feed, points, currentSpotsLeft, catalog, locale,
}: {
  feed: SlotHistoryFeed | null
  points: number
  currentSpotsLeft: number | null
  catalog: WebsiteCatalog
  locale: WebsiteLocale
}) {
  const change = latestSlotChange(feed, points, currentSpotsLeft)
  if (change === null) return null
  const label = (change > 0 ? "+" : change < 0 ? "−" : "") +
    new Intl.NumberFormat(getWebsiteLocaleInfo(locale).htmlLang).format(Math.abs(change))
  return (
    <span
      className={"tier-slot-delta " + (change > 0 ? "is-up" : change < 0 ? "is-down" : "is-flat")}
      title={slotHistoryText(catalog, "changeTitle")}
      aria-label={slotHistoryText(catalog, "changeAria", { change: label })}
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

function shortDate(value: string, locale: WebsiteLocale): string {
  return new Date(value).toLocaleDateString(getWebsiteLocaleInfo(locale).htmlLang, {
    month: "short", day: "numeric",
  })
}

function longDate(value: string, locale: WebsiteLocale): string {
  return new Date(value).toLocaleString(getWebsiteLocaleInfo(locale).htmlLang, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  })
}

type SlotText = (key: SlotHistoryTextKey, params?: Record<string, string | number>) => string

function MultiTierHistoryChart({
  points, enabled, period, now, locale, t,
}: {
  points: MultiTierSlotPoint[]
  enabled: TierKey[]
  period: SlotPeriod
  now: number
  locale: WebsiteLocale
  t: SlotText
}) {
  const numberFormat = new Intl.NumberFormat(getWebsiteLocaleInfo(locale).htmlLang)
  const cutoff = now - Number.parseInt(period, 10) * 86_400_000
  const series = useMemo(() => points.map((item) => ({
    ...item,
    // Preserve the actual observation timestamp for tooltips. The older
    // baseline sits at the window edge instead of fabricating an observation.
    ts: Math.max(cutoff, Date.parse(item.at)),
  })), [points, cutoff])
  const visible = DISPLAY_TIERS.filter((tier) => enabled.includes(tier.key))
  const brushKey = period + ":" + (points[0]?.at ?? "") + ":" + points.length
  const [zoom, setZoom] = useState<{
    key: string
    startIndex: number
    endIndex: number
  } | null>(null)
  const fullEnd = series.length - 1
  const startIndex = zoom?.key === brushKey
    ? Math.min(Math.max(0, zoom.startIndex), fullEnd) : 0
  const endIndex = zoom?.key === brushKey
    ? Math.min(Math.max(startIndex, zoom.endIndex), fullEnd) : fullEnd
  const isZoomed = startIndex > 0 || endIndex < fullEnd

  return (
    <div className="tier-trends-visual">
      <div className="tier-trends-chart-toolbar">
        <span className="tier-trends-observation-count">
          <span aria-hidden="true" className="tier-trends-observation-dot" />
          {numberFormat.format(series.length)} · {shortDate(points[0].at, locale)}
          {" — "}{shortDate(points[fullEnd].at, locale)}
        </span>
        {isZoomed ? (
          <button
            type="button"
            className="tier-trends-reset-zoom"
            onClick={() => setZoom(null)}
            aria-label={t("showAll") + " " + t("timeRange")}
          >
            {t("showAll")} ↗
          </button>
        ) : null}
      </div>
      <ChartContainer
        config={chartConfig}
        className="tier-trends-chart-surface aspect-auto h-[290px] w-full sm:h-[380px]"
      >
        <ComposedChart
          accessibilityLayer
          data={series}
          margin={{ top: 14, right: 12, left: -8, bottom: series.length >= 4 ? 2 : 8 }}
        >
          <defs>
            {DISPLAY_TIERS.map((tier) => (
              <linearGradient
                id={"slot-area-" + tier.key}
                key={tier.key}
                x1="0" x2="0" y1="0" y2="1"
              >
                <stop offset="0%" stopColor={tier.color} stopOpacity={0.23} />
                <stop offset="95%" stopColor={tier.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="4 6" />
          <XAxis
            type="number"
            dataKey="ts"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
            tickFormatter={(value: number) => shortDate(new Date(value).toISOString(), locale)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={57}
            tickFormatter={(value: number) => numberFormat.format(value)}
            domain={["dataMin - 50", "dataMax + 50"]}
            allowDecimals={false}
          />
          <ChartTooltip
            isAnimationActive={false}
            cursor={{ stroke: "#98a6cb", strokeWidth: 1.3, strokeDasharray: "4 4" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const item = payload[0].payload as (typeof series)[number]
              return (
                <div className="tier-trends-tooltip rounded-xl border px-3 py-2.5 text-xs shadow-xl">
                  <p className="font-semibold">{longDate(item.at, locale)}</p>
                  <div className="mt-2 grid gap-1.5">
                    {visible.map((tier) => (
                      <div className="flex items-center justify-between gap-5" key={tier.key}>
                        <span className="flex items-center gap-2">
                          <span className="inline-block size-2 rounded-full" style={{ backgroundColor: tier.color }} />
                          {tier.name}
                        </span>
                        <strong className="tabular-nums">
                          {t("tooltipValue", { count: numberFormat.format(item[tier.key]) })}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }}
          />
          {visible.map((tier) => (
            <Area
              key={"area-" + tier.key}
              type="linear"
              dataKey={tier.key}
              name={tier.name}
              stroke="none"
              fill={"url(#slot-area-" + tier.key + ")"}
              fillOpacity={1}
              legendType="none"
              isAnimationActive={false}
              connectNulls={false}
            />
          ))}
          {visible.map((tier) => (
            <Line
              key={"line-" + tier.key}
              type="linear"
              dataKey={tier.key}
              name={tier.name}
              stroke={tier.color}
              strokeWidth={3}
              style={{ filter: "drop-shadow(0 0 4px " + tier.color + "55)" }}
              dot={series.length <= 16
                ? { r: 3.5, strokeWidth: 1.5, fill: tier.color }
                : false}
              activeDot={{ r: 6.5, strokeWidth: 2 }}
              isAnimationActive={false}
              connectNulls={false}
            />
          ))}
          {series.length >= 4 ? (
            <Brush
              dataKey="ts"
              height={34}
              stroke="#9887ff"
              fill="#17213a"
              travellerWidth={12}
              tickFormatter={(value: number) => shortDate(new Date(value).toISOString(), locale)}
              startIndex={startIndex}
              endIndex={endIndex}
              onChange={(range) => {
                if (range.startIndex === undefined || range.endIndex === undefined) return
                setZoom({
                  key: brushKey,
                  startIndex: range.startIndex,
                  endIndex: range.endIndex,
                })
              }}
            />
          ) : null}
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}

export function TierSlotHistoryPanel({
  feed, status, retry, milestones, catalog, locale,
}: SlotHistoryState & {
  milestones: ArcadeMilestone[]
  catalog: WebsiteCatalog
  locale: WebsiteLocale
}) {
  const t: SlotText = (key, params) => slotHistoryText(catalog, key, params)
  const numberFormat = new Intl.NumberFormat(getWebsiteLocaleInfo(locale).htmlLang)
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

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next)
      if (next) setNow(Date.now())
    }}>
      <div className="tier-history-panel" aria-label="Prize-slot history">
        <DialogTrigger asChild>
          <button type="button" className="tier-trends-trigger"
            aria-haspopup="dialog" aria-label={t("viewAria")}>
            <span className="tier-trends-trigger-mark" aria-hidden="true">↗</span>
            <span className="tier-trends-trigger-copy">
              <strong>{t("title")}</strong>
              <small>{t("subtitle")}</small>
            </span>
            <span className="tier-trends-trigger-action" aria-hidden="true">↗</span>
          </button>
        </DialogTrigger>
      </div>

      <DialogContent
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="tier-trends-dialog !w-[calc(100vw-20px)] !max-w-[900px] !gap-0 !rounded-2xl !p-0 max-h-[calc(100dvh-28px)] overflow-y-auto [&>button]:text-slate-400"
        // The cookie banner is a separate high-z-index overlay. Interacting
        // with its buttons must not count as dismissal of this history modal.
        // Keep normal dialog close-button/Escape and unrelated outside clicks.
        onInteractOutside={(event) => {
          const target = event.detail.originalEvent.target
          if (target instanceof Element && target.closest(".cookie-consent-layer")) {
            event.preventDefault()
          }
        }}
      >
        <DialogHeader className="tier-trends-header px-5 pb-5 pt-6 text-left sm:px-8 sm:pt-7">
          <span className="text-[10px] font-bold uppercase tracking-[.16em] text-violet-300">
            ARCADE POINTS / {t("eyebrow")}
          </span>
          <DialogTitle className="!mt-2 text-[23px] font-extrabold tracking-tight sm:text-[27px]">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="!mt-2 max-w-lg !text-[13px] !leading-relaxed !text-slate-400">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
          {status === "loading" ? (
            <p className="tier-trends-empty" role="status">{t("loading")}</p>
          ) : status === "pending" ? (
            <p className="tier-trends-empty" role="status">
              {t("pending")}{" "}
              <button type="button" className="underline" onClick={retry}>{t("checkAgain")}</button>
            </p>
          ) : status === "unavailable" ? (
            <p className="tier-trends-empty" role="status">
              {t("unavailable")}{" "}
              <button type="button" className="underline" onClick={retry}>{t("retry")}</button>
            </p>
          ) : !feed?.snapshots.length ? (
            <p className="tier-trends-empty" role="status">{t("collecting")}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="tier-trends-label !mb-0">{t("timeRange")}</span>
                <ToggleGroup
                  type="single" value={period}
                  onValueChange={(value) => {
                    if (value) { setPeriod(value as SlotPeriod); setNow(Date.now()) }
                  }}
                  aria-label={t("timeRange")}
                  className="grid w-full grid-cols-4 gap-1.5 rounded-xl p-1 sm:w-auto"
                >
                  {PERIODS.map((value) => (
                    <ToggleGroupItem
                      key={value} value={value}
                      className="tier-trends-filter min-w-0 rounded-lg px-3 py-2 text-xs sm:text-sm"
                    >
                      {t("days", { count: value.slice(0, -1) })}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <section aria-label={t("toggleTiers")} className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="tier-trends-label !mb-0">{t("rewardTiers")}</span>
                  <button
                    type="button" className="tier-trends-show-all"
                    onClick={() => setVisibleTiers(ALL_TIERS)}
                    disabled={visibleTiers.length === ALL_TIERS.length}
                  >
                    {t("showAll")}
                  </button>
                </div>
                <ToggleGroup
                  type="multiple" value={visibleTiers}
                  onValueChange={(values) => {
                    setVisibleTiers(DISPLAY_TIERS.filter((tier) => values.includes(tier.key)).map((tier) => tier.key))
                  }}
                  aria-label={t("toggleTiers")}
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
                        aria-label={tier.name}
                      >
                        <span className="flex w-full items-center justify-between gap-1 text-xs font-bold">
                          <span className="flex min-w-0 items-center gap-2 truncate">
                            <span className="tier-trends-swatch" style={{ backgroundColor: tier.color }} />
                            {tier.name}
                          </span>
                          <span className="tier-trends-check" aria-hidden="true">{active ? "✓" : "+"}</span>
                        </span>
                        <strong className="mt-1 text-xl font-extrabold tabular-nums">
                          {count == null ? "—" : numberFormat.format(count)}
                        </strong>
                        <span className="flex w-full items-center justify-between gap-1 text-[11px]">
                          <span className="tier-trends-tier-detail">{t("remaining")}</span>
                          {delta != null ? (
                            <span
                              className={"tier-trends-tier-delta " + (delta > 0 ? "is-up" : delta < 0 ? "is-down" : "is-flat")}
                            >
                              {(delta > 0 ? "+" : delta < 0 ? "−" : "") +
                                numberFormat.format(Math.abs(delta))}
                            </span>
                          ) : null}
                        </span>
                        {live != null && count != null && live !== count ? (
                          <span className="text-[10px] text-amber-300">{t("liveDiffers")}</span>
                        ) : null}
                      </ToggleGroupItem>
                    )
                  })}
                </ToggleGroup>
                <p className="tier-trends-selection-note">
                  {t("visibleSummary", { count: numberFormat.format(visibleTiers.length) })}
                  {comparison && selectedWindow?.baselineAt
                    ? t("comparedWith", { date: shortDate(selectedWindow.baselineAt, locale) })
                    : ""}
                </p>
              </section>

              <section className="tier-trends-chart-card rounded-2xl border p-4 sm:p-5"
                aria-label={t("chartTitle")}>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold">{t("chartTitle")}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {t("chartSubtitle", { days: period.slice(0, -1) })}
                    </p>
                  </div>
                </div>
                {visibleTiers.length === 0 ? (
                  <div role="status" className="tier-trends-empty min-h-[220px]">
                    {t("noSelection")}
                  </div>
                ) : selectedWindow && selectedWindow.points.length > 0 ? (
                  <MultiTierHistoryChart
                    points={selectedWindow.points} enabled={visibleTiers} period={period} now={now} locale={locale} t={t}
                  />
                ) : (
                  <div role="status" className="tier-trends-empty min-h-[220px]">
                    {selectedWindow?.latestAt && selectedWindow.points.length === 0
                      ? t("noPeriodData")
                      : t("notEnoughData")}
                  </div>
                )}
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                  {t("chartNote")}
                  {latest ? " " + t("lastSaved", { date: longDate(latest.at, locale) }) : ""}
                </p>
              </section>

              <Accordion type="single" collapsible className="tier-trends-about rounded-xl border px-4">
                <AccordionItem value="source" className="border-0">
                  <AccordionTrigger className="gap-2 py-3 text-left text-xs font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Info size={15} aria-hidden="true" /> {t("aboutTitle")}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-xs leading-relaxed">
                    <p>{t("aboutCounts")}</p>
                    <p>{t("aboutCompare")}</p>
                    <p>{t("aboutDates")}</p>
                    <p>{t("aboutUpdate")}</p>
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
