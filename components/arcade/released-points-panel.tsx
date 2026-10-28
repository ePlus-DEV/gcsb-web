"use client"

import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { CircleHelp, Trophy, X } from "lucide-react"
import type { WebsiteCatalog } from "@/lib/website-i18n"
import type { ArcadeBadge } from "./model"
import type { ProfilePointSummary } from "./profile-point-summary"
import { parseReleasedGames, summarizeReleasedPoints, type ReleasedGame } from "./released-points"

export default function ReleasedPointsPanel({ badges, hasProfile, catalog, locale, nowMs, profilePoints, embedded = false }: {
  embedded?: boolean
  profilePoints?: ProfilePointSummary | null
  badges: ArcadeBadge[]; hasProfile: boolean; catalog: WebsiteCatalog; locale: string; nowMs: number
}) {
  const [games, setGames] = useState<ReleasedGame[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState({ top: 12, left: 12, maxHeight: 500 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const dialogId = useId()
  // Arcade publication months use the source timezone, independent of the viewer.
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).formatToParts(nowMs)
  const year = Number(date.find((part) => part.type === "year")?.value)
  const month = Number(date.find((part) => part.type === "month")?.value)
  const text = (key: string, params: Record<string, string> = {}) =>
    (catalog.additional[`__releasedPoints:${key}`] ?? "").replace(/\{(\w+)\}/g, (token, name: string) => params[name] ?? token)

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    setGames(null)
    setFailed(false)
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    void Promise.all(Array.from({ length: month }, async (_, index) => {
      const period = `${year}-${String(index + 1).padStart(2, "0")}`
      const response = await fetch(`https://raw.githubusercontent.com/hoangsvit/arcade-crawler/main/data/arcade_monthly_games_history/${year}/${String(index + 1).padStart(2, "0")}.json`, { signal: controller.signal, cache: "no-store" })
      // A missing month is unavailable coverage, never an invented zero-point release.
      if (response.status === 404) return []
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return parseReleasedGames(await response.json(), period)
    })).then((rows) => { if (active) setGames(rows.flat()) })
      .catch(() => { if (active) setFailed(true) })
      .finally(() => window.clearTimeout(timeout))
    return () => { active = false; controller.abort(); window.clearTimeout(timeout) }
  }, [year, month, attempt])

  // A portal escapes the dashboard card's stacking/overflow context. A dialog keeps
  // keyboard and touch interactions reliable in both the popover and mobile sheet.
  useEffect(() => {
    if (!historyOpen) return
    const reposition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const width = Math.min(380, window.innerWidth - 24)
      const height = Math.min(440, window.innerHeight - 24)
      const top = rect.bottom + 8 + height <= window.innerHeight - 12
        ? rect.bottom + 8
        : rect.top - 8 - height >= 12
          ? rect.top - 8 - height
          : 12
      setPopoverPosition({
        top,
        left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)),
        maxHeight: Math.max(0, window.innerHeight - top - 12),
      })
    }
    reposition()
    const dialog = dialogRef.current
    dialog?.focus()
    const wasMobile = window.matchMedia("(max-width: 680px)").matches
    const originalOverflow = document.body.style.overflow
    if (wasMobile) document.body.style.overflow = "hidden"
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setHistoryOpen(false); return }
      if (event.key !== "Tab" || !dialog) return
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]'))
      if (!controls.length) { event.preventDefault(); return }
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    window.addEventListener("resize", reposition)
    window.addEventListener("scroll", reposition, true)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("resize", reposition)
      window.removeEventListener("scroll", reposition, true)
      if (wasMobile) document.body.style.overflow = originalOverflow
      triggerRef.current?.focus()
    }
  }, [historyOpen])

  const summary = games ? summarizeReleasedPoints(games, badges, nowMs) : null
  const number = (value: number | null) => value === null ? "—" : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)
  if (embedded) {
    if (!hasProfile || !profilePoints) return null
    const title = text("title", { year: String(year) })
    return <>
      <section className="point-comparison" dir={locale.startsWith("ar") ? "rtl" : "ltr"} aria-label={title}>
        <div className="point-history-line">
          <span className="point-history-label">{title}</span>
          <span className="point-history-count">
            {summary ? <><strong>{number(summary.total)}</strong> {text("released")}</>
              : failed ? text("error") : text("loading")}
          </span>
          <button ref={triggerRef} type="button" className="point-history-trigger"
            aria-label={catalog.additional["Open details"]} aria-haspopup="dialog"
            aria-expanded={historyOpen} aria-controls={dialogId}
            onClick={() => setHistoryOpen(true)}>
            <CircleHelp aria-hidden="true" />
          </button>
        </div>
      </section>
      {historyOpen && typeof document !== "undefined" && createPortal(
        <div className={`point-history-portal${document.documentElement.classList.contains("light") || document.body.classList.contains("light") ? " is-light" : ""}`} dir={locale.startsWith("ar") ? "rtl" : "ltr"}>
          <div className="point-history-backdrop" aria-hidden="true" onClick={() => setHistoryOpen(false)} />
          <section id={dialogId} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${dialogId}-title`}
            tabIndex={-1} className="point-history-popover"
            style={{ top: popoverPosition.top, left: popoverPosition.left, maxHeight: popoverPosition.maxHeight }}>
            <header className="point-history-popover-header">
              <h3 id={`${dialogId}-title`}>{title}</h3>
              <button type="button" className="point-history-close" aria-label={catalog.additional["Close details"]}
                onClick={() => setHistoryOpen(false)}><X aria-hidden="true" /></button>
            </header>
            {failed ? <div role="status"><p>{text("error")}</p><button type="button" className="point-history-retry"
                onClick={() => setAttempt((value) => value + 1)}>{text("retry")}</button></div>
              : !summary ? <p role="status">{text("loading")}</p>
              : <>
                <dl className="point-comparison-stats">
                  <div><dt>{text("earned")}</dt><dd>{number(summary.achieved)}</dd></div>
                  <div><dt>{text("released")}</dt><dd>{number(summary.total)}</dd></div>
                </dl>
                <dl className="point-comparison-extra">
                  <div><dt>{text("available")}</dt><dd>{number(summary.available)}</dd></div>
                  <div><dt>{text("expired")}</dt><dd>{number(summary.expired)}</dd></div>
                </dl>
                <p className="point-history-coverage">{text("coverage", {
                  count: number(summary.months), total: number(month), unknown: number(summary.unknown),
                })}</p>
                <div className="point-history-notes">
                  <p>{text("scope")}</p>
                  <p>{text("skillCoverage")}</p>
                </div>
              </>}
          </section>
        </div>,
        document.body,
      )}
    </>
  }
  return <section className={embedded ? "released-points-panel is-embedded" : "released-points-panel"} aria-labelledby={embedded ? undefined : "released-points-title"} aria-label={embedded ? text("title", { year: String(year) }) : undefined} aria-busy={!summary && !failed}>
    {!embedded && <div className="released-points-heading">
      <div className="released-points-heading-title"><span className="released-points-emblem" aria-hidden="true"><Trophy /></span><h3 id="released-points-title">{text("overviewTitle", { year: String(year) })}</h3></div>
      {hasProfile && profilePoints && <div className="released-profile-total"><span>{catalog.messages.totalArcadePoints}</span><strong>{number(profilePoints.total)}</strong></div>}
    </div>}
    {!embedded && hasProfile && profilePoints && <dl className="released-profile-stats">
      <div><dt>{catalog.messages.gameBadges}</dt><dd>{number(profilePoints.games)}</dd></div>
      <div className="is-skill"><dt>{catalog.messages.skillBadges}</dt><dd>{number(profilePoints.skills)}</dd></div>
      <div><dt>{catalog.messages.triviaSpecial}</dt><dd>{number(profilePoints.triviaSpecial)}</dd></div>
      <div><dt>{catalog.messages.facilitatorBonus}</dt><dd>{number(profilePoints.bonus)}</dd></div>
    </dl>}
    {failed ? <div role="status"><p>{text("error")}</p><button type="button" onClick={() => setAttempt((value) => value + 1)}>{text("retry")}</button></div>
      : !summary ? <p role="status">{text("loading")}</p>
      : <>
        <div className="released-history-line">
          <h4>{text("title", { year: String(year) })}</h4>
          <dl className="released-history-values">
            {hasProfile && <div><dt>{text("earned")}</dt><dd>{number(summary.achieved)}</dd></div>}
            <div><dt>{text("released")}</dt><dd>{number(summary.total)}</dd></div>
          </dl>
          {hasProfile && <output className="released-points-percent">{new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(summary.percent)}</output>}
        </div>
        {hasProfile ? <progress aria-label={text("earned")} max={1} value={summary.percent} /> : <p>{text("profile")}</p>}
        <details className="released-points-notes">
          <summary>{catalog.messages.pointBreakdown}</summary>
          <dl className="released-detail-stats">
            {hasProfile && <>
              <div><dt>{text("available")}</dt><dd>{number(summary.available)}</dd></div>
              <div><dt>{text("expired")}</dt><dd>{number(summary.expired)}</dd></div>
            </>}
            {hasProfile && profilePoints && <div><dt>{catalog.messages.regularPoints}</dt><dd><strong>{number(profilePoints.regular)}</strong></dd></div>}
          </dl>
          <p>{text("skillCoverage")}</p>
          <p>{text("coverage", { count: number(summary.months), total: number(month), unknown: number(summary.unknown) })}</p>
          <p>{text("scope")}</p>
        </details>
      </>}
  </section>
}
