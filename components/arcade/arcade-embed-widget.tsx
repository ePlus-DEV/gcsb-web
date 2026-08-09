"use client"

import { ExternalLink, Gamepad2, LoaderCircle, Search, Trophy } from "lucide-react"
import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import { getFacilitatorAdjustedPoints } from "@/components/arcade/facilitator-points"
import { readFacilitatorParticipation } from "@/components/arcade/facilitator-participation"
import {
  API_URL,
  DASHBOARD_STORAGE_KEY,
  PROFILE_URL_PATTERN,
  getTier,
  numeric,
} from "@/components/arcade/model"
import type { ArcadeApiResponse } from "@/components/arcade/model"

const DEFAULT_DASHBOARD_URL = "https://arcade.eplus.dev/"

function sanitizeUtm(value: string | null, fallback: string): string {
  if (!value) return fallback
  return /^[a-zA-Z0-9._-]{1,80}$/.test(value) ? value : fallback
}

export default function ArcadeEmbedWidget() {
  const [profileUrl, setProfileUrl] = useState("")
  const [fullResultUrl, setFullResultUrl] = useState(DEFAULT_DASHBOARD_URL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<ArcadeApiResponse | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requestedProfileUrl = params.get("url")?.trim() ?? ""
    const normalizedRequestedProfileUrl = requestedProfileUrl.replace(/\/$/, "")

    if (PROFILE_URL_PATTERN.test(normalizedRequestedProfileUrl)) {
      setProfileUrl(requestedProfileUrl)
    }

    const target = new URL(DEFAULT_DASHBOARD_URL)
    target.searchParams.set("utm_source", sanitizeUtm(params.get("utm_source"), "hashnode"))
    target.searchParams.set("utm_medium", sanitizeUtm(params.get("utm_medium"), "widget"))
    target.searchParams.set("utm_campaign", sanitizeUtm(params.get("utm_campaign"), "arcade-widget"))
    setFullResultUrl(target.toString())
  }, [])

  const normalizedProfileUrl = profileUrl.trim().replace(/\/$/, "")
  const basePoints = numeric(result?.arcadePoints?.totalPoints)
  const facilitatorScore = result
    ? getFacilitatorAdjustedPoints(
        basePoints,
        {
          games: numeric(result.faciCounts?.faciGame),
          skills: numeric(result.faciCounts?.faciSkill),
        },
        readFacilitatorParticipation(normalizedProfileUrl),
      )
    : null
  const totalPoints = facilitatorScore?.totalPoints ?? basePoints
  const tier = getTier(totalPoints)
  const badgeCount = numeric(result?.beta?.profileBadgeCount) || (result?.badges?.length ?? 0)
  const userName = result?.userDetails?.[0]?.userName || "Google Skills learner"

  async function checkScore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = profileUrl.trim().replace(/\/$/, "")

    if (!PROFILE_URL_PATTERN.test(normalized)) {
      setError("Paste a valid public profile URL from skills.google.")
      setResult(null)
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized, season: "2026" }),
      })

      let payload: ArcadeApiResponse | null = null
      try {
        payload = (await response.json()) as ArcadeApiResponse
      } catch {
        // Keep the stable error below when the gateway returns invalid JSON.
      }

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "The profile could not be analyzed right now.")
      }

      setProfileUrl(normalized)
      setResult(payload)

      try {
        window.localStorage.setItem(
          DASHBOARD_STORAGE_KEY,
          JSON.stringify({ profileUrl: normalized, result: payload }),
        )
      } catch {
        // The mini checker still works when storage is unavailable.
      }
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : "The profile could not be analyzed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="arcade-embed-shell">
      <section className="arcade-widget-card" aria-label="Arcade Points mini score checker">
        <div className="arcade-widget-head">
          <div className="arcade-widget-brand-block">
            <span className="arcade-widget-icon" aria-hidden="true"><Gamepad2 /></span>
            <div className="arcade-widget-brand-copy">
              <strong>ARCADE POINTS</strong>
              <span>Google Cloud Arcade tracker · ePlus.DEV</span>
            </div>
          </div>
          <a className="arcade-widget-open-link" href={fullResultUrl} target="_blank" rel="noreferrer noopener">
            <span>Open full dashboard</span><ExternalLink />
          </a>
        </div>

        {!result ? (
          <>
            <div className="arcade-widget-copy">
              <h2>Check your Google Cloud Arcade score</h2>
              <p>Paste your public Google Skills profile URL to see your points and tier.</p>
            </div>

            <form className="arcade-widget-form" onSubmit={checkScore} noValidate>
              <label className={error ? "arcade-widget-input has-error" : "arcade-widget-input"}>
                <Search aria-hidden="true" />
                <input
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  value={profileUrl}
                  onChange={(event) => setProfileUrl(event.target.value)}
                  placeholder="https://www.skills.google/public_profiles/..."
                  aria-label="Google Skills public profile URL"
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? <LoaderCircle className="spin" /> : <Trophy />}
                <span>{loading ? "Checking..." : "Check score"}</span>
              </button>
            </form>
            {error ? <p className="arcade-widget-error" role="alert">{error}</p> : null}
          </>
        ) : (
          <div className="arcade-widget-result">
            <div className="arcade-widget-result-copy">
              <span>{userName}</span>
              <strong>{totalPoints}</strong>
              <small>Arcade points</small>
            </div>
            <div className="arcade-widget-result-meta">
              <span><b>{tier.name}</b> tier</span>
              <span><b>{badgeCount}</b> badges</span>
              {facilitatorScore && facilitatorScore.bonus > 0 ? (
                <span><b>+{facilitatorScore.bonus}</b> Facilitator bonus</span>
              ) : null}
            </div>
            <div className="arcade-widget-result-actions">
              <button type="button" onClick={() => { setResult(null); setError("") }}>
                Check another
              </button>
              <a href={fullResultUrl} target="_blank" rel="noreferrer noopener">
                View full result <ExternalLink />
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
