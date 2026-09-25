"use client"

import { Clock, Gamepad2 } from "lucide-react"
import { createPortal } from "react-dom"
import { useEffect, useMemo, useState } from "react"
import {
  initialDeadline,
  resolvedRemoteDeadline,
  type DeadlineSource,
  type ResolvedDeadline,
} from "./countdown-deadline"

const HOST_SELECTOR = ".program-countdown-host"
const HERO_SELECTOR = ".arcade-hero"
const FACILITATOR_LAUNCHER_SELECTOR = ".facilitator-launcher"
const DEFAULT_TIME_ZONE_OFFSET = "+05:30"
const FIREBASE_CDN_VERSION = "12.18.0"
const DEFAULT_FETCH_INTERVAL_MS = 900_000
const DEFAULT_FETCH_TIMEOUT_MS = 60_000

type CountdownUnit = "day" | "hour" | "minute" | "second"
type CountdownSource = "fallback" | "remote"

type ProgramCountdownConfig = {
  id: "facilitator" | "arcade"
  title: string
  deadline: string | null
  deadlineSource: DeadlineSource
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

type FirebaseClientConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

type FirebaseAppModule = {
  initializeApp: (config: FirebaseClientConfig) => unknown
  getApps: () => unknown[]
  getApp: () => unknown
}

type RemoteConfigValue = {
  asString: () => string
  asBoolean: () => boolean
  getSource?: () => string
}

type RemoteConfigInstance = {
  defaultConfig: Record<string, string | number | boolean>
  settings: {
    minimumFetchIntervalMillis: number
    fetchTimeoutMillis: number
  }
}

type FirebaseRemoteConfigModule = {
  getRemoteConfig: (app: unknown) => RemoteConfigInstance
  fetchAndActivate: (remoteConfig: RemoteConfigInstance) => Promise<boolean>
  getValue: (remoteConfig: RemoteConfigInstance, key: string) => RemoteConfigValue
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value?.trim()) return fallback

  const normalized = value.trim().toLowerCase()
  if (["0", "false", "off", "no"].includes(normalized)) return false
  if (["1", "true", "on", "yes"].includes(normalized)) return true
  return fallback
}

function readDuration(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function defaultSeasonDeadline(now: Date): string {
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const monthDay = month <= 6 ? "06-30" : "12-31"
  return `${year}-${monthDay}T23:59:59${DEFAULT_TIME_ZONE_OFFSET}`
}

function defaultPrograms(): ProgramCountdownConfig[] {
  const arcadeSeasonDeadline = defaultSeasonDeadline(new Date())
  const facilitatorDeadline = initialDeadline(
    "facilitator",
    process.env.WXT_COUNTDOWN_DEADLINE_FACILITATOR,
    arcadeSeasonDeadline,
  )
  const arcadeDeadline = initialDeadline(
    "arcade",
    process.env.WXT_COUNTDOWN_DEADLINE_ARCADE,
    arcadeSeasonDeadline,
  )

  return [
    {
      id: "facilitator",
      title: "Facilitator Program",
      deadline: facilitatorDeadline.deadline,
      deadlineSource: facilitatorDeadline.source,
      enabled: readBoolean(process.env.WXT_COUNTDOWN_ENABLED_FACILITATOR, true),
      tone: "orange",
    },
    {
      id: "arcade",
      title: "Arcade",
      deadline: arcadeDeadline.deadline,
      deadlineSource: arcadeDeadline.source,
      enabled: readBoolean(process.env.WXT_COUNTDOWN_ENABLED_ARCADE, true),
      tone: "blue",
    },
  ]
}

function firebaseConfig(): FirebaseClientConfig {
  return {
    apiKey: process.env.WXT_FIREBASE_API_KEY?.trim() || "",
    authDomain: process.env.WXT_FIREBASE_AUTH_DOMAIN?.trim() || "",
    projectId: process.env.WXT_FIREBASE_PROJECT_ID?.trim() || "",
    storageBucket: process.env.WXT_FIREBASE_STORAGE_BUCKET?.trim() || "",
    messagingSenderId:
      process.env.WXT_FIREBASE_MESSAGING_SENDER_ID?.trim() || "",
    appId: process.env.WXT_FIREBASE_APP_ID?.trim() || "",
  }
}

function isLocalEnvironment(): boolean {
  const host = window.location.hostname
  const localHost = host === "localhost" || host === "127.0.0.1"
  const development = process.env.NODE_ENV === "development" || localHost
  const forceRemote = readBoolean(process.env.WXT_FORCE_REMOTE_CONFIG, false)
  return development && !forceRemote
}

async function importBrowserModule<T>(url: string): Promise<T> {
  return import(/* webpackIgnore: true */ url) as Promise<T>
}

function remoteDeadline(
  remoteModule: FirebaseRemoteConfigModule,
  remoteConfig: RemoteConfigInstance,
  key: string,
  fallback: ResolvedDeadline,
): ResolvedDeadline {
  const value = remoteModule.getValue(remoteConfig, key)
  return resolvedRemoteDeadline(fallback, value.asString(), value.getSource?.())
}

function remoteBoolean(
  remoteModule: FirebaseRemoteConfigModule,
  remoteConfig: RemoteConfigInstance,
  key: string,
  fallback: boolean,
): boolean {
  const value = remoteModule.getValue(remoteConfig, key)
  return value.getSource?.() === "remote" ? value.asBoolean() : fallback
}

async function loadRemotePrograms(
  fallbackPrograms: ProgramCountdownConfig[],
): Promise<{ programs: ProgramCountdownConfig[]; source: CountdownSource }> {
  if (isLocalEnvironment()) {
    return { programs: fallbackPrograms, source: "fallback" }
  }

  const config = firebaseConfig()
  if (!config.apiKey || !config.projectId) {
    return { programs: fallbackPrograms, source: "fallback" }
  }

  try {
    const [appModule, remoteModule] = await Promise.all([
      importBrowserModule<FirebaseAppModule>(
        `https://www.gstatic.com/firebasejs/${FIREBASE_CDN_VERSION}/firebase-app.js`,
      ),
      importBrowserModule<FirebaseRemoteConfigModule>(
        `https://www.gstatic.com/firebasejs/${FIREBASE_CDN_VERSION}/firebase-remote-config.js`,
      ),
    ])

    const app =
      appModule.getApps().length > 0
        ? appModule.getApp()
        : appModule.initializeApp(config)
    const remoteConfig = remoteModule.getRemoteConfig(app)
    const facilitator = fallbackPrograms.find((item) => item.id === "facilitator")!
    const arcade = fallbackPrograms.find((item) => item.id === "arcade")!

    remoteConfig.defaultConfig = {
      countdown_deadline_facilitator: facilitator.deadline ?? "",
      countdown_enabled_facilitator: facilitator.enabled,
      countdown_deadline_arcade: arcade.deadline ?? "",
      countdown_enabled_arcade: arcade.enabled,
    }
    remoteConfig.settings = {
      minimumFetchIntervalMillis: readDuration(
        process.env.WXT_FIREBASE_FETCH_INTERVAL_MS,
        DEFAULT_FETCH_INTERVAL_MS,
      ),
      fetchTimeoutMillis: readDuration(
        process.env.WXT_FIREBASE_FETCH_TIMEOUT_MS,
        DEFAULT_FETCH_TIMEOUT_MS,
      ),
    }

    await remoteModule.fetchAndActivate(remoteConfig)

    // Resolve each program strictly from its own remote key. Firebase defaults
    // or absent remote values retain that program's own env/fallback status.
    const facilitatorDeadline = remoteDeadline(
      remoteModule,
      remoteConfig,
      "countdown_deadline_facilitator",
      { deadline: facilitator.deadline, source: facilitator.deadlineSource },
    )
    const arcadeDeadline = remoteDeadline(
      remoteModule,
      remoteConfig,
      "countdown_deadline_arcade",
      { deadline: arcade.deadline, source: arcade.deadlineSource },
    )

    return {
      source:
        facilitatorDeadline.source === "remote" || arcadeDeadline.source === "remote"
          ? "remote"
          : "fallback",
      programs: [
        {
          ...facilitator,
          deadline: facilitatorDeadline.deadline,
          deadlineSource: facilitatorDeadline.source,
          enabled: remoteBoolean(
            remoteModule,
            remoteConfig,
            "countdown_enabled_facilitator",
            facilitator.enabled,
          ),
        },
        {
          ...arcade,
          deadline: arcadeDeadline.deadline,
          deadlineSource: arcadeDeadline.source,
          enabled: remoteBoolean(
            remoteModule,
            remoteConfig,
            "countdown_enabled_arcade",
            arcade.enabled,
          ),
        },
      ],
    }
  } catch (error) {
    console.warn("Program countdown Remote Config unavailable; using defaults.", error)
    return { programs: fallbackPrograms, source: "fallback" }
  }
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

function openFacilitatorDetails() {
  document
    .querySelector<HTMLButtonElement>(FACILITATOR_LAUNCHER_SELECTOR)
    ?.click()
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
  const remaining = config.deadline ? countdownParts(config.deadline, nowMs) : null
  const Icon = config.id === "arcade" ? Gamepad2 : Clock
  const timeParts: Array<{ unit: CountdownUnit; value: number }> = [
    { unit: "day", value: remaining.days },
    { unit: "hour", value: remaining.hours },
    { unit: "minute", value: remaining.minutes },
    { unit: "second", value: remaining.seconds },
  ]

  return (
    <article
      className={`program-countdown-card tone-${config.tone}${!remaining ? " is-unconfigured" : remaining.ended ? " is-ended" : ""}`}
      data-program={config.id}
      data-program-state={!remaining ? "unconfigured" : remaining.ended ? "ended" : "active"}
      data-deadline-source={config.deadlineSource}
      aria-label={config.title}
    >
      <div className="program-countdown-heading">
        <span className="program-countdown-icon" aria-hidden="true"><Icon /></span>
        <div>
          <strong>{config.title}</strong>
          <span><b>Deadline</b> · {config.deadline ? deadlineLabel(config.deadline, locale) : "Not announced"}</span>
        </div>
      </div>

      {!remaining ? (
        <div className="program-countdown-unconfigured" role="status">
          <strong>Deadline unavailable</strong>
          <span>Awaiting Facilitator configuration</span>
        </div>
      ) : remaining.ended ? (
        <div className="program-countdown-ended" role="status">
          <div className="program-countdown-ended-copy">
            <strong>Unavailable</strong>
            <span>Program tracker</span>
          </div>
          {config.id === "facilitator" ? (
            <button
              className="program-countdown-ended-action"
              type="button"
              onClick={openFacilitatorDetails}
            >
              View program details
            </button>
          ) : null}
        </div>
      ) : (
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
      )}
    </article>
  )
}

export default function ProgramCountdown() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [locale, setLocale] = useState<string | undefined>(undefined)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [programs, setPrograms] = useState<ProgramCountdownConfig[]>([])
  const [source, setSource] = useState<CountdownSource>("fallback")

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

  useEffect(() => {
    let active = true
    const fallbackPrograms = defaultPrograms()
    setPrograms(fallbackPrograms)
    setSource("fallback")

    void loadRemotePrograms(fallbackPrograms).then((resolved) => {
      if (!active) return
      setPrograms(resolved.programs)
      setSource(resolved.source)
    })

    return () => {
      active = false
    }
  }, [])

  const enabledPrograms = useMemo(
    () => programs.filter((program) => program.enabled),
    [programs],
  )

  if (!host || enabledPrograms.length === 0) return null

  return createPortal(
    <section
      className={`program-countdown-grid${enabledPrograms.length === 1 ? " is-single" : ""}`}
      aria-label="Deadline"
      data-config-source={source}
    >
      {enabledPrograms.map((program) => (
        <ProgramCard key={program.id} config={program} locale={locale} nowMs={nowMs} />
      ))}
    </section>,
    host,
  )
}
