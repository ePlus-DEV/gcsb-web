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

/** Adds a compact share action above the analyzed dashboard. */
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
        <span class="share-profile-action-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 15 5c0 .2.02.4.06.58L8.91 9.1A3 3 0 0 0 7 8.5a3 3 0 1 0 1.91 5.4l6.15 3.52A3 3 0 0 0 15 18a3 3 0 1 0 .91-2.16L9.76 12.3a3 3 0 0 0 0-.6l6.15-3.54A3 3 0 0 0 18 8Z"/></svg>
        </span>
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
        position: relative;
        isolation: isolate;
        overflow: hidden;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: .85rem;
        margin-bottom: 1rem;
        padding: .8rem .9rem;
        border: 1px solid rgba(124, 141, 255, .22);
        border-radius: 18px;
        background:
          radial-gradient(circle at 92% 20%, rgba(63, 199, 241, .12), transparent 30%),
          linear-gradient(120deg, rgba(44, 35, 100, .54), rgba(12, 18, 39, .82));
        box-shadow:
          0 14px 38px rgba(0, 0, 0, .16),
          inset 0 1px 0 rgba(255, 255, 255, .045);
      }
      .share-profile-action-bar::after {
        content: "";
        position: absolute;
        z-index: -1;
        width: 150px;
        height: 150px;
        right: -74px;
        top: -86px;
        border-radius: 50%;
        border: 34px solid rgba(124, 92, 255, .07);
        pointer-events: none;
      }
      .share-profile-action-icon {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(128, 191, 255, .22);
        border-radius: 13px;
        color: #8ee8ff;
        background: rgba(66, 177, 224, .09);
      }
      .share-profile-action-icon svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }
      .share-profile-action-copy { min-width: 0; }
      .share-profile-action-copy strong,
      .share-profile-action-copy span { display: block; }
      .share-profile-action-copy strong {
        color: #fff;
        font-size: .9rem;
        letter-spacing: -.01em;
      }
      .share-profile-action-copy span {
        margin-top: .18rem;
        color: rgba(203, 213, 225, .68);
        font-size: .76rem;
      }
      .share-profile-action-button {
        position: relative;
        z-index: 1;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .48rem;
        min-height: 40px;
        border: 1px solid rgba(167, 139, 250, .42);
        border-radius: 12px;
        background: linear-gradient(135deg, #7658f6, #3978ef);
        color: #fff;
        padding: .58rem .82rem;
        font: inherit;
        font-size: .8rem;
        font-weight: 850;
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(73, 74, 214, .24);
        transition: transform .18s ease, filter .18s ease, box-shadow .18s ease;
      }
      .share-profile-action-button:hover {
        filter: brightness(1.08);
        transform: translateY(-1px);
        box-shadow: 0 14px 30px rgba(73, 74, 214, .3);
      }
      .share-profile-action-button:focus-visible {
        outline: 3px solid rgba(132, 204, 255, .35);
        outline-offset: 2px;
      }
      .share-profile-action-button svg {
        width: 15px;
        height: 15px;
        fill: currentColor;
      }
      .share-profile-action-button.is-success {
        background: linear-gradient(135deg, #059669, #047857);
        border-color: #34d399;
      }
      .share-profile-action-button.is-error {
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        border-color: #f87171;
      }
      html[data-theme="light"] .share-profile-action-bar {
        border-color: rgba(88, 89, 160, .16);
        background:
          radial-gradient(circle at 92% 20%, rgba(66, 217, 255, .12), transparent 30%),
          linear-gradient(120deg, rgba(255, 255, 255, .94), rgba(244, 247, 255, .9));
        box-shadow: 0 14px 34px rgba(54, 63, 110, .09), inset 0 1px 0 #fff;
      }
      html[data-theme="light"] .share-profile-action-copy strong { color: #181c35; }
      html[data-theme="light"] .share-profile-action-copy span { color: rgba(52, 62, 94, .68); }
      @media (max-width: 640px) {
        .share-profile-action-bar {
          grid-template-columns: auto minmax(0, 1fr);
          padding: .8rem;
        }
        .share-profile-action-button {
          grid-column: 1 / -1;
          width: 100%;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .share-profile-action-button { transition: none; }
      }
    `}</style>
  )
}
