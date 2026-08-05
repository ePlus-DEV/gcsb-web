"use client"

import {
  BadgeCheck,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Gamepad2,
  GraduationCap,
  Search,
  Sparkles,
  Trophy,
  X,
} from "lucide-react"
import type {
  ChangeEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react"
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

const SYNC_INTERVAL_MS = 1_500
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",")

const MILESTONES = [
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

type Counts = {
  games: number
  trivia: number
  skills: number
  labFree: number
}

type StatusFilter = "missing" | "completed" | "all"
type TrackFilter = "all" | FacilitatorTrack

function readDashboard(): StoredDashboard | null {
  try {
    const value = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!value) return null

    const parsed = JSON.parse(value) as unknown
    return typeof parsed === "object" && parsed !== null
      ? (parsed as StoredDashboard)
      : null
  } catch {
    return null
  }
}

function milestoneComplete(
  counts: Counts,
  target: (typeof MILESTONES)[number]["requirements"],
): boolean {
  return (
    counts.games >= target.games &&
    counts.trivia >= target.trivia &&
    counts.skills >= target.skills &&
    counts.labFree >= target.labFree
  )
}

function percentage(current: number, target: number): number {
  return Math.min(100, Math.max(0, (current / Math.max(target, 1)) * 100))
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (element) =>
      element.getAttribute("aria-hidden") !== "true" &&
      !element.hasAttribute("hidden"),
  )
}

export default function FacilitatorPanel() {
  const [open, setOpen] = useState(false)
  const [dashboard, setDashboard] = useState<StoredDashboard | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("missing")
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all")
  const [search, setSearch] = useState("")
  const launcherRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let previous = ""

    const sync = () => {
      const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY) ?? ""
      if (raw === previous) return

      previous = raw
      setDashboard(readDashboard())
    }

    sync()
    const timer = window.setInterval(sync, SYNC_INTERVAL_MS)
    window.addEventListener("focus", sync)
    window.addEventListener("storage", sync)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const drawer = drawerRef.current
    if (!drawer) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const focusFrame = window.requestAnimationFrame(() => {
      closeRef.current?.focus()
    })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
        return
      }

      if (event.key !== "Tab") return

      const focusableElements = getFocusableElements(drawer)
      if (focusableElements.length === 0) {
        event.preventDefault()
        drawer.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)!
      const activeElement = document.activeElement
      const focusIsOutsideDrawer =
        !(activeElement instanceof Node) || !drawer.contains(activeElement)

      if (event.shiftKey && (activeElement === firstElement || focusIsOutsideDrawer)) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement || focusIsOutsideDrawer)
      ) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
      launcherRef.current?.focus()
    }
  }, [open])

  const result = dashboard?.result
  const counts = useMemo<Counts>(
    () => ({
      games: numeric(result?.faciCounts?.faciGame),
      trivia: numeric(result?.faciCounts?.faciTrivia),
      skills: numeric(result?.faciCounts?.faciSkill),
      labFree: numeric(result?.faciCounts?.faciCompletion),
    }),
    [result],
  )

  const syllabus = useMemo(
    () =>
      evaluateFacilitatorSyllabus([
        ...(result?.skill ?? []),
        ...(result?.badges ?? []),
      ]),
    [result],
  )

  const completedCount = syllabus.filter((badge) => badge.completed).length
  const missingCount = FACILITATOR_SYLLABUS_2026.length - completedCount
  const normalizedSearch = normalizeFacilitatorBadgeTitle(search)
  const visibleBadges = syllabus.filter((badge) => {
    const statusMatches =
      statusFilter === "all" ||
      (statusFilter === "completed" ? badge.completed : !badge.completed)
    const trackMatches = trackFilter === "all" || badge.track === trackFilter
    const searchMatches =
      !normalizedSearch ||
      normalizeFacilitatorBadgeTitle(badge.title).includes(normalizedSearch)

    return statusMatches && trackMatches && searchMatches
  })

  const completedMilestones = MILESTONES.filter((item) =>
    milestoneComplete(counts, item.requirements),
  )
  const currentMilestone = completedMilestones.at(-1) ?? null
  const nextMilestone =
    MILESTONES.find((item) => !milestoneComplete(counts, item.requirements)) ??
    MILESTONES.at(-1)!
  const bonus = currentMilestone?.bonus ?? 0
  const arcadePoints = numeric(result?.arcadePoints?.totalPoints)

  const goToCalculator = () => {
    setOpen(false)
    window.requestAnimationFrame(() =>
      document.getElementById("calculator")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }),
    )
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
            {result ? `${missingCount} syllabus badges left` : "Program tracker"}
          </small>
        </span>
        <ChevronRight />
      </button>

      {open ? (
        <div
          className="facilitator-overlay"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <section
            ref={drawerRef}
            id="facilitator-dialog"
            className="facilitator-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="facilitator-title"
            aria-describedby="facilitator-description"
            tabIndex={-1}
            onClick={(event: ReactMouseEvent<HTMLElement>) =>
              event.stopPropagation()
            }
          >
            <header className="facilitator-header">
              <div>
                <p>
                  <Sparkles /> Google Cloud Arcade
                </p>
                <h2 id="facilitator-title">Facilitator Program</h2>
                <span id="facilitator-description">
                  Track program activities and find syllabus badges that are
                  still missing.
                </span>
              </div>
              <button
                ref={closeRef}
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
                  The checklist uses the same public-profile result as the
                  calculator.
                </p>
                <button type="button" onClick={goToCalculator}>
                  Go to calculator
                </button>
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
                    <strong>+{formatNumber(bonus)}</strong>
                    <small>Highest completed milestone</small>
                  </article>
                  <article className="is-total">
                    <span>Estimated combined score</span>
                    <strong>{formatNumber(arcadePoints + bonus)}</strong>
                    <small>Arcade score + Facilitator bonus</small>
                  </article>
                </div>

                {!result.faciCounts ? (
                  <div className="facilitator-warning">
                    <CircleHelp />
                    <span>
                      Facilitator activity totals are unavailable, but the
                      syllabus checklist still works from earned badge titles.
                    </span>
                  </div>
                ) : null}

                <section className="facilitator-section facilitator-syllabus-section">
                  <div className="facilitator-section-title">
                    <div>
                      <h3>2026 syllabus badge checklist</h3>
                      <p>Compare the profile with all 51 listed skill badges.</p>
                    </div>
                    <span>
                      {completedCount} / {FACILITATOR_SYLLABUS_2026.length}
                    </span>
                  </div>

                  <div className="facilitator-syllabus-summary">
                    <article className="is-completed">
                      <CheckCircle2 />
                      <span>Completed</span>
                      <strong>{completedCount}</strong>
                    </article>
                    <article className="is-missing">
                      <CircleHelp />
                      <span>Not completed</span>
                      <strong>{missingCount}</strong>
                    </article>
                    <article>
                      <Trophy />
                      <span>Top target</span>
                      <strong>51 + 15</strong>
                      <small>15 additional catalog badges</small>
                    </article>
                  </div>

                  <div className="facilitator-syllabus-progress">
                    <span>
                      <b>{completedCount}</b> of {FACILITATOR_SYLLABUS_2026.length}{" "}
                      syllabus badges completed
                    </span>
                    <i
                      role="progressbar"
                      aria-label="Facilitator syllabus badge progress"
                      aria-valuemin={0}
                      aria-valuemax={FACILITATOR_SYLLABUS_2026.length}
                      aria-valuenow={completedCount}
                    >
                      <b
                        style={{
                          width: `${percentage(
                            completedCount,
                            FACILITATOR_SYLLABUS_2026.length,
                          )}%`,
                        }}
                      />
                    </i>
                  </div>

                  <div
                    className="facilitator-track-filters"
                    aria-label="Filter syllabus by learning track"
                  >
                    <TrackButton
                      active={trackFilter === "all"}
                      label="All tracks"
                      count={`${completedCount}/${FACILITATOR_SYLLABUS_2026.length}`}
                      onClick={() => setTrackFilter("all")}
                    />
                    {FACILITATOR_TRACKS.map((track) => {
                      const badges = syllabus.filter(
                        (badge) => badge.track === track.id,
                      )
                      return (
                        <TrackButton
                          key={track.id}
                          active={trackFilter === track.id}
                          label={track.label}
                          count={`${
                            badges.filter((badge) => badge.completed).length
                          }/${badges.length}`}
                          title={track.description}
                          onClick={() => setTrackFilter(track.id)}
                        />
                      )
                    })}
                  </div>

                  <div className="facilitator-syllabus-toolbar">
                    <label>
                      <Search />
                      <input
                        type="search"
                        value={search}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setSearch(event.target.value)
                        }
                        placeholder="Search syllabus badges"
                        aria-label="Search Facilitator syllabus badges"
                      />
                    </label>
                    <div aria-label="Filter syllabus by completion status">
                      {(["missing", "completed", "all"] as const).map(
                        (value) => (
                          <button
                            key={value}
                            type="button"
                            className={statusFilter === value ? "is-active" : ""}
                            aria-pressed={statusFilter === value}
                            onClick={() => setStatusFilter(value)}
                          >
                            {value[0].toUpperCase() + value.slice(1)}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="facilitator-syllabus-list">
                    {visibleBadges.length ? (
                      visibleBadges.map((badge) => (
                        <article
                          key={badge.courseTemplateId}
                          className={
                            badge.completed ? "is-completed" : "is-missing"
                          }
                        >
                          <span
                            className="facilitator-badge-status"
                            aria-hidden="true"
                          >
                            {badge.completed ? <CheckCircle2 /> : <CircleHelp />}
                          </span>
                          <div>
                            <small>
                              {
                                FACILITATOR_TRACKS.find(
                                  (track) => track.id === badge.track,
                                )?.label
                              }
                            </small>
                            <strong>{badge.title}</strong>
                            <p>
                              {badge.labs} {badge.labs === 1 ? "lab" : "labs"}
                              <span aria-hidden="true">•</span>
                              {badge.credits}{" "}
                              {badge.credits === 1 ? "credit" : "credits"}
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
                    Based on the July–September 2026 syllabus. Google&apos;s
                    official syllabus and program records remain the final source
                    of truth.
                  </p>
                </section>

                <section className="facilitator-section">
                  <div className="facilitator-section-title">
                    <div>
                      <h3>Activity progress</h3>
                      <p>Progress toward {nextMilestone.label}</p>
                    </div>
                    <span>{currentMilestone?.label ?? "Not started"}</span>
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
                      <p>Only the highest completed milestone bonus applies.</p>
                    </div>
                  </div>
                  <div className="facilitator-milestones">
                    {MILESTONES.map((milestone) => {
                      const completed = milestoneComplete(
                        counts,
                        milestone.requirements,
                      )
                      const current = currentMilestone?.id === milestone.id

                      return (
                        <article
                          key={milestone.id}
                          className={`${
                            completed ? "is-completed" : ""
                          }${current ? " is-current" : ""}`}
                        >
                          <div className="facilitator-milestone-heading">
                            <span>
                              {completed ? <BadgeCheck /> : <GraduationCap />}
                            </span>
                            <div>
                              <strong>{milestone.label}</strong>
                              <small>+{milestone.bonus} bonus points</small>
                            </div>
                            {current ? <em>Current</em> : null}
                          </div>
                          <dl>
                            <div>
                              <dt>Games</dt>
                              <dd>{milestone.requirements.games}</dd>
                            </div>
                            <div>
                              <dt>Trivia</dt>
                              <dd>{milestone.requirements.trivia}</dd>
                            </div>
                            <div>
                              <dt>Skills</dt>
                              <dd>{milestone.requirements.skills}</dd>
                            </div>
                            <div>
                              <dt>Lab-free</dt>
                              <dd>{milestone.requirements.labFree}</dd>
                            </div>
                          </dl>
                        </article>
                      )
                    })}
                  </div>
                </section>

                <p className="facilitator-disclaimer">
                  This is an estimate from public-profile data. Final recognition
                  remains subject to Google&apos;s program records.
                </p>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  )
}

function TrackButton({
  active,
  label,
  count,
  title,
  onClick,
}: {
  active: boolean
  label: string
  count: string
  title?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={active ? "is-active" : ""}
      aria-pressed={active}
      title={title}
      onClick={onClick}
    >
      <strong>{label}</strong>
      <small>{count}</small>
    </button>
  )
}

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
  return (
    <article className={current >= target ? "is-completed" : ""}>
      <div>
        <span>{icon}</span>
        <strong>{label}</strong>
        <b>
          {current} / {target}
        </b>
      </div>
      <i
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(current, target)}
      >
        <b style={{ width: `${percentage(current, target)}%` }} />
      </i>
    </article>
  )
}
