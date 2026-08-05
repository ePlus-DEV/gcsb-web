"use client"

import { useEffect } from "react"
import { DASHBOARD_STORAGE_KEY } from "@/components/arcade/model"

const PROFILE_ID_PATTERN = /public_profiles\/([0-9a-f-]{36})/i

function getLocalePrefix(): string {
  const segment = window.location.pathname.split("/").filter(Boolean)[0]
  return segment && segment !== "profile" ? `/${segment}` : ""
}

export default function ShareProfileEnhancer() {
  useEffect(() => {
    let disposed = false

    function installButton() {
      if (disposed || document.querySelector("[data-share-profile-button]")) return

      const target = document.querySelector(".profile-name-block")
      if (!target) return

      const button = document.createElement("button")
      button.type = "button"
      button.dataset.shareProfileButton = "true"
      button.className = "share-profile-button"
      button.textContent = "Share profile"
      button.setAttribute("aria-label", "Share this Arcade profile")

      button.addEventListener("click", async () => {
        try {
          const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
          const parsed = raw ? JSON.parse(raw) as { profileUrl?: string } : null
          const match = parsed?.profileUrl?.match(PROFILE_ID_PATTERN)
          if (!match?.[1]) throw new Error("Profile ID unavailable")

          const url = `${window.location.origin}${getLocalePrefix()}/profile/?id=${match[1]}`
          const title = "Google Cloud Arcade profile"

          if (navigator.share) {
            await navigator.share({ title, url })
            return
          }

          await navigator.clipboard.writeText(url)
          const original = button.textContent
          button.textContent = "Link copied"
          window.setTimeout(() => { button.textContent = original }, 1800)
        } catch {
          button.textContent = "Unable to share"
          window.setTimeout(() => { button.textContent = "Share profile" }, 1800)
        }
      })

      target.appendChild(button)
    }

    installButton()
    const observer = new MutationObserver(installButton)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      disposed = true
      observer.disconnect()
    }
  }, [])

  return null
}
