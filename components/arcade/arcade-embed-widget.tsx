"use client"

import {
  ExternalLink,
  Gamepad2,
  GraduationCap,
  LoaderCircle,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { getFacilitatorAdjustedPoints } from "@/components/arcade/facilitator-points"
import {
  readFacilitatorParticipation,
  writeFacilitatorParticipation,
} from "@/components/arcade/facilitator-participation"
import {
  API_URL,
  DASHBOARD_STORAGE_KEY,
  PROFILE_URL_PATTERN,
  getTier,
  numeric,
} from "@/components/arcade/model"
import type { ArcadeApiResponse } from "@/components/arcade/model"
import { CHROME_EXTENSION_URL, FIREFOX_EXTENSION_URL } from "@/lib/extension-store-urls"

const DEFAULT_DASHBOARD_URL = "https://arcade.eplus.dev/"
const WIDGET_PROFILE_STORAGE_KEY = "arcade-widget-profile-url-v1"
const BONUS_MILESTONE_STORAGE_PREFIX = "arcade-facilitator-bonus-milestone-v1"

const MARQUEE_TITLES = [
  "More with Arcade Points",
  "Track points & tiers",
  "Follow monthly games",
  "Monitor Facilitator progress",
  "See your next tier",
  "Track Arcade milestones",
  "Compare game & skill points",
  "Follow bonus milestones",
  "Keep badge progress visible",
  "Stay ready for new games",
  "Refresh your latest profile",
  "Install the browser extension",
] as const

type WidgetTracking = {
  source: string
  medium: string
  campaign: string
  content: string
  sourceUrl: string
}

type WidgetTrackedUrls = {
  dashboard: string
  chrome: string
  firefox: string
}

type WidgetFacilitatorSelection = {
  participating: boolean
  bonusMilestoneCompleted: boolean
}

const DEFAULT_TRACKED_URLS: WidgetTrackedUrls = {
  dashboard: DEFAULT_DASHBOARD_URL,
  chrome: CHROME_EXTENSION_URL,
  firefox: FIREFOX_EXTENSION_URL,
}

function sanitizeUtm(value: string | null, fallback: string, maxLength = 80): string {
  const normalized = value?.trim() ?? ""
  if (!normalized) return fallback
  return /^[a-zA-Z0-9._/-]+$/.test(normalized) && normalized.length <= maxLength
    ? normalized
    : fallback
}

function normalizeSourceUrl(value: string | null): URL | null {
  if (!value) return null

  try {
    const url = new URL(value)
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    url.search = ""
    url.hash = ""
    return url
  } catch {
    return null
  }
}

function getEmbeddingPageUrl(params: URLSearchParams): URL | null {
  const explicitSource = normalizeSourceUrl(params.get("source_url"))
  if (explicitSource) return explicitSource
  return normalizeSourceUrl(document.referrer)
}

function getWidgetTracking(params: URLSearchParams): WidgetTracking {
  const embeddingPage = getEmbeddingPageUrl(params)
  const inferredSource = embeddingPage?.hostname.replace(/^www\./i, "").toLowerCase() ?? ""
  const inferredContent = embeddingPage?.pathname.replace(/^\/+|\/+$/g, "") ?? ""

  return {
    source: sanitizeUtm(params.get("utm_source"), inferredSource || "embedded-widget"),
    medium: sanitizeUtm(params.get("utm_medium"), "widget"),
    campaign: sanitizeUtm(params.get("utm_campaign"), "arcade-widget"),
    content: sanitizeUtm(params.get("utm_content"), inferredContent, 160),
    sourceUrl: embeddingPage?.toString() ?? "",
  }
}

function buildTrackedUrl(baseUrl: string, tracking: WidgetTracking): string {
  const target = new URL(baseUrl)
  target.searchParams.set("utm_source", tracking.source)
  target.searchParams.set("utm_medium", tracking.medium)
  target.searchParams.set("utm_campaign", tracking.campaign)

  if (tracking.content) target.searchParams.set("utm_content", tracking.content)
  if (tracking.sourceUrl) target.searchParams.set("source_url", tracking.sourceUrl)

  return target.toString()
}

function normalizeProfileUrl(value: string): string {
  return value.trim().replace(/\/$/, "")
}

function isValidProfileUrl(value: string): boolean {
  return PROFILE_URL_PATTERN.test(normalizeProfileUrl(value))
}

function bonusMilestoneStorageKey(profileUrl: string): string {
  return `${BONUS_MILESTONE_STORAGE_PREFIX}:${normalizeProfileUrl(profileUrl)}`
}

function readBonusMilestoneCompleted(profileUrl: string): boolean {
  if (!isValidProfileUrl(profileUrl)) return false

  try {
    return window.localStorage.getItem(bonusMilestoneStorageKey(profileUrl)) === "true"
  } catch {
    return false
  }
}

function writeBonusMilestoneCompleted(profileUrl: string, completed: boolean): void {
  if (!isValidProfileUrl(profileUrl)) return

  try {
    window.localStorage.setItem(
      bonusMilestoneStorageKey(profileUrl),
      completed ? "true" : "false",
    )
  } catch {
    // The widget still uses its in-memory confirmation when storage is unavailable.
  }
}

function readFacilitatorSelection(profileUrl: string): WidgetFacilitatorSelection {
  if (!isValidProfileUrl(profileUrl)) {
    return { participating: false, bonusMilestoneCompleted: false }
  }

  const participating = readFacilitatorParticipation(profileUrl)
  return {
    participating,
    bonusMilestoneCompleted:
      participating && readBonusMilestoneCompleted(profileUrl),
  }
}

function readStoredProfileUrl(): string {
  try {
    const remembered = window.localStorage.getItem(WIDGET_PROFILE_STORAGE_KEY) ?? ""
    if (isValidProfileUrl(remembered)) return normalizeProfileUrl(remembered)

    const dashboardSnapshot = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!dashboardSnapshot) return ""

    const parsed = JSON.parse(dashboardSnapshot) as { profileUrl?: unknown }
    return typeof parsed.profileUrl === "string" && isValidProfileUrl(parsed.profileUrl)
      ? normalizeProfileUrl(parsed.profileUrl)
      : ""
  } catch {
    return ""
  }
}

function ExtensionLinks({
  compact = false,
  chromeUrl,
  firefoxUrl,
}: {
  compact?: boolean
  chromeUrl: string
  firefoxUrl: string
}) {
  return (
    <div className={compact ? "arcade-widget-extension compact" : "arcade-widget-extension"}>
      <div className="arcade-widget-extension-copy">
        <span className="arcade-widget-extension-icon" aria-hidden="true"><Sparkles /></span>
        <div>
          <strong>Install the browser extension</strong>
          <span>Automatic Arcade point tracking on Chrome and Firefox.</span>
        </div>
      </div>
      <div className="arcade-widget-extension-actions">
        <a href={chromeUrl} target="_blank" rel="noreferrer noopener">
          Chrome <ExternalLink />
        </a>
        <a href={firefoxUrl} target="_blank" rel="noreferrer noopener">
          Firefox <ExternalLink />
        </a>
      </div>
    </div>
  )
}

export default function ArcadeEmbedWidget() {
  const [profileUrl, setProfileUrl] = useState("")
  const [trackedUrls, setTrackedUrls] = useState<WidgetTrackedUrls>(DEFAULT_TRACKED_URLS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<ArcadeApiResponse | null>(null)
  const [participating, setParticipating] = useState(false)
  const [bonusMilestoneCompleted, setBonusMilestoneCompleted] = useState(false)
  const requestIdRef = useRef(0)

  const analyzeProfile = useCallback(
    async (normalized: string, selection: WidgetFacilitatorSelection) => {
      const requestId = ++requestIdRef.current
      setLoading(true)
      setError("")

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: normalized,
            season: "2026",
            facilitator: {
              bonusMilestoneCompleted:
                selection.participating && selection.bonusMilestoneCompleted,
            },
          }),
        })

        let payload: ArcadeApiResponse | null = null
        try {
          payload = (await response.json()) as ArcadeApiResponse
        } catch {
          // Keep the stable English error below when the gateway returns invalid JSON.
        }

        if (!response.ok || !payload?.success) {
          throw new Error("The profile could not be analyzed right now.")
        }

        if (requestId !== requestIdRef.current) return

        setProfileUrl(normalized)
        setResult(payload)

        try {
          window.localStorage.setItem(WIDGET_PROFILE_STORAGE_KEY, normalized)
          window.localStorage.setItem(
            DASHBOARD_STORAGE_KEY,
            JSON.stringify({ profileUrl: normalized, result: payload }),
          )
        } catch {
          // Persistence is optional. The mini checker still works without storage.
        }
      } catch {
        if (requestId !== requestIdRef.current) return
        setResult(null)
        setError("The profile could not be analyzed right now.")
      } finally {
        if (requestId === requestIdRef.current) setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requestedProfileUrl = normalizeProfileUrl(params.get("url") ?? "")
    const initialProfileUrl = isValidProfileUrl(requestedProfileUrl)
      ? requestedProfileUrl
      : readStoredProfileUrl()
    const tracking = getWidgetTracking(params)
    let initialCheckTimer: number | undefined

    setTrackedUrls({
      dashboard: buildTrackedUrl(DEFAULT_DASHBOARD_URL, tracking),
      chrome: buildTrackedUrl(CHROME_EXTENSION_URL, tracking),
      firefox: buildTrackedUrl(FIREFOX_EXTENSION_URL, tracking),
    })

    if (initialProfileUrl) {
      const selection = readFacilitatorSelection(initialProfileUrl)
      setProfileUrl(initialProfileUrl)
      setParticipating(selection.participating)
      setBonusMilestoneCompleted(selection.bonusMilestoneCompleted)

      // Run the initial score check after restoring the controls so the widget
      // visibly enters its loading state instead of looking unresponsive.
      initialCheckTimer = window.setTimeout(() => {
        void analyzeProfile(initialProfileUrl, selection)
      }, 0)
    }

    return () => {
      if (initialCheckTimer !== undefined) window.clearTimeout(initialCheckTimer)
      requestIdRef.current += 1
    }
  }, [analyzeProfile])

  const normalizedProfileUrl = normalizeProfileUrl(profileUrl)
  const hasValidProfileUrl = isValidProfileUrl(normalizedProfileUrl)
  const confirmedBonusMilestone = participating && bonusMilestoneCompleted
  const basePoints = numeric(result?.arcadePoints?.totalPoints)
  const facilitatorScore = result
    ? getFacilitatorAdjustedPoints(
        basePoints,
        {
          games: numeric(result.faciCounts?.faciGame),
          skills: numeric(result.faciCounts?.faciSkill),
        },
        participating,
        confirmedBonusMilestone,
      )
    : null
  const totalPoints = facilitatorScore?.totalPoints ?? basePoints
  const tier = getTier(totalPoints)
  const badgeCount = result?.beta?.profileBadgeCount != null
    ? numeric(result.beta.profileBadgeCount)
    : (result?.badges?.length ?? 0)
  const userName = result?.userDetails?.[0]?.userName || "Google Skills learner"
  const gamePoints = numeric(result?.arcadePoints?.gamePoints)
  const skillPoints = numeric(result?.arcadePoints?.skillPoints)
  const triviaSpecialPoints =
    numeric(result?.arcadePoints?.triviaPoints) + numeric(result?.arcadePoints?.specialPoints)

  function updateProfileUrl(value: string) {
    setProfileUrl(value)
    const normalized = normalizeProfileUrl(value)
    const selection = readFacilitatorSelection(normalized)
    setParticipating(selection.participating)
    setBonusMilestoneCompleted(selection.bonusMilestoneCompleted)
  }

  function updateParticipation(nextParticipating: boolean) {
    if (!hasValidProfileUrl) return

    setParticipating(nextParticipating)
    writeFacilitatorParticipation(normalizedProfileUrl, nextParticipating)

    if (!nextParticipating) {
      setBonusMilestoneCompleted(false)
      writeBonusMilestoneCompleted(normalizedProfileUrl, false)
    }
  }

  function updateBonusMilestone(nextCompleted: boolean) {
    if (!hasValidProfileUrl || !participating) return

    setBonusMilestoneCompleted(nextCompleted)
    writeBonusMilestoneCompleted(normalizedProfileUrl, nextCompleted)
  }

  async function checkScore() {
    if (loading) return

    const normalized = normalizeProfileUrl(profileUrl)

    if (!isValidProfileUrl(normalized)) {
      setError("Paste a valid public profile URL from skills.google.")
      setResult(null)
      return
    }

    writeFacilitatorParticipation(normalized, participating)
    writeBonusMilestoneCompleted(normalized, confirmedBonusMilestone)

    await analyzeProfile(normalized, {
      participating,
      bonusMilestoneCompleted: confirmedBonusMilestone,
    })
  }

  function checkAnotherProfile() {
    requestIdRef.current += 1
    setLoading(false)
    setResult(null)
    setError("")
  }

  return (
    <main className="arcade-embed-shell notranslate" lang="en" translate="no">
      <style>{`
        .arcade-widget-marquee{overflow:hidden;white-space:nowrap;mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}
        .arcade-widget-marquee-track{display:inline-flex;align-items:center;gap:28px;min-width:max-content;animation:arcade-widget-marquee 28s linear infinite;color:#c4b5fd;font-size:.7rem;font-weight:800;letter-spacing:.02em}
        .arcade-widget-marquee-track span{display:inline-flex;align-items:center;gap:8px}
        .arcade-widget-marquee-track span:after{content:"•";color:#60a5fa}
        .arcade-widget-marquee:hover .arcade-widget-marquee-track{animation-play-state:paused}
        .arcade-widget-facilitator-options{order:2;grid-column:1/-1;flex:1 1 100%;width:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:2px 0}
        .arcade-widget-facilitator-option{min-width:0;display:flex;align-items:flex-start;gap:9px;padding:9px 10px;border:1px solid rgba(148,163,184,.16);border-radius:10px;background:rgba(99,102,241,.06);color:inherit;cursor:pointer}
        .arcade-widget-facilitator-option.is-disabled{opacity:.52;cursor:not-allowed}
        .arcade-widget-facilitator-option input{width:15px;height:15px;margin:1px 0 0;accent-color:#8b5cf6;flex:none}
        .arcade-widget-facilitator-option span{display:grid;gap:2px;font-size:.72rem;line-height:1.25}
        .arcade-widget-facilitator-option b{font-size:.74rem}
        .arcade-widget-facilitator-option small{font-size:.66rem;opacity:.7}
        .arcade-widget-form>.arcade-widget-input{order:1}
        .arcade-widget-form>button[type="submit"]{order:3;grid-column:1/-1;position:relative;z-index:2;pointer-events:auto}
        @keyframes arcade-widget-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @media(max-width:640px){.arcade-widget-facilitator-options{grid-template-columns:1fr}}
        @media(prefers-reduced-motion:reduce){.arcade-widget-marquee{white-space:normal}.arcade-widget-marquee-track{animation:none;display:flex;flex-wrap:wrap;gap:8px 16px}}
        @media(prefers-color-scheme:light){.arcade-widget-marquee-track{color:#6d28d9}}
      `}</style>
      <section className="arcade-widget-card" aria-label="Arcade Points mini score checker">
        <div className="arcade-widget-head">
          <div className="arcade-widget-brand-block">
            <span className="arcade-widget-icon" aria-hidden="true"><Gamepad2 /></span>
            <div className="arcade-widget-brand-copy">
              <strong>ARCADE POINTS</strong>
              <span>Google Cloud Arcade tracker · ePlus.DEV</span>
            </div>
          </div>
          <a className="arcade-widget-open-link" href={trackedUrls.dashboard} target="_blank" rel="noreferrer noopener">
            <span>Open full dashboard</span><ExternalLink />
          </a>
        </div>

        {!result ? (
          <>
            <div className="arcade-widget-copy">
              <h2>Check your Google Cloud Arcade score</h2>
              <p>Paste your public Google Skills profile URL to see your latest points and tier.</p>
            </div>

            <form
              className="arcade-widget-form"
              onSubmit={(event) => {
                event.preventDefault()
                void checkScore()
              }}
              noValidate
            >
              <label className={error ? "arcade-widget-input has-error" : "arcade-widget-input"}>
                <Search aria-hidden="true" />
                <input
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  value={profileUrl}
                  onChange={(event) => updateProfileUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return
                    event.preventDefault()
                    void checkScore()
                  }}
                  placeholder="https://www.skills.google/public_profiles/..."
                  aria-label="Google Skills public profile URL"
                />
              </label>

              <div className="arcade-widget-facilitator-options" aria-label="Facilitator score options">
                <label
                  className={
                    hasValidProfileUrl
                      ? "arcade-widget-facilitator-option"
                      : "arcade-widget-facilitator-option is-disabled"
                  }
                >
                  <input
                    type="checkbox"
                    checked={participating}
                    disabled={!hasValidProfileUrl || loading}
                    onChange={(event) => updateParticipation(event.target.checked)}
                  />
                  <span>
                    <b>Participating in Facilitator Program</b>
                    <small>Required before Facilitator bonus points are added.</small>
                  </span>
                </label>

                <label
                  className={
                    hasValidProfileUrl && participating
                      ? "arcade-widget-facilitator-option"
                      : "arcade-widget-facilitator-option is-disabled"
                  }
                >
                  <input
                    type="checkbox"
                    checked={bonusMilestoneCompleted}
                    disabled={!hasValidProfileUrl || !participating || loading}
                    onChange={(event) => updateBonusMilestone(event.target.checked)}
                  />
                  <span>
                    <b>Bonus Milestone completed</b>
                    <small>Self-confirm completion before the API applies the Bonus Milestone.</small>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                onClick={(event) => {
                  event.preventDefault()
                  void checkScore()
                }}
              >
                {loading ? <LoaderCircle className="spin" /> : <Trophy />}
                <span>{loading ? "Refreshing score..." : "Check score"}</span>
              </button>
            </form>
            {error ? <p className="arcade-widget-error" role="alert">{error}</p> : null}

            <div className="arcade-widget-promo">
              <div className="arcade-widget-marquee" aria-label="Arcade Points highlights">
                <div className="arcade-widget-marquee-track">
                  {MARQUEE_TITLES.map((title) => (
                    <span key={`primary-${title}`}>{title}</span>
                  ))}
                  {MARQUEE_TITLES.map((title) => (
                    <span key={`repeat-${title}`} aria-hidden="true">{title}</span>
                  ))}
                </div>
              </div>
              <ExtensionLinks chromeUrl={trackedUrls.chrome} firefoxUrl={trackedUrls.firefox} />
              <a className="arcade-widget-dashboard-cta" href={trackedUrls.dashboard} target="_blank" rel="noreferrer noopener">
                Explore the full Arcade dashboard <ExternalLink />
              </a>
            </div>
          </>
        ) : (
          <div className="arcade-widget-result">
            <div className="arcade-widget-result-summary">
              <div className="arcade-widget-result-copy">
                <span>{userName}</span>
                <strong>{totalPoints}</strong>
                <small>Arcade points</small>
              </div>
              <div className="arcade-widget-result-meta">
                <span><b>{tier.name}</b> tier</span>
                <span><b>{badgeCount}</b> badges</span>
                {facilitatorScore && facilitatorScore.bonus > 0 ? (
                  <span><b>+{facilitatorScore.bonus}</b> Facilitator bonus</span>
                ) : null}
                {confirmedBonusMilestone ? (
                  <span><b>Confirmed</b> Bonus Milestone</span>
                ) : null}
              </div>
            </div>

            <div className="arcade-widget-breakdown" aria-label="Point breakdown">
              <article><Gamepad2 /><span>Game points</span><strong>{gamePoints}</strong></article>
              <article><GraduationCap /><span>Skill points</span><strong>{skillPoints}</strong></article>
              <article><Sparkles /><span>Trivia &amp; special</span><strong>{triviaSpecialPoints}</strong></article>
            </div>

            <ExtensionLinks chromeUrl={trackedUrls.chrome} firefoxUrl={trackedUrls.firefox} />

            <div className="arcade-widget-result-actions">
              <button type="button" onClick={checkAnotherProfile}>Check another</button>
              <a href={trackedUrls.dashboard} target="_blank" rel="noreferrer noopener">
                View full result <ExternalLink />
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
