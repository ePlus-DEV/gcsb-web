"use client"

import Link from "next/link"
import { monthlyGameDetailPath } from "@/components/monthly-labs/model"

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
  DEFAULT_WEBSITE_LOCALE,
  getWebsiteLocale,
  getWebsiteLocaleInfo,
  loadWebsiteCatalog,
  type WebsiteCatalog,
  type WebsiteLocale,
} from "@/lib/website-i18n"
import {
  monthlyGamesText,
  type MonthlyGamesTextKey,
} from "./monthly-games-copy"
import {
  ARCADE_MONTHLY_GAMES_URL,
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
      month: typeof candidate.month === "string" ? candidate.month : undefined,
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

function readCurrentLocale(): WebsiteLocale {
  if (typeof document === "undefined") return DEFAULT_WEBSITE_LOCALE

  const host = document.querySelector<HTMLElement>(".monthly-games-host")
  const localizedAncestor = host?.closest<HTMLElement>("[lang]")
  return getWebsiteLocale(
    localizedAncestor?.lang || document.documentElement.lang || DEFAULT_WEBSITE_LOCALE,
  )
}

function formatDeadline(
  value: string | null,
  locale: string,
  timeZone: string | null,
  unavailable: string,
): string {
  if (!value) return unavailable

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return unavailable

  const zone = timeZone ? { timeZone } : {}
  const date = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...zone,
  }).format(parsed)

  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    ...zone,
  }).format(parsed)

  const timeZoneName = new Intl.DateTimeFormat(locale, {
    timeZoneName: "short",
    ...zone,
  })
    .formatToParts(parsed)
    .find((part) => part.type === "timeZoneName")?.value

  return [date, time, timeZoneName].filter(Boolean).join(" · ")
}

function formatDeadlineCountdown(
  value: string | null,
  locale: string | undefined,
  nowMs: number,
): string {
  if (!value) return "—"

  const deadlineMs = new Date(value).getTime()
  if (!Number.isFinite(deadlineMs)) return "—"

  const diffMs = deadlineMs - nowMs
  if (diffMs <= 0) {
    const minutesAgo = Math.max(1, Math.floor(Math.abs(diffMs) / 60_000))
    return new Intl.RelativeTimeFormat(locale, { numeric: "always" })
      .format(-minutesAgo, "minute")
  }

  const totalMinutes = Math.max(1, Math.floor(diffMs / 60_000))
  const days = Math.floor(totalMinutes / 1_440)
  const hours = Math.floor((totalMinutes % 1_440) / 60)
  const minutes = totalMinutes % 60
  const formatUnit = (amount: number, unit: "day" | "hour" | "minute") =>
    new Intl.NumberFormat(locale, {
      style: "unit",
      unit,
      unitDisplay: "short",
      maximumFractionDigits: 0,
    }).format(amount)

  const parts: string[] = []
  if (days > 0) parts.push(formatUnit(days, "day"))
  if (hours > 0 || days > 0) parts.push(formatUnit(hours, "hour"))
  parts.push(formatUnit(minutes, "minute"))

  return parts.join(" ")
}

function currentMonthHeading(locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date())
}

function gameDeadlineMs(game: MonthlyArcadeGame): number | null {
  if (!game.deadline) return null
  const value = new Date(game.deadline).getTime()
  return Number.isFinite(value) ? value : null
}

function isGameExpired(game: MonthlyArcadeGame, nowMs: number): boolean {
  const deadlineMs = gameDeadlineMs(game)
  return deadlineMs !== null && deadlineMs <= nowMs
}

function latestGameMonthHeading(
  games: MonthlyArcadeGame[],
  locale?: string,
): string | null {
  const latestGame = games.reduce<MonthlyArcadeGame | null>((latest, game) => {
    const value = gameDeadlineMs(game)
    if (value === null) return latest
    if (!latest) return game

    const latestValue = gameDeadlineMs(latest)
    return latestValue === null || value > latestValue ? game : latest
  }, null)

  if (!latestGame?.deadline) return null

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    ...(latestGame.deadlineTimeZone ? { timeZone: latestGame.deadlineTimeZone } : {}),
  }).format(new Date(latestGame.deadline))
}

export default function MonthlyGamesPanel({ badges, hasProfile }: MonthlyGamesPanelProps) {
  const [games, setGames] = useState<MonthlyArcadeGame[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [expandedDeadline, setExpandedDeadline] = useState<string | null>(null)
  const [locale, setLocale] = useState<WebsiteLocale>(DEFAULT_WEBSITE_LOCALE)
  const [catalog, setCatalog] = useState<WebsiteCatalog | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const intlLocale = getWebsiteLocaleInfo(locale).htmlLang
  const text = (
    key: MonthlyGamesTextKey,
    params?: Record<string, string | number>,
  ) => catalog ? monthlyGamesText(catalog, key, params) : ""

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
    setCatalog(null)

    void loadWebsiteCatalog(locale)
      .then((nextCatalog) => {
        if (active) setCatalog(nextCatalog)
      })
      .catch(() => {
        if (active) setCatalog(null)
      })

    return () => {
      active = false
    }
  }, [locale])

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60_000)
    return () => window.clearInterval(timer)
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

        const payload = await response.json()
        if (!Array.isArray(payload)) throw new Error("Invalid monthly games feed")

        const parsed = parseMonthlyGames(payload)
        if (payload.length > 0 && parsed.length === 0) {
          throw new Error("Monthly games feed contains no valid games")
        }
        if (!active) return

        setGames(parsed)
        setLoadFailed(false)
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

  const activeGames = useMemo(
    () => games.filter((game) => !isGameExpired(game, nowMs)),
    [games, nowMs],
  )
  const expiredGames = useMemo(
    () => games.filter((game) => isGameExpired(game, nowMs)),
    [games, nowMs],
  )
  const awaitingNewGames =
    games.length === 0 ||
    (expiredGames.length === games.length && activeGames.length === 0)
  const previousGamesMonth = useMemo(
    () => latestGameMonthHeading(expiredGames, intlLocale),
    [expiredGames, intlLocale],
  )

  const completedCount = useMemo(
    () => hasProfile
      ? activeGames.filter((game) => isCompleted(earnedTitleSet, game.title)).length
      : 0,
    [activeGames, earnedTitleSet, hasProfile],
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

  if (!catalog) {
    return (
      <section className="monthly-games-panel is-loading" aria-busy="true">
        <LoaderCircle className="spin" />
      </section>
    )
  }

  if (loading) {
    return (
      <section
        className="monthly-games-panel is-loading"
        aria-label={text("loadingAria")}
        aria-busy="true"
      >
        <LoaderCircle className="spin" />
        <span>{text("loading")}</span>
      </section>
    )
  }

  if (loadFailed) return null

  return (
    <section className="monthly-games-panel" aria-labelledby="monthly-games-title">
      <div className="monthly-games-heading">
        <div>
          <span className="monthly-games-kicker"><Gamepad2 /> {text("thisMonth")}</span>
          <h2 id="monthly-games-title">{currentMonthHeading(intlLocale)}</h2>
          <Link href="/monthly-labs/" className="monthly-lab-source">{catalog.messages.monthlyLabs}</Link>
          <p>
            {awaitingNewGames
              ? text("previousEndedWaiting")
              : text("activeDescription")}
          </p>
        </div>
        <div className={
          awaitingNewGames
            ? "monthly-progress-summary is-coming-soon"
            : hasProfile
              ? "monthly-progress-summary"
              : "monthly-progress-summary is-pending"
        }>
          {awaitingNewGames ? (
            <>
              <strong>{text("comingSoon")}</strong>
              <span>{text("newLabsNotPublished")}</span>
            </>
          ) : hasProfile ? (
            <>
              <strong>{completedCount}/{activeGames.length}</strong>
              <span>{text("completedLower")}</span>
              <i aria-hidden="true"><b style={{ width: `${activeGames.length ? (completedCount / activeGames.length) * 100 : 0}%` }} /></i>
            </>
          ) : (
            <>
              <strong>—/{activeGames.length}</strong>
              <span>{text("analyzeProfileTracking")}</span>
              <i aria-hidden="true"><b style={{ width: "0%" }} /></i>
            </>
          )}
        </div>
      </div>

      {awaitingNewGames ? (
        <div className="monthly-games-coming-soon" role="status">
          <span className="monthly-coming-soon-icon" aria-hidden="true"><Gamepad2 /></span>
          <div>
            <span className="monthly-coming-soon-label">{text("awaitingNewLabs")}</span>
            <h3>{text("comingSoonTitle", { month: currentMonthHeading(intlLocale) })}</h3>
            <p>
              {previousGamesMonth ? `${text("previousEnded", { month: previousGamesMonth })} ` : ""}
              {text("newGamesAuto")}
            </p>
          </div>
        </div>
      ) : (
        <div className="monthly-games-grid">
        {activeGames.map((game, index) => {
          const detailPath = monthlyGameDetailPath(game)
          const completed = hasProfile && isCompleted(earnedTitleSet, game.title)
          const stableKey =
            (game.joinUrl ?? game.accessCode ?? normalizeBadgeTitle(game.title)) ||
            "game"
          const deadlineKey = `${stableKey}-${index}`
          const deadlineDetail = formatDeadline(
            game.deadline,
            intlLocale,
            game.deadlineTimeZone,
            text("deadlineUnavailable"),
          )

          return (
            <article className={completed ? "monthly-game-card is-complete" : "monthly-game-card"} key={deadlineKey}>
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
                  {completed
                    ? text("completed")
                    : hasProfile
                      ? text("notCompleted")
                      : text("analyzeProfileCheck")}
                </span>
              </div>

              <div className="monthly-game-body">
                <h3>{game.title}</h3>
                {game.description && <p className="monthly-game-description">{game.description}</p>}

                <div className="monthly-game-meta">
                  {game.accessCode && (
                    <div className="monthly-access-row">
                      <div className="monthly-access-value">
                        <span>{text("accessCode")}</span>
                        <code>{game.accessCode}</code>
                      </div>
                      <button
                        className={copiedCode === game.accessCode ? "monthly-copy-button is-copied" : "monthly-copy-button"}
                        type="button"
                        onClick={() => void copyAccessCode(game.accessCode as string)}
                        aria-label={text("copyAccessCode")}
                        title={text("copyAccessCode")}
                      >
                        {copiedCode === game.accessCode ? <Check /> : <Copy />}
                        <span>{copiedCode === game.accessCode ? text("copied") : text("copy")}</span>
                      </button>
                    </div>
                  )}

                  <div className="monthly-game-facts">
                    {game.points !== null && (
                      <span className="monthly-game-points">
                        <Trophy /> {text(
                          game.points === 1 ? "arcadePoint" : "arcadePoints",
                          { count: game.points },
                        )}
                      </span>
                    )}
                    {game.spotsRemaining !== null && (
                      <span>
                        <Circle /> {text("spotsLeft", {
                          count: new Intl.NumberFormat(intlLocale, {
                            maximumFractionDigits: 0,
                          }).format(game.spotsRemaining),
                        })}
                      </span>
                    )}
                  </div>

                  <button
                    className={expandedDeadline === deadlineKey ? "monthly-game-deadline is-open" : "monthly-game-deadline"}
                    type="button"
                    data-source-time-zone={game.deadlineTimeZone ?? undefined}
                    aria-label={text("deadlineAria", { value: deadlineDetail })}
                    aria-expanded={expandedDeadline === deadlineKey}
                    onClick={() => setExpandedDeadline((current) => current === deadlineKey ? null : deadlineKey)}
                  >
                    <Clock />
                    <strong>{text("deadline")}</strong>
                    <time dateTime={game.deadline ?? undefined}>
                      {formatDeadlineCountdown(game.deadline, intlLocale, nowMs)}
                    </time>
                    <span className="monthly-deadline-tooltip" role="tooltip">
                      {deadlineDetail}
                    </span>
                  </button>
                </div>

                {(detailPath || game.joinUrl) && (
                  <div className="monthly-game-actions">
                    {detailPath && (
                      <Link href={detailPath} className="monthly-lab-source">
                        {catalog.messages.labDetails}
                      </Link>
                    )}
                    {game.joinUrl && (
                      <a className="monthly-game-link" href={game.joinUrl} target="_blank" rel="noreferrer noopener">
                        {text("openGame")} <ExternalLink />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          )
        })}
        </div>
      )}
    </section>
  )
}
