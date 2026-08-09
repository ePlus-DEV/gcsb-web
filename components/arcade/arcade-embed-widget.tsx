"use client"

import { ExternalLink, Gamepad2, GraduationCap, Sparkles, Trophy } from "lucide-react"
import { useMemo } from "react"

function sanitizeUtm(value: string | null, fallback: string): string {
  if (!value) return fallback
  return /^[a-zA-Z0-9._-]{1,80}$/.test(value) ? value : fallback
}

export default function ArcadeEmbedWidget() {
  const ctaUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://arcade.eplus.dev/?utm_source=hashnode&utm_medium=widget"
    const params = new URLSearchParams(window.location.search)
    const target = new URL("https://arcade.eplus.dev/")
    target.searchParams.set("utm_source", sanitizeUtm(params.get("utm_source"), "hashnode"))
    target.searchParams.set("utm_medium", sanitizeUtm(params.get("utm_medium"), "widget"))
    target.searchParams.set("utm_campaign", sanitizeUtm(params.get("utm_campaign"), "arcade-widget"))
    return target.toString()
  }, [])

  return (
    <main className="arcade-embed-shell">
      <a className="arcade-embed-card" href={ctaUrl} target="_blank" rel="noreferrer noopener" aria-label="Open Arcade Points by ePlus.DEV">
        <div className="arcade-embed-icon" aria-hidden="true"><Gamepad2 /></div>
        <div className="arcade-embed-content">
          <div className="arcade-embed-brand"><strong>ARCADE POINTS</strong><span>by ePlus.DEV</span></div>
          <h2>Track your Google Cloud Arcade progress.</h2>
          <p>Calculate points, follow milestones and keep up with monthly Arcade activities.</p>
          <div className="arcade-embed-features" aria-label="Features">
            <span><Trophy /> Points &amp; tiers</span>
            <span><Sparkles /> Monthly games</span>
            <span><GraduationCap /> Facilitator bonus</span>
          </div>
        </div>
        <div className="arcade-embed-cta"><span>Check your score</span><ExternalLink /></div>
      </a>
    </main>
  )
}
