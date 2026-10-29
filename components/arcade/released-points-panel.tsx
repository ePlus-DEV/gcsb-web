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
  const [historyActivation, setHistoryActivation] = useState<"hover" | "click">("click")
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supportsDesktopHover = () => typeof window !== "undefined" &&
    window.matchMedia("(min-width: 681px) and (hover: hover) and (pointer: fine)").matches
  const clearHoverClose = () => {
    if (hoverCloseTimerRef.current !== null) {
      clearTimeout(hoverCloseTimerRef.current)
      hoverCloseTimerRef.current = null
    }
  }
  const openHistoryOnHover = () => {
    if (!supportsDesktopHover()) return
    clearHoverClose()
    positionPopover()
    setHistoryActivation("hover")
    setHistoryOpen(true)
  }
  const closeHistoryAfterHover = () => {
    if (!supportsDesktopHover() || historyActivation !== "hover") return
    clearHoverClose()
    hoverCloseTimerRef.current = setTimeout(() => {
      hoverCloseTimerRef.current = null
      setHistoryOpen(false)
    }, 180)
  }
  useEffect(() => () => clearHoverClose(), [])
  // No placeholder (12, 12) coordinates: compute the initial anchor position
  // before mounting the portal, preventing a visible jump from the top-left.
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number; maxHeight: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const dialogId = useId()
  const positionPopover = () => {
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
    // Recalculate only for viewport or scroll changes, not the first paint.
    positionPopover()
    const dialog = dialogRef.current
    const wasMobile = window.matchMedia("(max-width: 680px)").matches
    // Hover is non-modal: never steal focus just because the mouse entered a label.
    if (historyActivation === "click") dialog?.focus()
    const originalOverflow = document.body.style.overflow
    if (wasMobile) document.body.style.overflow = "hidden"
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        clearHoverClose()
        setHistoryOpen(false)
        return
      }
      if (!wasMobile || event.key !== "Tab" || !dialog) return
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]'))
      if (!controls.length) { event.preventDefault(); return }
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus()
      }
    }
    const onOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (dialog?.contains(target) || triggerRef.current?.contains(target)) return
      clearHoverClose()
      setHistoryOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    if (!wasMobile) document.addEventListener("pointerdown", onOutsidePointer)
    window.addEventListener("resize", positionPopover)
    window.addEventListener("scroll", positionPopover, true)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onOutsidePointer)
      window.removeEventListener("resize", positionPopover)
      window.removeEventListener("scroll", positionPopover, true)
      if (wasMobile) document.body.style.overflow = originalOverflow
      if (historyActivation === "click") triggerRef.current?.focus()
    }
  }, [historyOpen, historyActivation])

  const summary = games ? summarizeReleasedPoints(games, badges, nowMs) : null
  const number = (value: number | null) => value === null ? "—" : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)
  if (embedded) {
    if (!hasProfile || !profilePoints) return null
    const title = text("title", { year: String(year) })
    return <>
      <section className="point-comparison" dir={locale.startsWith("ar") ? "rtl" : "ltr"} aria-label={title}>
        <div className="point-history-line"
          onMouseEnter={openHistoryOnHover} onMouseLeave={closeHistoryAfterHover}>
          <span className="point-history-label">{title}</span>
          <span className="point-history-count">
            {summary ? <strong title={text("released")}>{catalog.dynamic.points.replace("{count}", number(summary.total)).replace(/^\+\s*/, "")}</strong>
              : failed ? text("error") : text("loading")}
          </span>
          <button ref={triggerRef} type="button" className="point-history-trigger"
            aria-label={historyOpen ? catalog.additional["Close details"] : catalog.additional["Open details"]}
            aria-haspopup="dialog" aria-expanded={historyOpen} aria-controls={dialogId}
            onClick={(event) => {
              // On fine-pointer desktops hover is primary; keyboard activation still works.
              if (supportsDesktopHover() && event.detail !== 0) return
              clearHoverClose()
              positionPopover()
              setHistoryActivation("click")
              setHistoryOpen((open) => !open)
            }}>
            <CircleHelp aria-hidden="true" />
          </button>
        </div>
      </section>
      {historyOpen && popoverPosition && typeof document !== "undefined" && createPortal(
        <div className={`point-history-portal${document.documentElement.classList.contains("light") || document.body.classList.contains("light") ? " is-light" : ""}`} dir={locale.startsWith("ar") ? "rtl" : "ltr"}>
          <div className="point-history-backdrop" aria-hidden="true" onClick={() => setHistoryOpen(false)} />
          <section id={dialogId} ref={dialogRef} role="dialog"
            aria-modal={typeof window !== "undefined" && window.matchMedia("(max-width: 680px)").matches}
            aria-labelledby={`${dialogId}-title`} onMouseEnter={clearHoverClose}
            onMouseLeave={closeHistoryAfterHover}
            tabIndex={-1} className="point-history-popover"
            style={{ top: popoverPosition.top, left: popoverPosition.left, maxHeight: popoverPosition.maxHeight }}>
            <header className="point-history-popover-header">
              <h3 id={`${dialogId}-title`}>{title}</h3>
              <button type="button" className="point-history-close" aria-label={catalog.additional["Close details"]}
                onClick={() => setHistoryOpen(false)}><X aria-hidden="true" /></button>
            </header>
            <div className="point-history-popover-body" tabIndex={0}>
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
                <details className="point-history-explanation">
                  <summary>{catalog.messages.pointBreakdown}</summary>
                  <div className="point-history-notes">
                    <p>{text("scope")}</p>
                    <p>{text("skillCoverage")}</p>
                  </div>
                </details>
              </>}
            </div>
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
