"use client"

import { useEffect } from "react"
import { readFacilitatorBonusMilestoneCompletion } from "@/components/arcade/facilitator-bonus-milestone"
import { readFacilitatorParticipation } from "@/components/arcade/facilitator-participation"
import { DASHBOARD_STORAGE_KEY } from "@/components/arcade/model"

const PROFILE_ID_PATTERN =
  /public_profiles\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:[/?#]|$)/i
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")

function getShareUrl(): string {
  const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) as { profileUrl?: string } : null
  const match = parsed?.profileUrl?.match(PROFILE_ID_PATTERN)
  if (!match?.[1]) throw new Error("Profile ID unavailable")

  // Static PR previews cannot serve arbitrary `/profiles/<id>` paths because
  // those paths do not exist in the exported output. Use the real exported
  // `/profile/` page there, while keeping the friendly URL in production.
  const shareUrl = BASE_PATH
    ? new URL(`${window.location.origin}${BASE_PATH}/profile/`)
    : new URL(`${window.location.origin}/profiles/${match[1]}`)

  if (BASE_PATH) {
    shareUrl.searchParams.set("id", match[1])
  }

  const facilitatorParticipating = readFacilitatorParticipation(parsed?.profileUrl)
  if (facilitatorParticipating) {
    shareUrl.searchParams.set("facilitator", "1")

    if (readFacilitatorBonusMilestoneCompletion(parsed?.profileUrl)) {
      shareUrl.searchParams.set("bonus", "1")
    }
  }

  return shareUrl.toString()
}

export default function ShareProfileEnhancer() {
  useEffect(() => {
    let disposed = false
    let observer: MutationObserver | null = null
    let resetTimer: number | null = null

    function installShareAction(): boolean {
      if (disposed) return true

      const page = document.querySelector<HTMLElement>(".arcade-dashboard-page")
      if (page?.dataset.dashboardDebugFake === "true") {
        document.querySelector("[data-share-profile-action]")?.remove()
        document.querySelector(".has-profile-share-action")?.classList.remove("has-profile-share-action")
        return true
      }

      if (document.querySelector("[data-share-profile-action]")) return true

      const dashboard = document.querySelector(".dashboard-shell")
      const profilePanel = dashboard?.querySelector<HTMLElement>(".dashboard-panel")
      if (!dashboard || !profilePanel) return false

      profilePanel.classList.add("has-profile-share-action")

      const button = document.createElement("button")
      button.dataset.shareProfileAction = "true"
      button.className = "profile-share-fab"
      button.type = "button"
      button.setAttribute("aria-label", "Share this Arcade profile")
      button.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 15 5c0 .2.02.4.06.58L8.91 9.1A3 3 0 0 0 7 8.5a3 3 0 1 0 1.91 5.4l6.15 3.52A3 3 0 0 0 15 18a3 3 0 1 0 .91-2.16L9.76 12.3a3 3 0 0 0 0-.6l6.15-3.54A3 3 0 0 0 18 8Z"/></svg>
        <span>Share</span>
      `

      const label = button.querySelector<HTMLSpanElement>("span")
      if (!label) return false

      const resetState = () => {
        label.textContent = "Share"
        button.classList.remove("is-success", "is-error")
      }

      const scheduleReset = () => {
        if (resetTimer !== null) window.clearTimeout(resetTimer)
        resetTimer = window.setTimeout(resetState, 1800)
      }

      button.addEventListener("click", async () => {
        try {
          const url = getShareUrl()

          if (navigator.share) {
            try {
              await navigator.share({ title: "Google Cloud Arcade profile", url })
              return
            } catch (error) {
              if (error instanceof DOMException && error.name === "AbortError") return
            }
          }

          if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable")
          await navigator.clipboard.writeText(url)
          label.textContent = "Copied"
          button.classList.add("is-success")
          scheduleReset()
        } catch {
          label.textContent = "Failed"
          button.classList.add("is-error")
          scheduleReset()
        }
      })

      profilePanel.append(button)
      return true
    }

    installShareAction()
    observer = new MutationObserver(() => installShareAction())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      disposed = true
      observer?.disconnect()
      if (resetTimer !== null) window.clearTimeout(resetTimer)
      document.querySelector("[data-share-profile-action]")?.remove()
      document.querySelector(".has-profile-share-action")?.classList.remove("has-profile-share-action")
    }
  }, [])

  return null
}
