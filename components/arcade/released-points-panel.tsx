"use client"

import { useEffect, useState } from "react"
import type { WebsiteCatalog } from "@/lib/website-i18n"
import type { ArcadeBadge } from "./model"
import { parseReleasedGames, summarizeReleasedPoints, type ReleasedGame } from "./released-points"

export default function ReleasedPointsPanel({ badges, hasProfile, catalog, locale, nowMs }: {
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
  const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)
  return <section className="released-points-panel" aria-labelledby="released-points-title" aria-busy={!summary && !failed}>
    <h3 id="released-points-title">{text("title", { year: String(year) })}</h3>
    <p>{text("scope")}</p>
    {failed ? <div role="status"><p>{text("error")}</p><button type="button" onClick={() => setAttempt((value) => value + 1)}>{text("retry")}</button></div>
      : !summary ? <p role="status">{text("loading")}</p>
      : <>
        <p>{text("coverage", { count: number(summary.months), total: number(month), unknown: number(summary.unknown) })}</p>
        <dl className="released-points-stats">
          <div><dt>{text("released")}</dt><dd>{number(summary.total)}</dd></div>
          {hasProfile && <>
            <div><dt>{text("earned")}</dt><dd>{number(summary.achieved)}</dd></div>
            <div><dt>{text("available")}</dt><dd>{number(summary.available)}</dd></div>
            <div><dt>{text("expired")}</dt><dd>{number(summary.expired)}</dd></div>
          </>}
        </dl>
        {hasProfile ? <div><progress aria-label={text("earned")} max={1} value={summary.percent} /><output>{new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(summary.percent)}</output></div> : <p>{text("profile")}</p>}
      </>}
  </section>
}
