"use client"

import {
  BadgeCheck,
  Circle,
  Clock,
  ExternalLink,
  Gamepad2,
  LoaderCircle,
  Trophy,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  ARCADE_MONTHLY_GAMES_URL,
  formatInteger,
  type ArcadeBadge,
  type MonthlyArcadeGame,
} from "./model"

type MonthlyGamesPanelProps = {
  badges: ArcadeBadge[]
}

function normalizeBadgeTitle(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function isCompleted(earned: Set<string>, title: string): boolean {
  const key = normalizeBadgeTitle(title)
  return key !== "" && earned.has(key)
}

function safeHttpsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null

  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function optionalNumber(value: unknown): number | null {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    String(value).trim() === ""
  ) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseMonthlyGames(payload: unknown): MonthlyArcadeGame[] {
  if (!Array.isArray(payload)) return []

  return payload.flatMap((item) => {
    if (typeof item !== "object" || item === null) return []
    const candidate = item as Record<string, unknown>
    const title = typeof candidate.title === "string" ? candidate.title.trim() : ""
    if (!title) return []

    return [{
      title,
      imageUrl: safeHttpsUrl(candidate.imageUrl),
      accessCode:
        typeof candidate.accessCode === "string" && candidate.accessCode.trim()
          ? candidate.accessCode.trim()
          : null,
      deadline:
        typeof candidate.deadline === "string" && candidate.deadline.trim()
          ? candidate.deadline.trim()
          : null,
      description:
        typeof candidate.description === "string" && candidate.description.trim()
          ? candidate.description.trim()
          : null,
      points: optionalNumber(candidate.points),
      joinUrl: safeHttpsUrl(candidate.joinUrl),
      spotsRemaining: optionalNumber(candidate.spotsRemaining),
    }]
  })
}

function currentLocale(): string | undefined {
  if (typeof document === "undefined") return undefined

  const host = document.querySelector<HTMLElement>(".monthly-games-host")
  const localizedAncestor = host?.closest<HTMLElement>("[lang]")
  return localizedAncestor?.lang || document.documentElement.lang || undefined
}

function formatDeadline(value: string | null): string {
  if (!value) return "Deadline unavailable"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Deadline unavailable"

  return new Intl.DateTimeFormat(currentLocale(), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed)
}

function currentMonthHeading(): string {
  return new Intl.DateTimeFormat(currentLocale(), {
    month: "long",
    year: "numeric",
  }).format(new Date())
}

export default function MonthlyGamesPanel({ badges }: MonthlyGamesPanelProps) {
  const [games, setGames] = useState<MonthlyArcadeGame[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12_000)

    async function loadMonthlyGames() {
      try {
        const response = await fetch(ARCADE_MONTHLY_GAMES_URL, {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const parsed = parseMonthlyGames(await response.json())
        if (!active) return

        setGames(parsed)
        setLoadFailed(parsed.length === 0)
      } catch {
        if (active) setLoadFailed(true)
      } finally {
        window.clearTimeout(timeout)
        if (active) setLoading(false)
      }
    }

    void loadMonthlyGames()

    return () => {
      active = false
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [])

  const earnedTitleSet = useMemo(
    () => new Set(
      badges
        .map((badge) => normalizeBadgeTitle(badge.title))
        .filter(Boolean),
    ),
    [badges],
  )

  const completedCount = useMemo(
    () => games.filter((game) => isCompleted(earnedTitleSet, game.title)).length,
    [earnedTitleSet, games],
  )

  if (loading) {
    return (
      <section className="monthly-games-panel is-loading" aria-label="Loading current Arcade games">
        <LoaderCircle className="spin" />
        <span>Loading current Arcade games…</span>
      </section>
    )
  }

  if (loadFailed || games.length === 0) return null

  return (
    <section className="monthly-games-panel" aria-labelledby="monthly-games-title">
      <div className="monthly-games-heading">
        <div>
          <span className="monthly-games-kicker"><Gamepad2 /> This month</span>
          <h2 id="monthly-games-title">{currentMonthHeading()}</h2>
          <p>Track the active Arcade games against badges already present on this public profile.</p>
        </div>
        <div className="monthly-progress-summary">
          <strong>{completedCount}/{games.length}</strong>
          <span>completed</span>
          <i aria-hidden="true"><b style={{ width: `${games.length ? (completedCount / games.length) * 100 : 0}%` }} /></i>
        </div>
      </div>

      <div className="monthly-games-grid">
        {games.map((game, index) => {
          const completed = isCompleted(earnedTitleSet, game.title)
          const stableKey =
            game.joinUrl ??
            game.accessCode ??
            normalizeBadgeTitle(game.title) ||
            "game"

          return (
            <article className={completed ? "monthly-game-card is-complete" : "monthly-game-card"} key={`${stableKey}-${index}`}>
              <div className="monthly-game-art">
                {game.imageUrl ? (
                  <img src={game.imageUrl} alt="" loading="lazy" />
                ) : (
                  <Gamepad2 />
                )}
                <span className={completed ? "monthly-game-status is-complete" : "monthly-game-status"}>
                  {completed ? <BadgeCheck /> : <Circle />}
                  {completed ? "Completed" : "Not completed"}
                </span>
              </div>

              <div className="monthly-game-body">
                <h3>{game.title}</h3>
                {game.description && <p className="monthly-game-description">{game.description}</p>}

                <div className="monthly-game-meta">
                  {game.accessCode && <span><code>{game.accessCode}</code> Access code</span>}
                  {game.points !== null && <span><Trophy /> {game.points} Arcade point{game.points === 1 ? "" : "s"}</span>}
                  {game.spotsRemaining !== null && <span><Circle /> {formatInteger(game.spotsRemaining)} spots left</span>}
                  <span><Clock /> {formatDeadline(game.deadline)}</span>
                </div>

                {game.joinUrl && (
                  <a className="monthly-game-link" href={game.joinUrl} target="_blank" rel="noreferrer noopener">
                    Open game <ExternalLink />
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
