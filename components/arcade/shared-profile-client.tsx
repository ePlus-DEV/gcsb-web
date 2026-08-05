"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  API_URL,
  OFFICIAL_MILESTONES,
  type ArcadeApiResponse,
  type ArcadeBadge,
  numeric,
} from "@/components/arcade/model"

const PROFILE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const REQUEST_TIMEOUT_MS = 20_000
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ArcadeApiResponse; profileUrl: string }

type BadgeGroup = {
  key: string
  label: string
  icon: string
  badges: ArcadeBadge[]
}

/** Returns an HTTPS URL or null for invalid and unsafe values. */
function safeHttpsUrl(value?: string): string | null {
  if (!value) return null

  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

/** Resolves the dashboard route while preserving a configured static-export base path. */
function getDashboardHref(): string {
  if (typeof window === "undefined") return `${BASE_PATH}/`

  const relativePath = BASE_PATH && window.location.pathname.startsWith(BASE_PATH)
    ? window.location.pathname.slice(BASE_PATH.length)
    : window.location.pathname
  const firstSegment = relativePath.split("/").filter(Boolean)[0]
  const localePrefix = firstSegment && firstSegment !== "profile" ? `/${firstSegment}` : ""

  return `${BASE_PATH}${localePrefix}/`
}

/** Calculates the current and next official Arcade milestone. */
function getTierProgress(points: number) {
  const currentIndex = OFFICIAL_MILESTONES.reduce(
    (matchedIndex, milestone, index) => points >= milestone.points ? index : matchedIndex,
    -1,
  )
  const current = currentIndex >= 0 ? OFFICIAL_MILESTONES[currentIndex] : null
  const next = OFFICIAL_MILESTONES[currentIndex + 1] ?? null
  const lowerBound = current?.points ?? 0
  const upperBound = next?.points ?? current?.points ?? 1
  const progress = next
    ? Math.min(100, Math.max(0, ((points - lowerBound) / Math.max(1, upperBound - lowerBound)) * 100))
    : 100

  return {
    current,
    next,
    progress,
    remaining: next ? Math.max(0, next.points - points) : 0,
  }
}

/** Provides the complete public achievement dashboard styles. */
function Styles() {
  return <style>{`
    :root {
      color-scheme: dark;
    }
    * { box-sizing: border-box; }
    .achievement-page {
      min-height: 100vh;
      color: #f8fafc;
      background:
        radial-gradient(circle at 12% 0%, rgba(66,133,244,.22), transparent 34rem),
        radial-gradient(circle at 92% 8%, rgba(168,85,247,.16), transparent 28rem),
        #020617;
      padding: 1.25rem;
    }
    .achievement-shell { width: min(1120px, 100%); margin: 0 auto; }
    .achievement-topbar {
      min-height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .achievement-brand { display: flex; align-items: center; gap: .75rem; font-weight: 900; letter-spacing: -.02em; }
    .achievement-brand-mark {
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      box-shadow: 0 12px 30px rgba(37,99,235,.3);
    }
    .achievement-share,
    .achievement-link {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      border-radius: 12px;
      border: 1px solid rgba(148,163,184,.24);
      background: rgba(15,23,42,.72);
      color: #f8fafc;
      padding: .7rem 1rem;
      font: inherit;
      font-weight: 800;
      text-decoration: none;
      cursor: pointer;
      transition: transform .18s ease, border-color .18s ease, background .18s ease;
    }
    .achievement-share:hover,
    .achievement-link:hover { transform: translateY(-1px); border-color: rgba(96,165,250,.6); background: rgba(30,41,59,.9); }
    .achievement-hero {
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(148,163,184,.2);
      border-radius: 28px;
      padding: clamp(1.4rem, 4vw, 3rem);
      background:
        linear-gradient(135deg, rgba(37,99,235,.17), rgba(124,58,237,.12) 55%, rgba(15,23,42,.86)),
        rgba(15,23,42,.78);
      box-shadow: 0 30px 90px rgba(0,0,0,.3);
    }
    .achievement-hero::after {
      content: "";
      position: absolute;
      width: 320px;
      height: 320px;
      right: -130px;
      top: -150px;
      border-radius: 50%;
      border: 54px solid rgba(255,255,255,.035);
      pointer-events: none;
    }
    .achievement-person { display: flex; align-items: center; gap: 1rem; position: relative; z-index: 1; }
    .achievement-avatar,
    .achievement-avatar-fallback {
      width: 64px;
      height: 64px;
      flex: 0 0 auto;
      border-radius: 20px;
      border: 2px solid rgba(147,197,253,.48);
      object-fit: cover;
      background: rgba(30,41,59,.9);
    }
    .achievement-avatar-fallback { display: grid; place-items: center; font-size: 1.5rem; font-weight: 900; }
    .achievement-kicker { margin: 0 0 .3rem; color: #93c5fd; font-size: .78rem; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
    .achievement-name { margin: 0; font-size: clamp(1.35rem, 3vw, 2rem); letter-spacing: -.035em; }
    .achievement-member { margin: .35rem 0 0; color: #94a3b8; font-size: .9rem; }
    .achievement-score-zone {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(260px, .65fr);
      gap: 1.5rem;
      align-items: end;
      margin-top: clamp(2rem, 5vw, 3.5rem);
      position: relative;
      z-index: 1;
    }
    .achievement-score-label { margin: 0; color: #94a3b8; font-size: .82rem; font-weight: 900; letter-spacing: .15em; text-transform: uppercase; }
    .achievement-score {
      margin: .15rem 0 0;
      font-size: clamp(4.6rem, 13vw, 8.4rem);
      line-height: .9;
      letter-spacing: -.085em;
      font-weight: 950;
      background: linear-gradient(180deg, #fff, #bfdbfe 72%, #93c5fd);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .achievement-tier-panel {
      border: 1px solid rgba(147,197,253,.22);
      border-radius: 20px;
      padding: 1.15rem;
      background: rgba(2,6,23,.36);
      backdrop-filter: blur(12px);
    }
    .achievement-tier-caption { color: #94a3b8; font-size: .8rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
    .achievement-tier-name { margin: .35rem 0 .9rem; font-size: clamp(1.25rem, 3vw, 1.8rem); font-weight: 900; letter-spacing: -.03em; }
    .achievement-progress-head { display: flex; justify-content: space-between; gap: 1rem; color: #cbd5e1; font-size: .85rem; }
    .achievement-progress-track { height: 10px; margin: .7rem 0 .6rem; overflow: hidden; border-radius: 999px; background: rgba(148,163,184,.15); }
    .achievement-progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #4285f4, #8b5cf6); }
    .achievement-progress-note { margin: 0; color: #94a3b8; font-size: .82rem; }
    .achievement-overview {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: .85rem;
      margin-top: 1.25rem;
    }
    .achievement-overview-card {
      border: 1px solid rgba(148,163,184,.15);
      border-radius: 18px;
      padding: 1.1rem;
      background: rgba(15,23,42,.68);
    }
    .achievement-overview-card strong { display: block; font-size: clamp(1.7rem, 4vw, 2.5rem); letter-spacing: -.045em; }
    .achievement-overview-card span { display: block; margin-top: .3rem; color: #94a3b8; font-size: .86rem; }
    .achievement-section { margin-top: 2rem; }
    .achievement-section-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
    .achievement-section-heading h2 { margin: 0; font-size: clamp(1.25rem, 3vw, 1.65rem); letter-spacing: -.03em; }
    .achievement-section-heading p { margin: .35rem 0 0; color: #94a3b8; }
    .achievement-breakdown {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: .75rem;
    }
    .achievement-breakdown-card {
      min-height: 132px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid rgba(148,163,184,.15);
      border-radius: 18px;
      padding: 1rem;
      background: rgba(15,23,42,.62);
    }
    .achievement-breakdown-icon { font-size: 1.25rem; }
    .achievement-breakdown-card strong { display: block; font-size: 1.8rem; letter-spacing: -.04em; }
    .achievement-breakdown-card span { color: #94a3b8; font-size: .84rem; }
    .achievement-badges { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .85rem; }
    .achievement-badge-card {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: .85rem;
      border: 1px solid rgba(148,163,184,.14);
      border-radius: 18px;
      padding: .9rem;
      background: rgba(15,23,42,.62);
      text-decoration: none;
      color: inherit;
      transition: transform .18s ease, border-color .18s ease;
    }
    .achievement-badge-card:hover { transform: translateY(-2px); border-color: rgba(96,165,250,.5); }
    .achievement-badge-image,
    .achievement-badge-placeholder { width: 58px; height: 58px; flex: 0 0 auto; object-fit: contain; border-radius: 14px; background: rgba(30,41,59,.8); }
    .achievement-badge-placeholder { display: grid; place-items: center; font-size: 1.35rem; }
    .achievement-badge-card strong { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; font-size: .9rem; line-height: 1.35; }
    .achievement-badge-card span { display: block; margin-top: .35rem; color: #94a3b8; font-size: .76rem; }
    .achievement-cta {
      margin: 2rem 0 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border: 1px solid rgba(96,165,250,.22);
      border-radius: 22px;
      padding: 1.25rem;
      background: linear-gradient(135deg, rgba(37,99,235,.13), rgba(15,23,42,.72));
    }
    .achievement-cta h2 { margin: 0; font-size: 1.15rem; }
    .achievement-cta p { margin: .35rem 0 0; color: #94a3b8; }
    .achievement-primary { background: #2563eb; border-color: #3b82f6; }
    .achievement-loading-card,
    .achievement-error-card {
      width: min(680px, 100%);
      margin: 12vh auto 0;
      border: 1px solid rgba(148,163,184,.18);
      border-radius: 24px;
      padding: clamp(1.4rem, 4vw, 2.5rem);
      background: rgba(15,23,42,.82);
      text-align: center;
    }
    .achievement-skeleton { height: 18px; margin: .75rem 0; border-radius: 999px; background: linear-gradient(90deg, rgba(148,163,184,.08), rgba(148,163,184,.2), rgba(148,163,184,.08)); background-size: 200% 100%; animation: achievement-shimmer 1.4s infinite; }
    .achievement-skeleton.large { height: 92px; width: 48%; margin-inline: auto; }
    .achievement-toast { position: fixed; left: 50%; bottom: 1.25rem; z-index: 50; transform: translateX(-50%); border: 1px solid rgba(74,222,128,.3); border-radius: 999px; padding: .7rem 1rem; background: rgba(20,83,45,.95); color: #dcfce7; font-weight: 800; box-shadow: 0 14px 40px rgba(0,0,0,.35); }
    @keyframes achievement-shimmer { to { background-position: -200% 0; } }
    @media (max-width: 900px) {
      .achievement-score-zone { grid-template-columns: 1fr; align-items: stretch; }
      .achievement-breakdown { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .achievement-badges { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      .achievement-page { padding: .85rem; }
      .achievement-topbar { min-height: 54px; }
      .achievement-brand span:last-child { display: none; }
      .achievement-hero { border-radius: 22px; padding: 1.15rem; }
      .achievement-person { align-items: flex-start; }
      .achievement-avatar,
      .achievement-avatar-fallback { width: 52px; height: 52px; border-radius: 16px; }
      .achievement-score-zone { margin-top: 2.1rem; }
      .achievement-score { font-size: clamp(4.8rem, 26vw, 6.6rem); }
      .achievement-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .achievement-overview-card:first-child { grid-column: 1 / -1; }
      .achievement-breakdown { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .achievement-badges { grid-template-columns: 1fr; }
      .achievement-cta { align-items: stretch; flex-direction: column; }
      .achievement-link { width: 100%; }
      .achievement-section-heading { align-items: flex-start; flex-direction: column; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
  `}</style>
}

/** Renders a compact loading skeleton matching the dashboard visual hierarchy. */
function LoadingState() {
  return (
    <main className="achievement-page">
      <Styles />
      <div className="achievement-loading-card" aria-live="polite">
        <div className="achievement-skeleton" />
        <div className="achievement-skeleton large" />
        <div className="achievement-skeleton" />
        <p>Loading Arcade achievement…</p>
      </div>
    </main>
  )
}

/** Fetches and renders one profile selected from the reactive query string. */
function SharedProfileContent() {
  const searchParams = useSearchParams()
  const profileId = (searchParams.get("id") ?? "").trim()
  const [state, setState] = useState<State>({ status: "loading" })
  const [toast, setToast] = useState("")

  useEffect(() => {
    if (!PROFILE_ID_PATTERN.test(profileId)) {
      setState({ status: "error", message: "This Arcade link is invalid." })
      return
    }

    setState({ status: "loading" })
    const controller = new AbortController()
    const profileUrl = `https://www.skills.google/public_profiles/${profileId}`
    let timedOut = false
    const timeout = window.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, REQUEST_TIMEOUT_MS)

    async function loadProfile() {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: profileUrl, season: "2026" }),
          signal: controller.signal,
        })

        let payload: ArcadeApiResponse | null = null
        try {
          payload = await response.json() as ArcadeApiResponse
        } catch {
          // Gateways can return HTML or an empty body. Use the stable message below.
        }

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "The Arcade achievement could not be loaded.")
        }

        setState({ status: "ready", data: payload, profileUrl })
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          if (timedOut) {
            setState({ status: "error", message: "This achievement is taking too long to load. Please try again." })
          }
          return
        }

        setState({
          status: "error",
          message: error instanceof Error && error.message
            ? error.message
            : "The Arcade achievement could not be loaded.",
        })
      } finally {
        window.clearTimeout(timeout)
      }
    }

    void loadProfile()

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [profileId])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(""), 2200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  if (state.status === "loading") return <LoadingState />

  if (state.status === "error") {
    return (
      <main className="achievement-page">
        <Styles />
        <div className="achievement-error-card">
          <p className="achievement-kicker">Google Cloud Arcade 2026</p>
          <h1>Achievement unavailable</h1>
          <p>{state.message}</p>
          <a className="achievement-link achievement-primary" href={getDashboardHref()}>Check your Arcade score</a>
        </div>
      </main>
    )
  }

  const profile = state.data.userDetails?.[0]
  const profileImage = safeHttpsUrl(profile?.profileImage)
  const points = numeric(state.data.arcadePoints?.totalPoints)
  const groups: BadgeGroup[] = [
    { key: "skill", label: "Skill badges", icon: "☁", badges: state.data.skill ?? [] },
    { key: "game", label: "Games", icon: "◈", badges: state.data.game ?? [] },
    { key: "trivia", label: "Trivia", icon: "?", badges: state.data.trivia ?? [] },
    { key: "completion", label: "Completion", icon: "✓", badges: state.data.completion ?? [] },
    { key: "special", label: "Special", icon: "✦", badges: state.data.special ?? [] },
  ]
  const groupedBadges = groups.flatMap((group) => group.badges)
  const allBadges = state.data.badges?.length ? state.data.badges : groupedBadges
  const recentBadges = allBadges.slice(0, 8)
  const tierProgress = getTierProgress(points)
  const tierName = state.data.milestone || profile?.league || tierProgress.current?.league || "No tier yet"
  const displayName = profile?.userName || "Google Skills learner"
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A"

  async function shareAchievement() {
    const shareData = {
      title: `${displayName} – ${points} Arcade Points`,
      text: `${displayName} has ${points} Arcade Points, ${allBadges.length} badges and is currently ${tierName}.`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }
      await navigator.clipboard.writeText(window.location.href)
      setToast("Achievement link copied")
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      setToast("Unable to share this achievement")
    }
  }

  return (
    <main className="achievement-page">
      <Styles />
      <div className="achievement-shell">
        <header className="achievement-topbar">
          <a className="achievement-brand" href={getDashboardHref()} aria-label="Back to Arcade Score">
            <span className="achievement-brand-mark" aria-hidden="true">A</span>
            <span>Arcade Score</span>
          </a>
          <button className="achievement-share" type="button" onClick={shareAchievement}>↗ Share</button>
        </header>

        <section className="achievement-hero" aria-labelledby="achievement-title">
          <div className="achievement-person">
            {profileImage
              ? <img className="achievement-avatar" src={profileImage} alt={`Avatar of ${displayName}`} referrerPolicy="no-referrer" />
              : <div className="achievement-avatar-fallback" aria-hidden="true">{initials}</div>}
            <div>
              <p className="achievement-kicker">Google Cloud Arcade 2026</p>
              <h1 className="achievement-name" id="achievement-title">{displayName}</h1>
              {profile?.memberSince ? <p className="achievement-member">Google Skills member since {profile.memberSince}</p> : null}
            </div>
          </div>

          <div className="achievement-score-zone">
            <div>
              <p className="achievement-score-label">Arcade points</p>
              <p className="achievement-score">{points}</p>
            </div>

            <div className="achievement-tier-panel">
              <span className="achievement-tier-caption">Current tier</span>
              <div className="achievement-tier-name">🏆 {tierName}</div>
              {tierProgress.next ? (
                <>
                  <div className="achievement-progress-head">
                    <span>Next: {tierProgress.next.league}</span>
                    <strong>{points} / {tierProgress.next.points}</strong>
                  </div>
                  <div
                    className="achievement-progress-track"
                    role="progressbar"
                    aria-label={`Progress to ${tierProgress.next.league}`}
                    aria-valuemin={tierProgress.current?.points ?? 0}
                    aria-valuemax={tierProgress.next.points}
                    aria-valuenow={points}
                  >
                    <div className="achievement-progress-fill" style={{ width: `${tierProgress.progress}%` }} />
                  </div>
                  <p className="achievement-progress-note">{tierProgress.remaining} points to the next tier</p>
                </>
              ) : (
                <p className="achievement-progress-note">Highest Arcade tier achieved</p>
              )}
            </div>
          </div>

          <div className="achievement-overview">
            <div className="achievement-overview-card"><strong>{allBadges.length}</strong><span>Total badges earned</span></div>
            <div className="achievement-overview-card"><strong>{groups[0].badges.length}</strong><span>Skill badges</span></div>
            <div className="achievement-overview-card"><strong>{groups[1].badges.length}</strong><span>Arcade games</span></div>
          </div>
        </section>

        <section className="achievement-section" aria-labelledby="breakdown-title">
          <div className="achievement-section-heading">
            <div>
              <h2 id="breakdown-title">Badge breakdown</h2>
              <p>How this Arcade achievement is built.</p>
            </div>
            <a className="achievement-link" href={state.profileUrl} target="_blank" rel="noreferrer noopener">View on Google Skills ↗</a>
          </div>
          <div className="achievement-breakdown">
            {groups.map((group) => (
              <div className="achievement-breakdown-card" key={group.key}>
                <span className="achievement-breakdown-icon" aria-hidden="true">{group.icon}</span>
                <div><strong>{group.badges.length}</strong><span>{group.label}</span></div>
              </div>
            ))}
          </div>
        </section>

        {recentBadges.length ? (
          <section className="achievement-section" aria-labelledby="recent-title">
            <div className="achievement-section-heading">
              <div>
                <h2 id="recent-title">Recent achievements</h2>
                <p>A selection from {allBadges.length} earned badges.</p>
              </div>
            </div>
            <div className="achievement-badges">
              {recentBadges.map((badge, index) => {
                const imageUrl = safeHttpsUrl(badge.imageURL)
                const badgeUrl = safeHttpsUrl(badge.badgeURL)
                const content = (
                  <>
                    {imageUrl
                      ? <img className="achievement-badge-image" src={imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
                      : <span className="achievement-badge-placeholder" aria-hidden="true">🏅</span>}
                    <span>
                      <strong>{badge.title || "Arcade badge"}</strong>
                      <span>{badge.dateEarned || "Google Cloud achievement"}</span>
                    </span>
                  </>
                )

                return badgeUrl
                  ? <a className="achievement-badge-card" href={badgeUrl} target="_blank" rel="noreferrer noopener" key={`${badge.title}-${index}`}>{content}</a>
                  : <div className="achievement-badge-card" key={`${badge.title}-${index}`}>{content}</div>
              })}
            </div>
          </section>
        ) : null}

        <section className="achievement-cta">
          <div>
            <h2>How many Arcade points have you earned?</h2>
            <p>Analyze your public Google Skills profile and share your achievement.</p>
          </div>
          <a className="achievement-link achievement-primary" href={getDashboardHref()}>Check my Arcade score</a>
        </section>
      </div>
      {toast ? <div className="achievement-toast" role="status" aria-live="polite">✓ {toast}</div> : null}
    </main>
  )
}

/** Supplies the Suspense boundary required by static App Router exports. */
export default function SharedProfileClient() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SharedProfileContent />
    </Suspense>
  )
}
