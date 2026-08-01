"use client"

import {
  BadgeCheck,
  Chrome,
  CircleHelp,
  ExternalLink,
  Gamepad2,
  Github,
  LoaderCircle,
  Menu,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react"
import type { FormEvent, ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import {
  API_URL,
  OFFICIAL_MILESTONES,
  PROFILE_URL_PATTERN,
  formatInteger,
  formatNumber,
  getTier,
  numeric,
  tierRangeLabel,
} from "@/components/arcade/model"
import type {
  ArcadeApiResponse,
  ArcadeBadge,
  ArcadeMilestone,
  BadgeFilter,
} from "@/components/arcade/model"

const EXTENSION_URL =
  "https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg"
const GITHUB_URL = "https://github.com/ePlus-DEV/google-cloud-skills-boost-helper"
const STORAGE_KEY = "eplus-arcade-dashboard-v1"
const BADGE_PREVIEW_LIMIT = 8

const FILTERS: Array<{ value: BadgeFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "game", label: "Game" },
  { value: "skill", label: "Skill" },
  { value: "trivia", label: "Trivia" },
  { value: "special", label: "Special" },
]

function getQualifiedMilestone(points: number): ArcadeMilestone | null {
  return [...OFFICIAL_MILESTONES].reverse().find((tier) => points >= tier.points) ?? null
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

function readStoredResult(): { profileUrl: string; result: ArcadeApiResponse } | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
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

export default function RedesignCalculator() {
  const [profileUrl, setProfileUrl] = useState("")
  const [result, setResult] = useState<ArcadeApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<BadgeFilter>("all")
  const [showAllBadges, setShowAllBadges] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const stored = readStoredResult()
    if (!stored) return

    setProfileUrl(stored.profileUrl)
    setResult(stored.result)
  }, [])

  useEffect(() => {
    if (!result) return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ profileUrl, result }))
    } catch {
      // Storage is optional. The calculator still works without persistence.
    }
  }, [profileUrl, result])

  const badges = useMemo<ArcadeBadge[]>(
    () =>
      result
        ? result.badges ?? [
            ...(result.game ?? []),
            ...(result.trivia ?? []),
            ...(result.skill ?? []),
            ...(result.completion ?? []),
            ...(result.special ?? []),
          ]
        : [],
    [result],
  )

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

  const points = numeric(result?.arcadePoints?.totalPoints)
  const profile = result?.userDetails?.[0]
  const profileName = profile?.userName || "Google Skills learner"
  const profileImage = profile?.profileImage
  const memberSince = profile?.memberSince
  const qualifiedMilestone = getQualifiedMilestone(points)
  const currentTier = getTier(points)
  const minimumTierPoints = OFFICIAL_MILESTONES[0]?.points ?? 50
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
  ]

  const recentBadges = badges.filter((badge) => badge.dateEarned).slice(0, 4)

  const nextMilestone =
    OFFICIAL_MILESTONES.find((tier) => points < tier.points) ??
    OFFICIAL_MILESTONES[OFFICIAL_MILESTONES.length - 1]
  const pointsToNextTier = Math.max(0, nextMilestone.points - points)

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
    const controller = new AbortController()
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

      setResult(payload)
      setFilter("all")
      setShowAllBadges(false)
    } catch (caught) {
      setError(
        caught instanceof DOMException && caught.name === "AbortError"
          ? "The request timed out after 20 seconds."
          : caught instanceof Error
            ? caught.message
            : "The profile could not be analyzed.",
      )
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }

  function resetResult() {
    setProfileUrl("")
    setResult(null)
    setError("")
    setFilter("all")
    setShowAllBadges(false)

    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Reset in-memory state even if storage is unavailable.
    }
  }

  return (
    <main className="arcade-dashboard-page">
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
        </nav>

        <div className="arcade-header-actions">
          <a className="header-github" href={GITHUB_URL} target="_blank" rel="noreferrer">
            <Github /> <span>GitHub</span>
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

      <section id="top" className="arcade-hero">
        <div className="hero-heading">
          <p className="pixel-kicker"><Sparkles /> Google Cloud Skills Boost Arcade 2026</p>
          <h1>CHECK YOUR<br /><span>ARCADE SCORE</span></h1>
          <p className="hero-description">
            Analyze your public profile, inspect earned badges and check which 2026 reward tier your score qualifies for.
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
                placeholder="https://www.skills.google/public_profiles/..."
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
            <a href="https://www.skills.google/public_profiles" target="_blank" rel="noreferrer">
              <CircleHelp /> How to find your public profile <ExternalLink />
            </a>
            {result && (
              <button type="button" onClick={resetResult}><RefreshCcw /> Reset result</button>
            )}
          </div>
        </div>
      </section>

      <section id="extension" className="extension-strip">
        <span className="chrome-mark"><Chrome /></span>
        <div>
          <strong>Get points automatically with our Chrome extension</strong>
          <span>One-click sync on Skills Boost · score tools · open source</span>
        </div>
        <a href={EXTENSION_URL} target="_blank" rel="noreferrer">
          Install extension <ExternalLink />
        </a>
      </section>

      {result ? (
        <section className="dashboard-shell" aria-label="Arcade profile results">
          <div className="dashboard-summary-grid">
            <article className="dashboard-panel profile-panel">
              <PanelTitle>Profile summary</PanelTitle>
              <div className="profile-overview">
                <div className="profile-photo">
                  {profileImage ? (
                    <img src={profileImage} alt={`${profileName} profile`} />
                  ) : (
                    <span>{profileName.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="profile-name-block">
                  <h2>{profileName}<BadgeCheck /></h2>
                  <p>{memberSince ? `Member since ${memberSince}` : "Public Google Skills profile"}</p>
                </div>
              </div>
              <div className="profile-stat-grid">
                <Stat value={String(badges.length)} label="Badges" />
                <Stat value={formatNumber(points)} label="Arcade points" />
                <Stat value={qualifiedMilestone?.league.replace("Arcade ", "") ?? "—"} label="Score tier" />
              </div>
            </article>

            <article className="dashboard-panel breakdown-panel">
              <PanelTitle>Point breakdown</PanelTitle>
              <div className="points-total"><strong>{formatNumber(points)}</strong><span>Total Arcade points</span></div>
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
                {scoreComplete
                  ? "All eligible returned badges were classified."
                  : `${unknownBadgeCount} badge(s) still need scoring review.`}
              </p>
            </article>

            <article className="dashboard-panel tier-status-panel">
              <div className="panel-title-row">
                <PanelTitle>Tier status · Arcade 2026</PanelTitle>
                <span className={isTierQualified ? "score-state is-qualified" : "score-state"}>
                  {isTierQualified ? "Score qualified" : "Score not qualified"}
                </span>
              </div>
              <div className="tier-status-main">
                <span className="tier-trophy"><Trophy /></span>
                <div>
                  <strong>{qualifiedMilestone?.league.replace("Arcade ", "") ?? "NO TIER YET"}</strong>
                  <span>{qualifiedMilestone ? tierRangeLabel(qualifiedMilestone) : `${pointsToNextTier} points to Trooper`}</span>
                </div>
              </div>
              <dl className="allocation-row">
                <dt>Allocation status</dt>
                <dd>Unknown <CircleHelp /></dd>
              </dl>
              <p className="allocation-message">
                Google does not publicly expose your allocation order. This result confirms score eligibility only.
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
                        {badge.imageURL ? (
                          <img src={badge.imageURL} alt="" loading="lazy" />
                        ) : (
                          <BadgeCheck />
                        )}
                      </div>
                      <h3>{badge.title}</h3>
                      <p>
                        {badge.points === "-*"
                          ? "Special scoring rule"
                          : `+${formatNumber(numeric(badge.points))} pts`}
                      </p>
                      <time>{safeDateLabel(badge.dateEarned)}</time>
                      {badge.badgeURL && (
                        <a href={badge.badgeURL} target="_blank" rel="noreferrer" aria-label={`Open ${badge.title}`}>
                          <ExternalLink />
                        </a>
                      )}
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
                <span className="tier-help">Score only</span>
              </div>
              <div className="tier-list">
                {[...OFFICIAL_MILESTONES].reverse().map((tier) => {
                  const active = qualifiedMilestone?.points === tier.points
                  return (
                    <div className={`tier-list-row tier-${tier.points}${active ? " is-current" : ""}`} key={tier.points}>
                      <span className="tier-list-icon"><Trophy /></span>
                      <div><strong>{tier.league.replace("Arcade ", "")}</strong><span>{tierRangeLabel(tier)}</span></div>
                      <b>{formatInteger(tier.slots)}<small> slots</small></b>
                    </div>
                  )
                })}
              </div>
              <p className="tier-note">
                Slot limits are official totals. First-come allocation order is not public, so the site never claims a guaranteed reward.
              </p>
            </aside>
          </div>

          <div className="dashboard-bottom-grid">
            <article className="dashboard-panel compact-panel">
              <div className="compact-heading"><PanelTitle>Recently earned</PanelTitle><span>{recentBadges.length || "—"}</span></div>
              {recentBadges.length > 0 ? (
                <div className="compact-list">
                  {recentBadges.map((badge, index) => (
                    <div key={`${badge.title}-recent-${index}`}>
                      <span className="compact-icon">{badge.imageURL ? <img src={badge.imageURL} alt="" /> : <BadgeCheck />}</span>
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
                  <p>{scoreComplete ? "The score is complete for the crawler's current badge index." : "These badges are shown instead of being silently ignored."}</p>
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
                <strong>{points >= 120 ? "MAX" : formatNumber(pointsToNextTier)}</strong>
                <span>{points >= 120 ? "Top score tier reached" : "more points needed"}</span>
              </div>
              <div className="goal-progress" role="progressbar" aria-valuemin={0} aria-valuemax={nextMilestone.points} aria-valuenow={Math.min(points, nextMilestone.points)}>
                <span style={{ width: `${Math.min(100, (points / Math.max(nextMilestone.points, 1)) * 100)}%` }} />
              </div>
            </article>
          </div>
        </section>
      ) : (
        <section className="dashboard-empty-state">
          <div className="empty-result-message">
            <span><Trophy /></span>
            <strong>Your Arcade dashboard will appear here</strong>
            <p>Paste a public profile URL above to load real points, score eligibility and earned badges.</p>
          </div>
          <div className="empty-tier-grid">
            {[...OFFICIAL_MILESTONES].reverse().map((tier) => (
              <article key={tier.points}>
                <Trophy />
                <div><strong>{tier.league.replace("Arcade ", "")}</strong><span>{tierRangeLabel(tier)}</span></div>
                <b>{formatInteger(tier.slots)} slots</b>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="arcade-footer">
        <div className="arcade-brand footer-brand">
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
        </div>
        <p>Unofficial community calculator by ePlus.DEV. Google remains the authority for final scores and rewards.</p>
        <div>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          <a href={EXTENSION_URL} target="_blank" rel="noreferrer">Extension</a>
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

function Stat({ value, label }: { value: string; label: string }) {
  return <div><strong>{value}</strong><span>{label}</span></div>
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
  const width = total > 0 ? Math.min(100, (value / total) * 100) : 0

  return (
    <div className="point-breakdown-row">
      <span>{icon}{label}</span>
      <i><b className={`tone-${tone}`} style={{ width: `${width}%` }} /></i>
      <strong>{formatNumber(value)} pts</strong>
    </div>
  )
}
