"use client"

import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import MonthlyGamesPanel from "./monthly-games-panel"
import {
  DASHBOARD_STORAGE_KEY,
  type ArcadeApiResponse,
  type ArcadeBadge,
} from "./model"

const DASHBOARD_SYNC_INTERVAL_MS = 750
const HOST_CLASS_NAME = "monthly-games-host"

function readStoredBadges(): ArcadeBadge[] {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as { result?: ArcadeApiResponse }
    const result = parsed.result
    if (!result || typeof result !== "object") return []

    return result.badges ?? [
      ...(result.game ?? []),
      ...(result.trivia ?? []),
      ...(result.skill ?? []),
      ...(result.completion ?? []),
      ...(result.special ?? []),
    ]
  } catch {
    return []
  }
}

function ensureMonthlyGamesHost(): HTMLElement | null {
  const shell = document.querySelector<HTMLElement>(".dashboard-shell")
  if (!shell) return null

  const existing = shell.querySelector<HTMLElement>(`:scope > .${HOST_CLASS_NAME}`)
  if (existing) return existing

  const host = document.createElement("div")
  host.className = HOST_CLASS_NAME
  shell.prepend(host)
  return host
}

export default function MonthlyGamesPanelGate() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [badges, setBadges] = useState<ArcadeBadge[]>([])

  useEffect(() => {
    const sync = () => {
      setHost(ensureMonthlyGamesHost())
      setBadges(readStoredBadges())
    }

    sync()
    const timer = window.setInterval(sync, DASHBOARD_SYNC_INTERVAL_MS)
    const observer = new MutationObserver(sync)
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
