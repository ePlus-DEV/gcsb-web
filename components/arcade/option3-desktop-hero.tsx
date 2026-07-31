"use client"

import type { Dispatch, FormEvent, SetStateAction } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  EMPTY_SNAPSHOT,
  LEGACY_STORAGE_KEY,
  PROFILE_URL_PATTERN,
  STORAGE_KEY,
  getNextTier,
  numeric,
} from "./model"
import type { CalculatorSnapshot } from "./model"
import { Option3Hero } from "./option3-hero"

type StoredCalculatorState = {
  snapshot?: unknown
}

function restoreSnapshot(value: unknown): CalculatorSnapshot | null {
  if (typeof value !== "object" || value === null) return null
  const candidate = value as Partial<CalculatorSnapshot>

  return {
    profileUrl: typeof candidate.profileUrl === "string" ? candidate.profileUrl : "",
    currentPoints: Math.max(0, numeric(candidate.currentPoints)),
    gameBadges: Math.max(0, numeric(candidate.gameBadges)),
    triviaBadges: Math.max(0, numeric(candidate.triviaBadges)),
    skillBadges: Math.max(0, numeric(candidate.skillBadges)),
    targetPoints: 120,
    userName: typeof candidate.userName === "string" ? candidate.userName : "",
    milestone: typeof candidate.milestone === "string" ? candidate.milestone : "",
    scoreComplete: Boolean(candidate.scoreComplete),
    unknownBadgeCount: Math.max(0, numeric(candidate.unknownBadgeCount)),
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : "",
  }
}

function readStoredSnapshot(): CalculatorSnapshot | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as StoredCalculatorState
    return restoreSnapshot(stored.snapshot)
  } catch {
    return null
  }
}

function setNativeInputValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
}

function hiddenManualInputs(): HTMLInputElement[] {
  return Array.from(
    document.querySelectorAll<HTMLInputElement>(".trail-stage .manual-panel input"),
  )
}

export function Option3DesktopHero() {
  const initial = useRef<CalculatorSnapshot | null>(null)
  const [snapshot, setSnapshot] = useState<CalculatorSnapshot>(EMPTY_SNAPSHOT)
  const [profileUrl, setProfileUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [manualMode, setManualModeState] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const lastStoredValue = useRef<string | null>(null)

  useEffect(() => {
    const restored = readStoredSnapshot()
    initial.current = restored
    if (restored) {
      setSnapshot(restored)
      setProfileUrl(restored.profileUrl)
      setHasResult(true)
    }
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw && raw !== lastStoredValue.current) {
          lastStoredValue.current = raw
          const stored = JSON.parse(raw) as StoredCalculatorState
          const restored = restoreSnapshot(stored.snapshot)
          if (restored) {
            setSnapshot(restored)
            setProfileUrl(restored.profileUrl)
            setHasResult(true)
          }
        }
      } catch {
        // The image-first hero remains usable when browser storage is unavailable.
      }

      const hiddenSubmit = document.querySelector<HTMLButtonElement>(
        ".trail-stage .primary-button",
      )
      setLoading(Boolean(hiddenSubmit?.disabled))

      const hiddenError = document.querySelector<HTMLElement>(
        ".trail-stage .form-error",
      )?.textContent
      setError(hiddenError?.trim() ?? "")
    }, 250)

    return () => window.clearInterval(interval)
  }, [])

  const nextTier = useMemo(() => getNextTier(snapshot.currentPoints), [snapshot.currentPoints])
  const pointsRemaining = Math.max(0, nextTier.points - snapshot.currentPoints)

  const analyzeProfile = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const normalized = profileUrl.trim().replace(/\/$/, "")

      if (!PROFILE_URL_PATTERN.test(normalized)) {
        setError("Enter a valid public profile URL from skills.google or cloudskillsboost.google.")
        return
      }

      const hiddenInput = document.querySelector<HTMLInputElement>(
        ".trail-stage #profile-url",
      )
      const hiddenForm = document.querySelector<HTMLFormElement>(
        ".trail-stage .profile-form",
      )

      if (!hiddenInput || !hiddenForm) {
        setError("The calculator form is unavailable. Reload the page and try again.")
        return
      }

      setError("")
      setLoading(true)
      setNativeInputValue(hiddenInput, normalized)
      window.setTimeout(() => hiddenForm.requestSubmit(), 0)
    },
    [profileUrl],
  )

  const setManualMode: Dispatch<SetStateAction<boolean>> = useCallback((value) => {
    setManualModeState((current) => {
      const next = typeof value === "function" ? value(current) : value
      const hiddenPanelOpen = Boolean(
        document.querySelector(".trail-stage .manual-panel"),
      )
      if (next !== hiddenPanelOpen) {
        document.querySelector<HTMLButtonElement>(".trail-stage .text-button")?.click()
      }
      return next
    })
  }, [])

  const updateManual = useCallback(
    (field: keyof CalculatorSnapshot, value: string) => {
      const numericValue = Math.max(0, numeric(value))
      setSnapshot((current) => ({
        ...current,
        [field]: numericValue,
        updatedAt: new Date().toISOString(),
      }))
      setHasResult(true)

      const indexes: Partial<Record<keyof CalculatorSnapshot, number>> = {
        currentPoints: 0,
        gameBadges: 1,
        triviaBadges: 2,
        skillBadges: 3,
      }
      const index = indexes[field]
      if (index === undefined) return

      const applyValue = () => {
        const input = hiddenManualInputs()[index]
        if (input) setNativeInputValue(input, String(numericValue))
      }

      if (!document.querySelector(".trail-stage .manual-panel")) {
        document.querySelector<HTMLButtonElement>(".trail-stage .text-button")?.click()
        window.setTimeout(applyValue, 40)
      } else {
        applyValue()
      }
    },
    [],
  )

  const resetCalculator = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // Continue with an in-memory reset.
    }
    setSnapshot(EMPTY_SNAPSHOT)
    setProfileUrl("")
    setError("")
    setManualModeState(false)
    setHasResult(false)
    window.location.reload()
  }, [])

  return (
    <Option3Hero
      profileUrl={profileUrl}
      setProfileUrl={setProfileUrl}
      analyzeProfile={analyzeProfile}
      loading={loading}
      error={error}
      manualMode={manualMode}
      setManualMode={setManualMode}
      snapshot={snapshot}
      updateManual={updateManual}
      nextTier={nextTier}
      pointsRemaining={pointsRemaining}
      hasResult={hasResult}
      resetCalculator={resetCalculator}
    />
  )
}
