"use client"

import { ExternalLink, Sparkles } from "lucide-react"
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

    const counts = {
      games: numeric(result.faciCounts.faciGame),
      skills: numeric(result.faciCounts.faciSkill),
    }
    const milestone = getHighestFacilitatorMilestone(counts)
    const earnedPoints = numeric(result.arcadePoints?.totalPoints)
    const milestoneBonus = milestone?.bonus ?? 0
    const appliedBonus = participating ? milestoneBonus : 0

    return {
      earnedPoints,
      milestone,
      milestoneBonus,
      appliedBonus,
      totalPoints: earnedPoints + appliedBonus,
    }
  }, [dashboard, participating])

  const dashboardProfileUrl = dashboard?.profileUrl?.trim().replace(/\/$/, "") ?? ""
  const activeProfileUrl = profileUrl.trim().replace(/\/$/, "")

  if (
    !host ||
    !score ||
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
          padding: 11px 12px;
          border: 1px solid rgba(139, 92, 246, .25);
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(79, 70, 229, .08), rgba(236, 72, 153, .06));
        }
        .facilitator-profile-score-equation {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: 7px;
        }
        .facilitator-profile-score-part {
          min-width: 0;
          text-align: center;
        }
        .facilitator-profile-score-part span {
          display: block;
          margin-bottom: 2px;
          color: #94a3b8;
          font-size: .58rem;
          font-weight: 750;
          line-height: 1.2;
        }
        .facilitator-profile-score-part strong {
          display: block;
          color: #e2e8f0;
          font-size: .92rem;
          font-weight: 900;
          line-height: 1.15;
        }
        .facilitator-profile-score-part.is-bonus strong { color: #c084fc; }
        .facilitator-profile-score-part.is-total strong { color: #67e8f9; }
        .facilitator-profile-score-operator {
          color: #64748b;
          font-size: .8rem;
          font-weight: 900;
        }
        .facilitator-profile-score-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 9px;
          padding-top: 8px;
          border-top: 1px solid rgba(148, 163, 184, .14);
        }
        .facilitator-profile-score-meta span {
          min-width: 0;
          color: #94a3b8;
          font-size: .58rem;
          font-weight: 650;
          line-height: 1.35;
        }
        .facilitator-profile-score-meta b { color: #cbd5e1; }
        .facilitator-profile-score-meta button {
          display: inline-flex;
          flex: 0 0 auto;
          align-items: center;
          gap: 4px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #a78bfa;
          font: inherit;
          font-size: .58rem;
          font-weight: 800;
          cursor: pointer;
        }
        .facilitator-profile-score-meta button svg { width: 11px; height: 11px; }
        .light .facilitator-profile-score-card {
          border-color: rgba(124, 58, 237, .18);
          background: linear-gradient(135deg, rgba(79, 70, 229, .055), rgba(236, 72, 153, .04));
        }
        .light .facilitator-profile-score-part span,
        .light .facilitator-profile-score-meta span { color: #64748b; }
        .light .facilitator-profile-score-part strong { color: #1e293b; }
        .light .facilitator-profile-score-part.is-bonus strong { color: #9333ea; }
        .light .facilitator-profile-score-part.is-total strong { color: #0369a1; }
        .light .facilitator-profile-score-meta b { color: #475569; }
        @media (max-width: 680px) {
          .facilitator-profile-score-card { margin-top: 10px; padding: 10px; }
          .facilitator-profile-score-equation { gap: 5px; }
          .facilitator-profile-score-part span { font-size: .54rem; }
          .facilitator-profile-score-part strong { font-size: .82rem; }
          .facilitator-profile-score-meta { align-items: flex-start; }
          .facilitator-profile-score-meta span { font-size: .54rem; }
          .facilitator-profile-score-meta button span { display: none; }
          .facilitator-profile-score-meta button svg { width: 13px; height: 13px; }
        }
      `}</style>

      <div className="facilitator-profile-score-card" aria-label="Facilitator score summary">
        <div className="facilitator-profile-score-equation">
          <div className="facilitator-profile-score-part">
            <span>Overall Arcade points</span>
            <strong>{formatNumber(score.earnedPoints)}</strong>
          </div>
          <b className="facilitator-profile-score-operator" aria-hidden="true">+</b>
          <div className="facilitator-profile-score-part is-bonus">
            <span>Facilitator bonus</span>
            <strong>{participating ? `+${formatNumber(score.appliedBonus)}` : "Off"}</strong>
          </div>
          <b className="facilitator-profile-score-operator" aria-hidden="true">=</b>
          <div className="facilitator-profile-score-part is-total">
            <span>Estimated total after bonus</span>
            <strong>{formatNumber(score.totalPoints)}</strong>
          </div>
        </div>

        <div className="facilitator-profile-score-meta">
          <span>
            {participating
              ? <><b>{score.milestone?.label ?? "No milestone yet"}</b> · Optional +{FACILITATOR_BONUS_MILESTONE_POINTS} Bonus Milestone not included</>
              : <>Enable to include bonus points · Optional +{FACILITATOR_BONUS_MILESTONE_POINTS} Bonus Milestone not included</>}
          </span>
          <button type="button" onClick={openFacilitatorPanel}>
            <span>View program details</span><ExternalLink />
          </button>
        </div>
      </div>
    </>,
    host,
  )
}
