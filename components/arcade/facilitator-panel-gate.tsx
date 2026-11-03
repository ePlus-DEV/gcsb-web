"use client"

import { useEffect, useRef, useState } from "react"
import FacilitatorBonusMilestoneControl from "./facilitator-bonus-milestone-control"
import FacilitatorPanel from "./facilitator-panel"
import {
  FACILITATOR_PANEL_OPEN_EVENT,
  FACILITATOR_PARTICIPATION_EVENT,
  normalizeFacilitatorProfileUrl,
  readFacilitatorParticipation,
  type FacilitatorParticipationDetail,
} from "./facilitator-participation"
import { DASHBOARD_CHANGE_EVENT, readActiveDashboard, observeDashboardMode } from "./dashboard-state"
import { DASHBOARD_STORAGE_KEY } from "./model"

function readStoredProfileUrl(): string {
  return readActiveDashboard()?.profileUrl ?? ""
}

export default function FacilitatorPanelGate() {
  const [profileUrl, setProfileUrl] = useState("")
  const [participating, setParticipating] = useState(false)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const drawerWasOpenRef = useRef(false)

  useEffect(() => {
    const syncProfile = () => setProfileUrl(readStoredProfileUrl())

    const onStorage = (event: StorageEvent) => {
      if (event.key === DASHBOARD_STORAGE_KEY || event.key === null) syncProfile()
    }
    syncProfile()
    const stopObserving = observeDashboardMode(syncProfile)
    window.addEventListener(DASHBOARD_CHANGE_EVENT, syncProfile)
    window.addEventListener("focus", syncProfile)
    window.addEventListener("storage", onStorage)

    return () => {
      stopObserving()
      window.removeEventListener(DASHBOARD_CHANGE_EVENT, syncProfile)
      window.removeEventListener("focus", syncProfile)
      window.removeEventListener("storage", onStorage)
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
    window.addEventListener("focus", syncParticipation)
    window.addEventListener("storage", syncParticipation)
    window.addEventListener(
      FACILITATOR_PARTICIPATION_EVENT,
      onParticipationChange,
    )

    return () => {
      window.removeEventListener("focus", syncParticipation)
      window.removeEventListener("storage", syncParticipation)
      window.removeEventListener(
        FACILITATOR_PARTICIPATION_EVENT,
        onParticipationChange,
      )
    }
  }, [profileUrl])

  useEffect(() => {
    const restoreFocusWhenDrawerCloses = () => {
      const drawerIsOpen = Boolean(
        document.querySelector(".facilitator-overlay"),
      )

      if (drawerWasOpenRef.current && !drawerIsOpen) {
        const returnTarget = returnFocusRef.current
        if (returnTarget?.isConnected) returnTarget.focus()
        returnFocusRef.current = null
      }

      drawerWasOpenRef.current = drawerIsOpen
    }

    restoreFocusWhenDrawerCloses()
    const observer = new MutationObserver(restoreFocusWhenDrawerCloses)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const openPanel = () => {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null

      window.requestAnimationFrame(() => {
        const launcher =
          document.querySelector<HTMLButtonElement>(".facilitator-launcher")
        if (!launcher) return

        if (!launcher.hidden) launcher.click()
      })
    }

    window.addEventListener(FACILITATOR_PANEL_OPEN_EVENT, openPanel)
    return () =>
      window.removeEventListener(FACILITATOR_PANEL_OPEN_EVENT, openPanel)
  }, [])

  return (
    <>
      <FacilitatorPanel
        key={normalizeFacilitatorProfileUrl(profileUrl)}
      />
      <FacilitatorBonusMilestoneControl
        profileUrl={profileUrl}
        participating={participating}
      />
    </>
  )
}
