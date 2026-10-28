"use client"

import { useEffect, useState } from "react"
import { Trophy, Check, Clock, Circle } from "lucide-react"
import type { WebsiteCatalog } from "@/lib/website-i18n"
import type { ArcadeBadge } from "./model"
import type { ProfilePointSummary } from "./profile-point-summary"
import { parseReleasedGames, summarizeReleasedPoints, type ReleasedGame } from "./released-points"

export default function ReleasedPointsPanel({ badges, hasProfile, catalog, locale, nowMs, profilePoints }: {
  profilePoints?: ProfilePointSummary | null
  badges: ArcadeBadge[]; hasProfile: boolean; catalog: WebsiteCatalog; locale: string; nowMs: number
}) {
  const [games, setGames] = useState<ReleasedGame[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
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

  const summary = games ? summarizeReleasedPoints(games, badges, nowMs) : null
  const number = (value: number | null) => value === null ? "—" : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)
  return <section className="released-points-panel" aria-labelledby="released-points-title" aria-busy={!summary && !failed}>
    <div className="released-points-heading">
      <div className="released-points-heading-title"><span className="released-points-emblem" aria-hidden="true"><Trophy /></span><h3 id="released-points-title">{text("overviewTitle", { year: String(year) })}</h3></div>
      {hasProfile && profilePoints && <div className="released-profile-total"><span>{catalog.messages.totalArcadePoints}</span><strong>{number(profilePoints.total)}</strong></div>}
    </div>
    {hasProfile && profilePoints && <>
      <dl className="released-points-stats released-profile-stats">
        <div className="released-stat is-total"><dt>{catalog.messages.gameBadges}</dt><dd>{number(profilePoints.games)}</dd></div>
        <div className="released-stat is-skill"><dt>{catalog.messages.skillBadges}</dt><dd>{number(profilePoints.skills)}</dd></div>
        <div className="released-stat is-available"><dt>{catalog.messages.triviaSpecial}</dt><dd>{number(profilePoints.triviaSpecial)}</dd></div>
        <div className="released-stat is-earned"><dt>{catalog.messages.facilitatorBonus}</dt><dd>{number(profilePoints.bonus)}</dd></div>
      </dl>
      <div className="released-profile-regular"><span>{catalog.messages.regularPoints}</span><strong>{number(profilePoints.regular)}</strong></div>
    </>}
    <p className="released-skill-coverage">{text("skillCoverage")}</p>
    <div className="released-history-heading"><h4>{text("title", { year: String(year) })}</h4>
      {hasProfile && summary && <output className="released-points-percent">{new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(summary.percent)}</output>}
    </div>
    {failed ? <div role="status"><p>{text("error")}</p><button type="button" onClick={() => setAttempt((value) => value + 1)}>{text("retry")}</button></div>
      : !summary ? <p role="status">{text("loading")}</p>
      : <>
        <dl className="released-points-stats">
          <div className="released-stat is-total"><dt><Trophy aria-hidden="true" />{text("released")}</dt><dd>{number(summary.total)}</dd></div>
          {hasProfile && <>
            <div className="released-stat is-earned"><dt><Check aria-hidden="true" />{text("earned")}</dt><dd>{number(summary.achieved)}</dd></div>
            <div className="released-stat is-available"><dt><Clock aria-hidden="true" />{text("available")}</dt><dd>{number(summary.available)}</dd></div>
            <div className="released-stat is-expired"><dt><Circle aria-hidden="true" />{text("expired")}</dt><dd>{number(summary.expired)}</dd></div>
          </>}
        </dl>
        {hasProfile ? <progress aria-label={text("earned")} max={1} value={summary.percent} /> : <p>{text("profile")}</p>}
        <details className="released-points-notes"><summary>{text("coverage", { count: number(summary.months), total: number(month), unknown: number(summary.unknown) })}</summary><p>{text("scope")}</p></details>
      </>}
  </section>
}
