"use client"

import { CheckCircle2, CircleHelp } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  FACILITATOR_BONUS_MILESTONE_EVENT,
  readFacilitatorBonusMilestoneCompletion,
  writeFacilitatorBonusMilestoneCompletion,
  type FacilitatorBonusMilestoneDetail,
} from "./facilitator-bonus-milestone"
import { getFacilitatorAdjustedPoints } from "./facilitator-points"
import { normalizeFacilitatorProfileUrl } from "./facilitator-participation"
import {
  DASHBOARD_STORAGE_KEY,
  formatNumber,
  numeric,
  type ArcadeApiResponse,
} from "./model"

type Props = {
  profileUrl: string
  participating: boolean
}

type StoredDashboard = {
  profileUrl?: string
  result?: ArcadeApiResponse
}

function setText(element: Element | null, value: string): void {
  if (element && element.textContent !== value) element.textContent = value
}

function findLegacyBonusSection(): HTMLElement | null {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".facilitator-content > .facilitator-section",
    ),
  )

  return (
    sections.find(
      (section) =>
        section.querySelector("h3")?.textContent?.trim() === "Bonus Milestone",
    ) ?? null
  )
}

function readStoredDashboard(): StoredDashboard | null {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    return typeof parsed === "object" && parsed !== null
      ? (parsed as StoredDashboard)
      : null
  } catch {
    return null
  }
}

export default function FacilitatorBonusMilestoneControl({
  profileUrl,
  participating,
}: Props) {
  const [completed, setCompleted] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const syncCompletion = () => {
      setCompleted(readFacilitatorBonusMilestoneCompletion(profileUrl))
    }

    const onCompletionChange = (event: Event) => {
      const detail = (event as CustomEvent<FacilitatorBonusMilestoneDetail>)
        .detail
      if (!detail) return

      if (
        normalizeFacilitatorProfileUrl(detail.profileUrl) ===
        normalizeFacilitatorProfileUrl(profileUrl)
      ) {
        setCompleted(detail.completed)
      }
    }

    syncCompletion()
    window.addEventListener("storage", syncCompletion)
    window.addEventListener(
      FACILITATOR_BONUS_MILESTONE_EVENT,
      onCompletionChange,
    )

    return () => {
      window.removeEventListener("storage", syncCompletion)
      window.removeEventListener(
        FACILITATOR_BONUS_MILESTONE_EVENT,
        onCompletionChange,
      )
    }
  }, [profileUrl])

  useEffect(() => {
    let currentTarget: HTMLElement | null = null
    let currentBonusSection: HTMLElement | null = null
    let currentDetailsList: HTMLElement | null = null
    let currentToggle: HTMLButtonElement | null = null
    let currentActionRow: HTMLElement | null = null
    let assignedDetailsId = false

    const installOptimizedLayout = () => {
      // Ignore mutations produced by the layout we already installed. This
      // prevents a MutationObserver feedback loop while the drawer is open.
      if (currentTarget?.isConnected && currentBonusSection?.isConnected) return

      const bonusSection = findLegacyBonusSection()
      if (!bonusSection) return

      bonusSection.classList.add("bonus-milestone-optimized")
      currentBonusSection = bonusSection

      const detailsList = bonusSection.querySelector<HTMLElement>(
        ":scope > .facilitator-syllabus-list",
      )

      if (detailsList) {
        detailsList.classList.add("bonus-gear-details-list")
        currentDetailsList = detailsList

        if (!detailsList.id) {
          detailsList.id = "bonus-gear-skill-details"
          assignedDetailsId = true
        }

        let toggle = bonusSection.querySelector<HTMLButtonElement>(
          "[data-bonus-gear-toggle]",
        )

        const updateToggleLabel = () => {
          if (!toggle) return
          const completedSkills = detailsList.querySelectorAll(
            ":scope > article.is-completed",
          ).length
          const expanded = !detailsList.hidden
          const label = expanded
            ? `Hide GEAR skill badges · ${completedSkills}/4`
            : `View 4 GEAR skill badges · ${completedSkills}/4`

          setText(toggle, label)
          toggle.setAttribute("aria-expanded", String(expanded))
          toggle.classList.toggle("is-complete", completedSkills === 4)
        }

        if (!toggle) {
          detailsList.hidden = true
          toggle = document.createElement("button")
          toggle.type = "button"
          toggle.dataset.bonusGearToggle = "true"
          toggle.className = "bonus-gear-toggle"
          toggle.setAttribute("aria-controls", detailsList.id)
          toggle.addEventListener("click", () => {
            detailsList.hidden = !detailsList.hidden
            updateToggleLabel()
          })
          detailsList.before(toggle)
        }

        currentToggle = toggle
        updateToggleLabel()
      }

      const actionLink = Array.from(
        bonusSection.querySelectorAll<HTMLAnchorElement>("a"),
      ).find((link) => link.textContent?.includes("Read official guide"))
      const actionRow = actionLink?.parentElement
      if (actionRow) {
        actionRow.classList.add("bonus-milestone-actions-compact")
        currentActionRow = actionRow
      }

      let target = bonusSection.querySelector<HTMLElement>(
        "[data-bonus-milestone-confirmation]",
      )

      if (!target) {
        target = document.createElement("div")
        target.dataset.bonusMilestoneConfirmation = "true"
        const note = bonusSection.querySelector<HTMLElement>(
          ":scope > .facilitator-syllabus-note",
        )
        if (note) note.before(target)
        else bonusSection.append(target)
      }

      currentTarget = target
      setPortalTarget((previous) => (previous === target ? previous : target))
    }

    installOptimizedLayout()
    const observer = new MutationObserver(installOptimizedLayout)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      currentTarget?.remove()
      currentToggle?.remove()
      if (currentDetailsList) {
        currentDetailsList.hidden = false
        currentDetailsList.classList.remove("bonus-gear-details-list")
        if (assignedDetailsId) currentDetailsList.removeAttribute("id")
      }
      currentActionRow?.classList.remove("bonus-milestone-actions-compact")
      currentBonusSection?.classList.remove("bonus-milestone-optimized")
      setPortalTarget(null)
    }
  }, [])

  useEffect(() => {
    if (!portalTarget) return

    const syncScoreSummary = () => {
      const dashboard = readStoredDashboard()
      const result = dashboard?.result
      if (!result) return

      const score = getFacilitatorAdjustedPoints(
        numeric(result.arcadePoints?.totalPoints),
        {
          games: numeric(result.faciCounts?.faciGame),
          skills: numeric(result.faciCounts?.faciSkill),
        },
        participating,
        completed,
      )

      const content = document.querySelector(".facilitator-content")
      if (!content) return

      const scoreCards = content.querySelectorAll<HTMLElement>(
        ".facilitator-score-grid > article",
      )
      const bonusCard = scoreCards.item(1)
      const totalCard = scoreCards.item(2)

      if (bonusCard) {
        setText(
          bonusCard.querySelector("strong"),
          participating ? `+${formatNumber(score.bonus)}` : "Off",
        )
        const detail = bonusCard.querySelector<HTMLElement>("small")
        if (detail) detail.hidden = Boolean(participating && completed)
      }

      if (totalCard) {
        setText(
          totalCard.querySelector("strong"),
          formatNumber(score.totalPoints),
        )
        const detail = totalCard.querySelector<HTMLElement>("small")
        if (detail) detail.hidden = Boolean(participating && completed)
      }

      const launcherSmall = document.querySelector<HTMLElement>(
        ".facilitator-launcher small",
      )
      if (participating && launcherSmall?.textContent) {
        setText(
          launcherSmall,
          launcherSmall.textContent.replace(
            /\+\s*\d+(?:[.,]\d+)?/,
            `+${formatNumber(score.bonus)}`,
          ),
        )
      }
    }

    const frame = window.requestAnimationFrame(syncScoreSummary)
    return () => window.cancelAnimationFrame(frame)
  }, [completed, participating, portalTarget])

  const toggleCompleted = () => {
    if (!participating) return
    writeFacilitatorBonusMilestoneCompletion(profileUrl, !completed)
  }

  if (!portalTarget) return null

  return createPortal(
    <div className="bonus-milestone-confirmation">
      <style>{`
        .bonus-milestone-optimized .facilitator-milestones {
          gap: 6px;
        }
        .bonus-milestone-optimized .facilitator-milestones > article {
          padding-top: 10px;
          padding-bottom: 10px;
        }
        .bonus-gear-toggle {
          width: 100%;
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 8px;
          border: 1px solid rgba(124, 92, 246, .22);
          border-radius: 9px;
          background: rgba(124, 92, 246, .07);
          color: #b9a8ff;
          font: inherit;
          font-size: .66rem;
          font-weight: 800;
          cursor: pointer;
        }
        .bonus-gear-toggle:hover {
          border-color: rgba(124, 92, 246, .42);
          background: rgba(124, 92, 246, .12);
        }
        .bonus-gear-toggle.is-complete {
          border-color: rgba(52, 211, 153, .3);
          background: rgba(16, 185, 129, .08);
          color: #6ee7b7;
        }
        .bonus-gear-details-list {
          margin-top: 7px !important;
        }
        .bonus-gear-details-list[hidden] {
          display: none !important;
        }
        .bonus-milestone-actions-compact {
          gap: 6px !important;
          margin-top: 8px;
        }
        .bonus-milestone-actions-compact > a {
          min-height: 36px !important;
          padding: 0 10px !important;
        }
        .bonus-milestone-optimized > .facilitator-syllabus-note {
          margin-top: 7px;
          margin-bottom: 0;
        }
        .bonus-milestone-confirmation {
          margin-top: 9px;
        }
        .bonus-milestone-confirmation-card {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 10px;
          align-items: center;
          border: 1px solid rgba(124, 92, 246, .28);
          border-radius: 11px;
          padding: 10px 12px;
          background: rgba(124, 92, 246, .08);
        }
        .bonus-milestone-confirmation-card.is-completed {
          border-color: rgba(52, 211, 153, .34);
          background: rgba(6, 78, 59, .14);
        }
        .bonus-milestone-confirmation-icon {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(124, 92, 246, .14);
          color: #a78bfa;
        }
        .bonus-milestone-confirmation-card.is-completed
          .bonus-milestone-confirmation-icon {
          background: rgba(16, 185, 129, .13);
          color: #34d399;
        }
        .bonus-milestone-confirmation-icon svg {
          width: 17px;
          height: 17px;
        }
        .bonus-milestone-confirmation-copy strong,
        .bonus-milestone-confirmation-copy small {
          display: block;
        }
        .bonus-milestone-confirmation-copy strong {
          color: var(--facilitator-text, #f8fafc);
          font-size: .74rem;
        }
        .bonus-milestone-confirmation-copy small {
          margin-top: 2px;
          color: var(--facilitator-muted, #94a3b8);
          font-size: .65rem;
          line-height: 1.4;
        }
        .bonus-milestone-confirmation-button {
          min-height: 34px;
          border: 1px solid rgba(124, 92, 246, .45);
          border-radius: 999px;
          padding: 0 12px;
          background: rgba(124, 92, 246, .12);
          color: #c4b5fd;
          font: inherit;
          font-size: .66rem;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }
        .bonus-milestone-confirmation-button.is-completed {
          border-color: rgba(52, 211, 153, .4);
          background: rgba(16, 185, 129, .13);
          color: #6ee7b7;
        }
        .bonus-milestone-confirmation-button:disabled {
          cursor: not-allowed;
          opacity: .48;
        }
        @media (max-width: 560px) {
          .bonus-milestone-actions-compact {
            grid-template-columns: 1fr !important;
          }
          .bonus-milestone-confirmation-card {
            grid-template-columns: auto minmax(0, 1fr);
          }
          .bonus-milestone-confirmation-button {
            grid-column: 1 / -1;
            width: 100%;
          }
        }
      `}</style>

      <div
        className={`bonus-milestone-confirmation-card${
          completed ? " is-completed" : ""
        }`}
      >
        <span className="bonus-milestone-confirmation-icon" aria-hidden="true">
          {completed ? <CheckCircle2 /> : <CircleHelp />}
        </span>
        <div className="bonus-milestone-confirmation-copy">
          <strong>Bonus Milestone completed</strong>
          <small>Confirm after you finish all required steps above.</small>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={completed}
          className={`bonus-milestone-confirmation-button${
            completed ? " is-completed" : ""
          }`}
          disabled={!participating}
          onClick={toggleCompleted}
        >
          {completed
            ? participating
              ? "Completed · +10"
              : "Completed"
            : "Mark completed"}
        </button>
      </div>
    </div>,
    portalTarget,
  )
}
