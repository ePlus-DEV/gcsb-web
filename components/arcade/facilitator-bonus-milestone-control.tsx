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
import {
  FACILITATOR_BONUS_MILESTONE_POINTS,
  getFacilitatorAdjustedPoints,
} from "./facilitator-points"
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

    const installConfirmation = () => {
      const bonusSection = findLegacyBonusSection()
      if (!bonusSection) return

      let target = bonusSection.querySelector<HTMLElement>(
        "[data-bonus-milestone-confirmation]",
      )

      if (!target) {
        target = document.createElement("div")
        target.dataset.bonusMilestoneConfirmation = "true"
        bonusSection.append(target)
      }

      currentTarget = target
      setPortalTarget((previous) => (previous === target ? previous : target))
    }

    installConfirmation()
    const observer = new MutationObserver(installConfirmation)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      currentTarget?.remove()
      setPortalTarget(null)
    }
  }, [])

  useEffect(() => {
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
      const bonusCard = Array.from(scoreCards).find(
        (card) =>
          card.querySelector("span")?.textContent?.trim() ===
          "Facilitator bonus",
      )
      const totalCard = Array.from(scoreCards).find(
        (card) =>
          card.querySelector("span")?.textContent?.trim() ===
          "Estimated total after bonus",
      )

      if (bonusCard) {
        setText(
          bonusCard.querySelector("strong"),
          participating ? `+${formatNumber(score.bonus)}` : "Off",
        )
        setText(
          bonusCard.querySelector("small"),
          participating
            ? completed
              ? `Includes +${FACILITATOR_BONUS_MILESTONE_POINTS} Bonus Milestone`
              : "Highest completed milestone only"
            : "Participation is not enabled",
        )
      }

      if (totalCard) {
        setText(
          totalCard.querySelector("strong"),
          formatNumber(score.totalPoints),
        )
        setText(
          totalCard.querySelector("small"),
          participating
            ? completed
              ? `Includes +${FACILITATOR_BONUS_MILESTONE_POINTS} Bonus Milestone`
              : `Optional +${FACILITATOR_BONUS_MILESTONE_POINTS} Bonus Milestone not included`
            : "No Facilitator bonus included",
        )
      }

      const launcherSmall = document.querySelector(
        ".facilitator-launcher small",
      )
      if (participating && launcherSmall) {
        const current = launcherSmall.textContent ?? ""
        const separatorIndex = current.indexOf("·")
        const suffix =
          separatorIndex >= 0 ? current.slice(separatorIndex).trim() : ""
        setText(
          launcherSmall,
          `+${formatNumber(score.bonus)} bonus${suffix ? ` ${suffix}` : ""}`,
        )
      }

      setText(
        content.querySelector(".facilitator-disclaimer"),
        participating
          ? `Facilitator bonuses are included after participation is confirmed. The optional Bonus Milestone adds +${FACILITATOR_BONUS_MILESTONE_POINTS} only after you confirm completion below.`
          : "Facilitator bonuses are not included while participation is disabled.",
      )
    }

    syncScoreSummary()
    const observer = new MutationObserver(syncScoreSummary)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => observer.disconnect()
  }, [completed, participating])

  const toggleCompleted = () => {
    if (!participating) return
    writeFacilitatorBonusMilestoneCompletion(profileUrl, !completed)
  }

  if (!portalTarget) return null

  return createPortal(
    <div className="bonus-milestone-confirmation">
      <style>{`
        .bonus-milestone-confirmation {
          margin-top: 12px;
        }
        .bonus-milestone-confirmation-card {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          border: 1px solid rgba(124, 92, 246, .28);
          border-radius: 12px;
          padding: 13px 14px;
          background: rgba(124, 92, 246, .08);
        }
        .bonus-milestone-confirmation-card.is-completed {
          border-color: rgba(52, 211, 153, .34);
          background: rgba(6, 78, 59, .14);
        }
        .bonus-milestone-confirmation-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: rgba(124, 92, 246, .14);
          color: #a78bfa;
        }
        .bonus-milestone-confirmation-card.is-completed
          .bonus-milestone-confirmation-icon {
          background: rgba(16, 185, 129, .13);
          color: #34d399;
        }
        .bonus-milestone-confirmation-icon svg {
          width: 18px;
          height: 18px;
        }
        .bonus-milestone-confirmation-copy strong,
        .bonus-milestone-confirmation-copy small {
          display: block;
        }
        .bonus-milestone-confirmation-copy strong {
          color: var(--facilitator-text, #f8fafc);
          font-size: .76rem;
        }
        .bonus-milestone-confirmation-copy small {
          margin-top: 3px;
          color: var(--facilitator-muted, #94a3b8);
          font-size: .67rem;
          line-height: 1.45;
        }
        .bonus-milestone-confirmation-button {
          min-height: 36px;
          border: 1px solid rgba(124, 92, 246, .45);
          border-radius: 999px;
          padding: 0 13px;
          background: rgba(124, 92, 246, .12);
          color: #c4b5fd;
          font: inherit;
          font-size: .68rem;
          font-weight: 800;
          cursor: pointer;
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
          <strong>I have completed the Bonus Milestone</strong>
          <small>
            Keep the checklist above as guidance. Confirm here only after you
            have completed the required Bonus Milestone process.
          </small>
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
          {completed ? "Completed · +10" : "Mark completed"}
        </button>
      </div>
    </div>,
    portalTarget,
  )
}
