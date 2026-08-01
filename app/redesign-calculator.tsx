"use client"

import {
  BadgeCheck,
  Chrome,
  ExternalLink,
  Gamepad2,
  Github,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react"
import type { FormEvent, ReactNode } from "react"
import { useMemo, useState } from "react"
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
  BadgeFilter,
} from "@/components/arcade/model"

const EXTENSION_URL =
  "https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg"
const GITHUB_URL =
  "https://github.com/ePlus-DEV/google-cloud-skills-boost-helper"
const BADGE_DISPLAY_LIMIT = 12

export default function RedesignCalculator() {
  const [profileUrl, setProfileUrl] = useState("")
  const [result, setResult] = useState<ArcadeApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<BadgeFilter>("all")

  const badges = useMemo<ArcadeBadge[]>(
    () =>
      result
        ? result.badges ?? [
            ...(result.game ?? []),
            ...(result.trivia ?? []),
            ...(result.skill ?? []),
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
      special: result.special ?? [],
    }

    return groups[filter]
  }, [badges, filter, result])

  const displayedBadges = filteredBadges.slice(0, BADGE_DISPLAY_LIMIT)
  const badgeCountLabel =
    filteredBadges.length > BADGE_DISPLAY_LIMIT
      ? `${displayedBadges.length} of ${filteredBadges.length} badges`
      : `${displayedBadges.length} badge${displayedBadges.length === 1 ? "" : "s"}`

  const points = numeric(result?.arcadePoints?.totalPoints)
  const profileName =
    result?.userDetails?.[0]?.userName || "Google Skills learner"
  const currentTier = getTier(points)
  const minimumTierPoints = OFFICIAL_MILESTONES[0]?.points ?? 50
  const scoreComplete = result?.beta?.scoreComplete ?? true
  const unknownBadgeCount = numeric(result?.beta?.unknownBadgeCount)
  const isTierQualified = scoreComplete && points >= minimumTierPoints
  const qualificationLabel = !scoreComplete
    ? "Score incomplete"
    : isTierQualified
      ? "Score qualified"
      : "Not tier-qualified yet"

  const badgeCounts = {
    game: result?.game?.length ?? 0,
    trivia: result?.trivia?.length ?? 0,
    skill: result?.skill?.length ?? 0,
    special: result?.special?.length ?? 0,
  }

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

  return (
    <main className="redesign-page">
      <header className="redesign-header">
        <a className="redesign-brand" href="#top">
          <span className="redesign-brand-icon"><Gamepad2 /></span>
          <span><strong>ARCADE</strong><b>POINTS</b></span>
          <em>PRO</em>
        </a>
        <nav>
          <a className="active" href="#calculator">Calculator</a>
          <a href="#tiers">Tiers</a>
          <a href="#badges">Badges</a>
          <a href="#extension">Extension</a>
        </nav>
        <a className="github-button" href={GITHUB_URL} target="_blank" rel="noreferrer">
          <Github /> GitHub
        </a>
      </header>

      <section id="top" className="redesign-hero">
        <div className="redesign-intro">
          <p className="redesign-kicker"><Sparkles /> Google Cloud Skills Boost Arcade 2026</p>
          <h1>CHECK YOUR<br /><span>ARCADE SCORE</span></h1>
          <p>Analyze your public profile, inspect earned badges and see which 2026 reward tier your score qualifies for.</p>
          <div className="trust-row">
            <span><ShieldCheck /> Public data only</span>
            <span><BadgeCheck /> No Google sign-in</span>
          </div>
        </div>

        <div id="calculator" className="profile-search-card">
          <div className="card-step"><span>1</span> Paste your public profile URL</div>
          <form onSubmit={analyzeProfile}>
            <label className="profile-url-control">
              <Search />
              <input
                type="url"
                value={profileUrl}
                onChange={(event) => setProfileUrl(event.target.value)}
                placeholder="https://www.skills.google/public_profiles/..."
                aria-label="Google Skills public profile URL"
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="spin" /> : <Trophy />}
              {loading ? "Analyzing..." : "Analyze profile"}
            </button>
          </form>
          {error && <p className="profile-error" role="alert">{error}</p>}
          <a className="profile-help" href="https://www.skills.google/public_profiles" target="_blank" rel="noreferrer">
            How to find your public profile <ExternalLink />
          </a>
        </div>
      </section>

      <section id="extension" className="extension-ribbon">
        <Chrome />
        <div>
          <strong>Get points automatically with our Chrome extension</strong>
          <span>One-click sync on Skills Boost · real-time score tools · open source</span>
        </div>
        <a href={EXTENSION_URL} target="_blank" rel="noreferrer">
          Install extension <ExternalLink />
        </a>
      </section>

      {result ? (
        <>
          <section className="dashboard-top-grid">
            <article className="dashboard-card profile-summary-card">
              <div className="card-title">Profile summary</div>
              <div className="profile-identity">
                <div className="profile-avatar">{profileName.slice(0, 1).toUpperCase()}</div>
                <div><h2>{profileName}</h2><p>Public Google Skills profile</p></div>
              </div>
              <div className="profile-metrics">
                <div><strong>{badges.length}</strong><span>Badges</span></div>
                <div><strong>{formatNumber(points)}</strong><span>Points</span></div>
                <div><strong>{currentTier.name}</strong><span>Tier</span></div>
              </div>
            </article>

            <article className="dashboard-card points-card">
              <div className="card-title">Point breakdown</div>
              <strong className="total-points">{formatNumber(points)} <small>total points</small></strong>
              <PointRow icon={<Gamepad2 />} label="Game badges" count={badgeCounts.game} />
              <PointRow icon={<BadgeCheck />} label="Skill badges" count={badgeCounts.skill} />
              <PointRow icon={<Star />} label="Trivia & special" count={badgeCounts.trivia + badgeCounts.special} />
            </article>

            <article className="dashboard-card tier-status-card">
              <div className="card-title">Tier status · Arcade 2026</div>
              <p className={isTierQualified ? "qualified" : "qualified is-warning"}>
                <BadgeCheck /> {qualificationLabel}
              </p>
              <div className="tier-status-main">
                <Trophy />
                <div>
                  <strong>{currentTier.name}</strong>
                  <span>{points >= 120 ? "120+ points" : `${formatNumber(points)} points`}</span>
                </div>
              </div>
              <dl><dt>Allocation status</dt><dd>Unknown</dd></dl>
              <p className="allocation-note">
                {!scoreComplete
                  ? `${unknownBadgeCount || "Some"} badge(s) still need classification before tier qualification is reliable.`
                  : points < minimumTierPoints
                    ? `You need ${formatNumber(minimumTierPoints - points)} more points to reach the first reward tier.`
                    : "Google does not publicly expose your allocation order. This result is based on score only."}
              </p>
            </article>
          </section>

          <section className="dashboard-main-grid">
            <article id="badges" className="dashboard-card earned-badges-card">
              <div className="card-heading-row">
                <div><div className="card-title">Earned badges</div><p>{badgeCountLabel}</p></div>
                <div className="badge-tabs">
                  {(["all", "game", "skill", "trivia", "special"] as BadgeFilter[]).map((item) => (
                    <button type="button" key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="real-badge-grid">
                {displayedBadges.map((badge, index) => (
                  <article className="real-badge" key={`${badge.title}-${index}`}>
                    <div className="real-badge-art">
                      {badge.imageURL ? <img src={badge.imageURL} alt="" loading="lazy" /> : <BadgeCheck />}
                    </div>
                    <h3>{badge.title}</h3>
                    <p>{badge.points === "-*" ? "Special rule" : `+${formatNumber(numeric(badge.points))} pts`}</p>
                    {badge.dateEarned && <time>{badge.dateEarned}</time>}
                  </article>
                ))}
              </div>
              {filteredBadges.length === 0 && <div className="empty-badges">No badges returned for this category.</div>}
            </article>

            <aside id="tiers" className="dashboard-card tiers-card">
              <div className="card-title">Arcade 2026 tiers</div>
              <div className="tier-list">
                {[...OFFICIAL_MILESTONES].reverse().map((tier) => (
                  <div className={`tier-row tier-${tier.points}`} key={tier.points}>
                    <Trophy />
                    <div><strong>{tier.league.replace("Arcade ", "")}</strong><span>{tierRangeLabel(tier)}</span></div>
                    <b>{formatInteger(tier.slots)}<small> slots</small></b>
                  </div>
                ))}
              </div>
              <p className="tier-disclaimer">Tier qualification is calculated from points. Slot allocation and first-come order are not public.</p>
            </aside>
          </section>
        </>
      ) : (
        <section className="empty-dashboard">
          <div><Trophy /><strong>Your result will appear here</strong><span>Paste a public profile URL above to load real points, tiers and badges.</span></div>
          <div className="empty-tier-preview">
            {[...OFFICIAL_MILESTONES].reverse().map((tier) => (
              <span key={tier.points}><b>{tier.league.replace("Arcade ", "")}</b>{tierRangeLabel(tier)}</span>
            ))}
          </div>
        </section>
      )}

      <footer className="redesign-footer">
        <span>Arcade Points by ePlus.DEV</span>
        <div>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          <a href={EXTENSION_URL} target="_blank" rel="noreferrer">Chrome Extension</a>
        </div>
      </footer>
    </main>
  )
}

function PointRow({ icon, label, count }: { icon: ReactNode; label: string; count: number }) {
  return (
    <div className="point-row">
      <span>{icon}{label}</span>
      <i><b style={{ width: `${Math.min(100, count * 4)}%` }} /></i>
      <strong>{count}</strong>
    </div>
  )
}
