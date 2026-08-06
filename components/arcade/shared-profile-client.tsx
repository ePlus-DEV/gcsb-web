"use client"

import {
  BadgeCheck,
  ExternalLink,
  Gamepad2,
  LoaderCircle,
  Share2,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  API_URL,
  OFFICIAL_MILESTONES,
  type ArcadeApiResponse,
  type ArcadeBadge,
  formatNumber,
  numeric,
  tierRangeLabel,
} from "@/components/arcade/model"

const PROFILE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const REQUEST_TIMEOUT_MS = 20_000
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ArcadeApiResponse; profileUrl: string }

function safeHttpsUrl(value?: string): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function getDashboardHref(): string {
  if (typeof window === "undefined") return `${BASE_PATH}/`
  const pathname = BASE_PATH && window.location.pathname.startsWith(BASE_PATH)
    ? window.location.pathname.slice(BASE_PATH.length)
    : window.location.pathname
  const first = pathname.split("/").filter(Boolean)[0]
  const locale = first && first !== "profile" ? `/${first}` : ""
  return `${BASE_PATH}${locale}/`
}

function getTierProgress(points: number) {
  const current = [...OFFICIAL_MILESTONES].reverse().find((tier) => points >= tier.points) ?? null
  const next = OFFICIAL_MILESTONES.find((tier) => points < tier.points) ?? null
  const lower = current?.points ?? 0
  const upper = next?.points ?? current?.points ?? 1
  const progress = next
    ? Math.min(100, Math.max(0, ((points - lower) / Math.max(1, upper - lower)) * 100))
    : 100
  return { current, next, progress, remaining: next ? Math.max(0, next.points - points) : 0 }
}

function SharedProfileStyles() {
  return <style>{`
    .public-profile-page .arcade-header { position: relative; }
    .public-profile-page .dashboard-shell { padding-top: 1.4rem; }
    .public-profile-page .public-score-panel { grid-column: 1 / -1; overflow: hidden; position: relative; }
    .public-profile-page .public-score-panel::after { content: ""; position: absolute; width: 280px; height: 280px; right: -120px; top: -140px; border-radius: 50%; border: 48px solid rgba(124,92,255,.06); pointer-events: none; }
    .public-score-layout { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(300px, .85fr); gap: 1rem; align-items: stretch; }
    .public-score-main { min-height: 280px; display: flex; flex-direction: column; justify-content: space-between; border-radius: 20px; padding: clamp(1.25rem, 4vw, 2rem); background: linear-gradient(135deg, rgba(124,92,255,.14), rgba(30,34,66,.35)); border: 1px solid rgba(124,92,255,.18); }
    .public-profile-person { display: flex; align-items: center; gap: .85rem; }
    .public-profile-avatar { width: 54px; height: 54px; border-radius: 16px; object-fit: cover; border: 2px solid rgba(124,92,255,.34); background: var(--panel-soft, rgba(255,255,255,.06)); }
    .public-profile-avatar-fallback { display: grid; place-items: center; font-weight: 900; font-size: 1.25rem; }
    .public-profile-person h1 { margin: 0; font-size: clamp(1.25rem, 3vw, 1.8rem); }
    .public-profile-person p { margin: .25rem 0 0; color: var(--text-muted, #9ca3af); font-size: .88rem; }
    .public-score-number { margin-top: 1.5rem; }
    .public-score-number strong { display: block; font-size: clamp(4.8rem, 12vw, 8rem); line-height: .86; letter-spacing: -.08em; }
    .public-score-number span { display: block; margin-top: .7rem; color: var(--text-muted, #9ca3af); font-size: .78rem; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
    .public-tier-card { display: flex; flex-direction: column; justify-content: space-between; border-radius: 20px; padding: 1.35rem; background: rgba(16,19,40,.46); border: 1px solid rgba(255,255,255,.08); }
    .public-tier-name { display: flex; align-items: center; gap: .75rem; }
    .public-tier-name svg { width: 30px; height: 30px; color: #f6c453; }
    .public-tier-name span { display: block; color: var(--text-muted, #9ca3af); font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
    .public-tier-name strong { display: block; margin-top: .25rem; font-size: clamp(1.3rem, 3vw, 1.8rem); }
    .public-progress-head { display: flex; justify-content: space-between; gap: .75rem; margin-top: 1.5rem; color: var(--text-muted, #9ca3af); font-size: .82rem; }
    .public-progress-track { height: 10px; margin: .7rem 0; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.08); }
    .public-progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #7c5cff, #37b9f1); }
    .public-progress-note { margin: 0; color: var(--text-muted, #9ca3af); font-size: .82rem; }
    .public-profile-actions { display: flex; flex-wrap: wrap; gap: .65rem; margin-top: 1rem; }
    .public-profile-actions a, .public-profile-actions button { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: .45rem; border-radius: 12px; padding: .65rem .9rem; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.05); color: inherit; text-decoration: none; font: inherit; font-weight: 800; cursor: pointer; }
    .public-profile-actions .is-primary { background: linear-gradient(135deg, #6f55ff, #4c7dff); border-color: transparent; }
    .public-breakdown-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .7rem; }
    .public-breakdown-item { border-radius: 14px; padding: 1rem; background: rgba(255,255,255,.035); border: 1px solid rgba(255,255,255,.06); }
    .public-breakdown-item strong { display: block; font-size: 1.5rem; }
    .public-breakdown-item span { display: block; margin-top: .25rem; color: var(--text-muted, #9ca3af); font-size: .78rem; }
    .public-profile-loading { min-height: 100vh; display: grid; place-items: center; }
    .public-profile-loading .dashboard-panel { width: min(520px, calc(100% - 2rem)); text-align: center; }
    .public-profile-loading svg { animation: spin 1s linear infinite; }
    @media (max-width: 880px) { .public-score-layout { grid-template-columns: 1fr; } .public-breakdown-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 640px) { .public-profile-page .arcade-header { margin-inline: .8rem; } .public-profile-page .dashboard-shell { padding-inline: .8rem; } .public-score-main { min-height: 240px; } .public-breakdown-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .public-profile-actions a, .public-profile-actions button { flex: 1 1 100%; } }
  `}</style>
}

function SharedProfileContent() {
  const searchParams = useSearchParams()
  const profileId = (searchParams.get("id") ?? "").trim()
  const [state, setState] = useState<State>({ status: "loading" })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!PROFILE_ID_PATTERN.test(profileId)) {
      setState({ status: "error", message: "This profile link is invalid." })
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

    void (async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: profileUrl, season: "2026" }),
          signal: controller.signal,
        })
        let payload: ArcadeApiResponse | null = null
        try { payload = await response.json() as ArcadeApiResponse } catch { /* stable error below */ }
        if (!response.ok || !payload?.success) throw new Error(payload?.message || "The profile could not be loaded.")
        setState({ status: "ready", data: payload, profileUrl })
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          if (timedOut) setState({ status: "error", message: "The request timed out. Please try again." })
          return
        }
        setState({ status: "error", message: error instanceof Error ? error.message : "The profile could not be loaded." })
      } finally {
        window.clearTimeout(timeout)
      }
    })()

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [profileId])

  if (state.status === "loading") {
    return <main className="arcade-dashboard-page public-profile-loading"><SharedProfileStyles /><div className="arcade-stars" aria-hidden="true" /><article className="dashboard-panel"><LoaderCircle /><h1>Loading Arcade score…</h1><p>Fetching points, badges and tier information.</p></article></main>
  }

  if (state.status === "error") {
    return <main className="arcade-dashboard-page public-profile-loading"><SharedProfileStyles /><div className="arcade-stars" aria-hidden="true" /><article className="dashboard-panel"><Trophy /><h1>Score unavailable</h1><p>{state.message}</p><div className="public-profile-actions"><a className="is-primary" href={getDashboardHref()}>Check another profile</a></div></article></main>
  }

  const profile = state.data.userDetails?.[0]
  const profileName = profile?.userName || "Google Skills learner"
  const profileImage = safeHttpsUrl(profile?.profileImage)
  const points = numeric(state.data.arcadePoints?.totalPoints)
  const groups = [
    { label: "Skill badges", value: state.data.skill?.length ?? 0 },
    { label: "Arcade games", value: state.data.game?.length ?? 0 },
    { label: "Trivia", value: state.data.trivia?.length ?? 0 },
    { label: "Completion", value: state.data.completion?.length ?? 0 },
    { label: "Special", value: state.data.special?.length ?? 0 },
  ]
  const badges = state.data.badges ?? [
    ...(state.data.game ?? []),
    ...(state.data.trivia ?? []),
    ...(state.data.skill ?? []),
    ...(state.data.completion ?? []),
    ...(state.data.special ?? []),
  ]
  const tier = getTierProgress(points)
  const recentBadges = badges.slice(0, 8)

  async function shareProfile() {
    const url = window.location.href
    const title = `${profileName} · ${formatNumber(points)} Arcade points`
    const text = `${profileName} has ${formatNumber(points)} Arcade points, ${badges.length} badges and is currently ${tier.current?.league ?? "not yet ranked"}.`
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
    }
  }

  return (
    <main className="arcade-dashboard-page public-profile-page">
      <SharedProfileStyles />
      <div className="arcade-stars" aria-hidden="true" />

      <header className="arcade-header">
        <a className="arcade-brand" href={getDashboardHref()} aria-label="Arcade Points home">
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
          <em>PRO</em>
        </a>
        <nav className="arcade-nav"><a className="active" href="#score">Score</a><a href="#badges">Badges</a></nav>
        <div className="arcade-header-actions"><button className="header-store-link is-chrome" type="button" onClick={shareProfile}><Share2 /><span>{copied ? "Copied" : "Share"}</span></button></div>
      </header>

      <section className="dashboard-shell" aria-label="Shared Arcade score">
        <div className="dashboard-summary-grid">
          <article id="score" className="dashboard-panel public-score-panel">
            <div className="panel-title-row"><div className="panel-title"><Sparkles /> Google Cloud Arcade 2026</div><span className="score-state is-qualified">Public score</span></div>
            <div className="public-score-layout">
              <div className="public-score-main">
                <div className="public-profile-person">
                  {profileImage ? <img className="public-profile-avatar" src={profileImage} alt={`${profileName} profile`} referrerPolicy="no-referrer" /> : <span className="public-profile-avatar public-profile-avatar-fallback">{profileName.slice(0, 1).toUpperCase()}</span>}
                  <div><h1>{profileName}</h1><p>{profile?.memberSince ? `Member since ${profile.memberSince}` : "Google Skills public profile"}</p></div>
                </div>
                <div className="public-score-number"><strong>{formatNumber(points)}</strong><span>Total Arcade points</span></div>
              </div>

              <div className="public-tier-card">
                <div>
                  <div className="public-tier-name"><Trophy /><div><span>Current tier</span><strong>{tier.current?.league ?? "No tier yet"}</strong></div></div>
                  <div className="public-progress-head"><span>{tier.next ? `Next: ${tier.next.league}` : "Highest tier reached"}</span><strong>{tier.next ? `${formatNumber(points)} / ${tier.next.points}` : `${formatNumber(points)} pts`}</strong></div>
                  <div className="public-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(tier.progress)}><div className="public-progress-fill" style={{ width: `${tier.progress}%` }} /></div>
                  <p className="public-progress-note">{tier.next ? `${formatNumber(tier.remaining)} points remaining` : tier.current ? tierRangeLabel(tier.current) : `${OFFICIAL_MILESTONES[0].points} points to the first tier`}</p>
                </div>
                <div className="public-profile-actions"><button className="is-primary" type="button" onClick={shareProfile}><Share2 /> Share score</button><a href={state.profileUrl} target="_blank" rel="noreferrer noopener">Google Skills <ExternalLink /></a></div>
              </div>
            </div>
          </article>

          <article className="dashboard-panel profile-panel">
            <div className="panel-title"><BadgeCheck /> Score summary</div>
            <div className="profile-stat-grid"><div className="profile-stat"><strong>{badges.length}</strong><span>Total badges</span></div><div className="profile-stat"><strong>{state.data.skill?.length ?? 0}</strong><span>Skill badges</span></div><div className="profile-stat"><strong>{state.data.game?.length ?? 0}</strong><span>Arcade games</span></div></div>
          </article>

          <article className="dashboard-panel breakdown-panel">
            <div className="panel-title"><Star /> Badge breakdown</div>
            <div className="public-breakdown-grid">{groups.map((group) => <div className="public-breakdown-item" key={group.label}><strong>{group.value}</strong><span>{group.label}</span></div>)}</div>
          </article>
        </div>

        <div className="dashboard-content-grid">
          <article id="badges" className="dashboard-panel badges-panel">
            <div className="badge-heading-row"><div><div className="panel-title"><BadgeCheck /> Recent achievements</div><p>{badges.length} badges earned</p></div></div>
            {recentBadges.length ? <div className="earned-badge-grid">{recentBadges.map((badge: ArcadeBadge, index) => {
              const image = safeHttpsUrl(badge.imageURL)
              const href = safeHttpsUrl(badge.badgeURL)
              const card = <><div className="earned-badge-art">{image ? <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <BadgeCheck />}</div><h3>{badge.title}</h3><p>{badge.points === "-*" ? "Special scoring rule" : `+${formatNumber(numeric(badge.points))} pts`}</p><time>{badge.dateEarned || "Earned badge"}</time></>
              return href ? <a className="earned-badge" key={`${badge.title}-${index}`} href={href} target="_blank" rel="noreferrer noopener">{card}</a> : <article className="earned-badge" key={`${badge.title}-${index}`}>{card}</article>
            })}</div> : <p>No Arcade badges found for this profile.</p>}
          </article>
        </div>

        <article className="extension-strip"><span className="extension-store-mark"><Trophy /></span><div className="extension-copy-block"><strong>Check your own Arcade score</strong><span>Analyze your public Google Skills profile using the same dashboard.</span></div><div className="extension-store-actions"><a className="store-button is-chrome" href={getDashboardHref()}>Analyze profile <ExternalLink /></a></div></article>
      </section>
    </main>
  )
}

export default function SharedProfileClient() {
  return <Suspense fallback={<main className="arcade-dashboard-page public-profile-loading"><SharedProfileStyles /><div className="arcade-stars" aria-hidden="true" /><article className="dashboard-panel"><LoaderCircle /><h1>Loading Arcade score…</h1></article></main>}><SharedProfileContent /></Suspense>
}
