"use client"

import Link from "next/link"
import ScoreSummary from "@/components/arcade/score-summary"
import ScoreBreakdown from "@/components/arcade/score-breakdown"
import DashboardTiers from "@/components/arcade/dashboard-tiers"
import ProfileAnalyzer, { type HeroCopy } from "@/components/arcade/profile-analyzer"
import MonthlyGamesSection from "@/components/arcade/monthly-games-section"
import NextScoreGoal from "@/components/arcade/next-score-goal"
import ExtensionStrip from "@/components/arcade/extension-strip"
import GuestDashboard from "@/components/arcade/guest-dashboard"
import PreviewModeToolbar from "@/components/arcade/preview-mode-toolbar"
import { readStoredDashboard, type DashboardViewMode } from "@/components/arcade/dashboard-state"
import { useTierSlotHistory } from "@/components/arcade/tier-slot-history"
import {
  getWebsiteLocale,
  getWebsiteLocaleFromPathname,
  getWebsiteLocaleInfo,
  loadWebsiteCatalog,
  type WebsiteCatalog,
  type WebsiteLocale,
} from "@/lib/website-i18n"
import {
  BadgeCheck,
  ExternalLink,
  Gamepad2,
  GraduationCap,
  Menu,
  Search,
  Star,
  Trophy,
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
import {
  FACILITATOR_PARTICIPATION_EVENT,
  normalizeFacilitatorProfileUrl,
  readFacilitatorParticipation,
  type FacilitatorParticipationDetail,
} from "@/components/arcade/facilitator-participation"
import {
  API_URL,
  ARCADE_MILESTONES_URL,
  DASHBOARD_STORAGE_KEY,
  OFFICIAL_MILESTONES,
  PROFILE_URL_PATTERN,
  formatNumber,
  numeric,
} from "@/components/arcade/model"
import type {
  ArcadeApiResponse,
  ArcadeBadge,
  ArcadeMilestone,
  BadgeFilter,
} from "@/components/arcade/model"

const BADGE_PREVIEW_LIMIT = 8
const DASHBOARD_VIEW_MODE_STORAGE_KEY = "eplus-arcade-dashboard-view-mode-v1"

const FILTERS: Array<{ value: BadgeFilter }> = [
  { value: "all" },
  { value: "game" },
  { value: "skill" },
  { value: "trivia" },
  { value: "special" },
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

function safeDateLabel(value?: string, locale = "en", fallback = ""): string {
  if (!value) return fallback

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

    const onParticipationChange = (event: Event) => {
      const detail = (event as CustomEvent<FacilitatorParticipationDetail>).detail
      if (
        !detail ||
        normalizeFacilitatorProfileUrl(detail.profileUrl) !== normalizeFacilitatorProfileUrl(committedProfileUrl)
      ) return
      setFacilitatorParticipation({ profileUrl: committedProfileUrl, participating: detail.participating })
    }

    syncParticipation()
    window.addEventListener(FACILITATOR_PARTICIPATION_EVENT, onParticipationChange)
    window.addEventListener("focus", syncParticipation)
    window.addEventListener("storage", syncParticipation)

    return () => {
      window.removeEventListener(FACILITATOR_PARTICIPATION_EVENT, onParticipationChange)
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
  const profileName = profile?.userName || activeHistoryLanguage.catalog.messages.publicProfile
  const profileImage = profile?.profileImage
  const memberSince = profile?.memberSince
  const qualifiedMilestone = getQualifiedMilestone(points, milestones)
  const scoreComplete = result?.beta?.scoreComplete ?? true
  const unknownBadgeCount = numeric(result?.beta?.unknownBadgeCount)
  const unknownBadges = result?.beta?.unknownBadges ?? []

  const pointBreakdown = [
    {
      key: "game",
      label: activeHistoryLanguage.catalog.messages.gameBadges,
      icon: <Gamepad2 />,
      value: numeric(result?.arcadePoints?.gamePoints),
      tone: "purple",
    },
    {
      key: "skill",
      label: activeHistoryLanguage.catalog.messages.skillBadges,
      icon: <BadgeCheck />,
      value: numeric(result?.arcadePoints?.skillPoints),
      tone: "blue",
    },
    {
      key: "bonus",
      label: activeHistoryLanguage.catalog.messages.triviaSpecial,
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
            label: activeHistoryLanguage.catalog.messages.facilitatorBonus,
            icon: <GraduationCap />,
            value: facilitatorBonus,
            tone: "violet",
          },
        ]
      : []),
  ]

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

  const m = activeHistoryLanguage.catalog.messages

  const showProfileDashboard = viewMode === "profile" && Boolean(result)

  return (
    <main
      className="arcade-dashboard-page arcade-dashboard-v2"
      data-dashboard-view={viewMode}
      data-dashboard-debug-fake={usingPreviewFakeProfile ? "true" : undefined}
    >
      <div className="arcade-stars" aria-hidden="true" />

      <header className="arcade-header">
        <a className="arcade-brand" href="#top" aria-label={m.calculator}>
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
        </a>

        <nav className={mobileMenuOpen ? "arcade-nav is-open" : "arcade-nav"}>
          <a className="active" href="#calculator" onClick={() => setMobileMenuOpen(false)}>{m.calculator}</a>
          <a href="#tiers" onClick={() => setMobileMenuOpen(false)}>{m.tiers}</a>
          {viewMode === "profile" && <a href="#badges" onClick={() => setMobileMenuOpen(false)}>{m.badges}</a>}
          <Link
            data-arcade-swag-nav="true"
            href={swagSeasonPath(CURRENT_SWAG_SEASON)}
            onClick={() => setMobileMenuOpen(false)}
          >{activeHistoryLanguage.catalog.additional["Swag Drops"]}</Link>
          <a href="#monthly-games" onClick={() => setMobileMenuOpen(false)}>{m.guestLabsLabel}</a>
        </nav>

        <div className="arcade-header-actions">
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? m.closeNavigation : m.openNavigation}
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

      <ProfileAnalyzer
        catalog={activeHistoryLanguage.catalog}
        copy={heroCopy}
        profileUrl={viewMode === "guest" ? guestProfileUrl : profileUrl}
        onProfileUrlChange={viewMode === "guest" ? setGuestProfileUrl : setProfileUrl}
        onAnalyze={analyzeProfile}
        onReset={resetResult}
        hasResult={Boolean(result) && viewMode === "profile"}
        loading={loading}
        error={error}
      />

      {/* Stable portal anchor: keeps countdown placement identical for every locale. */}
      <div className="program-countdown-host" data-home-order="program-countdown" />

      {showProfileDashboard ? (
        <section className="dashboard-shell" aria-label={m.profileResults} data-home-order="dashboard-results">
          <div className="dashboard-summary-grid" data-home-order="dashboard-summary">
            <ScoreSummary
              catalog={activeHistoryLanguage.catalog}
              name={profileName}
              memberSince={memberSince}
              image={<SafeRemoteImage src={profileImage} alt={activeHistoryLanguage.catalog.dynamic.profile.replace("{value}", profileName)} fallback={<span>{profileName.slice(0, 1).toUpperCase()}</span>} />}
              points={points}
              badgeCount={badges.length}
              tier={qualifiedMilestone?.league.replace("Arcade ", "")}
              scoreComplete={scoreComplete}
              unknownBadgeCount={unknownBadgeCount}
            />

            <NextScoreGoal
              catalog={activeHistoryLanguage.catalog}
              nextMilestone={nextMilestone}
              points={points}
              pointsToNextTier={pointsToNextTier}
              maxTierPoints={maxTierPoints}
              hasReachedMaxTier={hasReachedMaxTier}
              goalStartPoints={goalStartPoints}
              goalProgress={goalProgress}
            />

          </div>

          <ScoreBreakdown catalog={activeHistoryLanguage.catalog} locale={activeHistoryLanguage.locale} items={pointBreakdown} total={points} scoreComplete={scoreComplete} unknownBadges={unknownBadges} />

          <div className="discovery-grid">
            <MonthlyGamesSection badges={badges} hasProfile={showProfileDashboard} />
            <DashboardTiers
              milestones={milestones}
              milestonesLive={milestonesLive}
              slotHistory={slotHistory}
              catalog={activeHistoryLanguage.catalog}
              locale={activeHistoryLanguage.locale}
              activeTierPoints={qualifiedMilestone?.points}
            />
          </div>

          <div className="dashboard-content-grid">
            <article id="badges" className="dashboard-panel badges-panel">
              <div className="badge-heading-row">
                <div>
                  <PanelTitle>{m.earnedBadges}</PanelTitle>
                  <p>{activeHistoryLanguage.catalog.dynamic.badgesInView.replace("{count}", String(filteredBadges.length))}</p>
                </div>
                <div className="badge-filters" role="group" aria-label={m.filterBadges}>
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
                      {m[item.value]}
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
                          ? m.specialScoring
                          : activeHistoryLanguage.catalog.dynamic.points.replace("{count}", formatNumber(numeric(badge.points)))}
                      </p>
                      <time>{safeDateLabel(badge.dateEarned, getWebsiteLocaleInfo(activeHistoryLanguage.locale).htmlLang, m.unavailable)}</time>
                      <SafeExternalLink
                        href={badge.badgeURL}
                        ariaLabel={activeHistoryLanguage.catalog.dynamic.open.replace("{value}", badge.title)}
                      >
                        <ExternalLink />
                      </SafeExternalLink>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-badge-state">
                  <BadgeCheck />
                  <strong>{m.noBadges}</strong>
                  <span>{m.chooseFilter}</span>
                </div>
              )}

              {filteredBadges.length > BADGE_PREVIEW_LIMIT && (
                <button className="show-all-badges" type="button" onClick={() => setShowAllBadges((open) => !open)}>
                  {showAllBadges ? m.showFewer : activeHistoryLanguage.catalog.dynamic.viewAllBadges.replace("{count}", String(filteredBadges.length))}
                </button>
              )}
            </article>

          </div>

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

      <ExtensionStrip catalog={activeHistoryLanguage.catalog} />

      {footerContent}

      <footer className="arcade-footer" data-home-order="footer">
        <div className="arcade-brand footer-brand">
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
        </div>
        <p>{m.unofficial}</p>
        <nav className="footer-route-links" aria-label={m.aboutArcade}>
          <Link href="/about/">{m.about}</Link>
          <Link href="/guide/">{m.guide}</Link>
          <Link href="/swag-drops/">{activeHistoryLanguage.catalog.additional["Swag archive"] ?? activeHistoryLanguage.catalog.additional["Swag Drops"]}</Link>
          <Link href="/privacy/">{m.privacy}</Link>
          <Link href="/terms/">{m.terms}</Link>
        </nav>
      </footer>

      <nav className="mobile-bottom-nav" aria-label={m.mobileNavigation}>
        <a href="#calculator"><Search /><span>{m.calculator}</span></a>
        <a href="#monthly-games"><Gamepad2 /><span>{m.guestLabsLabel}</span></a>
        <a href="#tiers"><Trophy /><span>{m.tiers}</span></a>
        {showProfileDashboard
          ? <a href="#badges"><BadgeCheck /><span>{m.badges}</span></a>
          : <Link href={swagSeasonPath(CURRENT_SWAG_SEASON)}><Trophy /><span>{activeHistoryLanguage.catalog.additional["Swag Drops"]}</span></Link>}
      </nav>
    </main>
  )
}

function PanelTitle({ children }: { children: ReactNode }) {
  return <h2 className="panel-title">{children}</h2>
}
