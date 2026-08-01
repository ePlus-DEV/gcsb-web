"use client"

import {
  BadgeCheck,
  BookOpenCheck,
  ChevronRight,
  CircleHelp,
  Gamepad2,
  GraduationCap,
  Sparkles,
  Trophy,
  X,
} from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ArcadeApiResponse } from "./model"
import { formatNumber, numeric } from "./model"

const STORAGE_KEY = "eplus-arcade-dashboard-v1"
const STORAGE_SYNC_INTERVAL_MS = 1_500

const FACILITATOR_MILESTONES = [
  {
    id: "1",
    label: "Milestone 1",
    bonus: 2,
    requirements: { games: 6, trivia: 5, skills: 14, labFree: 6 },
  },
  {
    id: "2",
    label: "Milestone 2",
    bonus: 8,
    requirements: { games: 8, trivia: 6, skills: 28, labFree: 12 },
  },
  {
    id: "3",
    label: "Milestone 3",
    bonus: 15,
    requirements: { games: 10, trivia: 7, skills: 38, labFree: 18 },
  },
  {
    id: "ultimate",
    label: "Ultimate",
    bonus: 25,
    requirements: { games: 12, trivia: 8, skills: 52, labFree: 24 },
  },
] as const

type StoredDashboard = {
  profileUrl?: string
  result?: ArcadeApiResponse
}

type DashboardSnapshot = {
  raw: string
  dashboard: StoredDashboard | null
}

type FacilitatorCounts = {
  games: number
  trivia: number
  skills: number
  labFree: number
}

/**
 * Read the persisted dashboard state without allowing unavailable browser
 * storage to break the Facilitator launcher or drawer.
 */
function readDashboardSnapshot(): DashboardSnapshot {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? ""
    if (!raw) return { raw, dashboard: null }

    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== "object" || parsed === null) {
      return { raw, dashboard: null }
    }

    return { raw, dashboard: parsed as StoredDashboard }
  } catch {
    return { raw: "", dashboard: null }
  }
}

/** Determine whether every activity requirement for a milestone is met. */
function hasCompletedMilestone(
  counts: FacilitatorCounts,
  requirements: (typeof FACILITATOR_MILESTONES)[number]["requirements"],
): boolean {
  return (
    counts.games >= requirements.games &&
    counts.trivia >= requirements.trivia &&
    counts.skills >= requirements.skills &&
    counts.labFree >= requirements.labFree
  )
}

/** Convert an activity count into a bounded percentage for its progress bar. */
function progress(current: number, target: number): number {
  return Math.min(100, Math.max(0, (current / Math.max(target, 1)) * 100))
}

/**
 * Render the Google Cloud Arcade Facilitator tracker using the most recent
 * calculator response persisted by the main dashboard.
 */
export default function FacilitatorPanel() {
  const [open, setOpen] = useState(false)
  const [dashboard, setDashboard] = useState<StoredDashboard | null>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let previousRaw: string | null = null

    const sync = () => {
      const snapshot = readDashboardSnapshot()
      if (snapshot.raw === previousRaw) return

      previousRaw = snapshot.raw
      setDashboard(snapshot.dashboard)
    }

    const syncWhenVisible = () => {
      if (!document.hidden) sync()
    }

    sync()
    const interval = window.setInterval(syncWhenVisible, STORAGE_SYNC_INTERVAL_MS)
    window.addEventListener("focus", sync)
    window.addEventListener("storage", sync)
    document.addEventListener("visibilitychange", syncWhenVisible)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", sync)
      window.removeEventListener("storage", sync)
      document.removeEventListener("visibilitychange", syncWhenVisible)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("keydown", closeOnEscape)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", closeOnEscape)
      launcherRef.current?.focus()
    }
  }, [open])

  const result = dashboard?.result
  const counts = useMemo<FacilitatorCounts>(
    () => ({
      games: numeric(result?.faciCounts?.faciGame),
      trivia: numeric(result?.faciCounts?.faciTrivia),
      skills: numeric(result?.faciCounts?.faciSkill),
      labFree: numeric(result?.faciCounts?.faciCompletion),
    }),
    [result],
  )

  const completedMilestones = FACILITATOR_MILESTONES.filter((milestone) =>
    hasCompletedMilestone(counts, milestone.requirements),
  )
  const currentMilestone = completedMilestones.at(-1) ?? null
  const nextMilestone =
    FACILITATOR_MILESTONES.find(
      (milestone) => !hasCompletedMilestone(counts, milestone.requirements),
    ) ?? FACILITATOR_MILESTONES.at(-1)!
  const facilitatorBonus = currentMilestone?.bonus ?? 0
  const arcadePoints = numeric(result?.arcadePoints?.totalPoints)
  const hasFacilitatorData = Boolean(result?.faciCounts)
  const hasCompletedUltimate = currentMilestone?.id === "ultimate"

  const closeAndGoToCalculator = () => {
    setOpen(false)
    window.requestAnimationFrame(() => {
      document.getElementById("calculator")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    })
  }

  return (
    <>
      <button
        ref={launcherRef}
        className="facilitator-launcher"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="facilitator-dialog"
      >
        <GraduationCap />
        <span>
          <strong>Facilitator</strong>
          <small aria-live="polite">
            {hasFacilitatorData ? `+${facilitatorBonus} bonus pts` : "Program tracker"}
          </small>
        </span>
        <ChevronRight />
      </button>

      {open && (
        <div className="facilitator-overlay" role="presentation" onClick={() => setOpen(false)}>
          <section
            id="facilitator-dialog"
            className="facilitator-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="facilitator-title"
            aria-describedby="facilitator-description"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="facilitator-header">
              <div>
                <p><Sparkles /> Google Cloud Arcade</p>
                <h2 id="facilitator-title">Facilitator Program</h2>
                <span id="facilitator-description">
                  Track Facilitator activities and the highest milestone bonus.
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Facilitator tracker"
              >
                <X />
              </button>
            </header>

            {!result ? (
              <div className="facilitator-empty">
                <GraduationCap />
                <strong>Analyze a public profile first</strong>
                <p>
                  The Facilitator tracker uses the same returned profile data. Complete the calculator above, then reopen this panel.
                </p>
                <button type="button" onClick={closeAndGoToCalculator}>Go to calculator</button>
              </div>
            ) : (
              <div className="facilitator-content">
                <div className="facilitator-score-grid">
                  <article>
                    <span>Arcade score</span>
                    <strong>{formatNumber(arcadePoints)}</strong>
                    <small>Regular Arcade points</small>
                  </article>
                  <article className="is-bonus">
                    <span>Facilitator bonus</span>
                    <strong>+{formatNumber(facilitatorBonus)}</strong>
                    <small>Highest completed milestone</small>
                  </article>
                  <article className="is-total">
                    <span>Estimated combined score</span>
                    <strong>{formatNumber(arcadePoints + facilitatorBonus)}</strong>
                    <small>Arcade score + Facilitator bonus</small>
                  </article>
                </div>

                {!hasFacilitatorData && (
                  <div className="facilitator-warning">
                    <CircleHelp />
                    <span>
                      This profile response does not contain Facilitator activity counts yet. Bonus remains 0 until the crawler returns <code>faciCounts</code>.
                    </span>
                  </div>
                )}

                <section className="facilitator-section">
                  <div className="facilitator-section-title">
                    <div>
                      <h3>Activity progress</h3>
                      <p>
                        {hasCompletedUltimate
                          ? "All Facilitator milestones completed"
                          : `Progress toward ${nextMilestone.label}`}
                      </p>
                    </div>
                    <span>{currentMilestone ? currentMilestone.label : "Not started"}</span>
                  </div>

                  <div className="facilitator-activity-grid">
                    <Activity
                      icon={<Gamepad2 />}
                      label="Games"
                      current={counts.games}
                      target={nextMilestone.requirements.games}
                    />
                    <Activity
                      icon={<Trophy />}
                      label="Trivia"
                      current={counts.trivia}
                      target={nextMilestone.requirements.trivia}
                    />
                    <Activity
                      icon={<BadgeCheck />}
                      label="Skill badges"
                      current={counts.skills}
                      target={nextMilestone.requirements.skills}
                    />
                    <Activity
                      icon={<BookOpenCheck />}
                      label="Lab-free courses"
                      current={counts.labFree}
                      target={nextMilestone.requirements.labFree}
                    />
                  </div>
                </section>

                <section className="facilitator-section">
                  <div className="facilitator-section-title">
                    <div>
                      <h3>Facilitator milestones</h3>
                      <p>The bonus is not cumulative; only the highest completed milestone applies.</p>
                    </div>
                  </div>

                  <div className="facilitator-milestones">
                    {FACILITATOR_MILESTONES.map((milestone) => {
                      const completed = hasCompletedMilestone(counts, milestone.requirements)
                      const active = currentMilestone?.id === milestone.id

                      return (
                        <article
                          key={milestone.id}
                          className={`${completed ? "is-completed" : ""}${active ? " is-current" : ""}`}
                        >
                          <div className="facilitator-milestone-heading">
                            <span>{completed ? <BadgeCheck /> : <GraduationCap />}</span>
                            <div>
                              <strong>{milestone.label}</strong>
                              <small>+{milestone.bonus} bonus points</small>
                            </div>
                            {active && <em>Current</em>}
                          </div>
                          <dl>
                            <div><dt>Games</dt><dd>{milestone.requirements.games}</dd></div>
                            <div><dt>Trivia</dt><dd>{milestone.requirements.trivia}</dd></div>
                            <div><dt>Skills</dt><dd>{milestone.requirements.skills}</dd></div>
                            <div><dt>Lab-free</dt><dd>{milestone.requirements.labFree}</dd></div>
                          </dl>
                        </article>
                      )
                    })}
                  </div>
                </section>

                <p className="facilitator-disclaimer">
                  Facilitator tracking is relevant only to learners enrolled in the Facilitator Program. The calculator estimates progress from public profile data; final recognition remains subject to Google&apos;s program records.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}

/** Render one Facilitator activity and its accessible progress indicator. */
function Activity({
  icon,
  label,
  current,
  target,
}: {
  icon: ReactNode
  label: string
  current: number
  target: number
}) {
  const completed = current >= target
  const progressValue = progress(current, target)

  return (
    <article className={completed ? "is-completed" : ""}>
      <div>
        <span>{icon}</span>
        <strong>{label}</strong>
        <b>{current} / {target}</b>
      </div>
      <i
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(current, target)}
      >
        <b style={{ width: `${progressValue}%` }} />
      </i>
    </article>
  )
}
