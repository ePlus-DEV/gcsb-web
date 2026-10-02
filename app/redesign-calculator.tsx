"use client"

import Link from "next/link"
import { SlotChangeBadge, TierSlotHistoryPanel, useTierSlotHistory } from "@/components/arcade/tier-slot-history"
import {
  getWebsiteLocale,
  getWebsiteLocaleFromPathname,
  loadWebsiteCatalog,
  type WebsiteCatalog,
  type WebsiteLocale,
} from "@/lib/website-i18n"
import {
  BadgeCheck,
  Chrome,
  CircleHelp,
  Download,
  ExternalLink,
  Gamepad2,
  Globe2,
  GraduationCap,
  LoaderCircle,
  Menu,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
} from "lucide-react"
import type { FormEvent, ReactNode } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { CURRENT_SWAG_SEASON, swagSeasonPath } from "@/components/arcade/swag-seasons"
import { getFacilitatorAdjustedPoints } from "@/components/arcade/facilitator-points"
import {
  IS_PR_PREVIEW,
  PREVIEW_DEBUG_PROFILE_RESULT,
  PREVIEW_DEBUG_PROFILE_URL,
} from "@/components/arcade/preview-debug-profile"
import { readFacilitatorParticipation } from "@/components/arcade/facilitator-participation"
import {
  API_URL,
  ARCADE_MILESTONES_URL,
  DASHBOARD_STORAGE_KEY,
  OFFICIAL_MILESTONES,
  PROFILE_URL_PATTERN,
  formatInteger,
  formatNumber,
  numeric,
  tierRangeLabel,
} from "@/components/arcade/model"
import type {
  ArcadeApiResponse,
  ArcadeBadge,
  ArcadeMilestone,
  BadgeFilter,
} from "@/components/arcade/model"

const CHROME_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg"
const FIREFOX_EXTENSION_URL =
  "https://addons.mozilla.org/addon/cloud-skills-boost-helper"
const BADGE_PREVIEW_LIMIT = 8
const DASHBOARD_VIEW_MODE_STORAGE_KEY = "eplus-arcade-dashboard-view-mode-v1"

type DashboardViewMode = "guest" | "profile"

const FILTERS: Array<{ value: BadgeFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "game", label: "Game" },
  { value: "skill", label: "Skill" },
  { value: "trivia", label: "Trivia" },
  { value: "special", label: "Special" },
]

type FacilitatorParticipationState = {
  profileUrl: string
  participating: boolean
}

function getQualifiedMilestone(
  points: number,
  milestones: ArcadeMilestone[],
): ArcadeMilestone | null {
  return [...milestones].reverse().find((tier) => points >= tier.points) ?? null
}

function safeDateLabel(value?: string): string {
  if (!value) return "Earned badge"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

function badgeEarnedTimestamp(value?: string): number {
  if (!value) return 0
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function sortBadgesNewestFirst(badges: ArcadeBadge[]): ArcadeBadge[] {
  return [...badges].sort(
    (a, b) =>
      badgeEarnedTimestamp(b.dateEarned) - badgeEarnedTimestamp(a.dateEarned),
  )
}

function safeHttpsUrl(value?: string): string | null {
  if (!value) return null

  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function SafeRemoteImage({
  src,
  alt,
  fallback,
  loading,
}: {
  src?: string
  alt: string
  fallback: ReactNode
  loading?: "eager" | "lazy"
}) {
  const safeSrc = safeHttpsUrl(src)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [safeSrc])

  if (!safeSrc || failed) return <>{fallback}</>

  return (
    <img
      src={safeSrc}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
    />
  )
}

function SafeExternalLink({
  href,
  ariaLabel,
  children,
}: {
  href?: string
  ariaLabel: string
  children: ReactNode
}) {
  const safeHref = safeHttpsUrl(href)
  if (!safeHref) return null

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={ariaLabel}
    >
      {children}
    </a>
  )
}

function readStoredViewMode(): DashboardViewMode | null {
  try {
    const value = window.localStorage.getItem(DASHBOARD_VIEW_MODE_STORAGE_KEY)
    return value === "guest" || value === "profile" ? value : null
  } catch {
    return null
  }
}

function readStoredResult(): { profileUrl: string; result: ArcadeApiResponse } | null {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as {
      profileUrl?: unknown
      result?: unknown
    }

    if (
      typeof parsed.profileUrl !== "string" ||
      typeof parsed.result !== "object" ||
      parsed.result === null
    ) {
      return null
    }

    return {
      profileUrl: parsed.profileUrl,
      result: parsed.result as ArcadeApiResponse,
    }
  } catch {
    return null
  }
}

type HeroCopy = { top: string; bottom: string; description: string }

export default function RedesignCalculator({
  footerContent,
  heroCopy,
  historyCatalog,
  historyLocale,
}: {
  footerContent?: ReactNode
  heroCopy?: HeroCopy
  historyCatalog: WebsiteCatalog
  historyLocale: WebsiteLocale
}) {
  const [profileUrl, setProfileUrl] = useState("")
  const [committedProfileUrl, setCommittedProfileUrl] = useState("")
  const [result, setResult] = useState<ArcadeApiResponse | null>(null)
  const [viewMode, setViewMode] = useState<DashboardViewMode>(IS_PR_PREVIEW ? "guest" : "profile")
  const [usingPreviewFakeProfile, setUsingPreviewFakeProfile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<BadgeFilter>("all")
  const [showAllBadges, setShowAllBadges] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [facilitatorParticipation, setFacilitatorParticipation] =
    useState<FacilitatorParticipationState>({
      profileUrl: "",
      participating: false,
    })
  const [milestones, setMilestones] = useState<ArcadeMilestone[]>(OFFICIAL_MILESTONES)
  const [milestonesLive, setMilestonesLive] = useState(false)
  const slotHistory = useTierSlotHistory()

  // Localized routes are prerendered with their correct catalog. The default
  // homepage can also be translated in place from the user's stored/browser
  // language, however. Keep this React-controlled modal synchronized with
  // the global language selector rather than freezing it to English SSR props.
  const [activeHistoryLanguage, setActiveHistoryLanguage] = useState({
    locale: historyLocale,
    catalog: historyCatalog,
  })
  useEffect(() => {
    let active = true
    let requestedLocale = historyLocale

    const syncHistoryLocale = () => {
      const explicitLocale = getWebsiteLocaleFromPathname(window.location.pathname)
      const selectedLocale = explicitLocale ??
        getWebsiteLocale(document.documentElement.dataset.locale)
      if (requestedLocale === selectedLocale) return
      requestedLocale = selectedLocale

      void loadWebsiteCatalog(selectedLocale)
        .then((catalog) => {
          if (active && requestedLocale === selectedLocale) {
            setActiveHistoryLanguage({ locale: selectedLocale, catalog })
          }
        })
        .catch(() => {
          // Keep the existing catalog and retry on the next locale change.
        })
    }

    const observer = new MutationObserver(syncHistoryLocale)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-locale"],
    })
    syncHistoryLocale()
    return () => {
      active = false
      observer.disconnect()
    }
  }, [historyCatalog, historyLocale])

  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const stored = readStoredResult()
    const storedViewMode = IS_PR_PREVIEW ? readStoredViewMode() : null

    if (!stored) {
      const initialMode = IS_PR_PREVIEW ? (storedViewMode ?? "guest") : "profile"
      setViewMode(initialMode)

      if (IS_PR_PREVIEW && initialMode === "profile") {
        setCommittedProfileUrl(PREVIEW_DEBUG_PROFILE_URL)
        setResult(PREVIEW_DEBUG_PROFILE_RESULT)
        setUsingPreviewFakeProfile(true)
      }
      return
    }

    setProfileUrl(stored.profileUrl)
    setCommittedProfileUrl(stored.profileUrl)
    setResult(stored.result)
    setUsingPreviewFakeProfile(false)
    setViewMode(IS_PR_PREVIEW ? (storedViewMode ?? "profile") : "profile")
  }, [])

  useEffect(() => {
    if (!IS_PR_PREVIEW) return

    try {
      window.localStorage.setItem(DASHBOARD_VIEW_MODE_STORAGE_KEY, viewMode)
    } catch {
      // Preview-only debug selection still works for the current session.
    }
  }, [viewMode])

  useEffect(() => {
    if (!result || usingPreviewFakeProfile) return

    try {
      window.localStorage.setItem(
        DASHBOARD_STORAGE_KEY,
        JSON.stringify({ profileUrl: committedProfileUrl, result }),
      )
    } catch {
      // Storage is optional. The calculator still works without persistence.
    }
  }, [committedProfileUrl, result, usingPreviewFakeProfile])

  useEffect(() => {
    const syncParticipation = () => {
      const participationProfileUrl = committedProfileUrl
      setFacilitatorParticipation({
        profileUrl: participationProfileUrl,
        participating: readFacilitatorParticipation(participationProfileUrl),
      })
    }

    syncParticipation()
    const timer = window.setInterval(syncParticipation, 750)
    window.addEventListener("focus", syncParticipation)
    window.addEventListener("storage", syncParticipation)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", syncParticipation)
      window.removeEventListener("storage", syncParticipation)
    }
  }, [committedProfileUrl])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15_000)

    async function loadLiveMilestones() {
      try {
        const response = await fetch(ARCADE_MILESTONES_URL, {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) return

        const payload: unknown = await response.json()
        if (!Array.isArray(payload)) return

        const liveMilestones = OFFICIAL_MILESTONES.map((fallback) => {
          const candidate = payload.find(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              numeric((item as { points?: unknown }).points) === fallback.points,
          ) as Record<string, unknown> | undefined

          if (!candidate) return fallback

          const hasSlots =
            candidate.slots !== undefined &&
            candidate.slots !== null &&
            candidate.slots !== ""
          const hasSpotsLeft =
            candidate.spotsLeft !== undefined &&
            candidate.spotsLeft !== null &&
            candidate.spotsLeft !== ""
          if (!hasSlots || !hasSpotsLeft) return fallback

          const slots = numeric(candidate.slots)
          const spotsLeft = numeric(candidate.spotsLeft)
          if (slots <= 0 || spotsLeft < 0 || spotsLeft > slots) return fallback

          return {
            ...fallback,
            league:
              typeof candidate.league === "string"
                ? candidate.league
                : fallback.league,
            slots,
            spotsLeft,
          }
        })

        if (active) {
          setMilestones(liveMilestones)
          setMilestonesLive(
            liveMilestones.every((milestone) => milestone.spotsLeft !== null),
          )
        }
      } catch {
        // Keep the verified tier thresholds and total-slot fallback.
      } finally {
        window.clearTimeout(timeout)
      }
    }

    void loadLiveMilestones()

    return () => {
      active = false
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [])

  const badges = useMemo<ArcadeBadge[]>(() => {
    const allBadges = result
      ? result.badges ?? [
          ...(result.game ?? []),
          ...(result.trivia ?? []),
          ...(result.skill ?? []),
          ...(result.completion ?? []),
          ...(result.special ?? []),
        ]
      : []

    return sortBadgesNewestFirst(allBadges)
  }, [result])

  const filteredBadges = useMemo(() => {
    if (!result || filter === "all") return badges

    const groups: Record<Exclude<BadgeFilter, "all">, ArcadeBadge[]> = {
      game: result.game ?? [],
      trivia: result.trivia ?? [],
      skill: result.skill ?? [],
      special: [...(result.special ?? []), ...(result.completion ?? [])],
    }

    return groups[filter]
  }, [badges, filter, result])

  const displayedBadges = showAllBadges
    ? filteredBadges
    : filteredBadges.slice(0, BADGE_PREVIEW_LIMIT)

  const facilitatorParticipating =
    facilitatorParticipation.profileUrl === committedProfileUrl &&
    facilitatorParticipation.participating
  const basePoints = numeric(result?.arcadePoints?.totalPoints)
  const facilitatorScore = getFacilitatorAdjustedPoints(
    basePoints,
    {
      games: numeric(result?.faciCounts?.faciGame),
      skills: numeric(result?.faciCounts?.faciSkill),
    },
    facilitatorParticipating,
  )
  const facilitatorBonus = facilitatorScore.bonus
  const points = facilitatorScore.totalPoints
  const profile = result?.userDetails?.[0]
  const profileName = profile?.userName || "Google Skills learner"
  const profileImage = profile?.profileImage
  const memberSince = profile?.memberSince
  const qualifiedMilestone = getQualifiedMilestone(points, milestones)
  const scoreComplete = result?.beta?.scoreComplete ?? true
  const unknownBadgeCount = numeric(result?.beta?.unknownBadgeCount)
  const unknownBadges = result?.beta?.unknownBadges ?? []
  const isTierQualified = scoreComplete && Boolean(qualifiedMilestone)

  const pointBreakdown = [
    {
      key: "game",
      label: "Game badges",
      icon: <Gamepad2 />,
      value: numeric(result?.arcadePoints?.gamePoints),
      tone: "purple",
    },
    {
      key: "skill",
      label: "Skill badges",
      icon: <BadgeCheck />,
      value: numeric(result?.arcadePoints?.skillPoints),
      tone: "blue",
    },
    {
      key: "bonus",
      label: "Trivia & special",
      icon: <Star />,
      value:
        numeric(result?.arcadePoints?.triviaPoints) +
        numeric(result?.arcadePoints?.specialPoints) +
        numeric(result?.arcadePoints?.completionPoints),
      tone: "orange",
    },
    ...(facilitatorBonus > 0
      ? [
          {
            key: "facilitator",
            label: "Facilitator bonus",
            icon: <GraduationCap />,
            value: facilitatorBonus,
            tone: "violet",
          },
        ]
      : []),
  ]

  const recentBadges = badges.filter((badge) => badge.dateEarned).slice(0, 4)

  const nextMilestone =
    milestones.find((tier) => points < tier.points) ??
    milestones[milestones.length - 1]
  const pointsToNextTier = Math.max(0, nextMilestone.points - points)
  const maxTierPoints = milestones[milestones.length - 1]?.points ?? 0
  const hasReachedMaxTier = maxTierPoints > 0 && points >= maxTierPoints
  const goalStartPoints = hasReachedMaxTier
    ? maxTierPoints
    : qualifiedMilestone?.points ?? 0
  const goalRange = Math.max(1, nextMilestone.points - goalStartPoints)
  const goalProgress = hasReachedMaxTier
    ? 100
    : Math.min(100, Math.max(0, ((points - goalStartPoints) / goalRange) * 100))

  async function analyzeProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = profileUrl.trim().replace(/\/$/, "")

    if (!PROFILE_URL_PATTERN.test(normalized)) {
      setError(
        "Enter a valid public profile URL from skills.google or cloudskillsboost.google.",
      )
      return
    }

    setLoading(true)
    setError("")
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 20_000)

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized, season: "2026" }),
        signal: controller.signal,
      })

      let payload: ArcadeApiResponse | null = null
      try {
        payload = (await response.json()) as ArcadeApiResponse
      } catch {
        // Gateways may return HTML or an empty body. Use the stable error below.
      }

      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.message || "The profile could not be analyzed right now.",
        )
      }

      setProfileUrl(normalized)
      setCommittedProfileUrl(normalized)
      setResult(payload)
      setUsingPreviewFakeProfile(false)
      setViewMode("profile")
      setFilter("all")
      setShowAllBadges(false)
    } catch (caught) {
      if (abortControllerRef.current !== controller) return

      setError(
        caught instanceof DOMException && caught.name === "AbortError"
          ? "The request timed out after 20 seconds."
          : caught instanceof Error
            ? caught.message
            : "The profile could not be analyzed.",
      )
    } finally {
      window.clearTimeout(timeout)
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
        setLoading(false)
      }
    }
  }

  function resetResult() {
    const controller = abortControllerRef.current
    abortControllerRef.current = null
    controller?.abort()

    setLoading(false)
    setProfileUrl("")
    setCommittedProfileUrl("")
    setResult(null)
    setUsingPreviewFakeProfile(false)
    setViewMode(IS_PR_PREVIEW ? "guest" : "profile")
    setError("")
    setFilter("all")
    setShowAllBadges(false)

    try {
      window.localStorage.removeItem(DASHBOARD_STORAGE_KEY)
    } catch {
      // Reset in-memory state even if storage is unavailable.
    }
  }

  function activatePreviewMode(nextMode: DashboardViewMode) {
    if (!IS_PR_PREVIEW) return

    setViewMode(nextMode)

    if (nextMode === "profile" && !result) {
      const stored = readStoredResult()

      if (stored) {
        setProfileUrl(stored.profileUrl)
        setCommittedProfileUrl(stored.profileUrl)
        setResult(stored.result)
        setUsingPreviewFakeProfile(false)
        return
      }

      setCommittedProfileUrl(PREVIEW_DEBUG_PROFILE_URL)
      setResult(PREVIEW_DEBUG_PROFILE_RESULT)
      setUsingPreviewFakeProfile(true)
    }
  }

  const showProfileDashboard = viewMode === "profile" && Boolean(result)
  const viewMessages = activeHistoryLanguage.catalog.messages

  return (
    <main
      className="arcade-dashboard-page arcade-dashboard-v2"
      data-dashboard-view={viewMode}
      data-dashboard-debug-fake={usingPreviewFakeProfile ? "true" : undefined}
    >
      <div className="arcade-stars" aria-hidden="true" />

      <header className="arcade-header">
        <a className="arcade-brand" href="#top" aria-label="Arcade Points home">
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
          <em>PRO</em>
        </a>

        <nav className={mobileMenuOpen ? "arcade-nav is-open" : "arcade-nav"}>
          <a className="active" href="#calculator" onClick={() => setMobileMenuOpen(false)}>Calculator</a>
          <a href="#tiers" onClick={() => setMobileMenuOpen(false)}>Tiers</a>
          <a href="#badges" onClick={() => setMobileMenuOpen(false)}>Badges</a>
          <a href="#extension" onClick={() => setMobileMenuOpen(false)}>Extension</a>
          <Link
            data-arcade-swag-nav="true"
            href={swagSeasonPath(CURRENT_SWAG_SEASON)}
            onClick={() => setMobileMenuOpen(false)}
          >Swag Drops</Link>
          <a href="#monthly-games" onClick={() => setMobileMenuOpen(false)}>Monthly labs</a>
        </nav>

        <div className="arcade-header-actions">
          <a
            className="header-store-link is-chrome"
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Install the extension from Chrome Web Store"
          >
            <Chrome /> <span>Chrome</span>
          </a>
          <a
            className="header-store-link is-firefox"
            href={FIREFOX_EXTENSION_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Install the extension from Firefox Add-ons"
          >
            <Globe2 /> <span>Firefox</span>
          </a>
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <section id="top" className="arcade-hero" data-home-order="hero">
        <div className="hero-heading">
          <p className="pixel-kicker"><Sparkles /> Google Cloud Skills Boost Arcade 2026</p>
          <h1>{heroCopy?.top ?? "CHECK YOUR"}<br /><span>{heroCopy?.bottom ?? "ARCADE SCORE"}</span></h1>
          <p className="hero-description">
            {heroCopy?.description ?? "Analyze your public profile, inspect earned badges and check which 2026 reward tier your score qualifies for."}
          </p>
          <div className="trust-pills">
            <span><ShieldCheck /> Public profile data only</span>
            <span><BadgeCheck /> No Google sign-in required</span>
          </div>
        </div>

        <div id="calculator" className="profile-analyzer-card">
          <div className="analyzer-title"><span>1</span> Paste your public profile URL</div>
          <form onSubmit={analyzeProfile} noValidate>
            <label className={error ? "profile-input has-error" : "profile-input"}>
              <Search />
              <input
                type="url"
                inputMode="url"
                autoComplete="url"
                value={profileUrl}
                onChange={(event) => setProfileUrl(event.target.value)}
                placeholder="https://www.skills.google/my_account/profile/..."
                aria-label="Google Skills public profile URL"
              />
              {profileUrl && (
                <button type="button" aria-label="Clear profile URL" onClick={() => setProfileUrl("")}>
                  <X />
                </button>
              )}
            </label>
            <button className="analyze-button" type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="spin" /> : <Trophy />}
              {loading ? "Analyzing..." : "Analyze profile"}
            </button>
          </form>
          {error && <p className="analyzer-error" role="alert">{error}</p>}
          <div className="analyzer-help-row">
            <a href="https://www.skills.google/my_account/profile" target="_blank" rel="noreferrer">
              <CircleHelp /> How to find your public profile <ExternalLink />
            </a>
            {result && (
              <button type="button" onClick={resetResult}><RefreshCcw /> Reset result</button>
            )}
          </div>
        </div>
      </section>

      {/* Stable portal anchor: keeps countdown placement identical for every locale. */}
      <div className="program-countdown-host" data-home-order="program-countdown" />

      <section id="extension" className="extension-strip" data-home-order="extension">
        <span className="extension-store-mark"><Download /></span>
        <div className="extension-copy-block">
          <strong>Install the extension for your browser</strong>
          <span>Automatic Arcade point tracking on Chrome and Firefox</span>
        </div>
        <div className="extension-store-actions">
          <a
            className="store-button is-chrome"
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Chrome /> Chrome <ExternalLink />
          </a>
          <a
            className="store-button is-firefox"
            href={FIREFOX_EXTENSION_URL}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Globe2 /> Firefox <ExternalLink />
          </a>
        </div>
      </section>

      {IS_PR_PREVIEW && (
        <aside className="preview-mode-toolbar" aria-label={viewMessages.dashboardView}>
          <span className="preview-mode-badge" aria-hidden="true">PR</span>
          <div className="dashboard-view-switch" role="group" aria-label={viewMessages.dashboardView}>
            <button
              type="button"
              className={viewMode === "guest" ? "is-active" : ""}
              aria-pressed={viewMode === "guest"}
              onClick={() => activatePreviewMode("guest")}
            >
              <Globe2 />
              <span>{viewMessages.guestView}</span>
            </button>
            <button
              type="button"
              className={viewMode === "profile" ? "is-active" : ""}
              aria-pressed={viewMode === "profile"}
              onClick={() => activatePreviewMode("profile")}
            >
              <Users />
              <span>{viewMessages.profileView}</span>
            </button>
          </div>
        </aside>
      )}

      {showProfileDashboard ? (
        <section className="dashboard-shell" aria-label="Arcade profile results" data-home-order="dashboard-results">
          <div className="dashboard-summary-grid" data-home-order="dashboard-summary">
            <article className="dashboard-panel profile-panel">
              <PanelTitle>Profile summary</PanelTitle>
              <div className="profile-overview">
                <div className="profile-photo">
                  <SafeRemoteImage
                    src={profileImage}
                    alt={`${profileName} profile`}
                    fallback={<span>{profileName.slice(0, 1).toUpperCase()}</span>}
                  />
                </div>
                <div className="profile-name-block">
                  <h2>{profileName}<BadgeCheck /></h2>
                  <p>{memberSince ? `Member since ${memberSince}` : "Public Google Skills profile"}</p>
                </div>
              </div>
              <div className="profile-stat-grid">
                <Stat value={String(badges.length)} label="Badges" icon={<BadgeCheck />} />
                <Stat value={formatNumber(points)} label="Arcade points" icon={<Sparkles />} />
                <Stat value={qualifiedMilestone?.league.replace("Arcade ", "") ?? "—"} label="Score tier" icon={<Trophy />} />
              </div>
            </article>

            <article className="dashboard-panel breakdown-panel">
              <PanelTitle>Point breakdown</PanelTitle>
              <div className="points-total"><strong>{formatNumber(points)}</strong><span>Total Arcade points</span></div>
              <div
                className="point-composition-bar"
                role="img"
                aria-label={`Point distribution: ${pointBreakdown
                  .map((item) => `${item.label} ${formatNumber(item.value)} points`)
                  .join(", ")}`}
              >
                {pointBreakdown.map((item) => {
                  const share =
                    points > 0
                      ? Math.max(0, Math.min(100, (item.value / points) * 100))
                      : 0

                  return (
                    <span
                      key={item.key}
                      className={`point-composition-segment point-tone-${item.tone}`}
                      style={{ width: `${share}%` }}
                      title={`${item.label}: ${formatNumber(item.value)} pts (${share.toFixed(1)}%)`}
                      aria-hidden="true"
                    />
                  )
                })}
              </div>
              <div className="point-breakdown-list">
                {pointBreakdown.map((item) => (
                  <PointRow
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                    total={points}
                    tone={item.tone}
                  />
                ))}
              </div>
              <p className="panel-link-note">
                {facilitatorBonus > 0
                  ? `Includes +${formatNumber(facilitatorBonus)} Facilitator bonus.`
                  : scoreComplete
                    ? "All eligible returned badges were classified."
                    : `${unknownBadgeCount} badge(s) still need scoring review.`}
              </p>
            </article>

            <article className="dashboard-panel tier-status-panel">
              <div className="panel-title-row">
                <PanelTitle>Point eligibility · Arcade 2026</PanelTitle>
                <span className={isTierQualified ? "score-state is-qualified" : "score-state"}>
                  {isTierQualified ? "Eligible by points" : "Not yet eligible"}
                </span>
              </div>
              <div className="tier-status-main">
                <span className="tier-trophy"><Trophy /></span>
                <div>
                  <strong>{qualifiedMilestone?.league.replace("Arcade ", "") ?? "NO TIER YET"}</strong>
                  <span>{qualifiedMilestone ? tierRangeLabel(qualifiedMilestone) : `${pointsToNextTier} points to Trooper`}</span>
                </div>
              </div>
              {qualifiedMilestone && (
                <div className="tier-availability-grid" aria-label="Tier slot availability">
                  <div>
                    <span className="tier-availability-icon" aria-hidden="true"><Users /></span>
                    <span>Total tier capacity</span>
                    <strong>{formatInteger(qualifiedMilestone.slots)}</strong>
                  </div>
                  <div>
                    <span className="tier-availability-icon" aria-hidden="true"><BadgeCheck /></span>
                    <span>Spots currently left</span>
                    <strong>
                      {qualifiedMilestone.spotsLeft === null
                        ? "Unavailable"
                        : formatInteger(qualifiedMilestone.spotsLeft)}
                    </strong>
                  </div>
                </div>
              )}
              <dl className="allocation-row">
                <dt>Your queue position</dt>
                <dd>Not available <CircleHelp /></dd>
              </dl>
              <p className="allocation-message">
                Point eligibility and remaining spots are different. Remaining slot counts are updated automatically from the latest available data, but Google does not expose whether your profile is ahead of other eligible users.
              </p>
            </article>
          </div>

          <div className="dashboard-content-grid">
            <article id="badges" className="dashboard-panel badges-panel">
              <div className="badge-heading-row">
                <div>
                  <PanelTitle>Earned badges</PanelTitle>
                  <p>{filteredBadges.length} badge{filteredBadges.length === 1 ? "" : "s"} in this view</p>
                </div>
                <div className="badge-filters" role="group" aria-label="Filter badges">
                  {FILTERS.map((item) => (
                    <button
                      type="button"
                      key={item.value}
                      className={filter === item.value ? "active" : ""}
                      aria-pressed={filter === item.value}
                      onClick={() => {
                        setFilter(item.value)
                        setShowAllBadges(false)
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {displayedBadges.length > 0 ? (
                <div className="earned-badge-grid">
                  {displayedBadges.map((badge, index) => (
                    <article className="earned-badge" key={`${badge.title}-${index}`}>
                      <div className="earned-badge-art">
                        <SafeRemoteImage
                          src={badge.imageURL}
                          alt=""
                          loading="lazy"
                          fallback={<BadgeCheck />}
                        />
                      </div>
                      <h3>{badge.title}</h3>
                      <p>
                        {badge.points === "-*"
                          ? "Special scoring rule"
                          : `+${formatNumber(numeric(badge.points))} pts`}
                      </p>
                      <time>{safeDateLabel(badge.dateEarned)}</time>
                      <SafeExternalLink
                        href={badge.badgeURL}
                        ariaLabel={`Open ${badge.title}`}
                      >
                        <ExternalLink />
                      </SafeExternalLink>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-badge-state">
                  <BadgeCheck />
                  <strong>No badges returned in this category</strong>
                  <span>Choose another filter or analyze a different public profile.</span>
                </div>
              )}

              {filteredBadges.length > BADGE_PREVIEW_LIMIT && (
                <button className="show-all-badges" type="button" onClick={() => setShowAllBadges((open) => !open)}>
                  {showAllBadges ? "Show fewer badges" : `View all ${filteredBadges.length} badges`}
                </button>
              )}
            </article>

            <aside id="tiers" className="dashboard-panel tier-list-panel">
              <div className="panel-title-row">
                <PanelTitle>Arcade 2026 tiers</PanelTitle>
                <span className={milestonesLive ? "tier-help is-live" : "tier-help"}>
                  {milestonesLive ? "Live slot data" : "Total slots only"}
                </span>
              </div>
              <div className="tier-list">
                {[...milestones].reverse().map((tier) => {
                  const active = qualifiedMilestone?.points === tier.points
                  return (
                    <div className={`tier-list-row tier-${tier.points}${active ? " is-current" : ""}`} key={tier.points}>
                      <span className="tier-list-icon"><Trophy /></span>
                      <div><strong>{tier.league.replace("Arcade ", "")}</strong><span>{tierRangeLabel(tier)}</span></div>
                      <div className="tier-slot-count">
                        <b>
                          {tier.spotsLeft === null
                            ? "—"
                            : formatInteger(tier.spotsLeft)}
                        </b>
                        <small>
                          {tier.spotsLeft === null
                            ? formatInteger(tier.slots) + " total slots"
                            : "left of " + formatInteger(tier.slots)}
                        </small>
                        <SlotChangeBadge
                          feed={slotHistory.feed}
                          points={tier.points}
                          currentSpotsLeft={tier.spotsLeft}
                  catalog={activeHistoryLanguage.catalog}
                  locale={activeHistoryLanguage.locale}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="tier-note">
                Total and remaining spots are refreshed automatically every 6 hours. Your personal queue position is not included in the public data.
              </p>
              <TierSlotHistoryPanel {...slotHistory} milestones={milestones} catalog={activeHistoryLanguage.catalog} locale={activeHistoryLanguage.locale} />
            </aside>
          </div>

          <div id="monthly-games" className="monthly-games-host" data-home-order="monthly-labs" />

          <div className="dashboard-bottom-grid" data-home-order="dashboard-bottom">
            <article className="dashboard-panel compact-panel">
              <div className="compact-heading"><PanelTitle>Recently earned</PanelTitle><span>{recentBadges.length || "—"}</span></div>
              {recentBadges.length > 0 ? (
                <div className="compact-list">
                  {recentBadges.map((badge, index) => (
                    <div key={`${badge.title}-recent-${index}`}>
                      <span className="compact-icon">
                        <SafeRemoteImage
                          src={badge.imageURL}
                          alt=""
                          loading="lazy"
                          fallback={<BadgeCheck />}
                        />
                      </span>
                      <strong>{badge.title}</strong>
                      <b>+{formatNumber(numeric(badge.points))} pts</b>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="compact-empty">No earned dates were returned by this profile.</p>
              )}
            </article>

            <article className="dashboard-panel compact-panel">
              <div className="compact-heading"><PanelTitle>Score confidence</PanelTitle><span>{scoreComplete ? "Complete" : "Review"}</span></div>
              <div className="confidence-summary">
                <span className={scoreComplete ? "confidence-ring is-complete" : "confidence-ring"}>
                  {scoreComplete ? <ShieldCheck /> : <CircleHelp />}
                </span>
                <div>
                  <strong>{scoreComplete ? "All known badges classified" : `${unknownBadgeCount} unknown badge(s)`}</strong>
                  <p>{scoreComplete ? "The score is complete for the current badge index." : "These badges are shown instead of being silently ignored."}</p>
                </div>
              </div>
              {unknownBadges.length > 0 && (
                <ul className="unknown-badge-list">
                  {unknownBadges.slice(0, 3).map((badge) => <li key={badge}>{badge}</li>)}
                </ul>
              )}
            </article>

            <article className="dashboard-panel compact-panel next-goal-panel">
              <div className="compact-heading"><PanelTitle>Next score goal</PanelTitle><span>{nextMilestone.league.replace("Arcade ", "")}</span></div>
              <div className="next-goal-value">
                <strong>{hasReachedMaxTier ? "MAX" : formatNumber(pointsToNextTier)}</strong>
                <span>{hasReachedMaxTier ? "Top score tier reached" : "more points needed"}</span>
              </div>
              <div
                className="goal-progress"
                role="progressbar"
                aria-label={hasReachedMaxTier ? "Maximum score tier reached" : `Progress toward ${nextMilestone.league}`}
                aria-valuemin={goalStartPoints}
                aria-valuemax={hasReachedMaxTier ? maxTierPoints : nextMilestone.points}
                aria-valuenow={hasReachedMaxTier ? maxTierPoints : Math.min(Math.max(points, goalStartPoints), nextMilestone.points)}
              >
                <span style={{ width: `${goalProgress}%` }} />
              </div>
            </article>
          </div>
        </section>
      ) : (
        <section
          className={`dashboard-empty-state guest-dashboard${viewMode === "guest" ? " is-guest" : " is-profile-empty"}`}
          data-home-order="dashboard-empty"
        >
          <div className="guest-dashboard-hero">
            <span className="guest-dashboard-orb" aria-hidden="true"><Trophy /></span>
            <div className="guest-dashboard-copy">
              <strong>{viewMode === "guest" ? viewMessages.guestDashboardTitle : viewMessages.dashboardPlaceholder}</strong>
              <p>{viewMode === "guest" ? viewMessages.guestDashboardHint : viewMessages.dashboardHint}</p>
            </div>
            <span className="guest-dashboard-decoration" aria-hidden="true"><Gamepad2 /></span>
          </div>

          <div className="guest-tier-heading">
            <div>
              <span className="guest-tier-heading-icon" aria-hidden="true"><Trophy /></span>
              <div>
                <strong>{viewMessages.arcadeTiers}</strong>
                <span>{milestonesLive ? viewMessages.liveSlots : viewMessages.totalSlotsOnly}</span>
              </div>
            </div>
          </div>

          <div className="empty-tier-grid">
            {[...milestones].reverse().map((tier) => {
              const remainingPercent =
                tier.spotsLeft === null || tier.slots <= 0
                  ? 0
                  : Math.max(0, Math.min(100, (tier.spotsLeft / tier.slots) * 100))

              return (
                <article className={`guest-tier-card tier-${tier.points}`} key={tier.points}>
                  <span className="guest-tier-icon" aria-hidden="true"><Trophy /></span>
                  <div className="guest-tier-main">
                    <div className="guest-tier-copy">
                      <strong>{tier.league.replace("Arcade ", "")}</strong>
                      <span>{tierRangeLabel(tier)}</span>
                    </div>
                    <div className="guest-tier-progress" aria-hidden="true">
                      <span style={{ width: `${remainingPercent}%` }} />
                    </div>
                  </div>
                  <div className="guest-tier-availability">
                    <strong>
                      {tier.spotsLeft === null ? "—" : formatInteger(tier.spotsLeft)}
                      <span> / {formatInteger(tier.slots)}</span>
                    </strong>
                    <small>{tier.spotsLeft === null ? viewMessages.totalSlotsOnly : viewMessages.spotsLeft}</small>
                    <SlotChangeBadge
                      feed={slotHistory.feed}
                      points={tier.points}
                      currentSpotsLeft={tier.spotsLeft}
                      catalog={activeHistoryLanguage.catalog}
                      locale={activeHistoryLanguage.locale}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
      {!showProfileDashboard && (
        <div className="tier-history-under-empty" data-home-order="tier-history">
          <TierSlotHistoryPanel {...slotHistory} milestones={milestones} catalog={activeHistoryLanguage.catalog} locale={activeHistoryLanguage.locale} />
        </div>
      )}

      {!showProfileDashboard && (
        <div id="monthly-games" className="monthly-games-host dashboard-shell" data-home-order="monthly-labs" />
      )}

      {footerContent}

      <footer className="arcade-footer" data-home-order="footer">
        <div className="arcade-brand footer-brand">
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
        </div>
        <p>Unofficial community calculator by ePlus.DEV. Google remains the authority for final scores and rewards.</p>
        <nav className="footer-route-links" aria-label="Site information">
          <Link href="/about/">About</Link>
          <Link href="/guide/">Guide</Link>
          <Link href="/swag-drops/">Swag archive</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
        </nav>
        <div className="footer-store-links">
          <a href={CHROME_EXTENSION_URL} target="_blank" rel="noreferrer noopener">
            <Chrome /> Chrome
          </a>
          <a href={FIREFOX_EXTENSION_URL} target="_blank" rel="noreferrer noopener">
            <Globe2 /> Firefox
          </a>
        </div>
      </footer>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <a href="#calculator"><Search /><span>Calculator</span></a>
        <a href="#tiers"><Trophy /><span>Tiers</span></a>
        <a href="#badges"><BadgeCheck /><span>Badges</span></a>
        <a href="#extension"><Chrome /><span>Extension</span></a>
      </nav>
    </main>
  )
}

function PanelTitle({ children }: { children: ReactNode }) {
  return <h2 className="panel-title">{children}</h2>
}

function Stat({
  value,
  label,
  icon,
}: {
  value: string
  label: string
  icon?: ReactNode
}) {
  return (
    <div>
      {icon ? <span className="profile-stat-icon" aria-hidden="true">{icon}</span> : null}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function PointRow({
  icon,
  label,
  value,
  total,
  tone,
}: {
  icon: ReactNode
  label: string
  value: number
  total: number
  tone: string
}) {
  const share = total > 0 ? Math.max(0, (value / total) * 100) : 0

  return (
    <div className={`point-breakdown-row point-tone-${tone}`}>
      <span className="point-breakdown-source"><span className="point-breakdown-swatch" aria-hidden="true" />{icon}<span>{label}</span></span>
      <strong>{formatNumber(value)} pts</strong>
      <span className="point-breakdown-share">{share.toFixed(1)}%</span>
    </div>
  )
}
