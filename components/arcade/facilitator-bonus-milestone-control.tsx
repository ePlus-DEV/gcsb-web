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
  formatNumber,
  numeric,
} from "./model"
import { readActiveDashboard } from "./dashboard-state"

type Props = {
  profileUrl: string
  participating: boolean
}

function setText(element: Element | null, value: string): void {
  if (element && element.textContent !== value) element.textContent = value
}

function findBonusSection(): HTMLElement | null {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".facilitator-content > .facilitator-section",
    ),
  )

  return (
    sections.find(
      (section) =>
        section.querySelector(
          'a[href="https://forms.gle/MMfH5RKp83TfRtXj9"]',
        ) !== null ||
        section.querySelector(
          'a[href="https://rsvp.withgoogle.com/events/arcade-facilitator/bonus-milestone"]',
        ) !== null,
    ) ?? null
  )
}

export default function FacilitatorBonusMilestoneControl({
  profileUrl,
  participating,
}: Props) {
  const [completed, setCompleted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const syncCompletion = () => {
      const nextCompleted = readFacilitatorBonusMilestoneCompletion(profileUrl)
      setCompleted(nextCompleted)
      setCollapsed(nextCompleted)
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
        setCollapsed(detail.completed)
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
    let currentBonusSection: HTMLElement | null = null
    let currentDetailsList: HTMLElement | null = null
    let currentToggle: HTMLButtonElement | null = null
    let currentActionRow: HTMLElement | null = null
    let assignedDetailsId = false

    const installOptimizedLayout = () => {
      const layoutStillInstalled = Boolean(
        currentBonusSection?.isConnected &&
          currentDetailsList?.isConnected &&
          currentToggle?.isConnected,
      )
      if (layoutStillInstalled) return

      const bonusSection = findBonusSection()
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

      const actionLink = bonusSection.querySelector<HTMLAnchorElement>(
        'a[href="https://rsvp.withgoogle.com/events/arcade-facilitator/bonus-milestone"]',
      )
      const actionRow = actionLink?.parentElement
      if (actionRow) {
        actionRow.classList.add("bonus-milestone-actions-compact")
        currentActionRow = actionRow
      }

      // Portal directly into the React-owned section. This avoids inserting a
      // raw intermediary node that React can remove during reconciliation.
      setPortalTarget((previous) =>
        previous === bonusSection ? previous : bonusSection,
      )
    }

    installOptimizedLayout()
    const observer = new MutationObserver(installOptimizedLayout)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
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
      const dashboard = readActiveDashboard()
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

      <div
        className={`bonus-milestone-confirmation-card${
          completed ? " is-completed" : ""
        }${completed && collapsed ? " is-collapsed" : ""}`}
      >
        <span className="bonus-milestone-confirmation-icon" aria-hidden="true">
          {completed ? <CheckCircle2 /> : <CircleHelp />}
        </span>
        <div className="bonus-milestone-confirmation-copy">
          <strong>Bonus Milestone completed</strong>
          <small>
            {completed
              ? collapsed
                ? "+10 bonus applied. Open to review the completed steps."
                : "Completion is saved. Close the details again or undo if needed."
              : "Confirm after you finish all required steps above."}
          </small>
        </div>
        <div className="bonus-milestone-confirmation-actions">
          {completed ? (
            <>
              <button
                type="button"
                className="bonus-milestone-confirmation-button is-completed"
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((value) => !value)}
              >
                {collapsed ? "Open details" : "Close details"}
              </button>
              {!collapsed ? (
                <button
                  type="button"
                  className="bonus-milestone-confirmation-button is-secondary"
                  onClick={toggleCompleted}
                >
                  Undo
                </button>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              role="switch"
              aria-checked={false}
              className="bonus-milestone-confirmation-button"
              disabled={!participating}
              onClick={toggleCompleted}
            >
              Mark completed
            </button>
          )}
        </div>
      </div>
    </div>,
    portalTarget,
  )
}
