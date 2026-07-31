"use client"

import { useEffect } from "react"

export function ManualEntryStageSync() {
  useEffect(() => {
    const stage = document.querySelector<HTMLElement>(".trail-stage")
    if (!stage) return

    const syncManualState = () => {
      stage.classList.toggle("is-manual-open", Boolean(stage.querySelector(".manual-panel")))
    }

    syncManualState()

    const observer = new MutationObserver(syncManualState)
    observer.observe(stage, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      stage.classList.remove("is-manual-open")
    }
  }, [])

  return null
}
