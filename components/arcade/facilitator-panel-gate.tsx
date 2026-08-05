"use client"

import { useEffect, useState } from "react"
import FacilitatorPanel from "./facilitator-panel"
import {
  FACILITATOR_PANEL_OPEN_EVENT,
  FACILITATOR_PARTICIPATION_EVENT,
  normalizeFacilitatorProfileUrl,
  readFacilitatorParticipation,
  type FacilitatorParticipationDetail,
} from "./facilitator-participation"
import { DASHBOARD_STORAGE_KEY } from "./model"

const DASHBOARD_SYNC_INTERVAL_MS = 1_000

function readStoredProfileUrl(): string {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!raw) return ""

    const parsed = JSON.parse(raw) as { profileUrl?: unknown }
    return typeof parsed.profileUrl === "string" ? parsed.profileUrl : ""
  } catch {
    return ""
  }
}

export default function FacilitatorPanelGate() {
  const [profileUrl, setProfileUrl] = useState("")
  const [participating, setParticipating] = useState(false)

  useEffect(() => {
    const syncProfile = () => setProfileUrl(readStoredProfileUrl())

    syncProfile()
    const timer = window.setInterval(syncProfile, DASHBOARD_SYNC_INTERVAL_MS)
    window.addEventListener("focus", syncProfile)
    window.addEventListener("storage", syncProfile)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", syncProfile)
      window.removeEventListener("storage", syncProfile)
    }
  }, [])

  useEffect(() => {
    const syncParticipation = () => {
      setParticipating(readFacilitatorParticipation(profileUrl))
    }

    const onParticipationChange = (event: Event) => {
      const detail = (event as CustomEvent<FacilitatorParticipationDetail>)
        .detail
      if (!detail) return

      if (
        normalizeFacilitatorProfileUrl(detail.profileUrl) ===
        normalizeFacilitatorProfileUrl(profileUrl)
      ) {
        setParticipating(detail.participating)
      }
    }

    syncParticipation()
    const timer = window.setInterval(syncParticipation, 750)
    window.addEventListener("focus", syncParticipation)
    window.addEventListener("storage", syncParticipation)
    window.addEventListener(
      FACILITATOR_PARTICIPATION_EVENT,
      onParticipationChange,
    )

    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", syncParticipation)
      window.removeEventListener("storage", syncParticipation)
      window.removeEventListener(
        FACILITATOR_PARTICIPATION_EVENT,
        onParticipationChange,
      )
    }
  }, [profileUrl])

  useEffect(() => {
    const updateLauncherVisibility = () => {
      const launcher =
        document.querySelector<HTMLButtonElement>(".facilitator-launcher")
      if (!launcher) return

      launcher.hidden =
        !participating || !launcher.classList.contains("is-participating")
    }

    updateLauncherVisibility()
    const observer = new MutationObserver(updateLauncherVisibility)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [participating])

  useEffect(() => {
    const openPanel = () => {
      window.requestAnimationFrame(() => {
        const launcher =
          document.querySelector<HTMLButtonElement>(".facilitator-launcher")
        if (!launcher) return

        const wasHidden = launcher.hidden
        launcher.hidden = false
        launcher.click()
        launcher.hidden = wasHidden
      })
    }

    window.addEventListener(FACILITATOR_PANEL_OPEN_EVENT, openPanel)
    return () =>
      window.removeEventListener(FACILITATOR_PANEL_OPEN_EVENT, openPanel)
  }, [])

  return (
    <FacilitatorPanel
      key={`${normalizeFacilitatorProfileUrl(profileUrl)}:${participating}`}
    />
  )
}
