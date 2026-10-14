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
import SiteHeader from "@/components/site/site-header"
import SiteFooter from "@/components/site/site-footer"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getFacilitatorAdjustedPoints } from "@/components/arcade/facilitator-points"
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
  const path = BASE_PATH && window.location.pathname.startsWith(BASE_PATH)
    ? window.location.pathname.slice(BASE_PATH.length)
    : window.location.pathname
  const first = path.split("/").filter(Boolean)[0]
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



function SharedProfileContent() {
  const searchParams = useSearchParams()
  const profileId = (searchParams.get("id") ?? "").trim()
  const facilitatorParticipating = searchParams.get("facilitator") === "1"
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
    return <main className="arcade-dashboard-page shared-score-page shared-state"><SiteHeader homeHref={getDashboardHref()} /><div className="arcade-stars" aria-hidden="true" /><article className="shared-state-card"><LoaderCircle className="spin" /><h1>Loading Arcade score…</h1><p>Fetching points, badges and tier information.</p></article><SiteFooter /></main>
  }

  if (state.status === "error") {
    return <main className="arcade-dashboard-page shared-score-page shared-state"><SiteHeader homeHref={getDashboardHref()} /><div className="arcade-stars" aria-hidden="true" /><article className="shared-state-card"><Trophy /><h1>Score unavailable</h1><p>{state.message}</p><a className="shared-action is-primary" href={getDashboardHref()}>Check another profile</a></article><SiteFooter /></main>
  }

  const profile = state.data.userDetails?.[0]
  const profileName = profile?.userName || "Google Skills learner"
  const profileImage = safeHttpsUrl(profile?.profileImage)
  const facilitatorScore = getFacilitatorAdjustedPoints(
    numeric(state.data.arcadePoints?.totalPoints),
    {
      games: numeric(state.data.faciCounts?.faciGame),
      skills: numeric(state.data.faciCounts?.faciSkill),
    },
    facilitatorParticipating,
  )
  const points = facilitatorScore.totalPoints
  const facilitatorBonus = facilitatorScore.bonus
  const badges = state.data.badges ?? [
    ...(state.data.game ?? []),
    ...(state.data.trivia ?? []),
    ...(state.data.skill ?? []),
    ...(state.data.completion ?? []),
    ...(state.data.special ?? []),
  ]
  const tier = getTierProgress(points)
  const recentBadges = [...badges]
    .sort((a, b) => {
      const aDate = a.dateEarned ? Date.parse(a.dateEarned) : 0
      const bDate = b.dateEarned ? Date.parse(b.dateEarned) : 0
      const aTimestamp = Number.isNaN(aDate) ? 0 : aDate
      const bTimestamp = Number.isNaN(bDate) ? 0 : bDate
      return bTimestamp - aTimestamp
    })
    .slice(0, 8)
  const groups = [
    { label: "Skill badges", value: state.data.skill?.length ?? 0 },
    { label: "Arcade games", value: state.data.game?.length ?? 0 },
    { label: "Trivia badges", value: state.data.trivia?.length ?? 0 },
    { label: "Completion badges", value: state.data.completion?.length ?? 0 },
    { label: "Special badges", value: state.data.special?.length ?? 0 },
  ]
  const largestGroup = Math.max(1, ...groups.map((group) => group.value))

  async function shareProfile() {
    const url = window.location.href
    const title = `${profileName} · ${formatNumber(points)} Arcade points`
    const text = `${profileName} has ${formatNumber(points)} Arcade points, ${badges.length} badges and is currently ${tier.current?.league ?? "not yet ranked"}.`
    try {
      if (navigator.share) await navigator.share({ title, text, url })
      else {
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
      <div className="arcade-stars" aria-hidden="true" />
      <SiteHeader homeHref={getDashboardHref()} />

      <div className="shared-shell">
        <section id="profile" className="shared-hero">
          <div className="shared-hero-main">
            <div className="shared-person">
              {profileImage ? <img className="shared-avatar" src={profileImage} alt={`${profileName} profile`} referrerPolicy="no-referrer" /> : <span className="shared-avatar shared-avatar-fallback">{profileName.slice(0,1).toUpperCase()}</span>}
              <div className="shared-copy"><p className="shared-kicker"><Sparkles /> Google Cloud Arcade 2026</p><h1>{profileName}</h1><p className="shared-meta">{profile?.memberSince ? `Member since ${profile.memberSince}` : "Google Skills public profile"}</p><span className="shared-tier-pill"><Trophy /> {tier.current?.league ?? "No tier yet"}</span></div>
            </div>
            <div className="shared-actions"><button className="shared-action is-primary" type="button" onClick={shareProfile}><Share /> Share score</button><a className="shared-action" href={state.profileUrl} target="_blank" rel="noreferrer noopener">Google Skills <ExternalLink /></a></div>
          </div>
          <div className="shared-stats">
            <div className="shared-stat"><span className="shared-stat-icon"><Star /></span><div><strong>{formatNumber(points)}</strong><span>Arcade points</span></div></div>
            <div className="shared-stat"><span className="shared-stat-icon"><BadgeCheck /></span><div><strong>{badges.length}</strong><span>Badges earned</span></div></div>
            <div className="shared-stat"><span className="shared-stat-icon"><BadgeCheck /></span><div><strong>{state.data.skill?.length ?? 0}</strong><span>Skill badges</span></div></div>
            <div className="shared-stat"><span className="shared-stat-icon"><Gamepad2 /></span><div><strong>{state.data.game?.length ?? 0}</strong><span>Arcade games</span></div></div>
          </div>
        </section>

        <nav className="shared-tabs" aria-label="Profile sections"><a className="is-active" href="#summary">Arcade summary</a><a href="#badges">Badges</a></nav>

        <section id="summary" className="shared-summary-grid">
          <article className="shared-panel">
            <div className="shared-panel-heading"><h2><Trophy /> Arcade tier</h2></div>
            <h3 className="shared-tier-title">{tier.current?.league ?? "No tier yet"}</h3>
            <p className="shared-tier-range">{tier.current ? tierRangeLabel(tier.current) : `${OFFICIAL_MILESTONES[0].points} points required`}</p>
            <div className="shared-progress-head"><span>{tier.next ? `Next: ${tier.next.league}` : "Highest tier reached"}</span><strong>{tier.next ? `${formatNumber(points)} / ${tier.next.points}` : `${formatNumber(points)} pts`}</strong></div>
            <div className="shared-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(tier.progress)}><div className="shared-progress-fill" style={{ width: `${tier.progress}%` }} /></div>
            <p className="shared-progress-note">{tier.next ? `${formatNumber(tier.remaining)} points remaining` : "Maximum Arcade tier reached"}</p>
            <p className="shared-tier-note">Arcade points and tier estimates are calculated by ePlus.DEV.{facilitatorBonus > 0 ? ` Includes +${formatNumber(facilitatorBonus)} Facilitator bonus.` : ""} Google Skills remains the source of truth for profile badges.</p>
          </article>

          <article className="shared-panel">
            <div className="shared-panel-heading"><h2><Star /> Badge breakdown</h2></div>
            <div className="shared-breakdown-list">{groups.map((group) => <div className="shared-breakdown-row" key={group.label}><span>{group.label}</span><strong>{group.value}</strong><span className="shared-breakdown-track" aria-hidden="true"><i style={{ width: `${(group.value / largestGroup) * 100}%` }} /></span></div>)}</div>
          </article>
        </section>

        <article id="badges" className="shared-panel shared-badges-panel">
          <div className="shared-panel-heading"><div><h2><BadgeCheck /> Recent achievements</h2><p>{badges.length} badges earned</p></div></div>
          {recentBadges.length ? <div className="shared-badges-grid">{recentBadges.map((badge: ArcadeBadge,index) => {
            const image = safeHttpsUrl(badge.imageURL)
            const href = safeHttpsUrl(badge.badgeURL)
            const content = <><span className="shared-badge-art">{image ? <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <BadgeCheck />}</span><strong>{badge.title}</strong><small>{badge.dateEarned || (badge.points === "-*" ? "Special badge" : `+${formatNumber(numeric(badge.points))} pts`)}</small></>
            return href ? <a className="shared-badge" key={`${badge.title}-${index}`} href={href} target="_blank" rel="noreferrer noopener">{content}</a> : <article className="shared-badge" key={`${badge.title}-${index}`}>{content}</article>
          })}</div> : <p className="shared-empty">No Arcade badges found for this profile.</p>}
        </article>

        <section className="shared-cta"><div><h2>Track your own Arcade progress</h2><p>Analyze your Google Skills profile and discover your Arcade achievements.</p></div><a className="shared-action is-primary" href={getDashboardHref()}>Check my profile <ExternalLink /></a></section>
      </div>
      <SiteFooter />
      {copied ? <div className="shared-toast" role="status">Profile link copied</div> : null}
    </main>
  )
}

export default function SharedProfileClient() {
  return <Suspense fallback={<main className="arcade-dashboard-page shared-score-page shared-state"><SiteHeader homeHref={getDashboardHref()} /><div className="arcade-stars" aria-hidden="true" /><article className="shared-state-card"><LoaderCircle className="spin" /><h1>Loading Arcade score…</h1></article><SiteFooter /></main>}><SharedProfileContent /></Suspense>
}