"use client"

import { useEffect } from "react"
import { DASHBOARD_STORAGE_KEY } from "@/components/arcade/model"

const PROFILE_ID_PATTERN =
  /public_profiles\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:[/?#]|$)/i
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")

function getShareUrl(): string {
  const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) as { profileUrl?: string } : null
  const match = parsed?.profileUrl?.match(PROFILE_ID_PATTERN)
  if (!match?.[1]) throw new Error("Profile ID unavailable")

  return `${window.location.origin}${BASE_PATH}/profiles/${match[1]}`
}

export default function ShareProfileEnhancer() {
  useEffect(() => {
    let disposed = false
    let observer: MutationObserver | null = null
    let resetTimer: number | null = null

    function installShareAction(): boolean {
      if (disposed || document.querySelector("[data-share-profile-action]")) return true

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
      observer?.disconnect()
      observer = null
      return true
    }

    if (!installShareAction()) {
      observer = new MutationObserver(() => installShareAction())
      observer.observe(document.body, { childList: true, subtree: true })
    }

    return () => {
      disposed = true
      observer?.disconnect()
      if (resetTimer !== null) window.clearTimeout(resetTimer)
      document.querySelector("[data-share-profile-action]")?.remove()
      document.querySelector(".has-profile-share-action")?.classList.remove("has-profile-share-action")
    }
  }, [])

  return (
    <style>{`
      .has-profile-share-action {
        position: relative;
      }
      .has-profile-share-action > :first-child {
        padding-right: 6.25rem;
      }
      .profile-share-fab {
        position: absolute;
        top: .85rem;
        right: .85rem;
        z-index: 2;
        min-height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .4rem;
        border: 1px solid rgba(129, 154, 255, .28);
        border-radius: 10px;
        padding: .42rem .65rem;
        background: rgba(61, 76, 155, .16);
        color: #a9c7ff;
        font: inherit;
        font-size: .72rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: none;
        transition: background .18s ease, border-color .18s ease, color .18s ease, transform .18s ease;
      }
      .profile-share-fab:hover {
        border-color: rgba(116, 154, 255, .58);
        background: rgba(67, 92, 190, .26);
        color: #fff;
        transform: translateY(-1px);
      }
      .profile-share-fab:focus-visible {
        outline: 3px solid rgba(132, 204, 255, .3);
        outline-offset: 2px;
      }
      .profile-share-fab svg {
        width: 14px;
        height: 14px;
        flex: 0 0 14px;
        fill: currentColor;
      }
      .profile-share-fab.is-success {
        border-color: rgba(52, 211, 153, .5);
        background: rgba(5, 150, 105, .18);
        color: #6ee7b7;
      }
      .profile-share-fab.is-error {
        border-color: rgba(248, 113, 113, .5);
        background: rgba(220, 38, 38, .16);
        color: #fca5a5;
      }
      html[data-theme="light"] .profile-share-fab {
        border-color: rgba(79, 70, 229, .18);
        background: rgba(79, 70, 229, .06);
        color: #4f46e5;
      }
      html[data-theme="light"] .profile-share-fab:hover {
        border-color: rgba(79, 70, 229, .34);
        background: rgba(79, 70, 229, .1);
      }
      @media (max-width: 520px) {
        .has-profile-share-action > :first-child {
          padding-right: 3.5rem;
        }
        .profile-share-fab {
          width: 34px;
          height: 34px;
          min-height: 34px;
          padding: 0;
          border-radius: 50%;
        }
        .profile-share-fab span {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .profile-share-fab { transition: none; }
      }
    `}</style>
  )
}
