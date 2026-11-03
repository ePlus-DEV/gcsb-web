"use client"

import { ArrowUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const SHOW_AFTER = 560

export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > SHOW_AFTER)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  useEffect(() => {
    if (!visible) return

    let observedLauncher: HTMLElement | null = null
    let frame = 0

    const resizeObserver = new ResizeObserver(() => scheduleUpdate())

    const updatePosition = () => {
      const launcher = document.querySelector<HTMLElement>(".facilitator-launcher")
      if (launcher !== observedLauncher) {
        if (observedLauncher) resizeObserver.unobserve(observedLauncher)
        if (launcher) resizeObserver.observe(launcher)
        observedLauncher = launcher
      }

      const isLauncherVisible =
        launcher !== null &&
        !launcher.hidden &&
        launcher.getClientRects().length > 0 &&
        window.getComputedStyle(launcher).visibility !== "hidden"

      // The launcher and default Back to top share the mobile navigation offset.
      // Add its actual height and a 12px gap rather than guessing a fixed height:
      // translations and a saved profile may change the launcher's content.
      const clearance = isLauncherVisible
        ? Math.ceil(launcher.getBoundingClientRect().height) + 12
        : 0
      buttonRef.current?.style.setProperty(
        "--mobile-facilitator-clearance",
        `${clearance}px`,
      )
    }

    const scheduleUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        updatePosition()
      })
    }

    // Facilitator can mount, hide, or change size independently of this button.
    const observer = new MutationObserver(scheduleUpdate)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden", "class"],
    })
    window.addEventListener("resize", scheduleUpdate)
    window.visualViewport?.addEventListener("resize", scheduleUpdate)
    scheduleUpdate()

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener("resize", scheduleUpdate)
      window.visualViewport?.removeEventListener("resize", scheduleUpdate)
    }
  }, [visible])

  if (!visible) return null

  return (
    <button
      type="button"
      ref={buttonRef}
      className="back-to-top"
      aria-label="Back to top"
      title="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp aria-hidden="true" />
    </button>
  )
}
