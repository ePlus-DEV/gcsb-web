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
import { useEffect, useMemo, useRef, useState } from "react"
import {
  API_URL,
  ARCADE_MILESTONES_URL,
  EMPTY_SNAPSHOT,
  LEGACY_STORAGE_KEY,
  OFFICIAL_MILESTONES,
  PROFILE_URL_PATTERN,
  STORAGE_KEY,
  clamp,
  formatInteger,
  formatNumber,
  getNextTier,
  getTier,
  numeric,
  tierRangeLabel,
} from "@/components/arcade/model"
import type {
  ArcadeApiResponse,
  ArcadeBadge,
  ArcadeMilestone,
  BadgeFilter,
  CalculatorSnapshot,
} from "@/components/arcade/model"
import {
  ExtensionStoreLinks,
  JoystickLogo,
  TrailMap,
  TrailStats,
} from "@/components/arcade/visuals"
import { Option3Hero } from "@/components/arcade/option3-hero"

const REQUEST_TIMEOUT_MS = 20_000
const STORAGE_DEBOUNCE_MS = 350

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Persistence is optional; calculator state must continue to work without it.
  }
}

function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Reset the in-memory state even when browser storage is unavailable.
  }
}

function persistCalculatorState(
  snapshot: CalculatorSnapshot,
  response: ArcadeApiResponse | null,
  badges: ArcadeBadge[],
): void {
  writeStorage(STORAGE_KEY, JSON.stringify({ snapshot, response, badges }))
}

function isArcadeBadge(value: unknown): value is ArcadeBadge {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { title?: unknown }).title === "string"
  )
}

function restoreSnapshot(value: unknown): CalculatorSnapshot | null {
  if (typeof value !== "object" || value === null) return null

  const candidate = value as Partial<CalculatorSnapshot>
  const targetPoints = numeric(candidate.targetPoints)

  return {
    profileUrl: typeof candidate.profileUrl === "string" ? candidate.profileUrl : "",
    currentPoints: Math.max(0, numeric(candidate.currentPoints)),
    gameBadges: Math.max(0, numeric(candidate.gameBadges)),
    triviaBadges: Math.max(0, numeric(candidate.triviaBadges)),
    skillBadges: Math.max(0, numeric(candidate.skillBadges)),
    targetPoints: targetPoints > 0 ? targetPoints : EMPTY_SNAPSHOT.targetPoints,
    userName:
      typeof candidate.userName === "string" ? candidate.userName : EMPTY_SNAPSHOT.userName,
    milestone:
      typeof candidate.milestone === "string" ? candidate.milestone : EMPTY_SNAPSHOT.milestone,
    scoreComplete:
      typeof candidate.scoreComplete === "boolean"
        ? candidate.scoreComplete
        : EMPTY_SNAPSHOT.scoreComplete,
    unknownBadgeCount: Math.max(0, numeric(candidate.unknownBadgeCount)),
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : "",
  }
}

export default function ArcadeCalculatorClient() {
  const [profileUrl, setProfileUrl] = useState("")
  const [snapshot, setSnapshot] = useState<CalculatorSnapshot>(EMPTY_SNAPSHOT)
  const [response, setResponse] = useState<ArcadeApiResponse | null>(null)
  const [badges, setBadges] = useState<ArcadeBadge[]>([])
  const [filter, setFilter] = useState<BadgeFilter>("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasResult, setHasResult] = useState(false)
  const [milestones, setMilestones] = useState<ArcadeMilestone[]>(OFFICIAL_MILESTONES)
  const [milestonesLive, setMilestonesLive] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    removeStorage(LEGACY_STORAGE_KEY)
    const stored = readStorage(STORAGE_KEY)
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as {
        snapshot?: unknown
        response?: unknown
        badges?: unknown
      }
      const restoredSnapshot = restoreSnapshot(parsed.snapshot)

      if (restoredSnapshot) {
        setSnapshot(restoredSnapshot)
        setProfileUrl(restoredSnapshot.profileUrl)
        setHasResult(true)
      }
      if (typeof parsed.response === "object" && parsed.response !== null) {
        setResponse(parsed.response as ArcadeApiResponse)
      }
      if (Array.isArray(parsed.badges)) {
        setBadges(parsed.badges.filter(isArcadeBadge))
      }
    } catch {
      removeStorage(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (!hasResult) return

    const timeoutId = window.setTimeout(
      () => persistCalculatorState(snapshot, response, badges),
      STORAGE_DEBOUNCE_MS,
    )

    return () => window.clearTimeout(timeoutId)
  }, [badges, hasResult, response, snapshot])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    async function loadMilestones() {
      try {
        const request = await fetch(ARCADE_MILESTONES_URL, {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!request.ok) return

        const payload: unknown = await request.json()
        if (!Array.isArray(payload)) return

        const liveMilestones = OFFICIAL_MILESTONES.map((fallback) => {
          const candidate = payload.find(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              numeric((item as { points?: unknown }).points) === fallback.points,
          ) as Record<string, unknown> | undefined

          if (!candidate) return fallback

          const slots = numeric(candidate.slots)
          const spotsLeft = numeric(candidate.spotsLeft)
          if (slots <= 0 || spotsLeft < 0 || spotsLeft > slots) return fallback

          return {
            ...fallback,
            league:
              typeof candidate.league === "string" ? candidate.league : fallback.league,
            slots,
            spotsLeft,
          }
        })

        if (active) {
          setMilestones(liveMilestones)
          setMilestonesLive(true)
        }
      } catch {
        // Keep verified total slots if live crawler data is temporarily unavailable.
      } finally {
        window.clearTimeout(timeoutId)
      }
    }

    void loadMilestones()
    return () => {
      active = false
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (!mobileNavOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false)
    }
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && !headerRef.current?.contains(target)) {
        setMobileNavOpen(false)
      }
    }

    document.addEventListener("keydown", closeOnEscape)
    document.addEventListener("pointerdown", closeOnOutsidePointer)

    return () => {
      document.removeEventListener("keydown", closeOnEscape)
      document.removeEventListener("pointerdown", closeOnOutsidePointer)
    }
  }, [mobileNavOpen])

  const currentTier = useMemo(() => getTier(snapshot.currentPoints), [snapshot.currentPoints])
  const nextTier = useMemo(
    () => getNextTier(snapshot.currentPoints),
    [snapshot.currentPoints],
  )
  const nextMilestone =
    milestones.find((milestone) => milestone.points === nextTier.points) ??
    milestones[milestones.length - 1]
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

  function applyApiResult(result: ArcadeApiResponse, url: string) {
    const totalPoints = numeric(result.arcadePoints?.totalPoints)
    const gameBadges = (result.game ?? []).length
    const triviaBadges = (result.trivia ?? []).length
    const skillBadges = (result.skill ?? []).length
    const nextSnapshot: CalculatorSnapshot = {
      profileUrl: url,
      currentPoints: totalPoints,
      gameBadges,
      triviaBadges,
      skillBadges,
      targetPoints: 120,
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
    setHasResult(true)
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

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const request = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized, season: "2026" }),
        signal: controller.signal,
      })
      let result: ArcadeApiResponse | null = null

      try {
        result = (await request.json()) as ArcadeApiResponse
      } catch {
        // Gateways can return HTML or an empty body; use the stable fallback below.
      }

      if (!request.ok || !result?.success) {
        throw new Error(result?.message || "The profile could not be analyzed right now.")
      }

      applyApiResult(result, normalized)
    } catch (caught) {
      const message =
        caught instanceof DOMException && caught.name === "AbortError"
          ? "The profile request timed out after 20 seconds."
          : caught instanceof Error
            ? caught.message
            : "The profile could not be analyzed."

      setError(`${message} You can use manual entry while the crawler is unavailable.`)
      setManualMode(true)
    } finally {
      window.clearTimeout(timeoutId)
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
    setHasResult(true)
  }

  function resetCalculator() {
    setSnapshot(EMPTY_SNAPSHOT)
    setProfileUrl("")
    setResponse(null)
    setBadges([])
    setError("")
    setManualMode(false)
    setHasResult(false)
    removeStorage(STORAGE_KEY)
    removeStorage(LEGACY_STORAGE_KEY)
  }

  const closeMobileNavigation = () => setMobileNavOpen(false)

  return (
    <main className="arcade-page">
      <Option3Hero
        profileUrl={profileUrl}
        setProfileUrl={setProfileUrl}
        analyzeProfile={analyzeProfile}
        loading={loading}
        error={error}
        manualMode={manualMode}
        setManualMode={setManualMode}
        snapshot={snapshot}
        updateManual={updateManual}
        nextTier={nextTier}
        pointsRemaining={pointsRemaining}
        hasResult={hasResult}
        resetCalculator={resetCalculator}
      />
      <header className="site-header" ref={headerRef}>
        <a className="brand" href="#calculator" aria-label="Arcade Points home" onClick={closeMobileNavigation}>
          <JoystickLogo />
          <span className="brand-name">Arcade Points</span>
          <span className="season-pill">2026 Season</span>
        </a>
        <button className="mobile-menu-button" type="button" aria-expanded={mobileNavOpen} aria-controls="primary-navigation" onClick={() => setMobileNavOpen((open) => !open)}>Menu</button>
        <nav id="primary-navigation" className={mobileNavOpen ? "site-nav is-open" : "site-nav"}>
          <a className="active" href="#calculator-option3" onClick={closeMobileNavigation}><Trophy />Dashboard</a>
          <a href="#calculator" onClick={closeMobileNavigation}><BadgeCheck />Calculator</a>
          <a href="#badges" onClick={closeMobileNavigation}><ShieldCheck />Badge Tracker</a>
          <a href="#extension" onClick={closeMobileNavigation}><Github />Resources</a>
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
            </div>
          )}
        </div>

        <aside className="next-tier-card" aria-label="Next Arcade tier">
          <span>{snapshot.currentPoints >= 120 ? "Top tier" : "Next tier"}</span>
          <strong>{nextTier.league}</strong>
          <b>{nextTier.points === 120 ? "120+ points" : `${nextTier.points} points`}</b>
          <p>{pointsRemaining > 0 ? `${formatNumber(pointsRemaining)} points remaining` : "Top 2026 tier reached"}</p>
          {nextMilestone && (
            <p className="slot-summary">
              {nextMilestone.spotsLeft === null
                ? `${formatInteger(nextMilestone.slots)} total slots`
                : `${formatInteger(nextMilestone.spotsLeft)} of ${formatInteger(nextMilestone.slots)} slots left`}
            </p>
          )}
          <div className="mini-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(completion)} aria-label="Progress to next tier"><span style={{ width: `${completion}%` }} /></div>
        </aside>
        <div className="trail-map-wrap"><TrailMap snapshot={snapshot} /></div>
        <TrailStats snapshot={snapshot} />
        <div className="stage-status">
          <span className={hasResult ? "status-dot" : "status-dot idle"} />
          {hasResult
            ? `Showing ${snapshot.userName || "manual entry"}'s latest saved result`
            : "No demo data — analyze a public profile or use manual entry"}
          {hasResult && <button type="button" onClick={resetCalculator}><RotateCcw /> Reset</button>}
        </div>
      </section>

      <section className="insight-strip" aria-label="Progress summary">
        <div><small>Current tier</small><strong>{hasResult ? currentTier.name : "Awaiting profile"}</strong></div>
        <div><small>Next goal</small><strong>{hasResult ? `${formatNumber(pointsRemaining)} points away` : "Trooper starts at 50"}</strong></div>
        <div><small>Estimated work</small><strong>{hasResult ? `About ${estimatedActivities} more 1-point activities` : "Analyze a profile first"}</strong></div>
        <div><small>Score confidence</small><strong>{hasResult ? (snapshot.scoreComplete ? "All eligible badges classified" : `${snapshot.unknownBadgeCount} badge(s) need review`) : "No result loaded"}</strong></div>
      </section>
      <section className="content-section tier-section" aria-labelledby="tier-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><Trophy /> Arcade 2026 tiers</p>
            <h2 id="tier-heading">Every official milestone and prize slot.</h2>
            <p>The point ranges and total slots are fixed for the 2026 season. Remaining slots are loaded from the automated arcade-crawler repository.</p>
          </div>
          <p className={milestonesLive ? "tier-data-source is-live" : "tier-data-source"}>
            {milestonesLive ? "Live crawler data" : "Live availability unavailable"}
          </p>
        </div>
        <div className="tier-grid">
          {[...milestones].reverse().map((milestone) => (
            <article className="tier-card" key={milestone.points}>
              <small>{milestone.league.replace("Arcade ", "")}</small>
              <strong>{tierRangeLabel(milestone)}</strong>
              <span>{formatInteger(milestone.slots)} slots</span>
              <b>
                {milestone.spotsLeft === null
                  ? "Remaining slots unavailable"
                  : `${formatInteger(milestone.spotsLeft)} spots left`}
              </b>
            </article>
          ))}
        </div>
      </section>

      <section id="badges" className="content-section badge-section">
        <div className="section-heading">
          <div><p className="eyebrow"><BadgeCheck /> Badge explorer</p><h2>See exactly what built your score.</h2><p>Review game, trivia, skill and special badges returned by the ePlus Arcade crawler.</p></div>
          <div className="badge-filter" role="group" aria-label="Filter badges">
            {(["all", "game", "trivia", "skill", "special"] as BadgeFilter[]).map((item) => <button key={item} type="button" className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
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
        {filteredBadges.length > 12 && <p className="badge-note">Showing the first 12 of {filteredBadges.length} returned badges to keep this page fast.</p>}
      </section>

      <section id="extension" className="extension-section">
        <div className="extension-art" aria-hidden="true">
          <div className="browser-window">
            <div className="browser-bar"><i /><i /><i /><span>skills.google</span></div>
            <div className="extension-panel"><span className="extension-logo"><JoystickLogo /></span><div><small>Google Cloud Skills Boost</small><strong>Helper</strong></div><BadgeCheck /></div>
            <div className="extension-score"><span>Arcade points</span><strong>{hasResult ? formatNumber(snapshot.currentPoints) : "—"}</strong><small>Synced while you learn</small></div>
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
