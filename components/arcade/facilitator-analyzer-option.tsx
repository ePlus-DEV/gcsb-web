"use client"

import { GraduationCap } from "lucide-react"
import { createPortal } from "react-dom"
import { useEffect, useMemo, useState } from "react"
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

function validProfileUrl(value: string): string {
  const normalized = normalizeFacilitatorProfileUrl(value)
  return PROFILE_URL_PATTERN.test(normalized) ? normalized : ""
}

export default function FacilitatorAnalyzerOption() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [inputProfileUrl, setInputProfileUrl] = useState("")
  const [participating, setParticipating] = useState(false)

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
      setPortalTarget(null)
    }
  }, [])

  const profileUrl = useMemo(() => {
    const fromInput = validProfileUrl(inputProfileUrl)
    if (fromInput) return fromInput

    return validProfileUrl(readStoredProfileUrl())
  }, [inputProfileUrl])

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

  if (!portalTarget) return null

  return createPortal(
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
    </label>,
    portalTarget,
  )
}
