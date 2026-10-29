"use client"

import Link from "next/link"
import ProfileAnalyzer from "@/components/arcade/profile-analyzer"
import { DashboardPanel, SectionTitle as PanelTitle, MetricStat as Stat } from "@/components/arcade/ui/dashboard-kit"
import { profilePointSummary } from "@/components/arcade/profile-point-summary"
import ReleasedPointsPanel from "@/components/arcade/released-points-panel"
import TierPredictionPanel from "@/components/arcade/tier-prediction-panel"
import type { ScoreCheck } from "@/components/arcade/tier-prediction"
import DashboardTiers from "@/components/arcade/dashboard-tiers"
import GuestDashboard from "@/components/arcade/guest-dashboard"
import PreviewModeToolbar from "@/components/arcade/preview-mode-toolbar"
import { readStoredDashboard, type DashboardViewMode } from "@/components/arcade/dashboard-state"
import { useTierSlotHistory } from "@/components/arcade/tier-slot-history"
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
  Menu,
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

function safeDateLabel(value?: string, locale = "en"): string {
  if (!value) return "Earned badge"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat(locale, {
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
  const [guestProfileUrl, setGuestProfileUrl] = useState("")
  const [committedProfileUrl, setCommittedProfileUrl] = useState("")
  const [result, setResult] = useState<ArcadeApiResponse | null>(null)
  const [viewMode, setViewMode] = useState<DashboardViewMode>("guest")
  const [usingPreviewFakeProfile, setUsingPreviewFakeProfile] = useState(false)
  const [viewModeRestored, setViewModeRestored] = useState(false)
  const [predictionCheck, setPredictionCheck] = useState<ScoreCheck | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<BadgeFilter>("all")
  const [showAllBadges, setShowAllBadges] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  // Header height can grow when navigation or translations wrap at tablet widths.
  // Keep sticky Tiers below its actual size rather than a fixed 72px assumption.
  useEffect(() => {
    const header = headerRef.current
    const dashboard = header?.closest<HTMLElement>(".arcade-dashboard-page")
    if (!header || !dashboard) return

    const syncHeaderHeight = () => {
      dashboard.style.setProperty(
        "--arcade-sticky-header-height",
        `${Math.ceil(header.getBoundingClientRect().height)}px`,
      )
    }
    syncHeaderHeight()
    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(syncHeaderHeight)
      : null
    observer?.observe(header)
    window.addEventListener("resize", syncHeaderHeight)
    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", syncHeaderHeight)
      dashboard.style.removeProperty("--arcade-sticky-header-height")
    }
  }, [])
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setMobileMenuOpen(false)
      menuToggleRef.current?.focus()
    }
    const onResize = () => { if (window.innerWidth > 1100) setMobileMenuOpen(false) }
    window.addEventListener("keydown", onKey)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onResize)
    }
  }, [mobileMenuOpen])
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
  const [analysisNowMs, setAnalysisNowMs] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setAnalysisNowMs(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
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
    const stored = readStoredDashboard()
    setViewModeRestored(true)
    const storedViewMode = IS_PR_PREVIEW ? readStoredViewMode() : null

    if (!stored) {
      const initialMode = IS_PR_PREVIEW ? (storedViewMode ?? "guest") : "guest"
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
    if (!IS_PR_PREVIEW || !viewModeRestored) return

    try {
      window.localStorage.setItem(DASHBOARD_VIEW_MODE_STORAGE_KEY, viewMode)
    } catch {
      // Preview-only debug selection still works for the current session.
    }
  }, [viewMode, viewModeRestored])

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

  const scoreCatalog = activeHistoryLanguage.catalog
  const scoreLocale = activeHistoryLanguage.locale.replace("_", "-")
  const scoreText = (key: string, params: Record<string, string>) =>
    scoreCatalog.additional[`__score:${key}`].replace(/\{(\w+)\}/g, (token, name: string) => params[name] ?? token)
  const scoreNumber = (value: number) => new Intl.NumberFormat(scoreLocale).format(value)
  const pointBreakdown = [
    {
      key: "game",
      label: scoreCatalog.messages.gameBadges,
      icon: <Gamepad2 />,
      value: numeric(result?.arcadePoints?.gamePoints),
      tone: "purple",
    },
    {
      key: "skill",
      label: scoreCatalog.messages.skillBadges,
      icon: <BadgeCheck />,
      value: numeric(result?.arcadePoints?.skillPoints),
      tone: "blue",
    },
    {
      key: "bonus",
      label: scoreCatalog.messages.triviaSpecial,
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
            label: scoreCatalog.messages.facilitatorBonus,
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
    const normalized = (viewMode === "guest" ? guestProfileUrl : profileUrl).trim().replace(/\/$/, "")

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
      setPredictionCheck({ at: new Date().toISOString(), points: Number(payload.arcadePoints?.totalPoints), complete: payload.beta?.scoreComplete === true })
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
    setPredictionCheck(null)
    setUsingPreviewFakeProfile(false)
    setViewMode("guest")
    setGuestProfileUrl("")
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
    setError("")
    if (nextMode === "guest") setGuestProfileUrl("")

    if (nextMode === "profile" && !result) {
      const stored = readStoredDashboard()

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

  const extensionStrip = (
    <section id="extension" className="extension-strip" data-home-order="extension">
      <span className="extension-store-mark"><Download /></span>
      <div className="extension-copy-block">
        <strong>{activeHistoryLanguage.catalog.messages.installExtension}</strong>
        <span>{activeHistoryLanguage.catalog.messages.automaticTracking}</span>
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
  )

  return (
    <main
      className="arcade-dashboard-page arcade-dashboard-v2 arcade-ui-refresh"
      data-dashboard-view={viewMode}
      data-dashboard-debug-fake={usingPreviewFakeProfile ? "true" : undefined}
    >
      <div className="arcade-stars" aria-hidden="true" />

      <header ref={headerRef} className="arcade-header">
        <a className="arcade-brand" href="#top" aria-label={scoreCatalog.messages.backToCalculator}>
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
          <em>PRO</em>
        </a>

        <nav id="arcade-primary-navigation" className={mobileMenuOpen ? "arcade-nav is-open" : "arcade-nav"}>
          <a className="active" href="#calculator" onClick={() => setMobileMenuOpen(false)}>{scoreCatalog.messages.calculator}</a>
          <a href="#tiers" onClick={() => setMobileMenuOpen(false)}>{scoreCatalog.messages.tiers}</a>
          {viewMode === "profile" && <a href="#badges" onClick={() => setMobileMenuOpen(false)}>{scoreCatalog.messages.badges}</a>}
          <a href="#extension" onClick={() => setMobileMenuOpen(false)}>{scoreCatalog.messages.extension}</a>
          <Link
            data-arcade-swag-nav="true"
            href={swagSeasonPath(CURRENT_SWAG_SEASON)}
            onClick={() => setMobileMenuOpen(false)}
          >{scoreCatalog.additional["Swag Drops"]}</Link>
          <a href="#monthly-games" onClick={() => setMobileMenuOpen(false)}>{scoreCatalog.messages.guestLabsLabel}</a>
        </nav>

        <div className="arcade-header-actions">
          <a
            className="header-store-link is-chrome"
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={scoreCatalog.messages.installChrome}
          >
            <Chrome /> <span>Chrome</span>
          </a>
          <a
            className="header-store-link is-firefox"
            href={FIREFOX_EXTENSION_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={scoreCatalog.messages.installFirefox}
          >
            <Globe2 /> <span>Firefox</span>
          </a>
          <button
            className="mobile-menu-toggle"
            ref={menuToggleRef}
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="arcade-primary-navigation"
            aria-label={mobileMenuOpen ? scoreCatalog.messages.closeNavigation : scoreCatalog.messages.openNavigation}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {IS_PR_PREVIEW && (
        <PreviewModeToolbar
          viewMode={viewMode}
          onChange={activatePreviewMode}
          catalog={activeHistoryLanguage.catalog}
        />
      )}

      <section id="top" className="arcade-hero" data-home-order="hero">
        <div className="hero-heading">
          <p className="pixel-kicker"><Sparkles /> Google Cloud Skills Boost Arcade 2026</p>
          <span className="halloween-edition">
            <span aria-hidden="true">🎃</span>
            {activeHistoryLanguage.catalog.messages.halloweenEdition}
          </span>
          <h1>{heroCopy?.top ?? activeHistoryLanguage.catalog.messages.heroTitleTop}<br /><span>{heroCopy?.bottom ?? activeHistoryLanguage.catalog.messages.heroTitleBottom}</span></h1>
          <p className="hero-description">
            {heroCopy?.description ?? activeHistoryLanguage.catalog.messages.heroDescription}
          </p>
          <div className="trust-pills">
            <span><ShieldCheck />{scoreCatalog.messages.publicDataOnly}</span>
            <span><BadgeCheck />{scoreCatalog.messages.noSignIn}</span>
          </div>
        </div>

        <ProfileAnalyzer
          catalog={activeHistoryLanguage.catalog}
          value={viewMode === "guest" ? guestProfileUrl : profileUrl}
          onChange={value => viewMode === "guest" ? setGuestProfileUrl(value) : setProfileUrl(value)}
          onSubmit={analyzeProfile}
          onReset={resetResult}
          loading={loading}
          error={error}
          hasResult={Boolean(result) && viewMode === "profile"}
        />
      </section>

      {/* Stable portal anchor: keeps countdown placement identical for every locale. */}
      <div className="program-countdown-host" data-home-order="program-countdown" />

      {extensionStrip}



      {showProfileDashboard ? (
        <section className="dashboard-shell" aria-label="Arcade profile results" data-home-order="dashboard-results">
          <div className="dashboard-summary-grid" data-home-order="dashboard-summary">
            <DashboardPanel className="profile-panel">
              <PanelTitle>{scoreCatalog.messages.profileSummary}</PanelTitle>
              <div className="profile-overview">
                <div className="profile-photo">
                  <SafeRemoteImage
                    src={profileImage}
                    alt={scoreCatalog.dynamic.profile.replace("{value}", profileName)}
                    fallback={<span>{profileName.slice(0, 1).toUpperCase()}</span>}
                  />
                </div>
                <div className="profile-name-block">
                  <h2>{profileName}<BadgeCheck /></h2>
                  <p>{memberSince ? scoreCatalog.dynamic.memberSince.replace("{value}", memberSince) : scoreCatalog.messages.publicProfile}</p>
                </div>
              </div>
              <div className="profile-stat-grid">
                <Stat value={scoreNumber(badges.length)} label={scoreCatalog.messages.badges} icon={<BadgeCheck />} />
                <Stat value={scoreNumber(points)} label={scoreCatalog.messages.arcadePoints} icon={<Sparkles />} />
                <Stat value={qualifiedMilestone?.league.replace("Arcade ", "") ?? "—"} label={scoreCatalog.messages.scoreTier} icon={<Trophy />} />
              </div>
            </DashboardPanel>

            <DashboardPanel className="breakdown-panel">
              <PanelTitle>{scoreCatalog.messages.pointBreakdown}</PanelTitle>
              <div className="points-total"><strong>{formatNumber(points)}</strong><span>{scoreCatalog.messages.totalArcadePoints}</span></div>
              <div
                className="point-composition-bar"
                role="img"
                aria-label={scoreText("distribution", { items: pointBreakdown.map((item) => `${item.label}: ${scoreNumber(item.value)}`).join(", ") })}
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
                      title={scoreText("segment", { label: item.label, value: scoreNumber(item.value), percent: new Intl.NumberFormat(scoreLocale, { style: "percent", maximumFractionDigits: 1 }).format(share / 100) })}
                      aria-hidden="true"
                    />
                  )
                })}
              </div>
              <div className="point-compact-list" role="list" aria-label={scoreCatalog.messages.pointBreakdown}>
                {pointBreakdown.map((item) => (
                  <div key={item.key} className={`point-compact-item point-tone-${item.tone}`} role="listitem">
                    <span className="point-compact-name">
                      <span className="point-compact-icon" aria-hidden="true">{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    <strong>{scoreNumber(item.value)}</strong>
                  </div>
                ))}
              </div>
              <ReleasedPointsPanel
                embedded
                badges={badges}
                hasProfile={Boolean(result)}
                profilePoints={profilePointSummary(result, facilitatorBonus)}
                catalog={activeHistoryLanguage.catalog}
                locale={activeHistoryLanguage.locale.replace("_", "-")}
                nowMs={analysisNowMs}
              />
              <p className="panel-link-note">
                {facilitatorBonus > 0
                  ? scoreText("bonusIncluded", { bonus: scoreNumber(facilitatorBonus) })
                  : scoreComplete
                    ? scoreCatalog.messages.allBadgesClassified
                    : scoreCatalog.dynamic.needReview.replace("{count}", scoreNumber(unknownBadgeCount))}
              </p>

            </DashboardPanel>

            <article className="dashboard-panel tier-status-panel">
              <div className="panel-title-row">
                <PanelTitle>{scoreCatalog.messages.eligibility}</PanelTitle>
                <span className={isTierQualified ? "score-state is-qualified" : "score-state"}>
                  {isTierQualified ? scoreCatalog.messages.eligibleByPoints : scoreCatalog.messages.notYetEligible}
                </span>
              </div>
              <div className="tier-status-main">
                <span className="tier-trophy"><Trophy /></span>
                <div>
                  <strong>{qualifiedMilestone?.league.replace("Arcade ", "") ?? scoreCatalog.messages.noTierYet}</strong>
                  <span>{qualifiedMilestone ? tierRangeLabel(qualifiedMilestone) : scoreCatalog.dynamic.pointsToTrooper.replace("{count}", scoreNumber(pointsToNextTier))}</span>
                </div>
              </div>
              {qualifiedMilestone && (
                <div className="tier-availability-grid" aria-label={scoreCatalog.messages.totalTierCapacity}>
                  <div>
                    <span className="tier-availability-icon" aria-hidden="true"><Users /></span>
                    <span>{scoreCatalog.messages.totalTierCapacity}</span>
                    <strong>{formatInteger(qualifiedMilestone.slots)}</strong>
                  </div>
                  <div>
                    <span className="tier-availability-icon" aria-hidden="true"><BadgeCheck /></span>
                    <span>{scoreCatalog.messages.spotsLeft}</span>
                    <strong>
                      {qualifiedMilestone.spotsLeft === null
                        ? scoreCatalog.messages.unavailable
                        : formatInteger(qualifiedMilestone.spotsLeft)}
                    </strong>
                  </div>
                </div>
              )}
              <dl className="allocation-row">
                <dt>{scoreCatalog.messages.queuePosition}</dt>
                <dd>{scoreCatalog.messages.notAvailable} <CircleHelp /></dd>
              </dl>
              <p className="allocation-message">
                {scoreCatalog.messages.allocationMessage}
              </p>
            </article>
          </div>

          <div className="dashboard-content-grid">
            <div className="dashboard-primary-column">
              <article id="badges" className="dashboard-panel badges-panel">
                <div className="badge-heading-row">
                  <div>
                    <PanelTitle>{scoreCatalog.messages.earnedBadges}</PanelTitle>
                    <p>{scoreCatalog.dynamic.badgesInView.replace("{count}", scoreNumber(filteredBadges.length))}</p>
                  </div>
                  <div className="badge-filters" role="group" aria-label={scoreCatalog.messages.filterBadges}>
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
                        {scoreCatalog.messages[item.value]}
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
                            ? scoreCatalog.messages.specialScoring
                            : scoreCatalog.dynamic.points.replace("{count}", scoreNumber(numeric(badge.points)))}
                        </p>
                        <time>{safeDateLabel(badge.dateEarned, scoreLocale)}</time>
                        <SafeExternalLink
                          href={badge.badgeURL}
                          ariaLabel={scoreCatalog.dynamic.open.replace("{value}", badge.title)}
                        >
                          <ExternalLink />
                        </SafeExternalLink>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-badge-state">
                    <BadgeCheck />
                    <strong>{scoreCatalog.messages.noBadges}</strong>
                    <span>{scoreCatalog.messages.chooseFilter}</span>
                  </div>
                )}

                {filteredBadges.length > BADGE_PREVIEW_LIMIT && (
                  <button className="show-all-badges" type="button" onClick={() => setShowAllBadges((open) => !open)}>
                    {showAllBadges ? scoreCatalog.messages.showFewer : scoreCatalog.dynamic.viewAllBadges.replace("{count}", scoreNumber(filteredBadges.length))}
                  </button>
                )}
              </article>

              <div className="dashboard-bottom-grid" data-home-order="dashboard-bottom">
                <article className="dashboard-panel compact-panel">
                  <div className="compact-heading"><PanelTitle>{scoreCatalog.messages.recentlyEarned}</PanelTitle><span>{recentBadges.length || "—"}</span></div>
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
                          <b>{scoreCatalog.dynamic.points.replace("{count}", scoreNumber(numeric(badge.points)))}</b>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="compact-empty">{scoreCatalog.messages.noEarnedDates}</p>
                  )}
                </article>

                <article className="dashboard-panel compact-panel">
                  <div className="compact-heading"><PanelTitle>{scoreCatalog.messages.scoreConfidence}</PanelTitle><span>{scoreComplete ? scoreCatalog.messages.complete : scoreCatalog.messages.review}</span></div>
                  <div className="confidence-summary">
                    <span className={scoreComplete ? "confidence-ring is-complete" : "confidence-ring"}>
                      {scoreComplete ? <ShieldCheck /> : <CircleHelp />}
                    </span>
                    <div>
                      <strong>{scoreComplete ? scoreCatalog.messages.allKnownClassified : scoreCatalog.dynamic.unknownBadges.replace("{count}", scoreNumber(unknownBadgeCount))}</strong>
                      <p>{scoreComplete ? scoreCatalog.messages.scoreComplete : scoreCatalog.messages.unknownShown}</p>
                    </div>
                  </div>
                  {unknownBadges.length > 0 && (
                    <ul className="unknown-badge-list">
                      {unknownBadges.slice(0, 3).map((badge) => <li key={badge}>{badge}</li>)}
                    </ul>
                  )}
                </article>

                <article className="dashboard-panel compact-panel next-goal-panel">
                  <div className="compact-heading"><PanelTitle>{scoreCatalog.messages.nextGoal}</PanelTitle><span>{nextMilestone.league.replace("Arcade ", "")}</span></div>
                  <div className="next-goal-value">
                    <strong>{hasReachedMaxTier ? scoreCatalog.messages.max : scoreNumber(pointsToNextTier)}</strong>
                    <span>{hasReachedMaxTier ? scoreCatalog.messages.topTierReached : scoreCatalog.messages.morePointsNeeded}</span>
                  </div>
                  <div
                    className="goal-progress"
                    role="progressbar"
                    aria-label={hasReachedMaxTier ? scoreCatalog.messages.topTierReached : scoreCatalog.dynamic.progressToward.replace("{value}", nextMilestone.league)}
                    aria-valuemin={goalStartPoints}
                    aria-valuemax={hasReachedMaxTier ? maxTierPoints : nextMilestone.points}
                    aria-valuenow={hasReachedMaxTier ? maxTierPoints : Math.min(Math.max(points, goalStartPoints), nextMilestone.points)}
                  >
                    <span style={{ width: `${goalProgress}%` }} />
                  </div>
                </article>
              </div>
            </div>

            <DashboardTiers
              milestones={milestones}
              milestonesLive={milestonesLive}
              slotHistory={slotHistory}
              catalog={activeHistoryLanguage.catalog}
              locale={activeHistoryLanguage.locale}
              activeTierPoints={qualifiedMilestone?.points}
              prediction={<TierPredictionPanel profileUrl={committedProfileUrl} check={usingPreviewFakeProfile ? null : predictionCheck} feed={slotHistory.feed} catalog={activeHistoryLanguage.catalog} locale={activeHistoryLanguage.locale} estimatedBonus={points !== basePoints} />}
            />
          </div>

          <div id="monthly-games" className="monthly-games-host" data-home-order="monthly-labs" />


        </section>
      ) : (
        <GuestDashboard
          viewMode={viewMode}
          milestones={milestones}
          milestonesLive={milestonesLive}
          slotHistory={slotHistory}
          catalog={activeHistoryLanguage.catalog}
          locale={activeHistoryLanguage.locale}
        />
      )}



      {footerContent}

      <footer className="arcade-footer" data-home-order="footer">
        <div className="arcade-brand footer-brand">
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
        </div>
        <p>{scoreCatalog.messages.unofficial}</p>
        <nav className="footer-route-links" aria-label="Site information">
          <Link href="/about/">{scoreCatalog.messages.about}</Link>
          <Link href="/guide/">{scoreCatalog.messages.guide}</Link>
          <Link href="/swag-drops/">{scoreCatalog.additional["__score:swagArchive"]}</Link>
          <Link href="/privacy/">{scoreCatalog.messages.privacy}</Link>
          <Link href="/terms/">{scoreCatalog.messages.terms}</Link>
        </nav>
      </footer>

      <nav className="mobile-bottom-nav" aria-label={scoreCatalog.messages.mobileNavigation}>
        <a href="#calculator"><Search /><span>{scoreCatalog.messages.calculator}</span></a>
        <a href="#tiers"><Trophy /><span>{scoreCatalog.messages.tiers}</span></a>
        <a href={viewMode === "guest" ? "#monthly-games" : "#badges"}>{viewMode === "guest" ? <Gamepad2 /> : <BadgeCheck />}<span>{viewMode === "guest" ? activeHistoryLanguage.catalog.messages.guestLabsLabel : activeHistoryLanguage.catalog.messages.badges}</span></a>
        <a href="#extension"><Chrome /><span>{scoreCatalog.messages.extension}</span></a>
      </nav>
    </main>
  )
}
