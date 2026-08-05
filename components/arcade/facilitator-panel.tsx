"use client"

import {
  BadgeCheck,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  CircleHelp,
  ExternalLink,
  Gamepad2,
  GraduationCap,
  ListChecks,
  Search,
  Sparkles,
  Trophy,
  X,
} from "lucide-react"
import type { ChangeEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  evaluateFacilitatorSyllabus,
  FACILITATOR_SYLLABUS_2026,
  FACILITATOR_TRACKS,
  normalizeFacilitatorBadgeTitle,
  type FacilitatorTrack,
} from "./facilitator-syllabus"
import type { ArcadeApiResponse } from "./model"
import { DASHBOARD_STORAGE_KEY, formatNumber, numeric } from "./model"

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

type SyllabusStatusFilter = "missing" | "completed" | "all"
type SyllabusTrackFilter = "all" | FacilitatorTrack

/**
 * Read the persisted dashboard state without allowing unavailable browser
 * storage to break the Facilitator launcher or drawer.
 */
function readDashboardSnapshot(): DashboardSnapshot {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY) ?? ""
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
  const [syllabusStatusFilter, setSyllabusStatusFilter] =
    useState<SyllabusStatusFilter>("missing")
  const [syllabusTrackFilter, setSyllabusTrackFilter] =
    useState<SyllabusTrackFilter>("all")
  const [syllabusSearch, setSyllabusSearch] = useState("")
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

  const syllabusStatuses = useMemo(
    () =>
      evaluateFacilitatorSyllabus([
        ...(result?.skill ?? []),
        ...(result?.badges ?? []),
      ]),
    [result],
  )
  const syllabusCompletedCount = syllabusStatuses.filter(
    (badge) => badge.completed,
  ).length
  const syllabusMissingCount =
    FACILITATOR_SYLLABUS_2026.length - syllabusCompletedCount
  const normalizedSyllabusSearch = normalizeFacilitatorBadgeTitle(syllabusSearch)
  const filteredSyllabusStatuses = syllabusStatuses.filter((badge) => {
    const matchesStatus =
      syllabusStatusFilter === "all" ||
      (syllabusStatusFilter === "completed" && badge.completed) ||
      (syllabusStatusFilter === "missing" && !badge.completed)
    const matchesTrack =
      syllabusTrackFilter === "all" || badge.track === syllabusTrackFilter
    const matchesSearch =
      !normalizedSyllabusSearch ||
      normalizeFacilitatorBadgeTitle(badge.title).includes(
        normalizedSyllabusSearch,
      )

    return matchesStatus && matchesTrack && matchesSearch
  })

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
            {result
              ? `${syllabusMissingCount} syllabus badges left`
              : "Program tracker"}
          </small>
        </span>
        <ChevronRight />
      </button>

      {open && (
        <div
          className="facilitator-overlay"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <section
            id="facilitator-dialog"
            className="facilitator-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="facilitator-title"
            aria-describedby="facilitator-description"
            onClick={(event: ReactMouseEvent<HTMLElement>) => event.stopPropagation()}
          >
            <header className="facilitator-header">
              <div>
                <p><Sparkles /> Google Cloud Arcade</p>
                <h2 id="facilitator-title">Facilitator Program</h2>
                <span id="facilitator-description">
                  Track program activities and find syllabus badges that are still missing.
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
                      This profile response does not contain Facilitator activity counts yet. The syllabus checklist still works from earned badge titles.
                    </span>
                  </div>
                )}

                <section className="facilitator-section facilitator-syllabus-section">
                  <div className="facilitator-section-title">
                    <div>
                      <h3>2026 syllabus badge checklist</h3>
                      <p>
                        Compare the public profile with the 51 listed skill badges and open any unfinished course directly.
                      </p>
                    </div>
                    <span>{syllabusCompletedCount} / {FACILITATOR_SYLLABUS_2026.length}</span>
                  </div>

                  <div className="facilitator-syllabus-summary">
                    <article className="is-completed">
                      <CheckCircle2 />
                      <span>Completed</span>
                      <strong>{syllabusCompletedCount}</strong>
                    </article>
                    <article className="is-missing">
                      <CircleDashed />
                      <span>Not completed</span>
                      <strong>{syllabusMissingCount}</strong>
                    </article>
                    <article>
                      <ListChecks />
                      <span>Top target</span>
                      <strong>51 + 15</strong>
                      <small>15 additional catalog badges</small>
                    </article>
                  </div>

                  <div className="facilitator-syllabus-progress">
                    <span>
                      <b>{syllabusCompletedCount}</b> of {FACILITATOR_SYLLABUS_2026.length} syllabus badges completed
                    </span>
                    <i
                      role="progressbar"
                      aria-label="Facilitator syllabus badge progress"
                      aria-valuemin={0}
                      aria-valuemax={FACILITATOR_SYLLABUS_2026.length}
                      aria-valuenow={syllabusCompletedCount}
                    >
                      <b
                        style={{
                          width: `${progress(
                            syllabusCompletedCount,
                            FACILITATOR_SYLLABUS_2026.length,
                          )}%`,
                        }}
                      />
                    </i>
                  </div>

                  <div className="facilitator-track-filters" aria-label="Filter syllabus by learning track">
                    <button
                      type="button"
                      className={syllabusTrackFilter === "all" ? "is-active" : ""}
                      aria-pressed={syllabusTrackFilter === "all"}
                      onClick={() => setSyllabusTrackFilter("all")}
                    >
                      <strong>All tracks</strong>
                      <small>{syllabusCompletedCount}/{FACILITATOR_SYLLABUS_2026.length}</small>
                    </button>
                    {FACILITATOR_TRACKS.map((track) => {
                      const trackBadges = syllabusStatuses.filter(
                        (badge) => badge.track === track.id,
                      )
                      const completed = trackBadges.filter(
                        (badge) => badge.completed,
                      ).length

                      return (
                        <button
                          key={track.id}
                          type="button"
                          className={syllabusTrackFilter === track.id ? "is-active" : ""}
                          aria-pressed={syllabusTrackFilter === track.id}
                          title={track.description}
                          onClick={() => setSyllabusTrackFilter(track.id)}
                        >
                          <strong>{track.label}</strong>
                          <small>{completed}/{trackBadges.length}</small>
                        </button>
                      )
                    })}
                  </div>

                  <div className="facilitator-syllabus-toolbar">
                    <label>
                      <Search />
                      <input
                        type="search"
                        value={syllabusSearch}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => setSyllabusSearch(event.target.value)}
                        placeholder="Search syllabus badges"
                        aria-label="Search Facilitator syllabus badges"
                      />
                    </label>
                    <div aria-label="Filter syllabus by completion status">
                      {([
                        ["missing", "Missing"],
                        ["completed", "Completed"],
                        ["all", "All"],
                      ] as const).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          className={syllabusStatusFilter === value ? "is-active" : ""}
                          aria-pressed={syllabusStatusFilter === value}
                          onClick={() => setSyllabusStatusFilter(value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="facilitator-syllabus-list">
                    {filteredSyllabusStatuses.length > 0 ? (
                      filteredSyllabusStatuses.map((badge) => (
                        <article
                          key={badge.courseTemplateId}
                          className={badge.completed ? "is-completed" : "is-missing"}
                        >
                          <span className="facilitator-badge-status" aria-hidden="true">
                            {badge.completed ? <CheckCircle2 /> : <CircleDashed />}
                          </span>
                          <div>
                            <small>
                              {FACILITATOR_TRACKS.find(
                                (track) => track.id === badge.track,
                              )?.label}
                            </small>
                            <strong>{badge.title}</strong>
                            <p>
                              {badge.labs} {badge.labs === 1 ? "lab" : "labs"}
                              <span aria-hidden="true">•</span>
                              {badge.credits} {badge.credits === 1 ? "credit" : "credits"}
                              {badge.completed && badge.earnedBadge?.dateEarned ? (
                                <>
                                  <span aria-hidden="true">•</span>
                                  Earned {badge.earnedBadge.dateEarned}
                                </>
                              ) : null}
                            </p>
                          </div>
                          <a
                            href={badge.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            aria-label={`Open ${badge.title}`}
                            title={`Open ${badge.title}`}
                          >
                            <ExternalLink />
                          </a>
                        </article>
                      ))
                    ) : (
                      <div className="facilitator-syllabus-empty">
                        <Search />
                        <strong>No badges match these filters</strong>
                        <p>Clear the search or select another track/status.</p>
                      </div>
                    )}
                  </div>

                  <p className="facilitator-syllabus-note">
                    Based on the July–September 2026 syllabus snapshot. Course names and eligibility can change, so Google&apos;s official syllabus and program records remain the final source of truth.
                  </p>
                </section>

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
