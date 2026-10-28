"use client"

import { useEffect, useState } from "react"
import { Trophy } from "lucide-react"
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
  if (embedded && profilePoints && hasProfile) {
    const rows = [
      { tone: "games", label: text("gamesGroup"), value: profilePoints.games === null || profilePoints.triviaSpecial === null ? null : profilePoints.games + profilePoints.triviaSpecial, published: summary ? number(summary.total) : "—" },
      { tone: "skills", label: catalog.messages.skillBadges, value: profilePoints.skills, published: text("incomplete") },
      { tone: "bonus", label: catalog.messages.facilitatorBonus, value: profilePoints.bonus, published: "—" },
    ]
    return <section className="point-comparison" dir={locale.startsWith("ar") ? "rtl" : "ltr"} aria-label={text("overviewTitle", { year: String(year) })}>
      <table>
        <thead><tr><th scope="col">{text("category")}</th><th scope="col">{text("achieved")}</th><th scope="col">{text("history")}*</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.label}>
          <th scope="row"><span className={`point-comparison-label tone-${row.tone}`}><i aria-hidden="true" />{row.label}</span></th>
          <td data-label={text("achieved")}>{number(row.value)}</td>
          <td data-label={text("history")}>{row.published}</td>
        </tr>)}</tbody>
      </table>
      {failed ? <div role="status"><p>{text("error")}</p><button type="button" onClick={() => setAttempt((value) => value + 1)}>{text("retry")}</button></div> : !summary ? <p role="status">{text("loading")}</p> : null}
      {summary && <details className="point-comparison-details"><summary>{text("title", { year: String(year) })}*</summary>
        <p>{text("earned")}: {number(summary.achieved)}</p>
        <p>{text("coverage", { count: number(summary.months), total: number(month), unknown: number(summary.unknown) })}</p>
        <dl><div><dt>{text("available")}</dt><dd>{number(summary.available)}</dd></div><div><dt>{text("expired")}</dt><dd>{number(summary.expired)}</dd></div></dl>
        <p>{text("comparisonNote")}</p>
      </details>}
    </section>
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
