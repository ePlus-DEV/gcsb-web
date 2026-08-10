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
const NAV_HREF = `#${HOST_ID}`

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

function ensureMonthlyGamesNavLink() {
  const nav = document.querySelector<HTMLElement>(".arcade-nav")
  if (!nav || nav.querySelector(`a[href="${NAV_HREF}"]`)) return

  const link = document.createElement("a")
  link.href = NAV_HREF
  link.textContent = "Monthly labs"
  link.addEventListener("click", () => {
    const expandedToggle = document.querySelector<HTMLButtonElement>(
      '.mobile-menu-toggle[aria-expanded="true"]',
    )
    expandedToggle?.click()
  })
  nav.append(link)
}

function ensureMonthlyGamesHost(): HTMLElement | null {
  const page = document.querySelector<HTMLElement>(".arcade-dashboard-page")
  if (!page) return null

  const shell = page.querySelector<HTMLElement>(
    ':scope > .dashboard-shell[aria-label="Arcade profile results"]',
  )
  const summary = shell?.querySelector<HTMLElement>(":scope > .dashboard-summary-grid") ?? null
  const footer = page.querySelector<HTMLElement>(":scope > .arcade-footer")
  let host = page.querySelector<HTMLElement>(`.${HOST_CLASS_NAME}`)

  if (!host) {
    host = document.createElement("div")
    host.id = HOST_ID
    host.className = HOST_CLASS_NAME
  }

  if (summary) {
    if (summary.nextElementSibling !== host) summary.insertAdjacentElement("afterend", host)
  } else if (footer) {
    if (footer.previousElementSibling !== host) footer.insertAdjacentElement("beforebegin", host)
  } else if (!host.isConnected) {
    page.append(host)
  }

  // Before a profile is analyzed there is no results shell. Reuse the
  // dashboard-shell sizing class so Monthly Labs keeps the same responsive
  // width instead of stretching edge-to-edge as a direct page child.
  host.classList.toggle("dashboard-shell", !shell)

  return host
}

export default function MonthlyGamesPanelGate() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [badges, setBadges] = useState<ArcadeBadge[]>([])
  const [hasProfile, setHasProfile] = useState(false)
  const lastRawRef = useRef<string | null>(null)

  useEffect(() => {
    const sync = () => {
      ensureMonthlyGamesNavLink()
      const nextHost = ensureMonthlyGamesHost()
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
