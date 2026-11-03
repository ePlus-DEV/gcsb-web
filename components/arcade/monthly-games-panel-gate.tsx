"use client"

import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import MonthlyGamesPanel from "./monthly-games-panel"
import { DASHBOARD_CHANGE_EVENT, readActiveDashboard, observeDashboardMode } from "./dashboard-state"
import {
  DASHBOARD_STORAGE_KEY,
  type ArcadeApiResponse,
  type ArcadeBadge,
} from "./model"

const HOST_CLASS_NAME = "monthly-games-host"
const HOST_ID = "monthly-games"

function asBadgeArray(value: unknown): ArcadeBadge[] {
  if (!Array.isArray(value)) return []

  return value.filter(
    (item): item is ArcadeBadge =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as { title?: unknown }).title === "string",
  )
}

function parseStoredBadges(result: ArcadeApiResponse | null): ArcadeBadge[] {
  if (!result) return []
  if (result.badges !== undefined) return asBadgeArray(result.badges)

  return [
    ...asBadgeArray(result.game),
    ...asBadgeArray(result.trivia),
    ...asBadgeArray(result.skill),
    ...asBadgeArray(result.completion),
    ...asBadgeArray(result.special),
  ]
}

/** The host belongs to React's shared homepage DOM, never to a translated label. */
function findMonthlyGamesHost(): HTMLElement | null {
  const page = document.querySelector<HTMLElement>(".arcade-dashboard-page")
  return page?.querySelector<HTMLElement>(`#${HOST_ID}.${HOST_CLASS_NAME}`) ?? null
}

export default function MonthlyGamesPanelGate() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [badges, setBadges] = useState<ArcadeBadge[]>([])
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    let previousResult: ArcadeApiResponse | null | undefined
    const sync = () => {
      const nextHost = findMonthlyGamesHost()
      setHost((current) => (current === nextHost ? current : nextHost))

      const dashboard = readActiveDashboard()
      const result = dashboard?.result ?? null
      setHasProfile(Boolean(dashboard))
      if (result === previousResult) return
      previousResult = result
      setBadges(parseStoredBadges(result))
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === DASHBOARD_STORAGE_KEY || event.key === null) sync()
    }

    sync()
    const stopObserving = observeDashboardMode(sync)
    window.addEventListener(DASHBOARD_CHANGE_EVENT, sync)
    window.addEventListener("focus", sync)
    window.addEventListener("storage", onStorage)

    return () => {
      stopObserving()
      window.removeEventListener(DASHBOARD_CHANGE_EVENT, sync)
      window.removeEventListener("focus", sync)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  if (!host) return null
  return createPortal(<MonthlyGamesPanel badges={badges} hasProfile={hasProfile} />, host)
}
