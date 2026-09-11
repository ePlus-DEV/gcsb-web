"use client"

import { Clock, Gamepad2 } from "lucide-react"
import { createPortal } from "react-dom"
import { useEffect, useMemo, useState } from "react"

const HOST_SELECTOR = ".program-countdown-host"
const HERO_SELECTOR = ".arcade-hero"
const DEFAULT_TIME_ZONE_OFFSET = "+05:30"

type CountdownUnit = "day" | "hour" | "minute" | "second"

type ProgramCountdownConfig = {
  id: "facilitator" | "arcade"
  title: string
  deadline: string
  enabled: boolean
  tone: "orange" | "blue"
}

type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
  ended: boolean
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value?.trim()) return fallback

  const normalized = value.trim().toLowerCase()
  if (["0", "false", "off", "no"].includes(normalized)) return false
  if (["1", "true", "on", "yes"].includes(normalized)) return true
  return fallback
}

function defaultSeasonDeadline(now: Date): string {
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const monthDay = month <= 6 ? "06-30" : "12-31"
  return `${year}-${monthDay}T23:59:59${DEFAULT_TIME_ZONE_OFFSET}`
}

function countdownParts(deadline: string, nowMs: number): CountdownParts {
  const deadlineMs = new Date(deadline).getTime()
  if (!Number.isFinite(deadlineMs)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true }
  }

  const diff = deadlineMs - nowMs
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true }
  }

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    ended: false,
  }
}

function currentLocale(): string | undefined {
  if (typeof document === "undefined") return undefined
  return document.documentElement.lang || navigator.language || undefined
}

function unitLabel(unit: CountdownUnit, locale?: string): string {
  try {
    const unitPart = new Intl.NumberFormat(locale, {
      style: "unit",
      unit,
      unitDisplay: "long",
    })
      .formatToParts(2)
      .find((part) => part.type === "unit")?.value

    if (unitPart) return unitPart
  } catch {
    // Use the English fallback below when Intl unit formatting is unavailable.
  }

  return `${unit}s`
}

function deadlineLabel(deadline: string, locale?: string): string {
  const parsed = new Date(deadline)
  if (Number.isNaN(parsed.getTime())) return "—"

  try {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(parsed)
  } catch {
    return parsed.toISOString()
  }
}

function formatPart(value: number): string {
  return String(value).padStart(2, "0")
}

function ProgramCard({
  config,
  locale,
  nowMs,
}: {
  config: ProgramCountdownConfig
  locale?: string
  nowMs: number
}) {
  const remaining = countdownParts(config.deadline, nowMs)
  const Icon = config.id === "arcade" ? Gamepad2 : Clock
  const timeParts: Array<{ unit: CountdownUnit; value: number }> = [
    { unit: "day", value: remaining.days },
    { unit: "hour", value: remaining.hours },
    { unit: "minute", value: remaining.minutes },
    { unit: "second", value: remaining.seconds },
  ]

  return (
    <article
      className={`program-countdown-card tone-${config.tone}${remaining.ended ? " is-ended" : ""}`}
      data-program={config.id}
      aria-label={config.title}
    >
      <div className="program-countdown-heading">
        <span className="program-countdown-icon" aria-hidden="true"><Icon /></span>
        <div>
          <strong>{config.title}</strong>
          <span><b>Deadline</b> · {deadlineLabel(config.deadline, locale)}</span>
        </div>
      </div>

      <div className="program-countdown-timer" role="timer">
        {timeParts.map((part, index) => (
          <div className="program-countdown-part-wrap" key={part.unit}>
            {index > 0 ? <span className="program-countdown-separator" aria-hidden="true">:</span> : null}
            <div className="program-countdown-part">
              <strong>{formatPart(part.value)}</strong>
              <span>{unitLabel(part.unit, locale)}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

export default function ProgramCountdown() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [locale, setLocale] = useState<string | undefined>(undefined)
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(HERO_SELECTOR)
    if (!hero?.parentElement) return

    let countdownHost = document.querySelector<HTMLElement>(HOST_SELECTOR)
    let created = false

    if (!countdownHost) {
      countdownHost = document.createElement("div")
      countdownHost.className = HOST_SELECTOR.slice(1)
      hero.insertAdjacentElement("afterend", countdownHost)
      created = true
    }

    setHost(countdownHost)

    return () => {
      if (created) countdownHost?.remove()
    }
  }, [])

  useEffect(() => {
    const syncLocale = () => setLocale(currentLocale())
    syncLocale()

    const observer = new MutationObserver(syncLocale)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "data-locale"],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [])

  const programs = useMemo<ProgramCountdownConfig[]>(() => {
    const fallbackDeadline = defaultSeasonDeadline(new Date(nowMs))

    return [
      {
        id: "facilitator",
        title: "Facilitator Program",
        deadline:
          process.env.NEXT_PUBLIC_COUNTDOWN_DEADLINE_FACILITATOR?.trim() ||
          fallbackDeadline,
        enabled: readBoolean(
          process.env.NEXT_PUBLIC_COUNTDOWN_ENABLED_FACILITATOR,
          false,
        ),
        tone: "orange",
      },
      {
        id: "arcade",
        title: "Arcade",
        deadline:
          process.env.NEXT_PUBLIC_COUNTDOWN_DEADLINE_ARCADE?.trim() ||
          fallbackDeadline,
        enabled: readBoolean(
          process.env.NEXT_PUBLIC_COUNTDOWN_ENABLED_ARCADE,
          true,
        ),
        tone: "blue",
      },
    ].filter((program) => program.enabled) as ProgramCountdownConfig[]
  }, [nowMs])

  if (!host || programs.length === 0) return null

  return createPortal(
    <section className={`program-countdown-grid${programs.length === 1 ? " is-single" : ""}`} aria-label="Deadline">
      {programs.map((program) => (
        <ProgramCard key={program.id} config={program} locale={locale} nowMs={nowMs} />
      ))}
    </section>,
    host,
  )
}
