"use client"

import { Fragment, type ReactNode, useLayoutEffect, useState } from "react"

const SOURCE_REQUEST_MESSAGE = "eplus-arcade-widget:request-source"
const SOURCE_RESPONSE_MESSAGE = "eplus-arcade-widget:source"

function normalizeSourceUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return ""

  try {
    const url = new URL(value)
    if (url.protocol !== "https:" && url.protocol !== "http:") return ""
    url.search = ""
    url.hash = ""
    return url.toString()
  } catch {
    return ""
  }
}

function getSameOriginParentUrl(): string {
  if (window.parent === window) return ""

  try {
    return normalizeSourceUrl(window.parent.location.href)
  } catch {
    return ""
  }
}

function getAncestorOrigin(): string {
  try {
    return normalizeSourceUrl(window.location.ancestorOrigins?.[0] ?? "")
  } catch {
    return ""
  }
}

function updateWidgetSourceUrl(sourceUrl: string): boolean {
  const currentUrl = new URL(window.location.href)
  const currentSourceUrl = normalizeSourceUrl(currentUrl.searchParams.get("source_url"))
  if (!sourceUrl || currentSourceUrl === sourceUrl) return false

  currentUrl.searchParams.set("source_url", sourceUrl)
  window.history.replaceState(window.history.state, "", currentUrl.toString())
  return true
}

export default function WidgetSourceBridge({ children }: { children: ReactNode }) {
  const [sourceRevision, setSourceRevision] = useState(0)

  useLayoutEffect(() => {
    const widgetUrl = new URL(window.location.href)
    const explicitSourceUrl = normalizeSourceUrl(widgetUrl.searchParams.get("source_url"))
    const initialSourceUrl =
      explicitSourceUrl ||
      getSameOriginParentUrl() ||
      normalizeSourceUrl(document.referrer) ||
      getAncestorOrigin()

    if (!explicitSourceUrl && updateWidgetSourceUrl(initialSourceUrl)) {
      setSourceRevision((revision) => revision + 1)
    }

    if (window.parent === window || explicitSourceUrl) return

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return
      if (!event.data || event.data.type !== SOURCE_RESPONSE_MESSAGE) return

      const sourceUrl = normalizeSourceUrl(event.data.sourceUrl)
      if (!sourceUrl) return

      try {
        if (new URL(sourceUrl).origin !== event.origin) return
      } catch {
        return
      }

      if (updateWidgetSourceUrl(sourceUrl)) {
        setSourceRevision((revision) => revision + 1)
      }
    }

    window.addEventListener("message", handleMessage)
    window.parent.postMessage({ type: SOURCE_REQUEST_MESSAGE }, "*")

    return () => window.removeEventListener("message", handleMessage)
  }, [])

  return <Fragment key={sourceRevision}>{children}</Fragment>
}
