"use client"

import { useEffect, useMemo, useState } from "react"
import { API_URL, type ArcadeApiResponse, numeric } from "@/components/arcade/model"

const PROFILE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ArcadeApiResponse; profileUrl: string }

function Styles() {
  return <style>{`
    .shared-profile-page { min-height: 100vh; display: grid; place-items: center; padding: 2rem; background: radial-gradient(circle at top, #172554, #020617 65%); color: #f8fafc; }
    .shared-profile-card { width: min(760px, 100%); border: 1px solid rgba(148,163,184,.25); border-radius: 24px; padding: clamp(1.25rem, 4vw, 2.5rem); background: rgba(15,23,42,.88); box-shadow: 0 24px 80px rgba(0,0,0,.35); }
    .shared-profile-kicker { margin: 0 0 1.25rem; color: #93c5fd; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; font-size: .78rem; }
    .shared-profile-heading { display: flex; align-items: center; gap: 1rem; }
    .shared-profile-heading img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(147,197,253,.55); }
    .shared-profile-heading h1 { margin: 0; font-size: clamp(1.6rem, 5vw, 2.6rem); }
    .shared-profile-heading p { margin: .35rem 0 0; color: #cbd5e1; }
    .shared-profile-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: .8rem; margin: 2rem 0; }
    .shared-profile-stats div { padding: 1rem; border-radius: 16px; background: rgba(30,41,59,.82); }
    .shared-profile-stats strong, .shared-profile-stats span { display: block; }
    .shared-profile-stats strong { font-size: 1.45rem; }
    .shared-profile-stats span { margin-top: .3rem; color: #94a3b8; font-size: .88rem; }
    .shared-profile-actions { display: flex; flex-wrap: wrap; gap: .75rem; }
    .shared-profile-actions a, .shared-profile-primary { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: .7rem 1rem; border-radius: 12px; border: 1px solid rgba(148,163,184,.35); color: #f8fafc; text-decoration: none; font-weight: 800; }
    .shared-profile-primary { background: #2563eb; border-color: #2563eb !important; }
    @media (max-width: 640px) { .shared-profile-stats { grid-template-columns: 1fr; } }
  `}</style>
}

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
        if (!response.ok || !payload.success) throw new Error(payload.message || "The shared profile could not be loaded.")
        setState({ status: "ready", data: payload, profileUrl })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setState({ status: "error", message: error instanceof Error ? error.message : "The shared profile could not be loaded." })
      })

    return () => controller.abort()
  }, [profileId])

  if (state.status === "loading") return <main className="shared-profile-page"><Styles /><div className="shared-profile-card"><p>Loading shared profile…</p></div></main>

  if (state.status === "error") {
    return <main className="shared-profile-page"><Styles /><div className="shared-profile-card"><h1>Profile unavailable</h1><p>{state.message}</p><a className="shared-profile-primary" href="../">Check your own profile</a></div></main>
  }

  const profile = state.data.userDetails?.[0]
  const points = numeric(state.data.arcadePoints?.totalPoints)
  const badges = state.data.badges ?? [...(state.data.game ?? []), ...(state.data.trivia ?? []), ...(state.data.skill ?? []), ...(state.data.completion ?? []), ...(state.data.special ?? [])]

  return (
    <main className="shared-profile-page">
      <Styles />
      <article className="shared-profile-card">
        <p className="shared-profile-kicker">Shared Google Cloud Arcade profile</p>
        <div className="shared-profile-heading">
          {profile?.profileImage ? <img src={profile.profileImage} alt="" /> : null}
          <div><h1>{profile?.userName || "Google Skills learner"}</h1><p>{profile?.memberSince ? `Member since ${profile.memberSince}` : "Public Google Skills profile"}</p></div>
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
