"use client"

import {
  BadgeCheck,
  ExternalLink,
  Gamepad2,
  LoaderCircle,
  Share,
  Star,
  Trophy,
} from "lucide-react"
import { Suspense, useEffect, useState } from "react"
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
    .official-profile-page {
      --official-bg: #f8fafd;
      --official-surface: #ffffff;
      --official-surface-soft: #f1f4f9;
      --official-text: #202124;
      --official-muted: #5f6368;
      --official-border: #dadce0;
      --official-blue: #1a73e8;
      --official-blue-soft: #e8f0fe;
      --official-green: #188038;
      --official-yellow: #f9ab00;
      min-height: 100vh;
      color: var(--official-text);
      background: var(--official-bg);
      font-family: Arial, Helvetica, sans-serif;
    }

    html.dark .official-profile-page {
      --official-bg: #0f1115;
      --official-surface: #17191f;
      --official-surface-soft: #202329;
      --official-text: #f1f3f4;
      --official-muted: #bdc1c6;
      --official-border: #3c4043;
      --official-blue: #8ab4f8;
      --official-blue-soft: rgba(138, 180, 248, .13);
      --official-green: #81c995;
      --official-yellow: #fdd663;
    }

    .official-profile-header {
      position: sticky;
      top: 0;
      z-index: 30;
      border-bottom: 1px solid var(--official-border);
      background: color-mix(in srgb, var(--official-surface) 94%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .official-profile-header-inner {
      width: min(1180px, calc(100% - 2rem));
      min-height: 64px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .official-profile-brand {
      display: inline-flex;
      align-items: center;
      gap: .7rem;
      color: var(--official-text);
      text-decoration: none;
      white-space: nowrap;
    }

    .official-profile-brand-mark {
      position: relative;
      width: 30px;
      height: 24px;
      display: grid;
      grid-template-columns: repeat(2, 10px);
      grid-template-rows: repeat(2, 10px);
      gap: 3px;
      transform: rotate(45deg);
    }

    .official-profile-brand-mark i {
      display: block;
      border-radius: 3px;
    }

    .official-profile-brand-mark i:nth-child(1) { background: #4285f4; }
    .official-profile-brand-mark i:nth-child(2) { background: #ea4335; }
    .official-profile-brand-mark i:nth-child(3) { background: #34a853; }
    .official-profile-brand-mark i:nth-child(4) { background: #fbbc04; }

    .official-profile-brand-copy strong,
    .official-profile-brand-copy small {
      display: block;
    }

    .official-profile-brand-copy strong {
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: -.01em;
    }

    .official-profile-brand-copy small {
      margin-top: .05rem;
      color: var(--official-muted);
      font-size: .7rem;
    }

    .official-profile-nav {
      display: flex;
      align-self: stretch;
      align-items: stretch;
      margin-left: auto;
    }

    .official-profile-nav a {
      position: relative;
      min-width: 84px;
      display: grid;
      place-items: center;
      color: var(--official-muted);
      text-decoration: none;
      font-size: .86rem;
      font-weight: 600;
    }

    .official-profile-nav a:hover,
    .official-profile-nav a.is-active {
      color: var(--official-blue);
    }

    .official-profile-nav a.is-active::after {
      content: "";
      position: absolute;
      left: 12px;
      right: 12px;
      bottom: 0;
      height: 3px;
      border-radius: 3px 3px 0 0;
      background: var(--official-blue);
    }

    .official-header-share,
    .official-button {
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: .45rem;
      border: 1px solid var(--official-border);
      border-radius: 6px;
      padding: .55rem .85rem;
      background: var(--official-surface);
      color: var(--official-blue);
      text-decoration: none;
      font: inherit;
      font-size: .84rem;
      font-weight: 600;
      cursor: pointer;
      transition: background .16s ease, box-shadow .16s ease, border-color .16s ease;
    }

    .official-header-share:hover,
    .official-button:hover {
      border-color: color-mix(in srgb, var(--official-blue) 52%, var(--official-border));
      background: var(--official-blue-soft);
      box-shadow: 0 1px 2px rgba(60, 64, 67, .12);
    }

    .official-button.is-primary {
      border-color: var(--official-blue);
      background: var(--official-blue);
      color: #fff;
    }

    html.dark .official-button.is-primary { color: #202124; }

    .official-header-share svg,
    .official-button svg {
      width: 17px;
      height: 17px;
    }

    .official-profile-main {
      width: min(1120px, calc(100% - 2rem));
      margin: 0 auto;
      padding: 2rem 0 4rem;
    }

    .official-profile-card {
      overflow: hidden;
      border: 1px solid var(--official-border);
      border-radius: 12px;
      background: var(--official-surface);
      box-shadow: 0 1px 2px rgba(60, 64, 67, .08);
    }

    .official-profile-cover {
      position: relative;
      height: 126px;
      overflow: hidden;
      background:
        linear-gradient(110deg, rgba(66, 133, 244, .16), transparent 54%),
        var(--official-blue-soft);
    }

    .official-profile-cover::before,
    .official-profile-cover::after {
      content: "";
      position: absolute;
      border-radius: 50%;
      border: 24px solid rgba(255, 255, 255, .35);
    }

    html.dark .official-profile-cover::before,
    html.dark .official-profile-cover::after {
      border-color: rgba(138, 180, 248, .08);
    }

    .official-profile-cover::before {
      width: 180px;
      height: 180px;
      right: 8%;
      top: -90px;
    }

    .official-profile-cover::after {
      width: 110px;
      height: 110px;
      right: 24%;
      bottom: -80px;
    }

    .official-cover-dots {
      position: absolute;
      inset: 0;
      opacity: .5;
      background-image: radial-gradient(rgba(26, 115, 232, .25) 1px, transparent 1px);
      background-size: 22px 22px;
    }

    .official-profile-identity {
      position: relative;
      min-height: 144px;
      display: flex;
      align-items: flex-end;
      gap: 1.25rem;
      padding: 0 1.75rem 1.5rem;
    }

    .official-profile-avatar {
      width: 116px;
      height: 116px;
      flex: 0 0 116px;
      margin-top: -58px;
      border: 5px solid var(--official-surface);
      border-radius: 50%;
      object-fit: cover;
      background: var(--official-surface-soft);
      box-shadow: 0 1px 4px rgba(60, 64, 67, .28);
    }

    .official-profile-avatar-fallback {
      display: grid;
      place-items: center;
      color: #fff;
      background: #1a73e8;
      font-size: 2.25rem;
      font-weight: 500;
    }

    .official-profile-name {
      min-width: 0;
      flex: 1 1 auto;
      padding-bottom: .2rem;
    }

    .official-profile-name h1 {
      margin: 0;
      overflow-wrap: anywhere;
      font-size: clamp(1.55rem, 3vw, 2.15rem);
      line-height: 1.16;
      font-weight: 500;
      letter-spacing: -.025em;
    }

    .official-profile-name p {
      margin: .45rem 0 0;
      color: var(--official-muted);
      font-size: .9rem;
    }

    .official-profile-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: .55rem;
      padding-bottom: .15rem;
    }

    .official-profile-stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      border-top: 1px solid var(--official-border);
    }

    .official-profile-stat {
      min-width: 0;
      padding: 1.15rem 1.35rem;
      border-right: 1px solid var(--official-border);
    }

    .official-profile-stat:last-child { border-right: 0; }

    .official-profile-stat strong,
    .official-profile-stat span {
      display: block;
    }

    .official-profile-stat strong {
      font-size: 1.45rem;
      line-height: 1.1;
      font-weight: 500;
    }

    .official-profile-stat span {
      margin-top: .32rem;
      color: var(--official-muted);
      font-size: .78rem;
    }

    .official-profile-tabs {
      display: flex;
      gap: 1.5rem;
      margin: 1.4rem 0;
      border-bottom: 1px solid var(--official-border);
    }

    .official-profile-tabs a {
      position: relative;
      padding: .8rem .15rem .9rem;
      color: var(--official-muted);
      text-decoration: none;
      font-size: .9rem;
      font-weight: 600;
    }

    .official-profile-tabs a.is-active {
      color: var(--official-blue);
    }

    .official-profile-tabs a.is-active::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;
      height: 3px;
      border-radius: 3px 3px 0 0;
      background: var(--official-blue);
    }

    .official-profile-content {
      display: grid;
      grid-template-columns: 290px minmax(0, 1fr);
      gap: 1.35rem;
      align-items: start;
    }

    .official-profile-sidebar {
      display: grid;
      gap: 1rem;
      position: sticky;
      top: 84px;
    }

    .official-info-card {
      border: 1px solid var(--official-border);
      border-radius: 10px;
      background: var(--official-surface);
      padding: 1.15rem;
    }

    .official-info-card h2 {
      display: flex;
      align-items: center;
      gap: .55rem;
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .official-info-card h2 svg {
      width: 19px;
      height: 19px;
      color: var(--official-blue);
    }

    .official-tier-name {
      margin: 1rem 0 .25rem;
      font-size: 1.35rem;
      font-weight: 500;
    }

    .official-tier-range,
    .official-tier-note,
    .official-unofficial-note {
      margin: 0;
      color: var(--official-muted);
      font-size: .78rem;
      line-height: 1.55;
    }

    .official-progress-head {
      display: flex;
      justify-content: space-between;
      gap: .75rem;
      margin-top: 1.15rem;
      color: var(--official-muted);
      font-size: .75rem;
    }

    .official-progress-head strong { color: var(--official-text); }

    .official-progress-track {
      height: 8px;
      margin: .55rem 0 .6rem;
      overflow: hidden;
      border-radius: 999px;
      background: var(--official-surface-soft);
    }

    .official-progress-fill {
      height: 100%;
      border-radius: inherit;
      background: var(--official-blue);
    }

    .official-unofficial-note {
      margin-top: 1rem;
      padding-top: .9rem;
      border-top: 1px solid var(--official-border);
    }

    .official-breakdown {
      display: grid;
      gap: .72rem;
      margin-top: 1rem;
    }

    .official-breakdown-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
      font-size: .82rem;
    }

    .official-breakdown-row span { color: var(--official-muted); }
    .official-breakdown-row strong { font-weight: 600; }

    .official-badges-panel {
      min-width: 0;
      border: 1px solid var(--official-border);
      border-radius: 10px;
      background: var(--official-surface);
      padding: 1.35rem;
    }

    .official-section-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.2rem;
    }

    .official-section-heading h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .official-section-heading p {
      margin: .35rem 0 0;
      color: var(--official-muted);
      font-size: .82rem;
    }

    .official-badge-count {
      flex: 0 0 auto;
      padding: .38rem .65rem;
      border-radius: 999px;
      color: var(--official-blue);
      background: var(--official-blue-soft);
      font-size: .75rem;
      font-weight: 600;
    }

    .official-badge-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    .official-badge-card {
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--official-border);
      border-radius: 9px;
      background: var(--official-surface);
      color: inherit;
      text-decoration: none;
      transition: box-shadow .18s ease, transform .18s ease, border-color .18s ease;
    }

    .official-badge-card:hover {
      transform: translateY(-2px);
      border-color: color-mix(in srgb, var(--official-blue) 36%, var(--official-border));
      box-shadow: 0 4px 14px rgba(60, 64, 67, .16);
    }

    .official-badge-art {
      min-height: 148px;
      display: grid;
      place-items: center;
      padding: 1.15rem;
      background: var(--official-surface-soft);
    }

    .official-badge-art img {
      width: 112px;
      height: 112px;
      object-fit: contain;
      filter: drop-shadow(0 3px 4px rgba(60, 64, 67, .12));
    }

    .official-badge-art svg {
      width: 44px;
      height: 44px;
      color: var(--official-blue);
    }

    .official-badge-body {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      padding: 1rem;
    }

    .official-badge-type {
      color: var(--official-blue);
      font-size: .67rem;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
    }

    .official-badge-card h3 {
      margin: .45rem 0 0;
      overflow-wrap: anywhere;
      font-size: .94rem;
      line-height: 1.38;
      font-weight: 600;
    }

    .official-badge-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .6rem;
      margin-top: auto;
      padding-top: 1rem;
      color: var(--official-muted);
      font-size: .72rem;
    }

    .official-badge-points {
      flex: 0 0 auto;
      padding: .25rem .45rem;
      border-radius: 4px;
      color: var(--official-green);
      background: color-mix(in srgb, var(--official-green) 10%, transparent);
      font-weight: 600;
    }

    .official-badge-open {
      display: inline-flex;
      align-items: center;
      gap: .3rem;
      margin-top: .9rem;
      padding-top: .8rem;
      border-top: 1px solid var(--official-border);
      color: var(--official-blue);
      font-size: .75rem;
      font-weight: 600;
    }

    .official-badge-open svg { width: 13px; height: 13px; }

    .official-empty-badges {
      min-height: 240px;
      display: grid;
      place-items: center;
      text-align: center;
      color: var(--official-muted);
    }

    .official-empty-badges svg {
      width: 44px;
      height: 44px;
      margin-bottom: .75rem;
      color: var(--official-blue);
    }

    .official-profile-cta {
      margin-top: 1.35rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border: 1px solid var(--official-border);
      border-radius: 10px;
      background: var(--official-surface);
      padding: 1.1rem 1.25rem;
    }

    .official-profile-cta strong,
    .official-profile-cta span { display: block; }

    .official-profile-cta strong {
      font-size: .95rem;
      font-weight: 600;
    }

    .official-profile-cta span {
      margin-top: .2rem;
      color: var(--official-muted);
      font-size: .78rem;
    }

    .official-profile-loading {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 1rem;
      background: var(--official-bg, #f8fafd);
    }

    .official-profile-loading-card {
      width: min(480px, 100%);
      border: 1px solid var(--official-border, #dadce0);
      border-radius: 12px;
      background: var(--official-surface, #fff);
      padding: 2rem;
      color: var(--official-text, #202124);
      text-align: center;
      box-shadow: 0 2px 10px rgba(60, 64, 67, .12);
    }

    .official-profile-loading-card svg {
      width: 36px;
      height: 36px;
      color: var(--official-blue, #1a73e8);
    }

    .official-profile-loading-card .is-spinning { animation: spin 1s linear infinite; }

    .official-profile-loading-card h1 {
      margin: 1rem 0 .4rem;
      font-size: 1.3rem;
      font-weight: 500;
    }

    .official-profile-loading-card p {
      margin: 0;
      color: var(--official-muted, #5f6368);
      font-size: .86rem;
      line-height: 1.55;
    }

    .official-profile-loading-card .official-button { margin-top: 1.25rem; }

    @media (max-width: 960px) {
      .official-profile-content { grid-template-columns: 1fr; }
      .official-profile-sidebar {
        position: static;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .official-badge-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 720px) {
      .official-profile-header-inner,
      .official-profile-main {
        width: min(100% - 1.25rem, 1120px);
      }
      .official-profile-header-inner { min-height: 58px; gap: .65rem; }
      .official-profile-brand-copy small,
      .official-profile-nav { display: none; }
      .official-header-share { margin-left: auto; }
      .official-profile-main { padding-top: .8rem; }
      .official-profile-cover { height: 96px; }
      .official-profile-identity {
        min-height: 0;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: .8rem 1rem;
        padding: 0 1rem 1rem;
      }
      .official-profile-avatar {
        width: 92px;
        height: 92px;
        flex-basis: 92px;
        margin-top: -46px;
        border-width: 4px;
      }
      .official-profile-name {
        flex-basis: calc(100% - 108px);
        padding-top: .7rem;
      }
      .official-profile-actions {
        width: 100%;
        justify-content: stretch;
      }
      .official-profile-actions .official-button { flex: 1 1 0; }
      .official-profile-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .official-profile-stat:nth-child(2) { border-right: 0; }
      .official-profile-stat:nth-child(-n + 2) { border-bottom: 1px solid var(--official-border); }
      .official-profile-sidebar { grid-template-columns: 1fr; }
      .official-badges-panel { padding: 1rem; }
      .official-profile-cta {
        align-items: stretch;
        flex-direction: column;
      }
      .official-profile-cta .official-button { width: 100%; }
    }

    @media (max-width: 520px) {
      .official-header-share span { display: none; }
      .official-header-share { width: 40px; padding-inline: 0; }
      .official-profile-brand-copy strong { font-size: .92rem; }
      .official-profile-name h1 { font-size: 1.35rem; }
      .official-profile-name p { font-size: .78rem; }
      .official-profile-stat { padding: .9rem 1rem; }
      .official-profile-stat strong { font-size: 1.25rem; }
      .official-profile-tabs { margin: 1rem 0; }
      .official-badge-grid { grid-template-columns: 1fr; }
      .official-badge-card { display: grid; grid-template-columns: 112px minmax(0, 1fr); }
      .official-badge-art { min-height: 100%; padding: .8rem; }
      .official-badge-art img { width: 84px; height: 84px; }
      .official-badge-body { min-width: 0; padding: .85rem; }
      .official-badge-card h3 { font-size: .86rem; }
      .official-badge-meta { padding-top: .7rem; }
      .official-badge-open { margin-top: .65rem; padding-top: .6rem; }
    }

    @media (prefers-reduced-motion: reduce) {
      .official-badge-card,
      .official-button,
      .official-header-share { transition: none; }
      .official-badge-card:hover { transform: none; }
    }
  `}</style>
}

function LoadingState() {
  return (
    <main className="official-profile-page official-profile-loading">
      <SharedProfileStyles />
      <article className="official-profile-loading-card">
        <LoaderCircle className="is-spinning" />
        <h1>Loading public profile</h1>
        <p>Fetching the latest profile information and earned badges.</p>
      </article>
    </main>
  )
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
          // Use the stable error message below when the response is not JSON.
        }

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "The profile could not be loaded.")
        }

        setState({ status: "ready", data: payload, profileUrl })
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          if (timedOut) {
            setState({ status: "error", message: "The request timed out. Please try again." })
          }
          return
        }

        setState({
          status: "error",
          message: error instanceof Error ? error.message : "The profile could not be loaded.",
        })
      } finally {
        window.clearTimeout(timeout)
      }
    })()

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [profileId])

  if (state.status === "loading") return <LoadingState />

  if (state.status === "error") {
    return (
      <main className="official-profile-page official-profile-loading">
        <SharedProfileStyles />
        <article className="official-profile-loading-card">
          <Trophy />
          <h1>Profile unavailable</h1>
          <p>{state.message}</p>
          <a className="official-button is-primary" href={getDashboardHref()}>
            Check another profile
          </a>
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
  const groups = [
    { label: "Skill badges", value: state.data.skill?.length ?? 0 },
    { label: "Arcade games", value: state.data.game?.length ?? 0 },
    { label: "Trivia badges", value: state.data.trivia?.length ?? 0 },
    { label: "Special badges", value: state.data.special?.length ?? 0 },
  ]

  async function shareProfile() {
    const url = window.location.href
    const title = `${profileName} · Google Skills profile`
    const text = `${profileName} has earned ${badges.length} badges and ${formatNumber(points)} Arcade points.`

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
      }

      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
    }
  }

  return (
    <main className="official-profile-page">
      <SharedProfileStyles />

      <header className="official-profile-header">
        <div className="official-profile-header-inner">
          <a className="official-profile-brand" href={getDashboardHref()} aria-label="Arcade Points home">
            <span className="official-profile-brand-mark" aria-hidden="true">
              <i /><i /><i /><i />
            </span>
            <span className="official-profile-brand-copy">
              <strong>Google Cloud Skills</strong>
              <small>Arcade profile by ePlus.DEV</small>
            </span>
          </a>

          <nav className="official-profile-nav" aria-label="Profile sections">
            <a className="is-active" href="#profile">Profile</a>
            <a href="#badges">Badges</a>
          </nav>

          <button className="official-header-share" type="button" onClick={shareProfile}>
            <Share />
            <span>{copied ? "Copied" : "Share"}</span>
          </button>
        </div>
      </header>

      <div className="official-profile-main">
        <section id="profile" className="official-profile-card">
          <div className="official-profile-cover" aria-hidden="true">
            <span className="official-cover-dots" />
          </div>

          <div className="official-profile-identity">
            {profileImage ? (
              <img
                className="official-profile-avatar"
                src={profileImage}
                alt={`${profileName} profile`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="official-profile-avatar official-profile-avatar-fallback" aria-hidden="true">
                {profileName.slice(0, 1).toUpperCase()}
              </span>
            )}

            <div className="official-profile-name">
              <h1>{profileName}</h1>
              <p>
                {profile?.memberSince
                  ? `Google Skills member since ${profile.memberSince}`
                  : "Google Skills public profile"}
              </p>
            </div>

            <div className="official-profile-actions">
              <button className="official-button is-primary" type="button" onClick={shareProfile}>
                <Share /> {copied ? "Link copied" : "Share profile"}
              </button>
              <a
                className="official-button"
                href={state.profileUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                View on Google Skills <ExternalLink />
              </a>
            </div>
          </div>

          <div className="official-profile-stats" aria-label="Profile summary">
            <div className="official-profile-stat">
              <strong>{formatNumber(points)}</strong>
              <span>Arcade points</span>
            </div>
            <div className="official-profile-stat">
              <strong>{formatNumber(badges.length)}</strong>
              <span>Badges earned</span>
            </div>
            <div className="official-profile-stat">
              <strong>{formatNumber(state.data.skill?.length ?? 0)}</strong>
              <span>Skill badges</span>
            </div>
            <div className="official-profile-stat">
              <strong>{formatNumber(state.data.game?.length ?? 0)}</strong>
              <span>Arcade games</span>
            </div>
          </div>
        </section>

        <nav className="official-profile-tabs" aria-label="Public profile navigation">
          <a className="is-active" href="#badges">Badges</a>
          <a href="#arcade-summary">Arcade summary</a>
        </nav>

        <div className="official-profile-content">
          <aside id="arcade-summary" className="official-profile-sidebar">
            <section className="official-info-card">
              <h2><Trophy /> Arcade tier</h2>
              <div className="official-tier-name">{tier.current?.league ?? "No tier yet"}</div>
              <p className="official-tier-range">
                {tier.current ? tierRangeLabel(tier.current) : "Start earning Arcade points to reach the first tier."}
              </p>

              <div className="official-progress-head">
                <span>{tier.next ? `Next: ${tier.next.league}` : "Highest tier reached"}</span>
                <strong>
                  {tier.next
                    ? `${formatNumber(points)} / ${formatNumber(tier.next.points)}`
                    : `${formatNumber(points)} pts`}
                </strong>
              </div>
              <div
                className="official-progress-track"
                role="progressbar"
                aria-label="Arcade tier progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(tier.progress)}
              >
                <div className="official-progress-fill" style={{ width: `${tier.progress}%` }} />
              </div>
              <p className="official-tier-note">
                {tier.next
                  ? `${formatNumber(tier.remaining)} points remaining`
                  : "The highest listed Arcade tier has been reached."}
              </p>
              <p className="official-unofficial-note">
                Arcade points and tier estimates are calculated by ePlus.DEV. Google Skills remains the source of truth for profile badges.
              </p>
            </section>

            <section className="official-info-card">
              <h2><Star /> Badge breakdown</h2>
              <div className="official-breakdown">
                {groups.map((group) => (
                  <div className="official-breakdown-row" key={group.label}>
                    <span>{group.label}</span>
                    <strong>{formatNumber(group.value)}</strong>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section id="badges" className="official-badges-panel">
            <div className="official-section-heading">
              <div>
                <h2>Earned badges</h2>
                <p>Achievements displayed from this public Google Skills profile.</p>
              </div>
              <span className="official-badge-count">{badges.length} badges</span>
            </div>

            {badges.length ? (
              <div className="official-badge-grid">
                {badges.map((badge: ArcadeBadge, index) => {
                  const image = safeHttpsUrl(badge.imageURL)
                  const href = safeHttpsUrl(badge.badgeURL)
                  const pointsLabel = badge.points === "-*"
                    ? "Special"
                    : `+${formatNumber(numeric(badge.points))} pts`

                  const card = (
                    <>
                      <div className="official-badge-art">
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <BadgeCheck />
                        )}
                      </div>
                      <div className="official-badge-body">
                        <span className="official-badge-type">Google Skills badge</span>
                        <h3>{badge.title}</h3>
                        <div className="official-badge-meta">
                          <time>{badge.dateEarned || "Earned badge"}</time>
                          <span className="official-badge-points">{pointsLabel}</span>
                        </div>
                        {href ? (
                          <span className="official-badge-open">
                            View achievement <ExternalLink />
                          </span>
                        ) : null}
                      </div>
                    </>
                  )

                  return href ? (
                    <a
                      className="official-badge-card"
                      key={`${badge.title}-${index}`}
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {card}
                    </a>
                  ) : (
                    <article className="official-badge-card" key={`${badge.title}-${index}`}>
                      {card}
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="official-empty-badges">
                <div>
                  <BadgeCheck />
                  <strong>No public badges found</strong>
                  <p>This profile does not currently expose any earned badges.</p>
                </div>
              </div>
            )}
          </section>
        </div>

        <section className="official-profile-cta">
          <div>
            <strong>Check your own Arcade progress</strong>
            <span>Analyze a public Google Skills profile and review its Arcade score.</span>
          </div>
          <a className="official-button is-primary" href={getDashboardHref()}>
            Analyze profile <ExternalLink />
          </a>
        </section>
      </div>
    </main>
  )
}

export default function SharedProfileClient() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SharedProfileContent />
    </Suspense>
  )
}
