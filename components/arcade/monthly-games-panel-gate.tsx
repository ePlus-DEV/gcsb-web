"use client"

import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"
import MonthlyGamesPanel from "./monthly-games-panel"
import {
  DASHBOARD_STORAGE_KEY,
  type ArcadeApiResponse,
  type ArcadeBadge,
} from "./model"

const DASHBOARD_SYNC_INTERVAL_MS = 1_000
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

function readStoredRaw(): string {
  try {
    return window.localStorage.getItem(DASHBOARD_STORAGE_KEY) ?? ""
  } catch {
    return ""
  }
}

function parseStoredResult(raw: string): ArcadeApiResponse | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as { result?: ArcadeApiResponse }
    const result = parsed.result
    return result && typeof result === "object" ? result : null
  } catch {
    return null
  }
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
  const lastRawRef = useRef<string | null>(null)

  useEffect(() => {
    const sync = () => {
      const nextHost = findMonthlyGamesHost()
      setHost((current) => (current === nextHost ? current : nextHost))

      const raw = readStoredRaw()
      if (raw === lastRawRef.current) return

      lastRawRef.current = raw
      const result = parseStoredResult(raw)
      setHasProfile(Boolean(result))
      setBadges(parseStoredBadges(result))
    }

    sync()
    const timer = window.setInterval(sync, DASHBOARD_SYNC_INTERVAL_MS)
    const observer = new MutationObserver((records) => {
      const hasExternalMutation = records.some((record) => {
        const target = record.target instanceof Element ? record.target : record.target.parentElement
        return !target?.closest(`.${HOST_CLASS_NAME}`)
      })

      if (hasExternalMutation) sync()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener("focus", sync)
    window.addEventListener("storage", sync)

    return () => {
      window.clearInterval(timer)
      observer.disconnect()
      window.removeEventListener("focus", sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  if (!host) return null
  return createPortal(<MonthlyGamesPanel badges={badges} hasProfile={hasProfile} />, host)
}
