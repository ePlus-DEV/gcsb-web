"use client"

import {
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  Trophy,
} from "lucide-react"
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

const BONUS_GUIDE_URL =
  "https://rsvp.withgoogle.com/events/arcade-facilitator/bonus-milestone"
const BONUS_FORM_URL = "https://forms.gle/MMfH5RKp83TfRtXj9"

const BONUS_STEPS = [
  {
    title: "Earn the GEAR Sign-up badge",
    detail: "Complete the GEAR program enrolment requirement.",
  },
  {
    title: "Earn the Arcade - GEAR badge",
    detail: "Make sure the Arcade - GEAR badge appears on your developer profile.",
  },
  {
    title: "Complete Facilitator Milestone 1",
    detail: "Reach at least 6 Arcade Games and 18 Skill Badges.",
  },
  {
    title: "Complete all 4 GEAR skill badges",
    detail:
      "Create Your First Gemini Enterprise Application; Engineer AI Agents with ADK; Deploy Multi-Agent Architectures; and Orchestrate Multi-Agent Workflows with Gemini Enterprise.",
  },
  {
    title: "Build and submit your AI agent",
    detail:
      "Follow the official Bonus Milestone guide, complete the required agent work, then submit the verification form.",
  },
] as const

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
    let currentLegacySection: HTMLElement | null = null
    let currentTarget: HTMLElement | null = null

    const installSimpleSection = () => {
      const legacySection = findLegacyBonusSection()
      if (!legacySection) return

      legacySection.hidden = true
      currentLegacySection = legacySection

      let target = legacySection.parentElement?.querySelector<HTMLElement>(
        "[data-simple-bonus-milestone]",
      )
      if (!target) {
        target = document.createElement("div")
        target.dataset.simpleBonusMilestone = "true"
        legacySection.before(target)
      }

      currentTarget = target
      setPortalTarget((previous) => (previous === target ? previous : target))
    }

    installSimpleSection()
    const observer = new MutationObserver(installSimpleSection)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      currentTarget?.remove()
      if (currentLegacySection?.isConnected) currentLegacySection.hidden = false
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
          ? `Facilitator bonuses are included after participation is confirmed. Follow the Bonus Milestone guide and add +${FACILITATOR_BONUS_MILESTONE_POINTS} only after you confirm the official Bonus Milestone is completed.`
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
    <section className="facilitator-section facilitator-bonus-simple">
      <style>{`
        .facilitator-bonus-simple .bonus-guide {
          display: grid;
          gap: 8px;
          margin-top: 10px;
        }
        .facilitator-bonus-simple .bonus-guide-step {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          border: 1px solid rgba(148, 163, 184, .12);
          border-radius: 10px;
          padding: 10px 11px;
          background: rgba(15, 23, 42, .16);
        }
        .facilitator-bonus-simple .bonus-guide-step > span {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(124, 92, 255, .13);
          color: #c4b5fd;
          font-size: .66rem;
          font-weight: 900;
        }
        .facilitator-bonus-simple .bonus-guide-step strong,
        .facilitator-bonus-simple .bonus-guide-step small {
          display: block;
        }
        .facilitator-bonus-simple .bonus-guide-step strong {
          color: var(--facilitator-text, #f8fafc);
          font-size: .72rem;
        }
        .facilitator-bonus-simple .bonus-guide-step small {
          margin-top: 2px;
          color: var(--facilitator-muted, #94a3b8);
          font-size: .65rem;
          line-height: 1.45;
        }
        .facilitator-bonus-simple .bonus-guide-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
        }
        .facilitator-bonus-simple .bonus-guide-link {
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid rgba(34, 211, 238, .3);
          border-radius: 9px;
          padding: 0 11px;
          background: rgba(34, 211, 238, .07);
          color: #67e8f9;
          font-size: .66rem;
          font-weight: 800;
          text-decoration: none;
        }
        .facilitator-bonus-simple .bonus-guide-link.is-primary {
          border-color: rgba(124, 92, 246, .46);
          background: linear-gradient(
            135deg,
            rgba(98, 53, 220, .9),
            rgba(139, 63, 224, .9)
          );
          color: #fff;
        }
        .facilitator-bonus-simple .bonus-guide-link svg {
          width: 14px;
          height: 14px;
        }
        .facilitator-bonus-simple .bonus-simple-card {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          margin-top: 12px;
          border: 1px solid rgba(34, 211, 238, .22);
          border-radius: 12px;
          padding: 14px;
          background: rgba(8, 47, 73, .16);
        }
        .facilitator-bonus-simple .bonus-simple-card.is-completed {
          border-color: rgba(52, 211, 153, .34);
          background: rgba(6, 78, 59, .16);
        }
        .facilitator-bonus-simple .bonus-simple-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: rgba(124, 92, 255, .14);
          color: #a78bfa;
        }
        .facilitator-bonus-simple .bonus-simple-card.is-completed .bonus-simple-icon {
          background: rgba(16, 185, 129, .13);
          color: #34d399;
        }
        .facilitator-bonus-simple .bonus-simple-icon svg {
          width: 18px;
          height: 18px;
        }
        .facilitator-bonus-simple .bonus-simple-copy strong,
        .facilitator-bonus-simple .bonus-simple-copy small {
          display: block;
        }
        .facilitator-bonus-simple .bonus-simple-copy strong {
          color: var(--facilitator-text, #f8fafc);
          font-size: .78rem;
        }
        .facilitator-bonus-simple .bonus-simple-copy small {
          margin-top: 3px;
          color: var(--facilitator-muted, #94a3b8);
          font-size: .68rem;
          line-height: 1.45;
        }
        .facilitator-bonus-simple .bonus-simple-toggle {
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
        .facilitator-bonus-simple .bonus-simple-toggle.is-completed {
          border-color: rgba(52, 211, 153, .4);
          background: rgba(16, 185, 129, .13);
          color: #6ee7b7;
        }
        .facilitator-bonus-simple .bonus-simple-toggle:disabled {
          cursor: not-allowed;
          opacity: .48;
        }
        @media (max-width: 560px) {
          .facilitator-bonus-simple .bonus-guide-actions {
            grid-template-columns: 1fr;
          }
          .facilitator-bonus-simple .bonus-simple-card {
            grid-template-columns: auto minmax(0, 1fr);
          }
          .facilitator-bonus-simple .bonus-simple-toggle {
            grid-column: 1 / -1;
            width: 100%;
          }
        }
      `}</style>

      <div className="facilitator-section-title">
        <div>
          <h3>Bonus Milestone</h3>
          <p>
            Follow the steps below. After the official Bonus Milestone check is
            complete, confirm it here to add +{FACILITATOR_BONUS_MILESTONE_POINTS}
            {" "}bonus points.
          </p>
        </div>
        <span>{completed && participating ? "+10 added" : "+10 bonus"}</span>
      </div>

      <div className="bonus-guide" aria-label="Bonus Milestone guide">
        {BONUS_STEPS.map((step, index) => (
          <div className="bonus-guide-step" key={step.title}>
            <span aria-hidden="true">{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <small>{step.detail}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="bonus-guide-actions">
        <a
          className="bonus-guide-link"
          href={BONUS_GUIDE_URL}
          target="_blank"
          rel="noreferrer noopener"
        >
          Read official guide <ExternalLink />
        </a>
        <a
          className="bonus-guide-link is-primary"
          href={BONUS_FORM_URL}
          target="_blank"
          rel="noreferrer noopener"
        >
          Submit verification form <ExternalLink />
        </a>
      </div>

      <div
        className={`bonus-simple-card${completed ? " is-completed" : ""}`}
      >
        <span className="bonus-simple-icon" aria-hidden="true">
          {completed ? <CheckCircle2 /> : <CircleHelp />}
        </span>
        <div className="bonus-simple-copy">
          <strong>I have completed the Bonus Milestone</strong>
          <small>
            This is a manual confirmation only. The site does not auto-check the
            individual GEAR or AI-agent requirements.
          </small>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={completed}
          className={`bonus-simple-toggle${completed ? " is-completed" : ""}`}
          disabled={!participating}
          onClick={toggleCompleted}
        >
          {completed ? "Completed · +10" : "Mark completed"}
        </button>
      </div>

      <p className="facilitator-syllabus-note">
        <Trophy aria-hidden="true" />{" "}
        {!participating
          ? "Enable Facilitator participation first."
          : completed
            ? "Bonus Milestone is confirmed for this profile and +10 is included in the score."
            : "Complete the guide above, wait for the official completion check, then mark this as completed."}
      </p>
    </section>,
    portalTarget,
  )
}
