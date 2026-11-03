"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { ExternalLink, GraduationCap, X } from "lucide-react"
import type { WebsiteCatalog } from "@/lib/website-i18n"
import { FACILITATOR_MILESTONES } from "./facilitator-points"

/** Lightweight, read-only program details. Never depends on profile data or
 * mounts the personalized Facilitator tracker on the Home route. */
export default function FacilitatorProgramDetails({
  catalog,
  onClose,
}: {
  catalog: WebsiteCatalog | null
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== "Tab") return
      const dialog = dialogRef.current
      if (!dialog) return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      )).filter(element => element.getClientRects().length > 0)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [onClose])

  const additional = (key: string) => catalog?.additional[key] || key
  const title = additional("View program details")
  const trackerDescription = additional(
    "Progress follows Google's official combined completed requirements display. Only the highest milestone bonus applies when participation is enabled.",
  )
  const participation = additional("Turn this on only for players who officially enrolled in the program.")

  return createPortal(
    <div className="facilitator-program-details-overlay" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section
        ref={dialogRef}
        className="facilitator-program-details-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="facilitator-program-details-title"
      >
        <header className="facilitator-program-details-header">
          <div className="facilitator-program-details-heading">
            <GraduationCap aria-hidden="true" />
            <div>
              <h2 id="facilitator-program-details-title">{catalog?.messages.facilitatorProgram || "Facilitator Program"}</h2>
              <p>{title}</p>
            </div>
          </div>
          <button ref={closeRef} type="button" className="facilitator-program-details-close" onClick={onClose} aria-label={catalog?.messages.closeFacilitator || "Close Facilitator tracker"}>
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="facilitator-program-details-body">
          <p className="facilitator-program-details-description">{trackerDescription}</p>
          <div className="facilitator-program-details-grid">
            {FACILITATOR_MILESTONES.map(milestone => (
              <article key={milestone.id} className="facilitator-program-details-milestone">
                <strong>{additional(milestone.label)}</strong>
                <span className="facilitator-program-details-bonus">+{milestone.bonus} {catalog?.messages.facilitatorBonus || "Facilitator bonus"}</span>
                <div>
                  <span>{milestone.requirements.games} {additional("Games")}</span>
                  <span>{milestone.requirements.skills} {additional("Skills")}</span>
                </div>
              </article>
            ))}
          </div>
          <p className="facilitator-program-details-disclaimer">{participation}</p>
          <a className="facilitator-program-details-action" href="dashboard/">
            {catalog?.messages.homeOpenDashboard || "View Dashboard"}
            <ExternalLink aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>,
    document.body,
  )
}
