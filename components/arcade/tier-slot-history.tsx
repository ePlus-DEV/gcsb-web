"use client"

import { useEffect, useMemo, useState } from "react"
import type { ArcadeMilestone } from "@/components/arcade/model"
import {
  MILESTONE_HISTORY_URL,
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

function dateLabel(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
  })
}

function TrendGraph({
  values, period, name, now,
}: {
  values: SlotPoint[]
  period: SlotPeriod
  name: string
  now: number
}) {
  const days = period === "24h" ? 1 : period === "7d" ? 7 : 30
  const cutoff = now - days * 86_400_000
  const lows = values.map((item) => item.spotsLeft)
  const low = Math.max(0, Math.min(...lows) - Math.max(5, Math.round((Math.max(...lows) - Math.min(...lows)) * .15)))
  const high = Math.max(...lows) + Math.max(5, Math.round((Math.max(...lows) - Math.min(...lows)) * .15))
  const x = (at: string) => 48 + (Math.max(cutoff, Date.parse(at)) - cutoff) / (now - cutoff) * 484
  const y = (value: number) => 16 + (high - value) / Math.max(1, high - low) * 124
  const path = values.map((point, index) =>
    (index ? "L" : "M") + x(point.at).toFixed(1) + "," + y(point.spotsLeft).toFixed(1)
  ).join(" ")
  const ticks = [...new Set([low, Math.round((high + low) / 2), high])]

  return (
    <div className="tier-history-chart">
      <svg viewBox="0 0 560 180" preserveAspectRatio="xMidYMid meet" role="img"
        aria-label={"Remaining " + name + " slots, " + period + " recorded trend"}>
        <title>{"Historical remaining slots for " + name}</title>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1="48" y1={y(tick)} x2="532" y2={y(tick)} className="tier-history-grid-line" />
            <text x="42" y={y(tick) + 4} textAnchor="end" className="tier-history-axis">
              {tick.toLocaleString("en-US")}
            </text>
          </g>
        ))}
        <path d={path} stroke="#8b80ff" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {values.map((item) => (
          <circle key={item.at} cx={x(item.at)} cy={y(item.spotsLeft)} r="4"
            fill="#8b80ff" stroke="#0d1530" strokeWidth="1.5">
            <title>{dateLabel(item.at) + ": " + item.spotsLeft.toLocaleString("en-US") + " remaining"}</title>
          </circle>
        ))}
        <text x="48" y="169" textAnchor="start" className="tier-history-axis">
          {dateLabel(new Date(cutoff).toISOString())}
        </text>
        <text x="532" y="169" textAnchor="end" className="tier-history-axis">
          {dateLabel(new Date(now).toISOString())}
        </text>
      </svg>
    </div>
  )
}

export function TierSlotHistoryPanel({
  feed, status, retry, milestones,
}: SlotHistoryState & { milestones: ArcadeMilestone[] }) {
  const [open, setOpen] = useState(false)
  const [period, setPeriod] = useState<SlotPeriod>("30d")
  const [tierPoints, setTierPoints] = useState(50)
  const [now, setNow] = useState(0)
  useEffect(() => {
    if (open) setNow(Date.now())
  }, [open, period, tierPoints, feed])

  const chosen = useMemo(() => feed && now
    ? selectSlotWindow(feed, tierPoints, period, now)
    : null, [feed, tierPoints, period, now])
  const name = TIERS.find((item) => item.points === tierPoints)?.name ?? "Trooper"
  const latest = chosen?.points[chosen.points.length - 1]?.spotsLeft
  const live = milestones.find((item) => item.points === tierPoints)?.spotsLeft

  return (
    <section className="tier-history-panel" aria-label="Prize-slot history">
      <button type="button" className="tier-history-toggle"
        aria-expanded={open} onClick={() => setOpen((previous) => !previous)}>
        <span className="tier-history-toggle-label">↗&nbsp; Prize slot trends</span>
        <span>{open ? "Hide history ⌃" : "View history ⌄"}</span>
      </button>
      {open && (
        <div className="tier-history-body">
          {status === "loading" ? (
            <p role="status" className="tier-history-muted">Loading slot history…</p>
          ) : status === "pending" ? (
            <p role="status" className="tier-history-muted">
              Waiting for the crawler to publish its first history feed.{" "}
              <button type="button" className="tier-history-retry" onClick={retry}>Check again</button>
            </p>
          ) : status === "unavailable" ? (
            <p role="status" className="tier-history-muted">History unavailable.{" "}
              <button type="button" className="tier-history-retry" onClick={retry}>Retry</button>
            </p>
          ) : !feed?.snapshots.length ? (
            <p role="status" className="tier-history-muted">
              Collecting history. Real observations begin after the crawler update.
            </p>
          ) : (
            <>
              <div className="tier-history-periods" role="group" aria-label="History period">
                {(["24h", "7d", "30d"] as const).map((value) => (
                  <button type="button" key={value} aria-pressed={period === value}
                    className={period === value ? "is-active" : ""}
                    onClick={() => setPeriod(value)}>{value}</button>
                ))}
              </div>
              <div className="tier-history-tiers" role="group" aria-label="Prize tier">
                {TIERS.map((item) => (
                  <button type="button" key={item.points}
                    aria-pressed={tierPoints === item.points}
                    className={tierPoints === item.points ? "is-active" : ""}
                    onClick={() => setTierPoints(item.points)}>{item.name}</button>
                ))}
              </div>
              {chosen && chosen.points.length > 1 ? (
                <>
                  <div className="tier-history-summary">
                    <span><strong>{latest?.toLocaleString("en-US")}</strong>
                      <small> last recorded</small>
                    </span>
                    {chosen.delta !== null && (
                      <b className={chosen.delta > 0 ? "is-up" : chosen.delta < 0 ? "is-down" : "is-flat"}>
                        {(chosen.delta > 0 ? "+" : chosen.delta < 0 ? "−" : "") +
                          Math.abs(chosen.delta).toLocaleString("en-US")}
                      </b>
                    )}
                  </div>
                  <TrendGraph values={chosen.points} period={period} name={name} now={now} />
                  <p className="tier-history-muted">
                    Observed: {chosen.latestAt ? dateLabel(chosen.latestAt) : "—"}.
                    {" "}Baseline: {chosen.baselineAt ? dateLabel(chosen.baselineAt) : "—"}.
                    {live !== null && live !== latest
                      ? " The latest live count may have changed since this snapshot." : ""}
                  </p>
                </>
              ) : (
                <p role="status" className="tier-history-muted">
                  {chosen?.latestAt && !chosen.points.length
                    ? "No recorded changes in this period. Last observation: " + dateLabel(chosen.latestAt) + "."
                    : "Not enough real observations for this period yet."}
                </p>
              )}
              <p className="tier-history-disclaimer">
                These are changes in published remaining slots, not allocation forecasts.
                An increase does not prove Google added prizes.
              </p>
            </>
          )}
        </div>
      )}
    </section>
  )
}
