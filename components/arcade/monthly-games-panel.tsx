"use client"

import {
  BadgeCheck,
  Check,
  Circle,
  Clock,
  Copy,
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
  hasProfile: boolean
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

function safeTimeZone(value: unknown): string | null {
  if (typeof value !== "string") return null

  const timeZone = value.trim()
  if (!timeZone) return null

  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(0)
    return timeZone
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
      deadlineTimeZone: safeTimeZone(candidate.deadlineTimeZone),
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

function readCurrentLocale(): string | undefined {
  if (typeof document === "undefined") return undefined

  const host = document.querySelector<HTMLElement>(".monthly-games-host")
  const localizedAncestor = host?.closest<HTMLElement>("[lang]")
  return localizedAncestor?.lang || document.documentElement.lang || undefined
}

function formatDeadline(value: string | null, locale?: string): string {
  if (!value) return "Deadline unavailable"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Deadline unavailable"

  const date = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed)

  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)

  const timeZone = new Intl.DateTimeFormat(locale, {
    timeZoneName: "short",
  })
    .formatToParts(parsed)
    .find((part) => part.type === "timeZoneName")?.value

  return [date, time, timeZone].filter(Boolean).join(" · ")
}

function currentMonthHeading(locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date())
}

export default function MonthlyGamesPanel({ badges, hasProfile }: MonthlyGamesPanelProps) {
  const [games, setGames] = useState<MonthlyArcadeGame[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [locale, setLocale] = useState<string | undefined>(undefined)

  useEffect(() => {
    const syncLocale = () => setLocale(readCurrentLocale())
    syncLocale()

    const observer = new MutationObserver(syncLocale)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "data-locale"],
    })
    return () => observer.disconnect()
  }, [])

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
    () => hasProfile
      ? games.filter((game) => isCompleted(earnedTitleSet, game.title)).length
      : 0,
    [earnedTitleSet, games, hasProfile],
  )

  async function copyAccessCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      window.setTimeout(() => setCopiedCode((current) => current === code ? null : current), 1_500)
    } catch {
      setCopiedCode(null)
    }
  }

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
          <h2 id="monthly-games-title">{currentMonthHeading(locale)}</h2>
          <p>Track the active Arcade games against badges already present on this public profile.</p>
        </div>
        <div className={hasProfile ? "monthly-progress-summary" : "monthly-progress-summary is-pending"}>
          {hasProfile ? (
            <>
              <strong>{completedCount}/{games.length}</strong>
              <span>completed</span>
              <i aria-hidden="true"><b style={{ width: `${games.length ? (completedCount / games.length) * 100 : 0}%` }} /></i>
            </>
          ) : (
            <>
              <strong>—/{games.length}</strong>
              <span>Analyze profile to track completion</span>
              <i aria-hidden="true"><b style={{ width: "0%" }} /></i>
            </>
          )}
        </div>
      </div>

      <div className="monthly-games-grid">
        {games.map((game, index) => {
          const completed = hasProfile && isCompleted(earnedTitleSet, game.title)
          const stableKey =
            (game.joinUrl ?? game.accessCode ?? normalizeBadgeTitle(game.title)) ||
            "game"

          return (
            <article className={completed ? "monthly-game-card is-complete" : "monthly-game-card"} key={`${stableKey}-${index}`}>
              <div className="monthly-game-art">
                {game.imageUrl ? (
                  <img
                    className="monthly-game-art-image"
                    src={game.imageUrl}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <Gamepad2 />
                )}
                <span className={completed ? "monthly-game-status is-complete" : hasProfile ? "monthly-game-status" : "monthly-game-status is-pending"}>
                  {completed ? <BadgeCheck /> : <Circle />}
                  {completed ? "Completed" : hasProfile ? "Not completed" : "Analyze profile to check"}
                </span>
              </div>

              <div className="monthly-game-body">
                <h3>{game.title}</h3>
                {game.description && <p className="monthly-game-description">{game.description}</p>}

                <div className="monthly-game-meta">
                  {game.accessCode && (
                    <div className="monthly-access-row">
                      <div className="monthly-access-value">
                        <span>Access code</span>
                        <code>{game.accessCode}</code>
                      </div>
                      <button
                        className={copiedCode === game.accessCode ? "monthly-copy-button is-copied" : "monthly-copy-button"}
                        type="button"
                        onClick={() => void copyAccessCode(game.accessCode as string)}
                        aria-label="Copy access code"
                        title="Copy access code"
                      >
                        {copiedCode === game.accessCode ? <Check /> : <Copy />}
                        <span>{copiedCode === game.accessCode ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  )}

                  <div className="monthly-game-facts">
                    {game.points !== null && <span className="monthly-game-points"><Trophy /> Arcade point{game.points === 1 ? "" : "s"}: {game.points}</span>}
                    {game.spotsRemaining !== null && <span><Circle /> {formatInteger(game.spotsRemaining)} spots left</span>}
                  </div>

                  <span
                    className="monthly-game-deadline"
                    data-source-time-zone={game.deadlineTimeZone ?? undefined}
                  >
                    <Clock />
                    <strong>Deadline</strong>
                    <time dateTime={game.deadline ?? undefined}>{formatDeadline(game.deadline, locale)}</time>
                  </span>
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
