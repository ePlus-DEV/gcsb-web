"use client"

import { ExternalLink, GraduationCap } from "lucide-react"
import { createPortal } from "react-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  FACILITATOR_BONUS_MILESTONE_POINTS,
  getHighestFacilitatorMilestone,
} from "./facilitator-points"
import { FACILITATOR_PANEL_OPEN_EVENT } from "./facilitator-participation"
import {
  DASHBOARD_STORAGE_KEY,
  formatNumber,
  numeric,
  type ArcadeApiResponse,
} from "./model"

const PROFILE_PANEL_SELECTOR = ".profile-panel"
const PROFILE_STATS_SELECTOR = ".profile-stat-grid"
const HOST_CLASS_NAME = "facilitator-profile-score-host"
const SYNC_INTERVAL_MS = 1_000

type FacilitatorProfileScoreProps = {
  profileUrl: string
  participating: boolean
}

type StoredDashboard = {
  profileUrl?: string
  result?: ArcadeApiResponse
}

function readDashboard(): StoredDashboard | null {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== "object" || parsed === null) return null

    const candidate = parsed as StoredDashboard
    if (typeof candidate.result !== "object" || candidate.result === null) {
      return null
    }

    return candidate
  } catch {
    return null
  }
}

function ensureHost(): HTMLElement | null {
  const panel = document.querySelector<HTMLElement>(PROFILE_PANEL_SELECTOR)
  const stats = panel?.querySelector<HTMLElement>(PROFILE_STATS_SELECTOR)
  if (!panel || !stats) return null

  let host = panel.querySelector<HTMLElement>(`.${HOST_CLASS_NAME}`)
  if (!host) {
    host = document.createElement("div")
    host.className = HOST_CLASS_NAME
  }

  if (stats.nextElementSibling !== host) {
    stats.insertAdjacentElement("afterend", host)
  }

  return host
}

export default function FacilitatorProfileScore({
  profileUrl,
  participating,
}: FacilitatorProfileScoreProps) {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [dashboard, setDashboard] = useState<StoredDashboard | null>(null)
  const lastRawRef = useRef("")

  useEffect(() => {
    const sync = () => {
      const nextHost = ensureHost()
      setHost((current) => (current === nextHost ? current : nextHost))

      let raw = ""
      try {
        raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY) ?? ""
      } catch {
        raw = ""
      }

      if (raw === lastRawRef.current) return
      lastRawRef.current = raw
      setDashboard(readDashboard())
    }

    sync()
    const timer = window.setInterval(sync, SYNC_INTERVAL_MS)
    const observer = new MutationObserver((records) => {
      const externalMutation = records.some(
        (record) =>
          !(record.target instanceof Element) ||
          !record.target.closest(`.${HOST_CLASS_NAME}`),
      )
      if (externalMutation) sync()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener("focus", sync)
    window.addEventListener("storage", sync)

    return () => {
      window.clearInterval(timer)
      observer.disconnect()
      window.removeEventListener("focus", sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const score = useMemo(() => {
    const result = dashboard?.result
    if (!result?.faciCounts) return null

    const milestone = getHighestFacilitatorMilestone({
      games: numeric(result.faciCounts.faciGame),
      skills: numeric(result.faciCounts.faciSkill),
    })
    const earnedPoints = numeric(result.arcadePoints?.totalPoints)
    const milestoneBonus = milestone?.bonus ?? 0

    return {
      milestone,
      milestoneBonus,
      totalPoints: earnedPoints + milestoneBonus,
    }
  }, [dashboard])

  const dashboardProfileUrl =
    dashboard?.profileUrl?.trim().replace(/\/$/, "") ?? ""
  const activeProfileUrl = profileUrl.trim().replace(/\/$/, "")

  if (
    !host ||
    !participating ||
    !score?.milestone ||
    !activeProfileUrl ||
    !dashboardProfileUrl ||
    dashboardProfileUrl !== activeProfileUrl
  ) {
    return null
  }

  const openFacilitatorPanel = () => {
    window.dispatchEvent(new Event(FACILITATOR_PANEL_OPEN_EVENT))
  }

  return createPortal(
    <>
      <style>{`
        .facilitator-profile-score-card {
          margin-top: 12px;
          padding: 10px 12px;
          border: 1px solid rgba(139, 92, 246, .25);
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(79, 70, 229, .08), rgba(236, 72, 153, .06));
        }
        .facilitator-profile-score-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .facilitator-profile-score-title {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .facilitator-profile-score-title > svg {
          width: 16px;
          height: 16px;
          flex: 0 0 auto;
          color: #a78bfa;
        }
        .facilitator-profile-score-title > span {
          min-width: 0;
          display: flex;
          align-items: baseline;
          gap: 6px;
          flex-wrap: wrap;
        }
        .facilitator-profile-score-title strong {
          color: #e2e8f0;
          font-size: .68rem;
          font-weight: 850;
        }
        .facilitator-profile-score-title small {
          color: #94a3b8;
          font-size: .57rem;
          font-weight: 700;
        }
        .facilitator-profile-score-head button {
          display: inline-flex;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          padding: 0;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #a78bfa;
          cursor: pointer;
        }
        .facilitator-profile-score-head button:hover,
        .facilitator-profile-score-head button:focus-visible {
          background: rgba(167, 139, 250, .1);
        }
        .facilitator-profile-score-head button svg { width: 13px; height: 13px; }
        .facilitator-profile-score-values {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 8px;
        }
        .facilitator-profile-score-value {
          min-width: 0;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
          padding: 7px 8px;
          border-radius: 8px;
          background: rgba(15, 23, 42, .22);
        }
        .facilitator-profile-score-value span {
          min-width: 0;
          color: #94a3b8;
          font-size: .56rem;
          font-weight: 700;
          line-height: 1.25;
        }
        .facilitator-profile-score-value strong {
          flex: 0 0 auto;
          color: #c084fc;
          font-size: .88rem;
          font-weight: 900;
          line-height: 1;
        }
        .facilitator-profile-score-value.is-total strong { color: #67e8f9; }
        .facilitator-profile-score-note {
          margin: 7px 0 0;
          color: #7f8da9;
          font-size: .54rem;
          font-weight: 650;
          line-height: 1.35;
        }
        .light .facilitator-profile-score-card {
          border-color: rgba(124, 58, 237, .18);
          background: linear-gradient(135deg, rgba(79, 70, 229, .055), rgba(236, 72, 153, .04));
        }
        .light .facilitator-profile-score-title strong { color: #1e293b; }
        .light .facilitator-profile-score-title small,
        .light .facilitator-profile-score-value span,
        .light .facilitator-profile-score-note { color: #64748b; }
        .light .facilitator-profile-score-value { background: rgba(241, 245, 249, .72); }
        .light .facilitator-profile-score-value strong { color: #9333ea; }
        .light .facilitator-profile-score-value.is-total strong { color: #0369a1; }
        @media (max-width: 680px) {
          .facilitator-profile-score-card { margin-top: 10px; padding: 9px 10px; }
          .facilitator-profile-score-title strong { font-size: .64rem; }
          .facilitator-profile-score-title small { font-size: .54rem; }
          .facilitator-profile-score-values { gap: 6px; }
          .facilitator-profile-score-value {
            align-items: flex-start;
            flex-direction: column;
            gap: 3px;
          }
          .facilitator-profile-score-value span { font-size: .52rem; }
          .facilitator-profile-score-value strong { font-size: .82rem; }
          .facilitator-profile-score-note { font-size: .51rem; }
        }
      `}</style>

      <div
        className="facilitator-profile-score-card"
        aria-label="Facilitator score summary"
      >
        <div className="facilitator-profile-score-head">
          <div className="facilitator-profile-score-title">
            <GraduationCap aria-hidden="true" />
            <span>
              <strong>Facilitator Program</strong>
              <small>{score.milestone.label}</small>
            </span>
          </div>
          <button
            type="button"
            onClick={openFacilitatorPanel}
            aria-label="Open Facilitator Program tracker"
            title="Open Facilitator Program tracker"
          >
            <ExternalLink />
          </button>
        </div>

        <div className="facilitator-profile-score-values">
          <div className="facilitator-profile-score-value">
            <span>Facilitator bonus</span>
            <strong>+{formatNumber(score.milestoneBonus)}</strong>
          </div>
          <div className="facilitator-profile-score-value is-total">
            <span>Estimated total after bonus</span>
            <strong>{formatNumber(score.totalPoints)}</strong>
          </div>
        </div>

        <p className="facilitator-profile-score-note">
          Optional +{FACILITATOR_BONUS_MILESTONE_POINTS} Bonus Milestone not included
        </p>
      </div>
    </>,
    host,
  )
}
