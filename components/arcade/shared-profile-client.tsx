"use client"

import { useEffect, useMemo, useState } from "react"
import { API_URL, type ArcadeApiResponse, numeric } from "@/components/arcade/model"

const PROFILE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ArcadeApiResponse; profileUrl: string }

export default function SharedProfileClient() {
  const [state, setState] = useState<State>({ status: "loading" })
  const profileId = useMemo(() => {
    if (typeof window === "undefined") return ""
    return new URLSearchParams(window.location.search).get("id")?.trim() ?? ""
  }, [])

  useEffect(() => {
    if (!PROFILE_ID_PATTERN.test(profileId)) {
      setState({ status: "error", message: "This shared profile link is invalid." })
      return
    }

    const controller = new AbortController()
    const profileUrl = `https://www.skills.google/public_profiles/${profileId}`

    void fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: profileUrl, season: "2026" }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json() as ArcadeApiResponse
        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "The shared profile could not be loaded.")
        }
        setState({ status: "ready", data: payload, profileUrl })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "The shared profile could not be loaded.",
        })
      })

    return () => controller.abort()
  }, [profileId])

  if (state.status === "loading") {
    return <main className="shared-profile-page"><div className="shared-profile-card"><p>Loading shared profile…</p></div></main>
  }

  if (state.status === "error") {
    return (
      <main className="shared-profile-page">
        <div className="shared-profile-card">
          <h1>Profile unavailable</h1>
          <p>{state.message}</p>
          <a className="shared-profile-primary" href="../">Check your own profile</a>
        </div>
      </main>
    )
  }

  const profile = state.data.userDetails?.[0]
  const points = numeric(state.data.arcadePoints?.totalPoints)
  const badges = state.data.badges ?? [
    ...(state.data.game ?? []),
    ...(state.data.trivia ?? []),
    ...(state.data.skill ?? []),
    ...(state.data.completion ?? []),
    ...(state.data.special ?? []),
  ]

  return (
    <main className="shared-profile-page">
      <article className="shared-profile-card">
        <p className="shared-profile-kicker">Shared Google Cloud Arcade profile</p>
        <div className="shared-profile-heading">
          {profile?.profileImage ? <img src={profile.profileImage} alt="" /> : null}
          <div>
            <h1>{profile?.userName || "Google Skills learner"}</h1>
            <p>{profile?.memberSince ? `Member since ${profile.memberSince}` : "Public Google Skills profile"}</p>
          </div>
        </div>
        <div className="shared-profile-stats">
          <div><strong>{points}</strong><span>Arcade points</span></div>
          <div><strong>{badges.length}</strong><span>Badges</span></div>
          <div><strong>{state.data.milestone || profile?.league || "—"}</strong><span>Tier</span></div>
        </div>
        <div className="shared-profile-actions">
          <a className="shared-profile-primary" href="../">Check your own profile</a>
          <a href={state.profileUrl} target="_blank" rel="noreferrer noopener">View on Google Skills</a>
        </div>
      </article>
    </main>
  )
}
