"use client"

import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { getWebsiteLocale, loadWebsiteCatalog } from "@/lib/website-i18n"

const ANALYZER_SELECTOR = ".profile-analyzer-card"
const BUTTON_SELECTOR = ".analyze-button"
const INPUT_SELECTOR = 'input[aria-label="Google Skills public profile URL"]'
const FACILITATOR_SLOT_SELECTOR = ".analyzer-facilitator-slot"
const HELP_ROW_SELECTOR = ".analyzer-help-row"
const MANUAL_INTENT_TTL_MS = 5_000
const FRESH_SCORE_MESSAGE_KEY = "freshScoreCacheNote"

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

export default function FreshScoreCheckEnhancer() {
  const [noteTarget, setNoteTarget] = useState<HTMLElement | null>(null)
  const [note, setNote] = useState("")
  const freshIntentUntilRef = useRef(0)

  useEffect(() => {
    const markManualFreshCheck = () => {
      freshIntentUntilRef.current = Date.now() + MANUAL_INTENT_TTL_MS
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest(BUTTON_SELECTOR)) {
        markManualFreshCheck()
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return
      const target = event.target
      if (target instanceof Element && target.matches(INPUT_SELECTOR)) {
        markManualFreshCheck()
      }
    }

    document.addEventListener("click", onClick, true)
    document.addEventListener("keydown", onKeyDown, true)

    return () => {
      document.removeEventListener("click", onClick, true)
      document.removeEventListener("keydown", onKeyDown, true)
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

      try {
        const payload = JSON.parse(init.body) as Record<string, unknown>
        return originalFetch(input, {
          ...init,
          body: JSON.stringify({ ...payload, force: true }),
        })
      } catch {
        return originalFetch(input, init)
      }
    }

    window.fetch = enhancedFetch

    return () => {
      if (window.fetch === enhancedFetch) {
        window.fetch = originalFetch
      }
    }
  }, [])

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

  if (!noteTarget || !note) return null

  return createPortal(
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
}
