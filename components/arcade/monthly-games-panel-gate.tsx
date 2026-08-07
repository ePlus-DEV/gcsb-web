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

function parseStoredBadges(raw: string): ArcadeBadge[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as { result?: ArcadeApiResponse }
    const result = parsed.result
    if (!result || typeof result !== "object") return []

    if (result.badges !== undefined) return asBadgeArray(result.badges)

    return [
      ...asBadgeArray(result.game),
      ...asBadgeArray(result.trivia),
      ...asBadgeArray(result.skill),
      ...asBadgeArray(result.completion),
      ...asBadgeArray(result.special),
    ]
  } catch {
    return []
  }
}

function ensureMonthlyGamesHost(): HTMLElement | null {
  const shell = document.querySelector<HTMLElement>(".dashboard-shell")
  if (!shell) return null

  const summary = shell.querySelector<HTMLElement>(":scope > .dashboard-summary-grid")
  if (!summary) return null

  const existing = shell.querySelector<HTMLElement>(`:scope > .${HOST_CLASS_NAME}`)
  if (existing) {
    if (summary.nextElementSibling !== existing) {
      summary.insertAdjacentElement("afterend", existing)
    }
    return existing
  }

  const host = document.createElement("div")
  host.className = HOST_CLASS_NAME
  summary.insertAdjacentElement("afterend", host)
  return host
}

export default function MonthlyGamesPanelGate() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [badges, setBadges] = useState<ArcadeBadge[]>([])
  const lastRawRef = useRef<string | null>(null)

  useEffect(() => {
    const sync = () => {
      const nextHost = ensureMonthlyGamesHost()
      setHost((current) => (current === nextHost ? current : nextHost))

      const raw = readStoredRaw()
      if (raw === lastRawRef.current) return

      lastRawRef.current = raw
      setBadges(parseStoredBadges(raw))
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
  return createPortal(<MonthlyGamesPanel badges={badges} />, host)
}
