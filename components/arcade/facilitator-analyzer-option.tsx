"use client"

import { GraduationCap, RefreshCcw } from "lucide-react"
import { createPortal } from "react-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  FACILITATOR_PARTICIPATION_EVENT,
  normalizeFacilitatorProfileUrl,
  readFacilitatorParticipation,
  writeFacilitatorParticipation,
  type FacilitatorParticipationDetail,
} from "./facilitator-participation"
import { DASHBOARD_STORAGE_KEY, PROFILE_URL_PATTERN } from "./model"

const ANALYZER_SELECTOR = ".profile-analyzer-card"
const INPUT_SELECTOR =
  'input[aria-label="Google Skills public profile URL"]'
const HELP_ROW_SELECTOR = ".analyzer-help-row"
const AUTO_FETCH_STORAGE_KEY = "gcsb-auto-fetch-latest-profile"

/** Reads the last successfully analyzed public profile URL. */
function readStoredProfileUrl(): string {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!raw) return ""

    const parsed = JSON.parse(raw) as { profileUrl?: unknown }
    return typeof parsed.profileUrl === "string" ? parsed.profileUrl : ""
  } catch {
    return ""
  }
}

/** Normalizes a public profile URL and rejects unsupported values. */
function validProfileUrl(value: string): string {
  const normalized = normalizeFacilitatorProfileUrl(value)
  return PROFILE_URL_PATTERN.test(normalized) ? normalized : ""
}

/** Reads whether the user wants fresh profile data fetched on page entry. */
function readAutoFetchPreference(): boolean {
  try {
    return window.localStorage.getItem(AUTO_FETCH_STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

/** Persists the automatic refresh preference when storage is available. */
function writeAutoFetchPreference(enabled: boolean): void {
  try {
    window.localStorage.setItem(AUTO_FETCH_STORAGE_KEY, String(enabled))
  } catch {
    // The toggle still works for the current page when storage is unavailable.
  }
}

/** Updates a controlled text input through its native setter. */
function setInputValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
}

/** Adds Facilitator and automatic-refresh preferences to the profile analyzer. */
export default function FacilitatorAnalyzerOption() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [inputProfileUrl, setInputProfileUrl] = useState("")
  const [storedProfileUrl, setStoredProfileUrl] = useState("")
  const [participating, setParticipating] = useState(false)
  const [autoFetchLatest, setAutoFetchLatest] = useState(false)
  const [autoFetchLoaded, setAutoFetchLoaded] = useState(false)
  const autoFetchAttempted = useRef(false)

  useEffect(() => {
    let currentInput: HTMLInputElement | null = null
    let slot: HTMLDivElement | null = null

    const syncInputValue = () => {
      setInputProfileUrl(currentInput?.value ?? "")
    }

    const attach = () => {
      const analyzer = document.querySelector<HTMLElement>(ANALYZER_SELECTOR)
      const helpRow = analyzer?.querySelector<HTMLElement>(HELP_ROW_SELECTOR)
      const nextInput = analyzer?.querySelector<HTMLInputElement>(INPUT_SELECTOR)

      if (!analyzer || !helpRow || !nextInput) return

      if (currentInput !== nextInput) {
        currentInput?.removeEventListener("input", syncInputValue)
        currentInput = nextInput
        currentInput.addEventListener("input", syncInputValue)
        syncInputValue()
      }

      if (!slot || !slot.isConnected) {
        slot = document.createElement("div")
        slot.className = "analyzer-facilitator-slot"
        helpRow.before(slot)
        setPortalTarget(slot)
      }
    }

    attach()
    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      currentInput?.removeEventListener("input", syncInputValue)
      slot?.remove()
    }
  }, [])

  useEffect(() => {
    setAutoFetchLatest(readAutoFetchPreference())
    setAutoFetchLoaded(true)
  }, [])

  useEffect(() => {
    const syncStoredProfile = () => {
      setStoredProfileUrl(readStoredProfileUrl())
    }

    syncStoredProfile()
    const timer = window.setInterval(syncStoredProfile, 1_000)
    window.addEventListener("focus", syncStoredProfile)
    window.addEventListener("storage", syncStoredProfile)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", syncStoredProfile)
      window.removeEventListener("storage", syncStoredProfile)
    }
  }, [])

  const profileUrl = useMemo(() => {
    const fromInput = validProfileUrl(inputProfileUrl)
    if (fromInput) return fromInput

    return validProfileUrl(storedProfileUrl)
  }, [inputProfileUrl, storedProfileUrl])

  useEffect(() => {
    if (!profileUrl) {
      setParticipating(false)
      return
    }

    const sync = () => {
      setParticipating(readFacilitatorParticipation(profileUrl))
    }

    const onParticipationChange = (event: Event) => {
      const detail = (event as CustomEvent<FacilitatorParticipationDetail>)
        .detail
      if (!detail) return

      if (
        normalizeFacilitatorProfileUrl(detail.profileUrl) ===
        normalizeFacilitatorProfileUrl(profileUrl)
      ) {
        setParticipating(detail.participating)
      }
    }

    sync()
    const timer = window.setInterval(sync, 1_000)
    window.addEventListener("focus", sync)
    window.addEventListener("storage", sync)
    window.addEventListener(
      FACILITATOR_PARTICIPATION_EVENT,
      onParticipationChange,
    )

    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", sync)
      window.removeEventListener("storage", sync)
      window.removeEventListener(
        FACILITATOR_PARTICIPATION_EVENT,
        onParticipationChange,
      )
    }
  }, [profileUrl])

  useEffect(() => {
    if (
      !autoFetchLoaded ||
      !autoFetchLatest ||
      !portalTarget ||
      !profileUrl ||
      autoFetchAttempted.current
    ) {
      return
    }

    const analyzer = document.querySelector<HTMLElement>(ANALYZER_SELECTOR)
    const input = analyzer?.querySelector<HTMLInputElement>(INPUT_SELECTOR)
    const form = input?.closest("form")
    if (!input || !form) return

    autoFetchAttempted.current = true
    setInputValue(input, profileUrl)
    window.setTimeout(() => form.requestSubmit(), 0)
  }, [autoFetchLatest, autoFetchLoaded, portalTarget, profileUrl])

  if (!portalTarget) return null

  return createPortal(
    <div style={{ display: "grid", gap: 8 }}>
      <label
        className={`analyzer-facilitator-option${
          participating ? " is-active" : ""
        }${profileUrl ? "" : " is-disabled"}`}
      >
        <input
          type="checkbox"
          checked={participating}
          disabled={!profileUrl}
          onChange={(event) => {
            const checked = event.target.checked
            setParticipating(checked)
            writeFacilitatorParticipation(profileUrl, checked)
          }}
          aria-describedby="analyzer-facilitator-description"
        />
        <span className="analyzer-facilitator-icon" aria-hidden="true">
          <GraduationCap />
        </span>
        <span className="analyzer-facilitator-copy">
          <strong>Participating in Facilitator Program</strong>
          <small id="analyzer-facilitator-description">
            {profileUrl
              ? "Include the highest eligible Facilitator milestone bonus."
              : "Paste a valid public profile URL to enable this option."}
          </small>
        </span>
        <span className="analyzer-facilitator-switch" aria-hidden="true" />
      </label>

      <label
        className={`analyzer-facilitator-option${
          autoFetchLatest ? " is-active" : ""
        }`}
      >
        <input
          type="checkbox"
          checked={autoFetchLatest}
          onChange={(event) => {
            const checked = event.target.checked
            autoFetchAttempted.current = false
            setAutoFetchLatest(checked)
            writeAutoFetchPreference(checked)
          }}
          aria-describedby="analyzer-auto-fetch-description"
        />
        <span className="analyzer-facilitator-icon" aria-hidden="true">
          <RefreshCcw />
        </span>
        <span className="analyzer-facilitator-copy">
          <strong>Automatically fetch latest data</strong>
          <small id="analyzer-auto-fetch-description">
            Refresh the saved profile once whenever this page is opened.
          </small>
        </span>
        <span className="analyzer-facilitator-switch" aria-hidden="true" />
      </label>
    </div>,
    portalTarget,
  )
}
