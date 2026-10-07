"use client"

import { useEffect, useState } from "react"

const SEASON_STORAGE_KEY = "arcade-seasonal-theme"

function isHalloweenSeason(date: Date) {
  const month = date.getMonth()
  const day = date.getDate()

  return month === 9 || (month === 10 && day <= 2)
}

function isWidgetPath(pathname: string) {
  return /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?widget\/?$/i.test(pathname)
}

export default function HalloweenSeason() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (isWidgetPath(window.location.pathname)) return

    let preference: string | null = null
    try {
      preference = window.localStorage.getItem(SEASON_STORAGE_KEY)
    } catch {
      // Storage is optional; the seasonal date window still works.
    }

    const shouldEnable =
      preference === "halloween" ||
      (preference !== "off" && isHalloweenSeason(new Date()))

    if (!shouldEnable) return

    const root = document.documentElement
    const previousSeason = root.dataset.season
    root.dataset.season = "halloween"
    setEnabled(true)

    return () => {
      if (previousSeason) {
        root.dataset.season = previousSeason
      } else {
        delete root.dataset.season
      }
    }
  }, [])

  if (!enabled) return null

  return (
    <div className="halloween-season-decor" aria-hidden="true">
      <span className="halloween-moon">☾</span>
      <span className="halloween-bat halloween-bat-one">🦇</span>
      <span className="halloween-bat halloween-bat-two">🦇</span>
      <span className="halloween-bat halloween-bat-three">🦇</span>
      <span className="halloween-pumpkin halloween-pumpkin-left">🎃</span>
      <span className="halloween-pumpkin halloween-pumpkin-right">🎃</span>
    </div>
  )
}
