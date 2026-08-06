"use client"

import {
  BadgeCheck,
  ExternalLink,
  Gamepad2,
  LoaderCircle,
  Share,
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
  const relativePath = BASE_PATH && window.location.pathname.startsWith(BASE_PATH)
    ? window.location.pathname.slice(BASE_PATH.length)
    : window.location.pathname
  const first = relativePath.split("/").filter(Boolean)[0]
  const locale = first && first !== "profile" ? `/${first}` : ""
  return `${BASE_PATH}${locale}/`
}

function getTierProgress(points: number) {
  const current = [...OFFICIAL_MILESTONES]
    .reverse()
    .find((tier) => points >= tier.points) ?? null
  const next = OFFICIAL_MILESTONES.find((tier) => points < tier.points) ?? null
  const lower = current?.points ?? 0
  const upper = next?.points ?? current?.points ?? 1
  const progress = next
    ? Math.min(100, Math.max(0, ((points - lower) / Math.max(1, upper - lower)) * 100))
    : 100

  return {
    current,
    next,
    progress,
    remaining: next ? Math.max(0, next.points - points) : 0,
  }
}

function SharedProfileStyles() {
  return <style>{`
    .shared-score-page {
      --shared-accent: #7c5cff;
      --shared-accent-2: #38bdf8;
      --shared-panel: rgba(14, 18, 39, .92);
      --shared-panel-soft: rgba(24, 30, 58, .76);
      --shared-border: rgba(149, 157, 255, .18);
      --shared-text: #f8fafc;
      --shared-muted: #a8b1c7;
      min-height: 100vh;
    }

    html.light .shared-score-page {
      --shared-panel: rgba(255, 255, 255, .96);
      --shared-panel-soft: rgba(244, 247, 255, .94);
      --shared-border: rgba(100, 116, 139, .18);
      --shared-text: #172033;
      --shared-muted: #64748b;
    }

    .shared-score-page .arcade-header {
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .shared-score-shell {
      width: min(1180px, calc(100% - 2rem));
      margin: 0 auto;
      padding: 1.5rem 0 3rem;
      position: relative;
      z-index: 1;
    }

    .shared-hero {
      overflow: hidden;
      border: 1px solid var(--shared-border);
      border-radius: 24px;
      background:
        radial-gradient(circle at 88% 12%, rgba(62, 91, 246, .3), transparent 28rem),
        linear-gradient(135deg, rgba(25, 39, 85, .94), rgba(11, 16, 37, .96));
      box-shadow: 0 24px 70px rgba(0, 0, 0, .24);
      color: #f8fafc;
    }

    html.light .shared-hero {
      background:
        radial-gradient(circle at 88% 12%, rgba(99, 102, 241, .16), transparent 28rem),
        linear-gradient(135deg, #eef3ff, #f8fafc);
      color: #172033;
      box-shadow: 0 18px 50px rgba(51, 65, 85, .12);
    }

    .shared-hero-main {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 1.25rem;
      align-items: center;
      padding: clamp(1.4rem, 4vw, 2.35rem);
    }

    .shared-person {
      display: flex;
      align-items: center;
      gap: 1.2rem;
      min-width: 0;
    }

    .shared-avatar {
      width: 104px;
      height: 104px;
      flex: 0 0 104px;
      border-radius: 50%;
      border: 4px solid rgba(129, 181, 255, .75);
      object-fit: cover;
      background: rgba(255, 255, 255, .08);
      box-shadow: 0 0 0 7px rgba(59, 130, 246, .12), 0 16px 36px rgba(0, 0, 0, .25);
    }

    .shared-avatar-fallback {
      display: grid;
      place-items: center;
      font-size: 2rem;
      font-weight: 900;
    }

    .shared-person-copy { min-width: 0; }
    .shared-kicker {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      margin: 0 0 .55rem;
      color: #9ec5ff;
      font-size: .76rem;
      font-weight: 900;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    html.light .shared-kicker { color: #4f46e5; }

    .shared-person h1 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3.15rem);
      line-height: 1.05;
      letter-spacing: -.045em;
      overflow-wrap: anywhere;
    }

    .shared-person-meta {
      margin: .55rem 0 0;
      color: #c4cce0;
      font-size: .95rem;
    }
    html.light .shared-person-meta { color: #64748b; }

    .shared-tier-pill {
      width: fit-content;
      display: inline-flex;
      align-items: center;
      gap: .45rem;
      margin-top: .85rem;
      padding: .45rem .72rem;
      border: 1px solid rgba(196, 181, 253, .28);
      border-radius: 999px;
      background: rgba(124, 92, 255, .18);
      color: #d8caff;
      font-size: .83rem;
      font-weight: 800;
    }
    html.light .shared-tier-pill {
      background: #ede9fe;
      color: #6d28d9;
      border-color: rgba(109, 40, 217, .18);
    }

    .shared-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: .65rem;
    }

    .shared-action {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      border: 1px solid rgba(148, 163, 184, .3);
      border-radius: 12px;
      padding: .72rem 1rem;
      background: rgba(15, 23, 42, .42);
      color: #eef4ff;
      text-decoration: none;
      font: inherit;
      font-size: .87rem;
      font-weight: 800;
      cursor: pointer;
    }
    .shared-action:hover { border-color: rgba(125, 169, 255, .68); background: rgba(30, 41, 74, .72); }
    .shared-action.is-primary { background: linear-gradient(135deg, #6f55ff, #377bf5); border-color: transparent; color: #fff; }
    html.light .shared-action:not(.is-primary) { background: rgba(255, 255, 255, .8); color: #334155; }
    .shared-action svg { width: 17px; height: 17px; }

    .shared-stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      border-top: 1px solid rgba(148, 163, 184, .16);
      background: rgba(5, 9, 24, .3);
    }
    html.light .shared-stats { background: rgba(255, 255, 255, .54); }

    .shared-stat {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: .9rem;
      padding: 1.15rem 1.35rem;
      border-right: 1px solid rgba(148, 163, 184, .16);
    }
    .shared-stat:last-child { border-right: 0; }

    .shared-stat-icon {
      width: 42px;
      height: 42px;
      flex: 0 0 42px;
      display: grid;
      place-items: center;
      border-radius: 13px;
      background: rgba(124, 92, 255, .14);
      color: #b69cff;
    }
    .shared-stat:nth-child(2) .shared-stat-icon { color: #a78bfa; background: rgba(139, 92, 246, .14); }
    .shared-stat:nth-child(3) .shared-stat-icon { color: #60a5fa; background: rgba(59, 130, 246, .14); }
    .shared-stat:nth-child(4) .shared-stat-icon { color: #4ade80; background: rgba(34, 197, 94, .13); }
    .shared-stat-icon svg { width: 21px; height: 21px; }

    .shared-stat strong,
    .shared-stat span { display: block; }
    .shared-stat strong { font-size: 1.8rem; line-height: 1; letter-spacing: -.04em; }
    .shared-stat span { margin-top: .33rem; color: #aeb7cb; font-size: .79rem; }
    html.light .shared-stat span { color: #64748b; }

    .shared-section-tabs {
      display: flex;
      gap: 1.4rem;
      margin: 1.3rem 0 1rem;
      border-bottom: 1px solid var(--shared-border);
    }
    .shared-section-tabs a {
      position: relative;
      padding: .8rem .1rem .9rem;
      color: var(--shared-muted);
      text-decoration: none;
      font-size: .9rem;
      font-weight: 800;
    }
    .shared-section-tabs a.is-active { color: #80b2ff; }
    html.light .shared-section-tabs a.is-active { color: #4f46e5; }
    .shared-section-tabs a.is-active::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;
      height: 3px;
      border-radius: 999px;
      background: linear-gradient(90deg, #7c5cff, #38bdf8);
    }

    .shared-dashboard-grid {
      display: grid;
      grid-template-columns: minmax(250px, .72fr) minmax(280px, .9fr) minmax(0, 1.65fr);
      gap: 1rem;
      align-items: stretch;
    }

    .shared-panel {
      min-width: 0;
      border: 1px solid var(--shared-border);
      border-radius: 18px;
      padding: 1.2rem;
      background: var(--shared-panel);
      color: var(--shared-text);
      box-shadow: 0 14px 36px rgba(0, 0, 0, .11);
    }
    html.light .shared-panel { box-shadow: 0 12px 30px rgba(51, 65, 85, .08); }

    .shared-panel-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
      margin-bottom: 1rem;
    }
    .shared-panel-heading h2 {
      display: flex;
      align-items: center;
      gap: .55rem;
      margin: 0;
      font-size: 1rem;
    }
    .shared-panel-heading h2 svg { width: 19px; height: 19px; color: #9c87ff; }
    .shared-panel-heading p { margin: .3rem 0 0; color: var(--shared-muted); font-size: .8rem; }

    .shared-tier-visual {
      min-height: 260px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .shared-tier-title { margin: .3rem 0 .25rem; font-size: 1.45rem; color: #b892ff; }
    html.light .shared-tier-title { color: #6d28d9; }
    .shared-tier-range { margin: 0; color: var(--shared-muted); font-size: .8rem; }
    .shared-progress-head { display: flex; justify-content: space-between; gap: .7rem; margin-top: 1.25rem; color: var(--shared-muted); font-size: .78rem; }
    .shared-progress-head strong { color: var(--shared-text); }
    .shared-progress-track { height: 9px; margin: .65rem 0; overflow: hidden; border-radius: 999px; background: rgba(148, 163, 184, .15); }
    .shared-progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #8b5cf6, #60a5fa); }
    .shared-progress-note { margin: 0; color: #b892ff; font-size: .8rem; }
    html.light .shared-progress-note { color: #6d28d9; }
    .shared-tier-disclaimer { margin: 1.1rem 0 0; padding-top: 1rem; border-top: 1px solid var(--shared-border); color: var(--shared-muted); font-size: .75rem; line-height: 1.55; }

    .shared-breakdown-list { display: grid; gap: .85rem; }
    .shared-breakdown-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 1rem; align-items: center; }
    .shared-breakdown-row span { color: var(--shared-muted); font-size: .82rem; }
    .shared-breakdown-row strong { font-size: .88rem; }
    .shared-breakdown-track { grid-column: 1 / -1; height: 6px; overflow: hidden; border-radius: 999px; background: rgba(148, 163, 184, .13); }
    .shared-breakdown-track i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #7c5cff, #38bdf8); }

    .shared-badges-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: .75rem;
    }
    .shared-badge {
      min-width: 0;
      min-height: 175px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      border: 1px solid var(--shared-border);
      border-radius: 15px;
      padding: .85rem;
      background: var(--shared-panel-soft);
      color: inherit;
      text-decoration: none;
      transition: transform .18s ease, border-color .18s ease;
    }
    .shared-badge:hover { transform: translateY(-2px); border-color: rgba(124, 92, 255, .48); }
    .shared-badge-art {
      width: 74px;
      height: 74px;
      display: grid;
      place-items: center;
      margin-bottom: .7rem;
      border-radius: 18px;
      background: rgba(10, 15, 35, .36);
    }
    html.light .shared-badge-art { background: rgba(226, 232, 240, .7); }
    .shared-badge-art img { width: 66px; height: 66px; object-fit: contain; }
    .shared-badge-art svg { width: 31px; height: 31px; color: #8ab4ff; }
    .shared-badge strong { display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; font-size: .8rem; line-height: 1.35; }
    .shared-badge small { margin-top: auto; padding-top: .55rem; color: var(--shared-muted); font-size: .7rem; }

    .shared-empty { color: var(--shared-muted); font-size: .88rem; }

    .shared-cta {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border: 1px solid rgba(124, 92, 255, .22);
      border-radius: 18px;
      padding: 1.1rem 1.25rem;
      background: linear-gradient(135deg, rgba(84, 64, 190, .22), rgba(31, 49, 102, .2));
      color: var(--shared-text);
    }
    html.light .shared-cta { background: linear-gradient(135deg, #eef2ff, #f8fafc); }
    .shared-cta h2 { margin: 0; font-size: 1.05rem; }
    .shared-cta p { margin: .3rem 0 0; color: var(--shared-muted); font-size: .82rem; }

    .shared-state {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 1rem;
    }
    .shared-state-card {
      width: min(560px, 100%);
      border: 1px solid var(--shared-border);
      border-radius: 20px;
      padding: 2rem;
      background: var(--shared-panel);
      color: var(--shared-text);
      text-align: center;
    }
    .shared-state-card svg { width: 34px; height: 34px; color: #8b7aff; }
    .shared-state-card .spin { animation: spin 1s linear infinite; }
    .shared-state-card p { color: var(--shared-muted); }

    .shared-toast {
      position: fixed;
      left: 50%;
      bottom: 1.25rem;
      z-index: 80;
      transform: translateX(-50%);
      border-radius: 999px;
      padding: .7rem 1rem;
      background: #166534;
      color: #dcfce7;
      font-weight: 800;
      box-shadow: 0 16px 40px rgba(0,0,0,.28);
    }

    @media (max-width: 1050px) {
      .shared-dashboard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .shared-badges-panel { grid-column: 1 / -1; }
    }

    @media (max-width: 760px) {
      .shared-hero-main { grid-template-columns: 1fr; }
      .shared-actions { justify-content: flex-start; }
      .shared-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .shared-stat:nth-child(2) { border-right: 0; }
      .shared-stat:nth-child(-n+2) { border-bottom: 1px solid rgba(148, 163, 184, .16); }
      .shared-dashboard-grid { grid-template-columns: 1fr; }
      .shared-badges-panel { grid-column: auto; }
      .shared-badges-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .shared-cta { align-items: flex-start; flex-direction: column; }
    }

    @media (max-width: 520px) {
      .shared-score-shell { width: min(100% - 1rem, 1180px); padding-top: .75rem; }
      .shared-hero { border-radius: 18px; }
      .shared-hero-main { padding: 1.05rem; }
      .shared-person { align-items: flex-start; gap: .85rem; }
      .shared-avatar { width: 74px; height: 74px; flex-basis: 74px; border-width: 3px; }
      .shared-person h1 { font-size: 1.65rem; }
      .shared-actions { display: grid; grid-template-columns: 1fr 1fr; }
      .shared-action { padding-inline: .7rem; }
      .shared-stat { padding: .95rem .8rem; gap: .6rem; }
      .shared-stat-icon { width: 36px; height: 36px; flex-basis: 36px; }
      .shared-stat strong { font-size: 1.45rem; }
      .shared-badge { min-height: 160px; padding: .7rem; }
    }
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
        try {
          payload = await response.json() as ArcadeApiResponse
        } catch {
          // Keep the stable message below for HTML or empty gateway responses.
        }

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "The profile could not be loaded.")
        }

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
    return (
      <main className="arcade-dashboard-page shared-score-page shared-state">
        <SharedProfileStyles />
        <div className="arcade-stars" aria-hidden="true" />
        <article className="shared-state-card">
          <LoaderCircle className="spin" />
          <h1>Loading Arcade score…</h1>
          <p>Fetching points, badges and tier information.</p>
        </article>
      </main>
    )
  }

  if (state.status === "error") {
    return (
      <main className="arcade-dashboard-page shared-score-page shared-state">
        <SharedProfileStyles />
        <div className="arcade-stars" aria-hidden="true" />
        <article className="shared-state-card">
          <Trophy />
          <h1>Score unavailable</h1>
          <p>{state.message}</p>
          <a className="shared-action is-primary" href={getDashboardHref()}>Check another profile</a>
        </article>
      </main>
    )
  }

  const profile = state.data.userDetails?.[0]
  const profileName = profile?.userName || "Google Skills learner"
  const profileImage = safeHttpsUrl(profile?.profileImage)
  const points = numeric(state.data.arcadePoints?.totalPoints)
  const badges = state.data.badges ?? [
    ...(state.data.game ?? []),
    ...(state.data.trivia ?? []),
    ...(state.data.skill ?? []),
    ...(state.data.completion ?? []),
    ...(state.data.special ?? []),
  ]
  const tier = getTierProgress(points)
  const recentBadges = badges.slice(0, 8)
  const groups = useMemo(() => [
    { label: "Skill badges", value: state.data.skill?.length ?? 0 },
    { label: "Arcade games", value: state.data.game?.length ?? 0 },
    { label: "Trivia badges", value: state.data.trivia?.length ?? 0 },
    { label: "Completion badges", value: state.data.completion?.length ?? 0 },
    { label: "Special badges", value: state.data.special?.length ?? 0 },
  ], [state.data])
  const largestGroup = Math.max(1, ...groups.map((group) => group.value))

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
    <main className="arcade-dashboard-page shared-score-page">
      <SharedProfileStyles />
      <div className="arcade-stars" aria-hidden="true" />

      <header className="arcade-header">
        <a className="arcade-brand" href={getDashboardHref()} aria-label="Arcade Points home">
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
          <em>PRO</em>
        </a>
        <nav className="arcade-nav">
          <a className="active" href="#profile">Profile</a>
          <a href="#badges">Badges</a>
        </nav>
        <div className="arcade-header-actions">
          <button className="header-store-link is-chrome" type="button" onClick={shareProfile}>
            <Share /><span>{copied ? "Copied" : "Share"}</span>
          </button>
        </div>
      </header>

      <div className="shared-score-shell">
        <section id="profile" className="shared-hero">
          <div className="shared-hero-main">
            <div className="shared-person">
              {profileImage ? (
                <img className="shared-avatar" src={profileImage} alt={`${profileName} profile`} referrerPolicy="no-referrer" />
              ) : (
                <span className="shared-avatar shared-avatar-fallback">{profileName.slice(0, 1).toUpperCase()}</span>
              )}
              <div className="shared-person-copy">
                <p className="shared-kicker"><Sparkles /> Google Cloud Arcade 2026</p>
                <h1>{profileName}</h1>
                <p className="shared-person-meta">{profile?.memberSince ? `Member since ${profile.memberSince}` : "Google Skills public profile"}</p>
                <span className="shared-tier-pill"><Trophy /> {tier.current?.league ?? "No tier yet"}</span>
              </div>
            </div>

            <div className="shared-actions">
              <button className="shared-action is-primary" type="button" onClick={shareProfile}><Share /> Share score</button>
              <a className="shared-action" href={state.profileUrl} target="_blank" rel="noreferrer noopener">Google Skills <ExternalLink /></a>
            </div>
          </div>

          <div className="shared-stats">
            <div className="shared-stat"><span className="shared-stat-icon"><Star /></span><div><strong>{formatNumber(points)}</strong><span>Arcade points</span></div></div>
            <div className="shared-stat"><span className="shared-stat-icon"><BadgeCheck /></span><div><strong>{badges.length}</strong><span>Badges earned</span></div></div>
            <div className="shared-stat"><span className="shared-stat-icon"><BadgeCheck /></span><div><strong>{state.data.skill?.length ?? 0}</strong><span>Skill badges</span></div></div>
            <div className="shared-stat"><span className="shared-stat-icon"><Gamepad2 /></span><div><strong>{state.data.game?.length ?? 0}</strong><span>Arcade games</span></div></div>
          </div>
        </section>

        <nav className="shared-section-tabs" aria-label="Profile sections">
          <a className="is-active" href="#badges">Badges</a>
          <a href="#summary">Arcade summary</a>
        </nav>

        <section id="summary" className="shared-dashboard-grid">
          <article className="shared-panel shared-tier-visual">
            <div>
              <div className="shared-panel-heading"><h2><Trophy /> Arcade tier</h2></div>
              <h3 className="shared-tier-title">{tier.current?.league ?? "No tier yet"}</h3>
              <p className="shared-tier-range">{tier.current ? tierRangeLabel(tier.current) : `${OFFICIAL_MILESTONES[0].points} points required`}</p>
            </div>
            <div>
              <div className="shared-progress-head"><span>{tier.next ? `Next: ${tier.next.league}` : "Highest tier reached"}</span><strong>{tier.next ? `${formatNumber(points)} / ${tier.next.points}` : `${formatNumber(points)} pts`}</strong></div>
              <div className="shared-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(tier.progress)}><div className="shared-progress-fill" style={{ width: `${tier.progress}%` }} /></div>
              <p className="shared-progress-note">{tier.next ? `${formatNumber(tier.remaining)} points remaining` : "Maximum Arcade tier reached"}</p>
              <p className="shared-tier-disclaimer">Arcade points and tier estimates are calculated by ePlus.DEV. Google Skills remains the source of truth for profile badges.</p>
            </div>
          </article>

          <article className="shared-panel">
            <div className="shared-panel-heading"><h2><Star /> Badge breakdown</h2></div>
            <div className="shared-breakdown-list">
              {groups.map((group) => (
                <div className="shared-breakdown-row" key={group.label}>
                  <span>{group.label}</span><strong>{group.value}</strong>
                  <span className="shared-breakdown-track" aria-hidden="true"><i style={{ width: `${(group.value / largestGroup) * 100}%` }} /></span>
                </div>
              ))}
            </div>
          </article>

          <article id="badges" className="shared-panel shared-badges-panel">
            <div className="shared-panel-heading">
              <div><h2><BadgeCheck /> Recent achievements</h2><p>{badges.length} badges earned</p></div>
            </div>
            {recentBadges.length ? (
              <div className="shared-badges-grid">
                {recentBadges.map((badge: ArcadeBadge, index) => {
                  const image = safeHttpsUrl(badge.imageURL)
                  const href = safeHttpsUrl(badge.badgeURL)
                  const content = (
                    <>
                      <span className="shared-badge-art">{image ? <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <BadgeCheck />}</span>
                      <strong>{badge.title}</strong>
                      <small>{badge.dateEarned || (badge.points === "-*" ? "Special badge" : `+${formatNumber(numeric(badge.points))} pts`)}</small>
                    </>
                  )
                  return href ? <a className="shared-badge" key={`${badge.title}-${index}`} href={href} target="_blank" rel="noreferrer noopener">{content}</a> : <article className="shared-badge" key={`${badge.title}-${index}`}>{content}</article>
                })}
              </div>
            ) : <p className="shared-empty">No Arcade badges found for this profile.</p>}
          </article>
        </section>

        <section className="shared-cta">
          <div><h2>Track your own Arcade progress</h2><p>Analyze your Google Skills profile and discover your Arcade achievements.</p></div>
          <a className="shared-action is-primary" href={getDashboardHref()}>Check my profile <ExternalLink /></a>
        </section>
      </div>

      {copied ? <div className="shared-toast" role="status">Profile link copied</div> : null}
    </main>
  )
}

export default function SharedProfileClient() {
  return (
    <Suspense fallback={<main className="arcade-dashboard-page shared-score-page shared-state"><SharedProfileStyles /><div className="arcade-stars" aria-hidden="true" /><article className="shared-state-card"><LoaderCircle className="spin" /><h1>Loading Arcade score…</h1></article></main>}>
      <SharedProfileContent />
    </Suspense>
  )
}
