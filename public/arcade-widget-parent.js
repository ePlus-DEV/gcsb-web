(() => {
  "use strict"

  const REQUEST_MESSAGE = "eplus-arcade-widget:request-source"
  const RESPONSE_MESSAGE = "eplus-arcade-widget:source"
  const wiredFrames = new WeakSet()

  function getSourceUrl() {
    try {
      const url = new URL(window.location.href)
      url.search = ""
      url.hash = ""
      return url.toString()
    } catch {
      return ""
    }
  }

  function getFrameUrl(frame) {
    try {
      return new URL(frame.src, document.baseURI)
    } catch {
      return null
    }
  }

  function isArcadeWidgetFrame(frame) {
    if (!(frame instanceof HTMLIFrameElement)) return false
    if (frame.hasAttribute("data-arcade-widget")) return true

    const url = getFrameUrl(frame)
    if (!url) return false

    const isEplusHost = url.hostname === "arcade.eplus.dev" || url.hostname.endsWith(".eplus.dev")
    return isEplusHost && /\/widget\/?$/i.test(url.pathname)
  }

  function sendSource(frame) {
    if (!isArcadeWidgetFrame(frame) || !frame.contentWindow) return

    const sourceUrl = getSourceUrl()
    const frameUrl = getFrameUrl(frame)
    if (!sourceUrl || !frameUrl) return

    frame.contentWindow.postMessage(
      { type: RESPONSE_MESSAGE, sourceUrl },
      frameUrl.origin,
    )
  }

  function wireFrame(frame) {
    if (!isArcadeWidgetFrame(frame) || wiredFrames.has(frame)) return
    wiredFrames.add(frame)

    frame.addEventListener("load", () => sendSource(frame), { passive: true })
    sendSource(frame)
  }

  function scan(root = document) {
    if (root instanceof HTMLIFrameElement) wireFrame(root)
    if (!(root instanceof Document || root instanceof Element)) return

    root.querySelectorAll("iframe").forEach(wireFrame)
  }

  window.addEventListener("message", (event) => {
    if (!event.data || event.data.type !== REQUEST_MESSAGE) return

    const sourceFrame = Array.from(document.querySelectorAll("iframe")).find(
      (frame) => isArcadeWidgetFrame(frame) && frame.contentWindow === event.source,
    )
    if (!sourceFrame) return

    const frameUrl = getFrameUrl(sourceFrame)
    if (!frameUrl || frameUrl.origin !== event.origin) return

    sendSource(sourceFrame)
  })

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => scan(), { once: true })
  } else {
    scan()
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) scan(node)
      }
    }
  })

  observer.observe(document.documentElement, { childList: true, subtree: true })
})()
