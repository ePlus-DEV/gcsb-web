"use client"

import { CalendarDays, ExternalLink, Gamepad2, GraduationCap, Trophy } from "lucide-react"
import { useMemo } from "react"

function sanitizeUtm(value: string | null, fallback: string): string {
  if (!value) return fallback
  return /^[a-zA-Z0-9._-]{1,80}$/.test(value) ? value : fallback
}

export default function ArcadeEmbedWidget() {
  const ctaUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "https://arcade.eplus.dev/?utm_source=hashnode&utm_medium=widget"
    }

    const params = new URLSearchParams(window.location.search)
    const source = sanitizeUtm(params.get("utm_source"), "hashnode")
    const medium = sanitizeUtm(params.get("utm_medium"), "widget")
    const campaign = sanitizeUtm(params.get("utm_campaign"), "arcade-widget")

    const target = new URL("https://arcade.eplus.dev/")
    target.searchParams.set("utm_source", source)
    target.searchParams.set("utm_medium", medium)
    target.searchParams.set("utm_campaign", campaign)

    return target.toString()
  }, [])

  return (
    <main className="arcade-embed-shell">
      <section className="arcade-embed-card" aria-label="Arcade Points by ePlus.DEV">
        <div className="arcade-embed-brand-row">
          <div className="arcade-embed-brand">
            <span className="arcade-embed-logo" aria-hidden="true"><Gamepad2 /></span>
            <div>
              <strong>ARCADE POINTS</strong>
              <span>by ePlus.DEV</span>
            </div>
          </div>
          <span className="arcade-embed-badge">FREE</span>
        </div>

        <div className="arcade-embed-copy">
          <div>
            <p className="arcade-embed-eyebrow">Google Cloud Arcade Tracker</p>
            <h1>Track your Arcade progress in one place.</h1>
            <p>
              Calculate points, follow milestones, discover monthly games and keep up with Facilitator bonuses.
            </p>
          </div>

          <div className="arcade-embed-features" aria-label="Arcade tracker features">
            <span><Trophy />Points &amp; tiers</span>
            <span><CalendarDays />Monthly games</span>
            <span><GraduationCap />Facilitator bonus</span>
          </div>
        </div>

        <div className="arcade-embed-footer">
          <span>arcade.eplus.dev</span>
          <a href={ctaUrl} target="_blank" rel="noreferrer noopener">
            Check your Arcade score
            <ExternalLink />
          </a>
        </div>
      </section>
    </main>
  )
}
