"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { History, Info, X } from "lucide-react"
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

function dateLabel(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  })
}

function dateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

const PERIODS: SlotPeriod[] = ["7d", "14d", "21d", "30d"]

function TrendGraph({
  values, period, name, now,
}: {
  values: SlotPoint[]
  period: SlotPeriod
  name: string
  now: number
}) {
  const days = Number.parseInt(period, 10)
  const cutoff = now - days * 86_400_000
  const numbers = values.map((item) => item.spotsLeft)
  const min = Math.min(...numbers)
  const max = Math.max(...numbers)
  const margin = Math.max(5, Math.round((max - min) * .15))
  const low = Math.max(0, min - margin)
  const high = max + margin
  const x = (at: string) => 54 + (Math.max(cutoff, Date.parse(at)) - cutoff) /
    Math.max(1, now - cutoff) * 610
  const y = (n: number) => 20 + (high - n) / Math.max(1, high - low) * 178
  const path = values.map((item, i) =>
    (i ? "L" : "M") + x(item.at).toFixed(1) + "," +
    y(item.spotsLeft).toFixed(1)).join(" ")

  return (
    <div className="tier-history-chart">
      <svg viewBox="0 0 710 242" preserveAspectRatio="xMidYMid meet" role="img"
        aria-label={"Saved observations of " + name + " remaining slots over " + days + " days"}>
        <title>{"Saved remaining slots for " + name}</title>
        {[low, Math.round((low + high) / 2), high].map((tick) => (
          <g key={tick}>
            <line x1="54" x2="664" y1={y(tick)} y2={y(tick)} className="tier-history-grid-line" />
            <text x="45" y={y(tick) + 4} textAnchor="end" className="tier-history-axis">
              {tick.toLocaleString("en-US")}
            </text>
          </g>
        ))}
        <path d={path} className="tier-history-line" fill="none"
          strokeWidth="2.5" strokeDasharray="7 5" />
        {values.map((item) => (
          <circle key={item.at} cx={x(item.at)} cy={y(item.spotsLeft)} r="5"
            className="tier-history-point" strokeWidth="2">
            <title>{
              dateTime(item.at) + ": " + item.spotsLeft.toLocaleString("en-US") + " remaining" +
              (item.source?.kind === "git-commit" ? " (Git commit date, not exact crawl time)" : "")
            }</title>
          </circle>
        ))}
        <text x="54" y="231" textAnchor="start" className="tier-history-axis">
          {dateLabel(new Date(cutoff).toISOString())}
        </text>
        <text x="664" y="231" textAnchor="end" className="tier-history-axis">
          {dateLabel(new Date(now).toISOString())}
        </text>
      </svg>
    </div>
  )
}

export function TierSlotHistoryPanel({
  feed, status, retry, milestones,
}: SlotHistoryState & { milestones: ArcadeMilestone[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const [period, setPeriod] = useState<SlotPeriod>("30d")
  const [tierPoints, setTierPoints] = useState(50)
  const [now, setNow] = useState(0)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      setNow(Date.now())
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const chosen = useMemo(() => feed && now
    ? selectSlotWindow(feed, tierPoints, period, now)
    : null, [feed, tierPoints, period, now])
  const tierName = TIERS.find((tier) => tier.points === tierPoints)?.name ?? "Trooper"
  const lastSaved = feed?.snapshots[feed.snapshots.length - 1]
  const lastTier = lastSaved?.tiers.find((tier) => tier.points === tierPoints)
  const latestCount = lastTier?.spotsLeft
  const currentCount = milestones.find((tier) => tier.points === tierPoints)?.spotsLeft
  const delta = chosen?.delta
  const hasComparison = (chosen?.points.length ?? 0) > 1
  const recovered = chosen?.points.some((item) => item.source?.kind === "git-commit") ?? false

  const closeDialog = () => {
    dialogRef.current?.close()
    setOpen(false)
  }

  return (
    <section className="tier-history-panel" aria-label="Prize-slot history">
      <button type="button" className="tier-history-toggle"
        aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <span className="tier-history-toggle-icon"><History size={17} aria-hidden="true" /></span>
        <span className="tier-history-toggle-copy">
          <strong>Prize slot history</strong>
          <small>See weekly changes and remaining rewards</small>
        </span>
        <span className="tier-history-toggle-action">View trends ↗</span>
      </button>

      <dialog ref={dialogRef} className="tier-history-dialog"
        aria-labelledby="tier-history-title" aria-describedby="tier-history-intro"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog()
        }}>
        <div className="tier-history-dialog-content">
          <header className="tier-history-dialog-head">
            <div>
              <span className="tier-history-eyebrow">ARCADE REWARDS</span>
              <h2 id="tier-history-title">Prize slot history</h2>
              <p id="tier-history-intro">See how published remaining slots changed over time.</p>
            </div>
            <button type="button" className="tier-history-close"
              aria-label="Close slot history" onClick={closeDialog}>
              <X size={18} aria-hidden="true" />
            </button>
          </header>
          <div className="tier-history-body">
            {status === "loading" ? (
              <p role="status" className="tier-history-muted">Loading slot history…</p>
            ) : status === "pending" ? (
              <p role="status" className="tier-history-muted">
                History has not been published yet.{" "}
                <button type="button" className="tier-history-retry" onClick={retry}>Check again</button>
              </p>
            ) : status === "unavailable" ? (
              <p role="status" className="tier-history-muted">
                Could not load history.{" "}
                <button type="button" className="tier-history-retry" onClick={retry}>Retry</button>
              </p>
            ) : !feed?.snapshots.length ? (
              <p role="status" className="tier-history-muted">
                Collecting observations. Charts will appear when recorded data is available.
              </p>
            ) : (
              <>
                <div className="tier-history-controls">
                  <div>
                    <span className="tier-history-label">Reward tier</span>
                    <div className="tier-history-tiers" role="group" aria-label="Reward tier">
                      {TIERS.map((tier) => (
                        <button type="button" key={tier.points}
                          aria-pressed={tierPoints === tier.points}
                          className={tierPoints === tier.points ? "is-active" : ""}
                          onClick={() => setTierPoints(tier.points)}>{tier.name}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="tier-history-label">Time range</span>
                    <div className="tier-history-periods" role="group" aria-label="History period">
                      {PERIODS.map((value) => (
                        <button type="button" key={value} aria-pressed={period === value}
                          className={period === value ? "is-active" : ""}
                          onClick={() => { setPeriod(value); setNow(Date.now()) }}>
                          {value.slice(0, -1)} days
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="tier-history-result">
                  <div>
                    <span className="tier-history-label">Latest recorded · {tierName}</span>
                    <div className="tier-history-current">
                      <strong>{latestCount?.toLocaleString("en-US") ?? "—"}</strong>
                      <span>slots remaining</span>
                    </div>
                    <small>
                      {lastSaved ? "Saved " + dateTime(lastSaved.at) : "Awaiting a snapshot"}
                      {currentCount !== undefined && lastSaved && currentCount !== latestCount
                        ? " · Live count may differ." : ""}
                    </small>
                  </div>
                  {hasComparison && delta !== null && delta !== undefined && (
                    <div className="tier-history-change">
                      <b className={delta > 0 ? "is-up" : delta < 0 ? "is-down" : "is-flat"}>
                        {(delta > 0 ? "+" : delta < 0 ? "−" : "") +
                          Math.abs(delta).toLocaleString("en-US")}
                      </b>
                      <span>vs {chosen?.baselineAt ? dateLabel(chosen.baselineAt) : "earlier record"}</span>
                    </div>
                  )}
                </div>

                {hasComparison && chosen ? (
                  <>
                    <TrendGraph values={chosen.points} period={period} name={tierName} now={now} />
                    <p className="tier-history-chart-note">
                      Dots are saved observations; dashed lines connect known records.
                      {recovered ? " Some dates are recovered Git commit timestamps." : ""}
                    </p>
                  </>
                ) : (
                  <p role="status" className="tier-history-empty">
                    {chosen?.latestAt && !chosen.points.length
                      ? "No observations in this range. Try a longer period."
                      : "Not enough observations to compare yet. Try a longer period."}
                  </p>
                )}

                <details className="tier-history-explainer">
                  <summary><Info size={15} aria-hidden="true" /> About these numbers</summary>
                  <div className="tier-history-explainer-body">
                    <p>These are published remaining slot counts, not personal queue positions or reward forecasts.</p>
                    <p>Older points were recovered from saved Git commits. Their dates are commit times, not verified original crawl times. New observations use crawler timestamps.</p>
                    <p>The crawler checks every six hours, but counts can remain unchanged for days. Dashed lines connect saved observations; they do not represent continuous measurement. An increase does not prove new prizes were added.</p>
                  </div>
                </details>
              </>
            )}
          </div>
        </div>
      </dialog>
    </section>
  )
}
