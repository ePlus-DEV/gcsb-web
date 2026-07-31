"use client"

import {
  BadgeCheck,
  BookOpen,
  Chrome,
  ExternalLink,
  Firefox,
  Gamepad2,
  Github,
  LoaderCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react"
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"

type ArcadeBadge = {
  title: string
  dateEarned?: string
  imageURL?: string
  badgeURL?: string
  points?: number | string
}

type ArcadeApiResponse = {
  success: boolean
  message?: string
  userDetails?: Array<{
    url?: string
    profileImage?: string
    userName?: string
    memberSince?: string
    league?: string
    points?: string
  }>
  badges?: ArcadeBadge[]
  game?: ArcadeBadge[]
  trivia?: ArcadeBadge[]
  skill?: ArcadeBadge[]
  completion?: ArcadeBadge[]
  special?: ArcadeBadge[]
  arcadePoints?: {
    totalPoints?: number
    gamePoints?: number
    triviaPoints?: number
    skillPoints?: number
    specialPoints?: number
    completionPoints?: number
  }
  milestone?: string
  faciCounts?: {
    faciGame?: number
    faciTrivia?: number
    faciSkill?: number
    faciCompletion?: number
  }
  beta?: {
    scoreComplete?: boolean
    unknownBadgeCount?: number
    unknownBadges?: string[]
    profileBadgeCount?: number
    eligibleBadgeCount?: number
    tier?: string
  }
}

type CalculatorSnapshot = {
  profileUrl: string
  currentPoints: number
  gameBadges: number
  triviaBadges: number
  skillBadges: number
  targetPoints: number
  userName: string
  milestone: string
  scoreComplete: boolean
  unknownBadgeCount: number
  updatedAt: string
}

type BadgeFilter = "all" | "game" | "trivia" | "skill" | "special"

const API_URL =
  process.env.NEXT_PUBLIC_ARCADE_API_URL ??
  "https://hub.eplus.dev/api/arcade-public"

const STORAGE_KEY = "eplus-arcade-calculator-v1"
const PROFILE_URL_PATTERN =
  /^https:\/\/(?:www\.)?(?:skills\.google|cloudskillsboost\.google)\/public_profiles\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/?$/i

const TIERS = [
  { points: 0, name: "Arcade Explorer" },
  { points: 50, name: "Arcade Trooper" },
  { points: 75, name: "Arcade Ranger" },
  { points: 95, name: "Arcade Champion" },
  { points: 120, name: "Arcade Legend" },
]

const DEMO_SNAPSHOT: CalculatorSnapshot = {
  profileUrl: "",
  currentPoints: 37,
  gameBadges: 6,
  triviaBadges: 12,
  skillBadges: 38,
  targetPoints: 50,
  userName: "Demo learner",
  milestone: "Arcade Explorer",
  scoreComplete: true,
  unknownBadgeCount: 0,
  updatedAt: "",
}

const SAMPLE_BADGES: ArcadeBadge[] = [
  { title: "Arcade Base Camp", points: 1, dateEarned: "Demo" },
  { title: "Arcade Adventure", points: 1, dateEarned: "Demo" },
  { title: "Manage Kubernetes in Google Cloud", points: 0.5, dateEarned: "Demo" },
]

function numeric(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function getTier(points: number) {
  return [...TIERS].reverse().find((tier) => points >= tier.points) ?? TIERS[0]
}

function getNextTier(points: number, target: number) {
  const officialNext = TIERS.find((tier) => tier.points > points)

  if (officialNext) {
    return officialNext
  }

  return {
    points: Math.max(target, Math.ceil(points / 25) * 25 + 25),
    name: "Next personal goal",
  }
}

function checkpointsFor(target: number): number[] {
  if (target <= 50) return [0, 10, 25, 50]
  if (target <= 75) return [0, 25, 50, 75]
  if (target <= 95) return [0, 25, 50, 95]
  return [0, 25, 75, 120]
}

const TRAIL_POINTS = [
  { x: 80, y: 438 },
  { x: 220, y: 430 },
  { x: 360, y: 385 },
  { x: 520, y: 390 },
  { x: 680, y: 315 },
  { x: 835, y: 330 },
  { x: 950, y: 267 },
  { x: 1085, y: 228 },
  { x: 1185, y: 165 },
  { x: 1285, y: 116 },
]

function pointOnTrail(progress: number) {
  const safeProgress = clamp(progress, 0, 1)
  const scaled = safeProgress * (TRAIL_POINTS.length - 1)
  const index = Math.min(Math.floor(scaled), TRAIL_POINTS.length - 2)
  const localProgress = scaled - index
  const start = TRAIL_POINTS[index]
  const end = TRAIL_POINTS[index + 1]

  return {
    x: start.x + (end.x - start.x) * localProgress,
    y: start.y + (end.y - start.y) * localProgress,
  }
}

function JoystickLogo() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true" className="brand-mark">
      <path d="M16 48h43l5 13H10l6-13Z" fill="#fffdf6" stroke="currentColor" strokeWidth="3" />
      <path d="M21 43h33l5 9H16l5-9Z" fill="#d9f743" stroke="currentColor" strokeWidth="3" />
      <path d="M37 41V20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <circle cx="37" cy="15" r="11" fill="#d9f743" stroke="currentColor" strokeWidth="3" />
      <path d="M31 12c2-4 6-6 10-5" fill="none" stroke="#fffdf6" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="47" r="3" fill="#ff6657" stroke="currentColor" strokeWidth="2" />
      <circle cx="26" cy="47" r="3" fill="#8f78ff" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function FlagIcon() {
  return (
    <g transform="translate(1190 14)">
      <path d="M28 8v130" stroke="#071d49" strokeWidth="5" strokeLinecap="round" />
      <path d="M30 18c50-22 65 17 119-2-10 27-10 46 2 70-53 21-75-17-121 3V18Z" fill="#d9f743" stroke="#071d49" strokeWidth="4" strokeLinejoin="round" />
      <path d="M82 28 112 41v32L82 87 52 72V41l30-13Z" fill="#071d49" stroke="#071d49" strokeWidth="3" />
      <path d="m82 39 8 16 17 3-12 12 3 17-16-8-16 8 3-17-12-12 17-3 8-16Z" fill="#d9f743" />
      <path d="m158 12 10-11M165 34l16-1M157 58l13 8" stroke="#071d49" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

function TrailCheckpoint({ x, y, label }: { x: number; y: number; label: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="22" rx="34" ry="12" fill="#fffdf6" stroke="#071d49" strokeWidth="4" />
      <path d="M0 17v-44" stroke="#071d49" strokeWidth="5" strokeLinecap="round" />
      <circle cx="0" cy="-48" r="34" fill="#fffdf6" stroke="#071d49" strokeWidth="4" />
      <text x="0" y="-37" textAnchor="middle" className="checkpoint-label">
        {label}
      </text>
    </g>
  )
}

function TrailMap({ snapshot }: { snapshot: CalculatorSnapshot }) {
  const target = Math.max(snapshot.targetPoints, 1)
  const progress = clamp(snapshot.currentPoints / target, 0, 1)
  const pin = pointOnTrail(progress)
  const checkpoints = checkpointsFor(target)
  const positions = [TRAIL_POINTS[0], TRAIL_POINTS[2], TRAIL_POINTS[4], TRAIL_POINTS[9]]

  return (
    <svg
      className="trail-svg"
      viewBox="0 0 1440 520"
      role="img"
      aria-label={`Learning trail showing ${formatNumber(snapshot.currentPoints)} of ${target} points`}
    >
      <path
        d="M14 477c107-118 198-17 305-87 105-69 206 4 310-81 100-82 184-15 273-80 114-83 178-32 273-130 81-83 171-85 251-47l-8 468H15Z"
        fill="#f2e6c9"
        opacity=".78"
      />
      <path
        d="M24 468c55-35 86-40 126-20 33 17 62 6 96-13M1124 189c42-18 72-12 111-46 34-30 70-38 107-28"
        fill="none"
        stroke="#e1d3b4"
        strokeWidth="14"
        strokeLinecap="round"
      />

      <g className="trail-decoration" stroke="#071d49" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M270 415c-9-25-4-41 10-51 15 11 18 27 9 51Z" fill="#d9f743" />
        <path d="M280 414v-38M260 396l20-9M300 392l-20-7" />
        <path d="M520 363h67l-10 45h-53Z" fill="#fffdf6" />
        <path d="M553 361v47M528 372c12-8 22-7 25-5M558 367c10-4 18-2 25 4" />
        <path d="M710 335c0-21 14-38 31-38s31 17 31 38v50h-62Z" fill="#d9f743" />
        <path d="M722 314h38M727 333h27M728 352h26M741 296v-15" />
        <path d="M955 265l18-38 18 38h-12l17 29h-48l17-29Z" fill="#9dde6a" />
        <path d="M972 294v22" />
        <path d="M1117 199c7-21 30-21 38-3 18-10 36 2 34 20h-78c-2-8 0-13 6-17Z" fill="#d9f743" />
        <path d="M1042 284c7-17 23-20 33-7 15-10 31-1 31 14h-69c-1-3 1-5 5-7Z" fill="#9dde6a" />
        <path d="M166 470 182 445l17 25M418 430l15-20 18 20M875 349l12-17 19 17" fill="#fffdf6" />
      </g>

      <path
        d="M80 438C230 470 275 390 360 385c115-7 172 65 320-70 80-73 152 46 270-48 88-70 154-36 235-102 62-51 70-56 100-49"
        fill="none"
        stroke="#071d49"
        strokeWidth="88"
        strokeLinecap="round"
      />
      <path
        d="M80 438C230 470 275 390 360 385c115-7 172 65 320-70 80-73 152 46 270-48 88-70 154-36 235-102 62-51 70-56 100-49"
        fill="none"
        stroke="#fff8e6"
        strokeWidth="78"
        strokeLinecap="round"
      />
      <path
        d="M80 438C230 470 275 390 360 385c115-7 172 65 320-70 80-73 152 46 270-48 88-70 154-36 235-102 62-51 70-56 100-49"
        fill="none"
        stroke="#071d49"
        strokeWidth="4"
        strokeDasharray="13 14"
        strokeLinecap="round"
      />
      <path
        d="M80 438C230 470 275 390 360 385c115-7 172 65 320-70 80-73 152 46 270-48 88-70 154-36 235-102 62-51 70-56 100-49"
        fill="none"
        stroke="#ff6657"
        strokeWidth="5"
        strokeDasharray={`${progress * 100} 100`}
        pathLength="100"
        strokeLinecap="round"
      />

      {checkpoints.map((label, index) => (
        <TrailCheckpoint key={label} x={positions[index].x} y={positions[index].y} label={label} />
      ))}

      <g transform={`translate(${pin.x} ${pin.y - 12})`} className="current-pin">
        <path d="M0 31c-30-28-48-48-48-75 0-30 21-51 48-51s48 21 48 51C48-17 30 3 0 31Z" fill="#ff6657" stroke="#071d49" strokeWidth="4" />
        <circle cx="0" cy="-45" r="31" fill="#fffdf6" stroke="#071d49" strokeWidth="3" />
        <text x="0" y="-34" textAnchor="middle" className="pin-label">
          {formatNumber(snapshot.currentPoints)}
        </text>
        <ellipse cx="0" cy="38" rx="32" ry="10" fill="#fffdf6" stroke="#071d49" strokeWidth="4" />
      </g>

      <g transform={`translate(${clamp(pin.x - 76, 650, 1025)} ${clamp(pin.y - 160, 30, 300)})`}>
        <path d="M12 0h136a12 12 0 0 1 12 12v36a12 12 0 0 1-12 12H86L68 79 59 60H12A12 12 0 0 1 0 48V12A12 12 0 0 1 12 0Z" fill="#fffdf6" stroke="#ff6657" strokeWidth="3" />
        <text x="80" y="38" textAnchor="middle" className="you-are-here">
          You are here!
        </text>
      </g>

      <FlagIcon />
    </svg>
  )
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode
  value: string
  label: string
  tone: "lime" | "coral" | "mint"
}) {
  return (
    <article className="trail-stat-card">
      <span className={`stat-icon stat-icon--${tone}`}>{icon}</span>
      <span className="stat-copy">
        <strong>{value}</strong>
        <small>{label}</small>
      </span>
      <Sparkles className="stat-sparkle" aria-hidden="true" />
    </article>
  )
}

function ExtensionStoreLinks({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "store-links store-links--compact" : "store-links"}>
      <a
        className="store-button store-button--chrome"
        href="https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg/?utm_source=gcsb-web&utm_medium=website&utm_campaign=arcade-calculator"
        target="_blank"
        rel="noreferrer"
      >
        <Chrome aria-hidden="true" />
        <span><small>Available on</small>Chrome Web Store</span>
        <ExternalLink aria-hidden="true" />
      </a>
      <a
        className="store-button"
        href="https://addons.mozilla.org/addon/cloud-skills-boost-helper?utm_source=gcsb-web&utm_medium=website&utm_campaign=arcade-calculator"
        target="_blank"
        rel="noreferrer"
      >
        <Firefox aria-hidden="true" />
        <span><small>Get it for</small>Firefox</span>
        <ExternalLink aria-hidden="true" />
      </a>
    </div>
  )
}

export default function ArcadePointsPage() {
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

  function resetCalculator() {
    loadDemo()
  }

  return (
    <main className="arcade-page">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Arcade Points home">
          <JoystickLogo />
          <span className="brand-name">Arcade Points</span>
          <span className="season-pill">2026 Season</span>
        </a>

        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={mobileNavOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          Menu
        </button>

        <nav id="primary-navigation" className={mobileNavOpen ? "site-nav is-open" : "site-nav"}>
          <a className="active" href="#calculator"><Trophy />Calculator</a>
          <a href="#badges"><BadgeCheck />Badges</a>
          <a href="#extension"><ShieldCheck />Extension</a>
          <a href="https://github.com/ePlus-DEV/google-cloud-skills-boost-helper" target="_blank" rel="noreferrer"><Github />GitHub</a>
        </nav>
      </header>

      <section id="top" className="trail-stage" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles /> Free, private & powered by public profile data</p>
          <h1 id="hero-title">Know your points.<br />Plan your next badge.</h1>
          <p className="hero-description">
            Paste your public Google Skills profile to calculate Arcade points, inspect badges and see the fastest route to your next tier.
          </p>

          <form className="profile-form" onSubmit={analyzeProfile} noValidate>
            <label htmlFor="profile-url">Google Skills public profile URL</label>
            <div className={error ? "profile-input-wrap has-error" : "profile-input-wrap"}>
              <Search aria-hidden="true" />
              <input
                id="profile-url"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://www.skills.google/public_profiles/..."
                value={profileUrl}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setProfileUrl(event.target.value)}
                aria-describedby={error ? "profile-error" : "profile-help"}
              />
            </div>
            <p id="profile-help" className="field-help">Only public profile data is read. No Google sign-in is required.</p>
            {error && <p id="profile-error" className="form-error" role="alert">{error}</p>}

            <div className="hero-actions">
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? <LoaderCircle className="spin" /> : <BadgeCheck />}
                {loading ? "Analyzing profile..." : "Analyze profile"}
              </button>
              <button className="secondary-button" type="button" onClick={loadDemo}>
                <Gamepad2 /> Try demo
              </button>
              <button className="text-button" type="button" onClick={() => setManualMode((open) => !open)}>
                {manualMode ? "Close manual entry" : "Enter points manually"}
              </button>
            </div>
          </form>

          {manualMode && (
            <div className="manual-panel">
              <div>
                <strong>Manual entry</strong>
                <span>Use this when the public crawler is temporarily unavailable.</span>
              </div>
              <label>Current points<input type="number" min="0" step="0.5" value={snapshot.currentPoints} onChange={(event: ChangeEvent<HTMLInputElement>) => updateManual("currentPoints", event.target.value)} /></label>
              <label>Game badges<input type="number" min="0" value={snapshot.gameBadges} onChange={(event: ChangeEvent<HTMLInputElement>) => updateManual("gameBadges", event.target.value)} /></label>
              <label>Trivia badges<input type="number" min="0" value={snapshot.triviaBadges} onChange={(event: ChangeEvent<HTMLInputElement>) => updateManual("triviaBadges", event.target.value)} /></label>
              <label>Skill badges<input type="number" min="0" value={snapshot.skillBadges} onChange={(event: ChangeEvent<HTMLInputElement>) => updateManual("skillBadges", event.target.value)} /></label>
              <label>Target<select value={snapshot.targetPoints} onChange={(event: ChangeEvent<HTMLSelectElement>) => updateManual("targetPoints", event.target.value)}><option value="25">25 points</option><option value="50">50 points</option><option value="75">75 points</option><option value="95">95 points</option><option value="120">120 points</option></select></label>
            </div>
          )}
        </div>

        <aside className="next-tier-card" aria-label="Next Arcade tier">
          <span>Next tier</span>
          <strong>{nextTier.name}</strong>
          <b>{nextTier.points} points</b>
          <p>{formatNumber(pointsRemaining)} points remaining</p>
          <div className="mini-progress" aria-label={`${Math.round(completion)} percent complete`}>
            <span style={{ width: `${completion}%` }} />
          </div>
        </aside>

        <div className="trail-map-wrap">
          <TrailMap snapshot={snapshot} />
        </div>

        <div className="trail-stats" aria-label="Arcade statistics">
          <StatCard icon={<Trophy />} value={formatNumber(snapshot.currentPoints)} label="total points" tone="lime" />
          <StatCard icon={<Gamepad2 />} value={String(snapshot.gameBadges + snapshot.triviaBadges)} label="game & trivia badges" tone="coral" />
          <StatCard icon={<BookOpen />} value={String(snapshot.skillBadges)} label="skill badges" tone="mint" />
        </div>

        <div className="stage-status">
          <span className={isDemo ? "status-dot demo" : "status-dot"} />
          {isDemo ? "Demo preview — analyze a profile for live results" : `Showing ${snapshot.userName}'s latest saved result`}
          {!isDemo && <button type="button" onClick={resetCalculator}><RotateCcw /> Reset</button>}
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
          <div>
            <p className="eyebrow"><BadgeCheck /> Badge explorer</p>
            <h2>See exactly what built your score.</h2>
            <p>Review game, trivia, skill and special badges returned by the ePlus Arcade crawler.</p>
          </div>
          <div className="badge-filter" role="group" aria-label="Filter badges">
            {(["all", "game", "trivia", "skill", "special"] as BadgeFilter[]).map((item) => (
              <button key={item} type="button" className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>
        </div>

        <div className="badge-grid">
          {filteredBadges.length > 0 ? filteredBadges.slice(0, 12).map((badge, index) => (
            <article className="badge-card" key={`${badge.title}-${index}`}>
              <div className="badge-art">
                {badge.imageURL ? <img src={badge.imageURL} alt="" loading="lazy" /> : <BadgeCheck aria-hidden="true" />}
              </div>
              <div>
                <span>{badge.dateEarned || "Earned badge"}</span>
                <h3>{badge.title}</h3>
                <p>{badge.points === "-*" ? "Bundle or special rule" : `${formatNumber(numeric(badge.points))} Arcade point${numeric(badge.points) === 1 ? "" : "s"}`}</p>
              </div>
              {badge.badgeURL && <a href={badge.badgeURL} target="_blank" rel="noreferrer" aria-label={`Open ${badge.title}`}><ExternalLink /></a>}
            </article>
          )) : (
            <div className="empty-state"><BookOpen /><strong>No badges in this category yet.</strong><span>Analyze a profile or choose another filter.</span></div>
          )}
        </div>

        {badges.length > 12 && <p className="badge-note">Showing the first 12 of {badges.length} returned badges to keep this page fast.</p>}
      </section>

      <section id="extension" className="extension-section">
        <div className="extension-art" aria-hidden="true">
          <div className="browser-window">
            <div className="browser-bar"><i /><i /><i /><span>skills.google</span></div>
            <div className="extension-panel">
              <span className="extension-logo"><JoystickLogo /></span>
              <div><small>Google Cloud Skills Boost</small><strong>Helper</strong></div>
              <BadgeCheck />
            </div>
            <div className="extension-score"><span>Arcade points</span><strong>{formatNumber(snapshot.currentPoints)}</strong><small>Synced while you learn</small></div>
          </div>
        </div>

        <div className="extension-copy">
          <p className="eyebrow"><ShieldCheck /> The advantage other calculators do not have</p>
          <h2>Calculate on the web. Track automatically with the extension.</h2>
          <p>
            The free ePlus.DEV extension brings Arcade points, multi-account snapshots, leaderboards and lab-solution search directly into Google Skills — so you do not need to keep returning to a separate calculator.
          </p>
          <ul>
            <li><BadgeCheck /> Automatic Arcade point tracking on Google Skills</li>
            <li><BadgeCheck /> Multi-account snapshots and quick switching</li>
            <li><BadgeCheck /> Leaderboard, score tools and lab-solution search</li>
            <li><BadgeCheck /> Open source and available in 13 languages</li>
          </ul>
          <ExtensionStoreLinks />
          <a className="github-link" href="https://github.com/ePlus-DEV/google-cloud-skills-boost-helper" target="_blank" rel="noreferrer"><Github /> View source on GitHub <ExternalLink /></a>
        </div>
      </section>

      <section className="content-section rules-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><Trophy /> Transparent scoring</p>
            <h2>Built around the verified 2026 rules.</h2>
            <p>The web calculator reuses the crawler and scoring engine maintained in hub.eplus.dev instead of copying totals from another calculator.</p>
          </div>
        </div>
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
        <nav><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/changelog">Changelog</a><a href="https://eplus.dev" target="_blank" rel="noreferrer">ePlus.DEV</a></nav>
      </footer>
    </main>
  )
}
