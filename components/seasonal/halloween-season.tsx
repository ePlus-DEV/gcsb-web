"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import { usePortalTarget } from "@/components/use-portal-target"
import { shouldEnableHalloween } from "./halloween-model"

const SEASON_STORAGE_KEY = "arcade-seasonal-theme"

export default function HalloweenSeason() {
  const pathname = usePathname()
  const target = usePortalTarget(".arcade-dashboard-page")
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const previousSeason = root.dataset.season
    const restoreSeason = () => {
      if (previousSeason) root.dataset.season = previousSeason
      else delete root.dataset.season
    }
    const syncSeason = () => {
      let preference: string | null = null
      try {
        preference = window.localStorage.getItem(SEASON_STORAGE_KEY)
      } catch {
        // Storage is optional; the seasonal date window still works.
      }
      const active = shouldEnableHalloween(pathname ?? "/", preference, new Date())
      if (active) root.dataset.season = "halloween"
      else restoreSeason()
      setEnabled(active)
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === SEASON_STORAGE_KEY || event.key === null) syncSeason()
    }
    syncSeason()
    window.addEventListener("storage", onStorage)
    window.addEventListener("focus", syncSeason)
    // Also expire the skin if a tab stays open beyond November 2.
    const timer = window.setInterval(syncSeason, 60_000)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("focus", syncSeason)
      window.clearInterval(timer)
      restoreSeason()
    }
  }, [pathname])

  if (!enabled || !target) return null

  return createPortal(
    <div className="halloween-season-decor" aria-hidden="true">
      <div className="halloween-web halloween-web-left" />
      <div className="halloween-web halloween-web-right" />
      <span className="halloween-moon" />
      <span className="halloween-bat halloween-bat-one">🦇</span>
      <span className="halloween-bat halloween-bat-two">🦇</span>
      <span className="halloween-bat halloween-bat-three">🦇</span>
      <span className="halloween-pumpkin halloween-pumpkin-left">🎃</span>
      <span className="halloween-pumpkin halloween-pumpkin-right">🎃</span>
    </div>,
    target,
  )
}
