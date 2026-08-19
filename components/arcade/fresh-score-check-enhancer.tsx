"use client"

import { createPortal } from "react-dom"
import { useCallback, useEffect, useRef, useState } from "react"
import { getWebsiteLocale, loadWebsiteCatalog } from "@/lib/website-i18n"

const ANALYZER_SELECTOR = ".profile-analyzer-card"
const BUTTON_SELECTOR = ".analyze-button"
const INPUT_SELECTOR = 'input[aria-label="Google Skills public profile URL"]'
const FACILITATOR_SLOT_SELECTOR = ".analyzer-facilitator-slot"
const HELP_ROW_SELECTOR = ".analyzer-help-row"
const MANUAL_INTENT_TTL_MS = 5_000
const FRESH_SCORE_MESSAGE_KEY = "freshScoreCacheNote"
const COOLDOWN_STORAGE_KEY = "arcade:fresh-score-cooldown-until"
const DEFAULT_RATE_LIMIT_SECONDS = 60
const MIN_REPEAT_DELAY_SECONDS = 5

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input
  if (input instanceof URL) return input.toString()
  return input.url
}

function isArcadePost(input: RequestInfo | URL, init?: RequestInit): boolean {
  const method = String(
    init?.method ?? (input instanceof Request ? input.method : "GET"),
  ).toUpperCase()

  if (method !== "POST") return false

  try {
    const url = new URL(requestUrl(input), window.location.href)
    return url.pathname.startsWith("/api/arcade")
  } catch {
    return false
  }
}

function parseRetryAfterSeconds(value: string | null): number | null {
  if (!value) return null

  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.max(1, Math.ceil(seconds))
  }

  const retryAt = Date.parse(value)
  if (Number.isNaN(retryAt)) return null

  const remaining = Math.ceil((retryAt - Date.now()) / 1_000)
  return remaining > 0 ? remaining : null
}

function parseRateLimitSeconds(message: string): number | null {
  const match = message.match(
    /(?:try again|retry(?: after| in)?)\D{0,24}(\d+)\s*(?:seconds?|secs?|s)\b/i,
  )
  if (!match) return null

  const seconds = Number(match[1])
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null
}

async function getRateLimitCooldownSeconds(response: Response): Promise<number | null> {
  const retryAfter = parseRetryAfterSeconds(response.headers.get("retry-after"))
  if (retryAfter !== null) return retryAfter

  let message = ""
  try {
    const payload = (await response.clone().json()) as unknown
    if (typeof payload === "object" && payload !== null) {
      const candidate = (payload as { message?: unknown }).message
      message = typeof candidate === "string" ? candidate : JSON.stringify(payload)
    } else if (typeof payload === "string") {
      message = payload
    }
  } catch {
    try {
      message = await response.clone().text()
    } catch {
      message = ""
    }
  }

  const parsedSeconds = parseRateLimitSeconds(message)
  if (
    parsedSeconds !== null &&
    (response.status === 429 || /rate[ -]?limit/i.test(message))
  ) {
    return parsedSeconds
  }

  return response.status === 429 ? DEFAULT_RATE_LIMIT_SECONDS : null
}

function clearCooldownUi(): void {
  const button = document.querySelector<HTMLButtonElement>(BUTTON_SELECTOR)
  const analyzer = document.querySelector<HTMLElement>(ANALYZER_SELECTOR)

  if (button) {
    delete button.dataset.freshScoreCooldown
    delete button.dataset.freshScoreLabel
    button.removeAttribute("aria-disabled")
  }
  analyzer?.removeAttribute("data-fresh-score-rate-limited")
}

export default function FreshScoreCheckEnhancer() {
  const [noteTarget, setNoteTarget] = useState<HTMLElement | null>(null)
  const [note, setNote] = useState("")
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [rateLimited, setRateLimited] = useState(false)
  const freshIntentUntilRef = useRef(0)
  const cooldownUntilRef = useRef(0)

  const beginCooldown = useCallback((seconds: number, isRateLimited = false) => {
    const safeSeconds = Math.max(1, Math.ceil(seconds))
    const until = Date.now() + safeSeconds * 1_000

    cooldownUntilRef.current = until
    setCooldownSeconds(safeSeconds)
    setRateLimited(isRateLimited)

    try {
      window.sessionStorage.setItem(COOLDOWN_STORAGE_KEY, String(until))
    } catch {
      // Cooldown still works in memory when session storage is unavailable.
    }
  }, [])

  useEffect(() => {
    try {
      const storedUntil = Number(window.sessionStorage.getItem(COOLDOWN_STORAGE_KEY))
      if (Number.isFinite(storedUntil) && storedUntil > Date.now()) {
        cooldownUntilRef.current = storedUntil
      } else {
        window.sessionStorage.removeItem(COOLDOWN_STORAGE_KEY)
      }
    } catch {
      // Session storage is optional.
    }

    const syncCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil((cooldownUntilRef.current - Date.now()) / 1_000),
      )
      setCooldownSeconds((current) => (current === remaining ? current : remaining))

      if (remaining === 0 && cooldownUntilRef.current !== 0) {
        cooldownUntilRef.current = 0
        setRateLimited(false)
        try {
          window.sessionStorage.removeItem(COOLDOWN_STORAGE_KEY)
        } catch {
          // Nothing else to do.
        }
      }
    }

    syncCountdown()
    const timer = window.setInterval(syncCountdown, 250)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const cooldownActive = () => cooldownUntilRef.current > Date.now()

    const markManualFreshCheck = () => {
      freshIntentUntilRef.current = Date.now() + MANUAL_INTENT_TTL_MS
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element) || !target.closest(BUTTON_SELECTOR)) return

      if (cooldownActive()) {
        event.preventDefault()
        event.stopImmediatePropagation()
        return
      }

      markManualFreshCheck()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return
      const target = event.target
      if (!(target instanceof Element) || !target.matches(INPUT_SELECTOR)) return

      if (cooldownActive()) {
        event.preventDefault()
        event.stopImmediatePropagation()
        return
      }

      markManualFreshCheck()
    }

    const onSubmit = (event: SubmitEvent) => {
      if (!cooldownActive()) return
      const target = event.target
      if (!(target instanceof HTMLFormElement) || !target.closest(ANALYZER_SELECTOR)) return

      event.preventDefault()
      event.stopImmediatePropagation()
    }

    document.addEventListener("click", onClick, true)
    document.addEventListener("keydown", onKeyDown, true)
    document.addEventListener("submit", onSubmit, true)

    return () => {
      document.removeEventListener("click", onClick, true)
      document.removeEventListener("keydown", onKeyDown, true)
      document.removeEventListener("submit", onSubmit, true)
    }
  }, [])

  useEffect(() => {
    const originalFetch = window.fetch.bind(window)

    const enhancedFetch: typeof window.fetch = async (input, init) => {
      const manualFreshCheck = Date.now() <= freshIntentUntilRef.current

      if (
        !manualFreshCheck ||
        !isArcadePost(input, init) ||
        typeof init?.body !== "string"
      ) {
        return originalFetch(input, init)
      }

      freshIntentUntilRef.current = 0

      let nextInit = init
      try {
        const payload = JSON.parse(init.body) as Record<string, unknown>
        nextInit = {
          ...init,
          body: JSON.stringify({ ...payload, force: true }),
        }
      } catch {
        // Keep the original request body if it is not JSON.
      }

      const response = await originalFetch(input, nextInit)
      const retrySeconds = await getRateLimitCooldownSeconds(response)

      if (retrySeconds !== null) {
        beginCooldown(retrySeconds, true)
      } else if (response.ok) {
        beginCooldown(MIN_REPEAT_DELAY_SECONDS)
      }

      return response
    }

    window.fetch = enhancedFetch

    return () => {
      if (window.fetch === enhancedFetch) {
        window.fetch = originalFetch
      }
    }
  }, [beginCooldown])

  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>(BUTTON_SELECTOR)
    const analyzer = document.querySelector<HTMLElement>(ANALYZER_SELECTOR)
    if (!button) return

    if (cooldownSeconds > 0) {
      button.dataset.freshScoreCooldown = "true"
      button.dataset.freshScoreLabel = `Try again in ${cooldownSeconds}s`
      button.setAttribute("aria-disabled", "true")

      if (rateLimited) {
        analyzer?.setAttribute("data-fresh-score-rate-limited", "true")
      } else {
        analyzer?.removeAttribute("data-fresh-score-rate-limited")
      }
    } else {
      clearCooldownUi()
    }
  }, [cooldownSeconds, rateLimited])

  useEffect(() => () => clearCooldownUi(), [])

  useEffect(() => {
    let active = true
    let requestId = 0

    const syncNote = () => {
      const currentRequestId = ++requestId
      const locale = getWebsiteLocale(document.documentElement.lang)
      setNote("")

      void loadWebsiteCatalog(locale)
        .then((catalog) => {
          if (!active || currentRequestId !== requestId) return
          setNote(catalog.messages[FRESH_SCORE_MESSAGE_KEY] ?? "")
        })
        .catch(() => {
          if (!active || currentRequestId !== requestId) return
          setNote("")
        })
    }

    syncNote()

    const observer = new MutationObserver(syncNote)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    })

    return () => {
      active = false
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    let slot: HTMLDivElement | null = null

    const attach = () => {
      const analyzer = document.querySelector<HTMLElement>(ANALYZER_SELECTOR)
      if (!analyzer) return

      const facilitatorSlot = analyzer.querySelector<HTMLElement>(FACILITATOR_SLOT_SELECTOR)
      const helpRow = analyzer.querySelector<HTMLElement>(HELP_ROW_SELECTOR)
      if (!helpRow) return

      if (!slot || !slot.isConnected) {
        slot = document.createElement("div")
        slot.dataset.freshScoreNote = "true"

        if (facilitatorSlot) {
          facilitatorSlot.after(slot)
        } else {
          helpRow.before(slot)
        }

        setNoteTarget(slot)
      } else if (facilitatorSlot && slot.previousElementSibling !== facilitatorSlot) {
        facilitatorSlot.after(slot)
      }
    }

    attach()
    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      slot?.remove()
    }
  }, [])

  return (
    <>
      <style>{`
        ${BUTTON_SELECTOR}[data-fresh-score-cooldown="true"] {
          position: relative;
          color: transparent !important;
          pointer-events: none;
          cursor: not-allowed;
        }
        ${BUTTON_SELECTOR}[data-fresh-score-cooldown="true"] svg {
          visibility: hidden;
        }
        ${BUTTON_SELECTOR}[data-fresh-score-cooldown="true"]::after {
          content: attr(data-fresh-score-label);
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          pointer-events: none;
        }
        ${ANALYZER_SELECTOR}[data-fresh-score-rate-limited="true"] .analyzer-error {
          display: none !important;
        }
      `}</style>
      {noteTarget && note
        ? createPortal(
            <p
              role="note"
              style={{
                margin: "0",
                padding: "2px 2px 4px",
                color: "var(--muted-foreground, #64748b)",
                fontSize: "12px",
                lineHeight: 1.5,
              }}
            >
              {note}
            </p>,
            noteTarget,
          )
        : null}
    </>
  )
}
