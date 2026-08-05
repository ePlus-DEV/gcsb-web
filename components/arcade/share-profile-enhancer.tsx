"use client"

import { useEffect } from "react"
import { DASHBOARD_STORAGE_KEY } from "@/components/arcade/model"

const PROFILE_ID_PATTERN = /public_profiles\/([0-9a-f-]{36})/i
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")
const LOCALE_SEGMENTS = new Set([
  "ar", "de", "es", "fr", "hi", "it", "ja", "ko", "pt-br", "ru", "vi", "zh-cn",
])

/** Builds the basePath- and locale-aware shared profile route. */
function getShareRoute(): string {
  const pathname = window.location.pathname
  const relativePath = BASE_PATH && pathname.startsWith(BASE_PATH)
    ? pathname.slice(BASE_PATH.length)
    : pathname
  const segment = relativePath.split("/").filter(Boolean)[0]?.toLowerCase()
  const localePrefix = segment && LOCALE_SEGMENTS.has(segment) ? `/${segment}` : ""

  return `${BASE_PATH}${localePrefix}/profile/`
}

/** Adds a standalone share action bar above the analyzed dashboard. */
export default function ShareProfileEnhancer() {
  useEffect(() => {
    let disposed = false
    let observer: MutationObserver | null = null

    function installShareAction(): boolean {
      if (disposed || document.querySelector("[data-share-profile-action]")) return true

      const dashboard = document.querySelector(".dashboard-shell")
      if (!dashboard) return false

      const actionBar = document.createElement("div")
      actionBar.dataset.shareProfileAction = "true"
      actionBar.className = "share-profile-action-bar"
      actionBar.innerHTML = `
        <div class="share-profile-action-copy">
          <strong>Share your Arcade profile</strong>
          <span>Create a public link to this score and badge summary.</span>
        </div>
        <button class="share-profile-action-button" type="button" aria-label="Share this Arcade profile">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 15 5c0 .2.02.4.06.58L8.91 9.1A3 3 0 0 0 7 8.5a3 3 0 1 0 1.91 5.4l6.15 3.52A3 3 0 0 0 15 18a3 3 0 1 0 .91-2.16L9.76 12.3a3 3 0 0 0 0-.6l6.15-3.54A3 3 0 0 0 18 8Z"/></svg>
          <span>Share profile</span>
        </button>
      `

      const button = actionBar.querySelector<HTMLButtonElement>("button")
      const label = actionBar.querySelector<HTMLSpanElement>("button span")
      if (!button || !label) return false

      button.addEventListener("click", async () => {
        const defaultLabel = "Share profile"

        try {
          const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
          const parsed = raw ? JSON.parse(raw) as { profileUrl?: string } : null
          const match = parsed?.profileUrl?.match(PROFILE_ID_PATTERN)
          if (!match?.[1]) throw new Error("Profile ID unavailable")

          const url = `${window.location.origin}${getShareRoute()}?id=${match[1]}`
          if (navigator.share) {
            await navigator.share({ title: "Google Cloud Arcade profile", url })
            return
          }

          await navigator.clipboard.writeText(url)
          label.textContent = "Link copied"
          button.classList.add("is-success")
          window.setTimeout(() => {
            label.textContent = defaultLabel
            button.classList.remove("is-success")
          }, 1800)
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return

          label.textContent = "Unable to share"
          button.classList.add("is-error")
          window.setTimeout(() => {
            label.textContent = defaultLabel
            button.classList.remove("is-error")
          }, 1800)
        }
      })

      dashboard.prepend(actionBar)
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
    }
  }, [])

  return (
    <style>{`
      .share-profile-action-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
        padding: .9rem 1rem;
        border: 1px solid rgba(124, 141, 255, .26);
        border-radius: 16px;
        background: linear-gradient(105deg, rgba(54, 39, 121, .5), rgba(17, 24, 39, .76));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
      }
      .share-profile-action-copy { min-width: 0; }
      .share-profile-action-copy strong,
      .share-profile-action-copy span { display: block; }
      .share-profile-action-copy strong { color: #fff; font-size: .95rem; }
      .share-profile-action-copy span { margin-top: .2rem; color: rgba(226,232,240,.72); font-size: .8rem; }
      .share-profile-action-button {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .5rem;
        min-height: 42px;
        border: 1px solid rgba(167,139,250,.55);
        border-radius: 11px;
        background: linear-gradient(135deg, #7c3aed, #4f46e5);
        color: #fff;
        padding: .65rem .9rem;
        font: inherit;
        font-size: .86rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 8px 22px rgba(79,70,229,.24);
        transition: transform .18s ease, filter .18s ease;
      }
      .share-profile-action-button:hover { filter: brightness(1.08); transform: translateY(-1px); }
      .share-profile-action-button svg { width: 17px; height: 17px; fill: currentColor; }
      .share-profile-action-button.is-success { background: linear-gradient(135deg, #059669, #047857); border-color: #34d399; }
      .share-profile-action-button.is-error { background: linear-gradient(135deg, #dc2626, #b91c1c); border-color: #f87171; }
      @media (max-width: 640px) {
        .share-profile-action-bar { align-items: stretch; flex-direction: column; }
        .share-profile-action-button { width: 100%; }
      }
    `}</style>
  )
}
