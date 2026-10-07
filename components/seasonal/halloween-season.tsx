"use client"

import { useEffect, useRef, useState } from "react"

const SEASON_STORAGE_KEY = "arcade-seasonal-theme"

function isHalloweenSeason(date: Date) {
  const month = date.getMonth()
  const day = date.getDate()

  return month === 9 || (month === 10 && day <= 2)
}

function isWidgetPath(pathname: string) {
  return /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?widget\/?$/i.test(pathname)
}

const LOTTIE_PLAYER_SCRIPT =
  "https://unpkg.com/@lottiefiles/lottie-player@2.0.12/dist/lottie-player.js"

const LOTTIE_ASSET_PATH = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/lottie/halloween-ghost.json`

type LottiePlayerElement = HTMLElement & {
  play?: () => void
  pause?: () => void
}

function HalloweenGhostLottie() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    let player: LottiePlayerElement | null = null
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    const syncPlayback = () => {
      if (!player) return
      if (document.hidden || motionQuery.matches) {
        player.pause?.()
      } else {
        player.play?.()
      }
    }

    const mountPlayer = async () => {
      try {
        if (!window.customElements.get("lottie-player")) {
          let script = document.querySelector<HTMLScriptElement>(
            'script[data-arcade-lottie="true"]',
          )

          if (!script) {
            script = document.createElement("script")
            script.type = "module"
            script.src = LOTTIE_PLAYER_SCRIPT
            script.dataset.arcadeLottie = "true"
            document.head.appendChild(script)
          }

          await Promise.race([
            window.customElements.whenDefined("lottie-player"),
            new Promise((_, reject) =>
              window.setTimeout(() => reject(new Error("dotLottie player timeout")), 6000),
            ),
          ])
        }

        if (!active || !hostRef.current) return

        player = document.createElement("lottie-player") as LottiePlayerElement
        player.setAttribute("src", LOTTIE_ASSET_PATH)
        player.setAttribute("background", "transparent")
        player.setAttribute("speed", "0.8")
        player.setAttribute("loop", "")
        player.setAttribute("autoplay", "")
        player.setAttribute("aria-hidden", "true")
        player.className = "halloween-lottie-player"
        hostRef.current.replaceChildren(player)
        setReady(true)
        syncPlayback()
      } catch {
        // Keep the lightweight CSS/emoji fallback when the runtime is blocked.
      }
    }

    void mountPlayer()
    document.addEventListener("visibilitychange", syncPlayback)
    motionQuery.addEventListener("change", syncPlayback)

    return () => {
      active = false
      document.removeEventListener("visibilitychange", syncPlayback)
      motionQuery.removeEventListener("change", syncPlayback)
      player?.pause?.()
      player?.remove()
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className={ready ? "halloween-lottie-ghost is-ready" : "halloween-lottie-ghost"}
      aria-hidden="true"
    >
      <span className="halloween-lottie-fallback">👻</span>
    </div>
  )
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
      <div className="halloween-web halloween-web-left" />
      <div className="halloween-web halloween-web-right" />
      <div className="halloween-fog halloween-fog-one" />
      <div className="halloween-fog halloween-fog-two" />
      <span className="halloween-moon"><span>☾</span></span>
      <HalloweenGhostLottie />
      <span className="halloween-ghost halloween-ghost-right">👻</span>
      <span className="halloween-bat halloween-bat-one">🦇</span>
      <span className="halloween-bat halloween-bat-two">🦇</span>
      <span className="halloween-bat halloween-bat-three">🦇</span>
      <span className="halloween-pumpkin halloween-pumpkin-left">🎃</span>
      <span className="halloween-pumpkin halloween-pumpkin-right">🎃</span>
      <div className="halloween-candy-line">
        <span>✦</span><span>◆</span><span>✦</span><span>◆</span><span>✦</span>
      </div>
    </div>
  )
}
