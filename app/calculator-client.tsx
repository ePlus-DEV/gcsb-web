"use client"

import {
  BadgeCheck,
  BookOpen,
  ExternalLink,
  Gamepad2,
  Github,
  LoaderCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react"
import type { ChangeEvent, FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import {
  API_URL,
  DEMO_SNAPSHOT,
  PROFILE_URL_PATTERN,
  SAMPLE_BADGES,
  STORAGE_KEY,
  formatNumber,
  getNextTier,
  getTier,
  numeric,
  clamp,
} from "@/components/arcade/model"
import type {
  ArcadeApiResponse,
  ArcadeBadge,
  BadgeFilter,
  CalculatorSnapshot,
} from "@/components/arcade/model"
import {
  ExtensionStoreLinks,
  JoystickLogo,
  TrailMap,
  TrailStats,
} from "@/components/arcade/visuals"

export default function ArcadeCalculatorClient() {
  const [profileUrl, setProfileUrl] = useState("")
  const [snapshot, setSnapshot] = useState<CalculatorSnapshot>(DEMO_SNAPSHOT)
  const [response, setResponse] = useState<ArcadeApiResponse | null>(null)
  const [badges, setBadges] = useState<ArcadeBadge[]>(SAMPLE_BADGES)
  const [filter, setFilter] = useState<BadgeFilter>("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isDemo, setIsDemo] = useState(true)
  const [manualMode, setManualMode] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored) as {
        snapshot?: CalculatorSnapshot
        response?: ArcadeApiResponse | null
        badges?: ArcadeBadge[]
      }

      if (parsed.snapshot) {
        setSnapshot(parsed.snapshot)
        setProfileUrl(parsed.snapshot.profileUrl ?? "")
        setIsDemo(false)
      }
      if (parsed.response) setResponse(parsed.response)
      if (Array.isArray(parsed.badges)) setBadges(parsed.badges)
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const currentTier = useMemo(() => getTier(snapshot.currentPoints), [snapshot.currentPoints])
  const nextTier = useMemo(
    () => getNextTier(snapshot.currentPoints, snapshot.targetPoints),
    [snapshot.currentPoints, snapshot.targetPoints],
  )
  const pointsRemaining = Math.max(0, nextTier.points - snapshot.currentPoints)
  const completion = clamp((snapshot.currentPoints / Math.max(nextTier.points, 1)) * 100, 0, 100)
  const estimatedActivities = Math.ceil(pointsRemaining)

  const filteredBadges = useMemo(() => {
    if (!response || filter === "all") return badges

    const byFilter: Record<Exclude<BadgeFilter, "all">, ArcadeBadge[]> = {
      game: response.game ?? [],
      trivia: response.trivia ?? [],
      skill: response.skill ?? [],
      special: response.special ?? [],
    }

    return byFilter[filter]
  }, [badges, filter, response])

  function persist(
    nextSnapshot: CalculatorSnapshot,
    nextResponse: ArcadeApiResponse | null,
    nextBadges: ArcadeBadge[],
  ) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ snapshot: nextSnapshot, response: nextResponse, badges: nextBadges }),
    )
  }

  function applyApiResult(result: ArcadeApiResponse, url: string) {
    const totalPoints = numeric(result.arcadePoints?.totalPoints)
    const gameBadges = (result.game ?? []).length
    const triviaBadges = (result.trivia ?? []).length
    const skillBadges = (result.skill ?? []).length
    const officialNext = getNextTier(totalPoints, 50)
    const nextSnapshot: CalculatorSnapshot = {
      profileUrl: url,
      currentPoints: totalPoints,
      gameBadges,
      triviaBadges,
      skillBadges,
      targetPoints: officialNext.points,
      userName: result.userDetails?.[0]?.userName || "Google Skills learner",
      milestone: result.milestone || result.beta?.tier || getTier(totalPoints).name,
      scoreComplete: result.beta?.scoreComplete ?? true,
      unknownBadgeCount: numeric(result.beta?.unknownBadgeCount),
      updatedAt: new Date().toISOString(),
    }
    const nextBadges = result.badges ?? [
      ...(result.game ?? []),
      ...(result.trivia ?? []),
      ...(result.skill ?? []),
      ...(result.special ?? []),
    ]

    setSnapshot(nextSnapshot)
    setResponse(result)
    setBadges(nextBadges)
    setIsDemo(false)
    persist(nextSnapshot, result, nextBadges)
  }

  async function analyzeProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = profileUrl.trim().replace(/\/$/, "")

    if (!PROFILE_URL_PATTERN.test(normalized)) {
      setError("Enter a valid public profile URL from skills.google or cloudskillsboost.google.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const request = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized, season: "2026" }),
      })
      const result = (await request.json()) as ArcadeApiResponse

      if (!request.ok || !result.success) {
        throw new Error(result.message || "The profile could not be analyzed right now.")
      }

      applyApiResult(result, normalized)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `${caught.message} You can use manual entry while the crawler is unavailable.`
          : "The profile could not be analyzed. You can use manual entry instead.",
      )
      setManualMode(true)
    } finally {
      setLoading(false)
    }
  }

  function updateManual(field: keyof CalculatorSnapshot, value: string) {
    const numericFields: Array<keyof CalculatorSnapshot> = [
      "currentPoints",
      "gameBadges",
      "triviaBadges",
      "skillBadges",
      "targetPoints",
    ]
    const nextValue = numericFields.includes(field) ? Math.max(0, numeric(value)) : value
    const nextSnapshot = { ...snapshot, [field]: nextValue, updatedAt: new Date().toISOString() }

    setSnapshot(nextSnapshot)
    setIsDemo(false)
    persist(nextSnapshot, response, badges)
  }

  function loadDemo() {
    setSnapshot(DEMO_SNAPSHOT)
    setProfileUrl("")
    setResponse(null)
    setBadges(SAMPLE_BADGES)
    setError("")
    setManualMode(false)
    setIsDemo(true)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <main className="arcade-page">
      <header className="site-header">
        <a className="brand" href="#calculator" aria-label="Arcade Points home">
          <JoystickLogo />
          <span className="brand-name">Arcade Points</span>
          <span className="season-pill">2026 Season</span>
        </a>
        <button className="mobile-menu-button" type="button" aria-expanded={mobileNavOpen} aria-controls="primary-navigation" onClick={() => setMobileNavOpen((open) => !open)}>Menu</button>
        <nav id="primary-navigation" className={mobileNavOpen ? "site-nav is-open" : "site-nav"}>
          <a className="active" href="#calculator"><Trophy />Calculator</a>
          <a href="#badges"><BadgeCheck />Badges</a>
          <a href="#extension"><ShieldCheck />Extension</a>
          <a href="https://github.com/ePlus-DEV/google-cloud-skills-boost-helper" target="_blank" rel="noreferrer"><Github />GitHub</a>
        </nav>
      </header>

      <section id="calculator" className="trail-stage" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles /> Free, private & powered by public profile data</p>
          <h1 id="hero-title">Know your points.<br />Plan your next badge.</h1>
          <p className="hero-description">Paste your public Google Skills profile to calculate Arcade points, inspect badges and see the fastest route to your next tier.</p>

          <form className="profile-form" onSubmit={analyzeProfile} noValidate>
            <label htmlFor="profile-url">Google Skills public profile URL</label>
            <div className={error ? "profile-input-wrap has-error" : "profile-input-wrap"}>
              <Search aria-hidden="true" />
              <input id="profile-url" type="url" inputMode="url" autoComplete="url" placeholder="https://www.skills.google/public_profiles/..." value={profileUrl} onChange={(event: ChangeEvent<HTMLInputElement>) => setProfileUrl(event.target.value)} aria-describedby={error ? "profile-error" : "profile-help"} />
            </div>
            <p id="profile-help" className="field-help">Only public profile data is read. No Google sign-in is required.</p>
            {error && <p id="profile-error" className="form-error" role="alert">{error}</p>}
            <div className="hero-actions">
              <button className="primary-button" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spin" /> : <BadgeCheck />}{loading ? "Analyzing profile..." : "Analyze profile"}</button>
              <button className="secondary-button" type="button" onClick={loadDemo}><Gamepad2 /> Try demo</button>
              <button className="text-button" type="button" onClick={() => setManualMode((open) => !open)}>{manualMode ? "Close manual entry" : "Enter points manually"}</button>
            </div>
          </form>

          {manualMode && (
            <div className="manual-panel">
              <div><strong>Manual entry</strong><span>Use this when the public crawler is temporarily unavailable.</span></div>
              <label>Current points<input type="number" min="0" step="0.5" value={snapshot.currentPoints} onChange={(event: ChangeEvent<HTMLInputElement>) => updateManual("currentPoints", event.target.value)} /></label>
              <label>Game badges<input type="number" min="0" value={snapshot.gameBadges} onChange={(event: ChangeEvent<HTMLInputElement>) => updateManual("gameBadges", event.target.value)} /></label>
              <label>Trivia badges<input type="number" min="0" value={snapshot.triviaBadges} onChange={(event: ChangeEvent<HTMLInputElement>) => updateManual("triviaBadges", event.target.value)} /></label>
              <label>Skill badges<input type="number" min="0" value={snapshot.skillBadges} onChange={(event: ChangeEvent<HTMLInputElement>) => updateManual("skillBadges", event.target.value)} /></label>
              <label>Target<select value={snapshot.targetPoints} onChange={(event: ChangeEvent<HTMLSelectElement>) => updateManual("targetPoints", event.target.value)}><option value="25">25 points</option><option value="50">50 points</option><option value="75">75 points</option><option value="95">95 points</option><option value="120">120 points</option></select></label>
            </div>
          )}
        </div>

        <aside className="next-tier-card" aria-label="Next Arcade tier">
          <span>Next tier</span><strong>{nextTier.name}</strong><b>{nextTier.points} points</b><p>{formatNumber(pointsRemaining)} points remaining</p>
          <div className="mini-progress" aria-label={`${Math.round(completion)} percent complete`}><span style={{ width: `${completion}%` }} /></div>
        </aside>
        <div className="trail-map-wrap"><TrailMap snapshot={snapshot} /></div>
        <TrailStats snapshot={snapshot} />
        <div className="stage-status">
          <span className={isDemo ? "status-dot demo" : "status-dot"} />
          {isDemo ? "Demo preview — analyze a profile for live results" : `Showing ${snapshot.userName}'s latest saved result`}
          {!isDemo && <button type="button" onClick={loadDemo}><RotateCcw /> Reset</button>}
        </div>
      </section>

      <section className="insight-strip" aria-label="Progress summary">
        <div><small>Current tier</small><strong>{currentTier.name}</strong></div>
        <div><small>Next goal</small><strong>{formatNumber(pointsRemaining)} points away</strong></div>
        <div><small>Estimated work</small><strong>About {estimatedActivities} more 1-point activities</strong></div>
        <div><small>Score confidence</small><strong>{snapshot.scoreComplete ? "All eligible badges classified" : `${snapshot.unknownBadgeCount} badge(s) need review`}</strong></div>
      </section>

      <section id="badges" className="content-section badge-section">
        <div className="section-heading">
          <div><p className="eyebrow"><BadgeCheck /> Badge explorer</p><h2>See exactly what built your score.</h2><p>Review game, trivia, skill and special badges returned by the ePlus Arcade crawler.</p></div>
          <div className="badge-filter" role="group" aria-label="Filter badges">
            {(["all", "game", "trivia", "skill", "special"] as BadgeFilter[]).map((item) => <button key={item} type="button" className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        </div>
        <div className="badge-grid">
          {filteredBadges.length > 0 ? filteredBadges.slice(0, 12).map((badge, index) => (
            <article className="badge-card" key={`${badge.title}-${index}`}>
              <div className="badge-art">{badge.imageURL ? <img src={badge.imageURL} alt="" loading="lazy" /> : <BadgeCheck aria-hidden="true" />}</div>
              <div><span>{badge.dateEarned || "Earned badge"}</span><h3>{badge.title}</h3><p>{badge.points === "-*" ? "Bundle or special rule" : `${formatNumber(numeric(badge.points))} Arcade point${numeric(badge.points) === 1 ? "" : "s"}`}</p></div>
              {badge.badgeURL && <a href={badge.badgeURL} target="_blank" rel="noreferrer" aria-label={`Open ${badge.title}`}><ExternalLink /></a>}
            </article>
          )) : <div className="empty-state"><BookOpen /><strong>No badges in this category yet.</strong><span>Analyze a profile or choose another filter.</span></div>}
        </div>
        {badges.length > 12 && <p className="badge-note">Showing the first 12 of {badges.length} returned badges to keep this page fast.</p>}
      </section>

      <section id="extension" className="extension-section">
        <div className="extension-art" aria-hidden="true">
          <div className="browser-window">
            <div className="browser-bar"><i /><i /><i /><span>skills.google</span></div>
            <div className="extension-panel"><span className="extension-logo"><JoystickLogo /></span><div><small>Google Cloud Skills Boost</small><strong>Helper</strong></div><BadgeCheck /></div>
            <div className="extension-score"><span>Arcade points</span><strong>{formatNumber(snapshot.currentPoints)}</strong><small>Synced while you learn</small></div>
          </div>
        </div>
        <div className="extension-copy">
          <p className="eyebrow"><ShieldCheck /> The advantage other calculators do not have</p>
          <h2>Calculate on the web. Track automatically with the extension.</h2>
          <p>The free ePlus.DEV extension brings Arcade points, multi-account snapshots, leaderboards and lab-solution search directly into Google Skills — so you do not need to keep returning to a separate calculator.</p>
          <ul><li><BadgeCheck /> Automatic Arcade point tracking on Google Skills</li><li><BadgeCheck /> Multi-account snapshots and quick switching</li><li><BadgeCheck /> Leaderboard, score tools and lab-solution search</li><li><BadgeCheck /> Open source and available in 13 languages</li></ul>
          <ExtensionStoreLinks />
          <a className="github-link" href="https://github.com/ePlus-DEV/google-cloud-skills-boost-helper" target="_blank" rel="noreferrer"><Github /> View source on GitHub <ExternalLink /></a>
        </div>
      </section>

      <section className="content-section rules-section">
        <div className="section-heading"><div><p className="eyebrow"><Trophy /> Transparent scoring</p><h2>Built around the verified 2026 rules.</h2><p>The web calculator reuses the crawler and scoring engine maintained in hub.eplus.dev instead of copying totals from another calculator.</p></div></div>
        <div className="rule-grid">
          <article><Gamepad2 /><strong>Game & trivia</strong><span>Usually 1 point each, with official special-game overrides preserved.</span></article>
          <article><BookOpen /><strong>Skill badges</strong><span>2 Skill Badges equal 1 Arcade point; half points remain visible.</span></article>
          <article><ShieldCheck /><strong>No double counting</strong><span>Bundles and Facilitator estimates are handled separately and transparently.</span></article>
          <article><Sparkles /><strong>Honest confidence</strong><span>Unknown eligible badges are shown instead of silently pretending the score is complete.</span></article>
        </div>
        <p className="disclaimer">Unofficial community calculator. Google remains the authority for final Arcade scores, tiers and rewards.</p>
      </section>

      <footer className="site-footer">
        <div className="brand footer-brand"><JoystickLogo /><span><strong>Arcade Points</strong><small>by ePlus.DEV</small></span></div>
        <p>Free and open source tools for Google Cloud learners.</p>
        <nav><a href="privacy">Privacy</a><a href="terms">Terms</a><a href="changelog">Changelog</a><a href="https://eplus.dev" target="_blank" rel="noreferrer">ePlus.DEV</a></nav>
      </footer>
    </main>
  )
}
