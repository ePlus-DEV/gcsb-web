"use client"

import {
  BadgeCheck,
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
  CSSProperties,
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
const BONUS_MILESTONE_POINTS = 10
const BONUS_GUIDE_URL =
  "https://rsvp.withgoogle.com/events/arcade-facilitator/bonus-milestone"
const BONUS_FORM_URL = "https://forms.gle/MMfH5RKp83TfRtXj9"
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
    bonus: 5,
    color: "#4285f4",
    requirements: { games: 6, skills: 18 },
  },
  {
    id: "2",
    label: "Milestone 2",
    bonus: 15,
    color: "#f9ab00",
    requirements: { games: 8, skills: 34 },
  },
  {
    id: "3",
    label: "Milestone 3",
    bonus: 25,
    color: "#34a853",
    requirements: { games: 10, skills: 50 },
  },
  {
    id: "ultimate",
    label: "Ultimate Milestone",
    bonus: 35,
    color: "#ea4335",
    requirements: { games: 12, skills: 66 },
  },
] as const

const GEAR_SKILL_BADGES = [
  "Create Your First Gemini Enterprise Application",
  "Engineer AI Agents with Agent Development Kit (ADK)",
  "Deploy Multi-Agent Architectures",
  "Orchestrate Multi-Agent Workflows with Gemini Enterprise",
] as const

const GEAR_SIGNUP_BADGE_ALIASES = [
  "GEAR Sign-up Badge",
  "GEAR Signup Badge",
  "GEAR Program Enrolment Badge",
  "GEAR Program Enrollment Badge",
]

const ARCADE_GEAR_BADGE_ALIASES = [
  "Arcade - GEAR Badge",
  "Arcade GEAR Badge",
  "GEAR Arcade Badge",
]

type StoredDashboard = {
  profileUrl?: string
  result?: ArcadeApiResponse
}

type Counts = {
  games: number
  skills: number
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
  return counts.games >= target.games && counts.skills >= target.skills
}

function regularArcadePointsForActivities(counts: Counts): number {
  return counts.games + Math.floor(counts.skills / 2)
}

function percentage(current: number, target: number): number {
  return Math.min(100, Math.max(0, (current / Math.max(target, 1)) * 100))
}

function milestoneProgress(
  counts: Counts,
  target: (typeof MILESTONES)[number]["requirements"],
) {
  const completed =
    Math.min(counts.games, target.games) + Math.min(counts.skills, target.skills)
  const total = target.games + target.skills

  return {
    completed,
    total,
    percent: Math.floor(percentage(completed, total)),
  }
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

function titleMatchesAliases(title: string, aliases: readonly string[]): boolean {
  const normalizedTitle = normalizeFacilitatorBadgeTitle(title)
  return aliases.some((alias) => {
    const normalizedAlias = normalizeFacilitatorBadgeTitle(alias)
    return (
      normalizedTitle === normalizedAlias ||
      normalizedTitle.includes(normalizedAlias)
    )
  })
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
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus())

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== "Tab") return

      const focusableElements = getFocusableElements(drawer)
      if (!focusableElements.length) {
        event.preventDefault()
        drawer.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)!
      const activeElement = document.activeElement
      const focusIsOutsideDrawer =
        !(activeElement instanceof Node) || !drawer.contains(activeElement)

      if (
        event.shiftKey &&
        (activeElement === firstElement || focusIsOutsideDrawer)
      ) {
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
      skills: numeric(result?.faciCounts?.faciSkill),
    }),
    [result],
  )

  const earnedBadges = useMemo(
    () => [
      ...(result?.skill ?? []),
      ...(result?.badges ?? []),
      ...(result?.special ?? []),
      ...(result?.game ?? []),
    ],
    [result],
  )
  const syllabus = useMemo(
    () => evaluateFacilitatorSyllabus(earnedBadges),
    [earnedBadges],
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
  const milestoneBonus = currentMilestone?.bonus ?? 0
  const overallArcadePoints = numeric(result?.arcadePoints?.totalPoints)
  const estimatedTotal = overallArcadePoints + milestoneBonus
  const hasFacilitatorData = Boolean(result?.faciCounts)
  const completedUltimate = currentMilestone?.id === "ultimate"
  const completedMilestoneOne = milestoneComplete(
    counts,
    MILESTONES[0].requirements,
  )

  const hasGearSignupBadge = earnedBadges.some((badge) =>
    titleMatchesAliases(badge.title, GEAR_SIGNUP_BADGE_ALIASES),
  )
  const hasArcadeGearBadge = earnedBadges.some((badge) =>
    titleMatchesAliases(badge.title, ARCADE_GEAR_BADGE_ALIASES),
  )
  const gearSkillStatuses = GEAR_SKILL_BADGES.map((title) => ({
    title,
    completed: earnedBadges.some(
      (badge) =>
        normalizeFacilitatorBadgeTitle(badge.title) ===
        normalizeFacilitatorBadgeTitle(title),
    ),
  }))
  const completedGearSkills = gearSkillStatuses.filter(
    (badge) => badge.completed,
  ).length
  const completedBonusProfileChecks = [
    hasGearSignupBadge,
    hasArcadeGearBadge,
    completedMilestoneOne,
    completedGearSkills === GEAR_SKILL_BADGES.length,
  ].filter(Boolean).length
  const readyForBonusManualSteps = completedBonusProfileChecks === 4

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
                  Track Facilitator milestone bonuses and find syllabus badges
                  that are still missing.
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
                <p>The tracker uses the same public-profile result as the calculator.</p>
                <button type="button" onClick={goToCalculator}>
                  Go to calculator
                </button>
              </div>
            ) : (
              <div className="facilitator-content">
                <div className="facilitator-score-grid">
                  <article>
                    <span>Overall Arcade points</span>
                    <strong>{formatNumber(overallArcadePoints)}</strong>
                    <small>Includes regular points from games and skill badges</small>
                  </article>
                  <article className="is-bonus">
                    <span>Facilitator bonus</span>
                    <strong>+{formatNumber(milestoneBonus)}</strong>
                    <small>Highest completed milestone only</small>
                  </article>
                  <article className="is-total">
                    <span>Estimated total after bonus</span>
                    <strong>{formatNumber(estimatedTotal)}</strong>
                    <small>Optional +10 Bonus Milestone not included</small>
                  </article>
                </div>

                <div className="facilitator-warning">
                  <CircleHelp />
                  <span>
                    Facilitator game and skill-badge counts only determine the
                    milestone bonus. Their regular Arcade points are already in
                    the overall score and are not added twice.
                  </span>
                </div>

                {!hasFacilitatorData ? (
                  <div className="facilitator-warning">
                    <CircleHelp />
                    <span>
                      Facilitator activity totals are unavailable, so milestone
                      progress and bonus cannot be estimated yet.
                    </span>
                  </div>
                ) : null}

                <SyllabusSection
                  syllabus={syllabus}
                  visibleBadges={visibleBadges}
                  completedCount={completedCount}
                  missingCount={missingCount}
                  trackFilter={trackFilter}
                  statusFilter={statusFilter}
                  search={search}
                  setTrackFilter={setTrackFilter}
                  setStatusFilter={setStatusFilter}
                  setSearch={setSearch}
                />

                <section className="facilitator-section">
                  <div className="facilitator-section-title">
                    <div>
                      <h3>Milestone progress</h3>
                      <p>
                        {completedUltimate
                          ? "All standard milestones completed"
                          : `Progress toward ${nextMilestone.label}`}
                      </p>
                    </div>
                    <span>{currentMilestone?.label ?? "Not started"}</span>
                  </div>
                  <div className="facilitator-activity-grid">
                    <Activity
                      icon={<Gamepad2 />}
                      label="Arcade games"
                      current={counts.games}
                      target={nextMilestone.requirements.games}
                    />
                    <Activity
                      icon={<BadgeCheck />}
                      label="Skill badges"
                      current={counts.skills}
                      target={nextMilestone.requirements.skills}
                    />
                  </div>
                </section>

                <section className="facilitator-section">
                  <div className="facilitator-section-title">
                    <div>
                      <h3>Facilitator milestones</h3>
                      <p>
                        Progress follows Google&apos;s official combined completed
                        requirements display. Only the highest milestone bonus
                        applies.
                      </p>
                    </div>
                  </div>
                  <div className="facilitator-milestones">
                    {MILESTONES.map((milestone) => {
                      const completed = milestoneComplete(
                        counts,
                        milestone.requirements,
                      )
                      const current = currentMilestone?.id === milestone.id
                      const regularPoints = regularArcadePointsForActivities(
                        milestone.requirements,
                      )
                      const progress = milestoneProgress(
                        counts,
                        milestone.requirements,
                      )

                      return (
                        <article
                          key={milestone.id}
                          className={`${completed ? "is-completed" : ""}${
                            current ? " is-current" : ""
                          }`}
                        >
                          <div className="facilitator-milestone-heading">
                            <span>
                              {completed ? <BadgeCheck /> : <GraduationCap />}
                            </span>
                            <div>
                              <strong>{milestone.label}</strong>
                              <small>
                                Complete any {milestone.requirements.games} Arcade
                                Games and {milestone.requirements.skills} Skill
                                Badges
                              </small>
                            </div>
                            {current ? <em>Current</em> : null}
                          </div>

                          <MilestoneProgressBar
                            label={milestone.label}
                            color={milestone.color}
                            completed={progress.completed}
                            total={progress.total}
                            percent={progress.percent}
                          />

                          <dl>
                            <div>
                              <dt>Games</dt>
                              <dd>
                                {Math.min(counts.games, milestone.requirements.games)} /{" "}
                                {milestone.requirements.games}
                              </dd>
                            </div>
                            <div>
                              <dt>Skills</dt>
                              <dd>
                                {Math.min(counts.skills, milestone.requirements.skills)} /{" "}
                                {milestone.requirements.skills}
                              </dd>
                            </div>
                            <div>
                              <dt>Regular Arcade</dt>
                              <dd>{regularPoints}</dd>
                            </div>
                            <div>
                              <dt>Facilitator bonus</dt>
                              <dd>+{milestone.bonus}</dd>
                            </div>
                          </dl>
                        </article>
                      )
                    })}
                  </div>
                </section>

                <BonusMilestoneSection
                  completedBonusProfileChecks={completedBonusProfileChecks}
                  hasGearSignupBadge={hasGearSignupBadge}
                  hasArcadeGearBadge={hasArcadeGearBadge}
                  completedMilestoneOne={completedMilestoneOne}
                  completedGearSkills={completedGearSkills}
                  gearSkillStatuses={gearSkillStatuses}
                  readyForBonusManualSteps={readyForBonusManualSteps}
                />

                <p className="facilitator-disclaimer">
                  Facilitator milestones add bonus points to the existing Arcade
                  total; game and skill-badge points are not counted twice. The
                  optional Bonus Milestone adds +{BONUS_MILESTONE_POINTS} after
                  Google verifies the form. Final recognition remains subject to
                  Google&apos;s program records.
                </p>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  )
}

function MilestoneProgressBar({
  label,
  color,
  completed,
  total,
  percent,
}: {
  label: string
  color: string
  completed: number
  total: number
  percent: number
}) {
  const containerStyle: CSSProperties = {
    borderColor: `${color}55`,
    background: `${color}12`,
  }
  const labelStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  }

  return (
    <div className="facilitator-syllabus-progress" style={containerStyle}>
      <span style={labelStyle}>
        <b style={{ color }}>{percent}% completed</b>
        <strong style={{ color }}>{completed}/{total}</strong>
      </span>
      <i
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
        style={{ background: `${color}18`, border: `1px solid ${color}` }}
      >
        <b style={{ width: `${percent}%`, background: color }} />
      </i>
    </div>
  )
}

function SyllabusSection({
  syllabus,
  visibleBadges,
  completedCount,
  missingCount,
  trackFilter,
  statusFilter,
  search,
  setTrackFilter,
  setStatusFilter,
  setSearch,
}: {
  syllabus: ReturnType<typeof evaluateFacilitatorSyllabus>
  visibleBadges: ReturnType<typeof evaluateFacilitatorSyllabus>
  completedCount: number
  missingCount: number
  trackFilter: TrackFilter
  statusFilter: StatusFilter
  search: string
  setTrackFilter: (value: TrackFilter) => void
  setStatusFilter: (value: StatusFilter) => void
  setSearch: (value: string) => void
}) {
  return (
    <section className="facilitator-section facilitator-syllabus-section">
      <div className="facilitator-section-title">
        <div>
          <h3>2026 syllabus badge checklist</h3>
          <p>Compare the profile with all 51 listed skill badges.</p>
        </div>
        <span>{completedCount} / {FACILITATOR_SYLLABUS_2026.length}</span>
      </div>

      <div className="facilitator-syllabus-summary">
        <article className="is-completed">
          <CheckCircle2 /><span>Completed</span><strong>{completedCount}</strong>
        </article>
        <article className="is-missing">
          <CircleHelp /><span>Not completed</span><strong>{missingCount}</strong>
        </article>
        <article>
          <Trophy /><span>Ultimate target</span><strong>51 + 15</strong>
          <small>66 eligible skill badges total</small>
        </article>
      </div>

      <div className="facilitator-syllabus-progress">
        <span>
          <b>{completedCount}</b> of {FACILITATOR_SYLLABUS_2026.length} syllabus
          badges completed
        </span>
        <i
          role="progressbar"
          aria-label="Facilitator syllabus badge progress"
          aria-valuemin={0}
          aria-valuemax={FACILITATOR_SYLLABUS_2026.length}
          aria-valuenow={completedCount}
        >
          <b style={{ width: `${percentage(completedCount, FACILITATOR_SYLLABUS_2026.length)}%` }} />
        </i>
      </div>

      <div className="facilitator-track-filters" aria-label="Filter syllabus by learning track">
        <TrackButton
          active={trackFilter === "all"}
          label="All tracks"
          count={`${completedCount}/${FACILITATOR_SYLLABUS_2026.length}`}
          onClick={() => setTrackFilter("all")}
        />
        {FACILITATOR_TRACKS.map((track) => {
          const badges = syllabus.filter((badge) => badge.track === track.id)
          return (
            <TrackButton
              key={track.id}
              active={trackFilter === track.id}
              label={track.label}
              count={`${badges.filter((badge) => badge.completed).length}/${badges.length}`}
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
            onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
            placeholder="Search syllabus badges"
            aria-label="Search Facilitator syllabus badges"
          />
        </label>
        <div aria-label="Filter syllabus by completion status">
          {(["missing", "completed", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={statusFilter === value ? "is-active" : ""}
              aria-pressed={statusFilter === value}
              onClick={() => setStatusFilter(value)}
            >
              {value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="facilitator-syllabus-list">
        {visibleBadges.length ? visibleBadges.map((badge) => (
          <article key={badge.courseTemplateId} className={badge.completed ? "is-completed" : "is-missing"}>
            <span className="facilitator-badge-status" aria-hidden="true">
              {badge.completed ? <CheckCircle2 /> : <CircleHelp />}
            </span>
            <div>
              <small>{FACILITATOR_TRACKS.find((track) => track.id === badge.track)?.label}</small>
              <strong>{badge.title}</strong>
              <p>
                {badge.labs} {badge.labs === 1 ? "lab" : "labs"}
                <span aria-hidden="true">•</span>
                {badge.credits} {badge.credits === 1 ? "credit" : "credits"}
                {badge.completed && badge.earnedBadge?.dateEarned ? (
                  <><span aria-hidden="true">•</span>Earned {badge.earnedBadge.dateEarned}</>
                ) : null}
              </p>
            </div>
            <a href={badge.url} target="_blank" rel="noreferrer noopener" aria-label={`Open ${badge.title}`} title={`Open ${badge.title}`}>
              <ExternalLink />
            </a>
          </article>
        )) : (
          <div className="facilitator-syllabus-empty">
            <Search /><strong>No badges match these filters</strong>
            <p>Clear the search or select another track/status.</p>
          </div>
        )}
      </div>

      <p className="facilitator-syllabus-note">
        Based on the July–September 2026 syllabus. Google&apos;s official syllabus
        and program records remain the final source of truth.
      </p>
    </section>
  )
}

function BonusMilestoneSection({
  completedBonusProfileChecks,
  hasGearSignupBadge,
  hasArcadeGearBadge,
  completedMilestoneOne,
  completedGearSkills,
  gearSkillStatuses,
  readyForBonusManualSteps,
}: {
  completedBonusProfileChecks: number
  hasGearSignupBadge: boolean
  hasArcadeGearBadge: boolean
  completedMilestoneOne: boolean
  completedGearSkills: number
  gearSkillStatuses: Array<{ title: string; completed: boolean }>
  readyForBonusManualSteps: boolean
}) {
  return (
    <section className="facilitator-section">
      <div className="facilitator-section-title">
        <div>
          <h3>Bonus Milestone</h3>
          <p>Earn an extra +{BONUS_MILESTONE_POINTS} bonus points through GEAR and AI agent verification.</p>
        </div>
        <span>{completedBonusProfileChecks} / 4 profile checks</span>
      </div>

      <div className="facilitator-syllabus-progress">
        <span>
          <b>{completedBonusProfileChecks}</b> of 4 requirements can be checked
          from the public profile. Agent verification is manual.
        </span>
        <i role="progressbar" aria-label="Bonus Milestone profile-checkable progress" aria-valuemin={0} aria-valuemax={4} aria-valuenow={completedBonusProfileChecks}>
          <b style={{ width: `${percentage(completedBonusProfileChecks, 4)}%` }} />
        </i>
      </div>

      <div className="facilitator-milestones">
        <BonusCriterion completed={hasGearSignupBadge} title="GEAR Sign-up badge" detail="Earn the GEAR program enrolment badge." />
        <BonusCriterion completed={hasArcadeGearBadge} title="Arcade - GEAR badge" detail="Earn the Arcade - GEAR badge on your developer profile." />
        <BonusCriterion completed={completedMilestoneOne} title="Complete Milestone 1" detail="Reach at least 6 Arcade Games and 18 Skill Badges." />
        <BonusCriterion
          completed={completedGearSkills === GEAR_SKILL_BADGES.length}
          title="Complete all 4 GEAR skill badges"
          detail={`${completedGearSkills} of ${GEAR_SKILL_BADGES.length} found on the public profile.`}
        />
        <article>
          <div className="facilitator-milestone-heading">
            <span><CircleHelp /></span>
            <div>
              <strong>Build and submit your AI agent</strong>
              <small>Free Trial, agent creation, Project Name and Billing ID verification cannot be detected from a public profile.</small>
            </div>
            <em>Manual</em>
          </div>
        </article>
      </div>

      <div className="facilitator-syllabus-list">
        {gearSkillStatuses.map((badge) => (
          <article key={badge.title} className={badge.completed ? "is-completed" : "is-missing"}>
            <span className="facilitator-badge-status" aria-hidden="true">
              {badge.completed ? <CheckCircle2 /> : <CircleHelp />}
            </span>
            <div>
              <small>GEAR skill badge</small><strong>{badge.title}</strong>
              <p>{badge.completed ? "Completed" : "Not found"}</p>
            </div>
          </article>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        <BonusLink href={BONUS_GUIDE_URL} secondary>Read official guide</BonusLink>
        <BonusLink href={BONUS_FORM_URL}>Submit verification form</BonusLink>
      </div>

      <p className="facilitator-syllabus-note">
        {readyForBonusManualSteps
          ? "All profile-checkable requirements appear complete. Follow the guide, build your AI agent, then submit the verification form."
          : "Complete the remaining profile requirements first. Google recommends finishing enrolment before starting the Bonus Milestone steps."}
      </p>
    </section>
  )
}

function BonusLink({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: 42,
        padding: "0 12px",
        border: secondary ? "1px solid rgba(34, 211, 238, .35)" : "1px solid rgba(124, 92, 246, .48)",
        borderRadius: 9,
        background: secondary ? "rgba(34, 211, 238, .08)" : "linear-gradient(135deg, rgba(98, 53, 220, .9), rgba(139, 63, 224, .9))",
        color: secondary ? "#67e8f9" : "#fff",
        fontSize: ".68rem",
        fontWeight: 800,
        textDecoration: "none",
      }}
    >
      {children} <ExternalLink />
    </a>
  )
}

function TrackButton({ active, label, count, title, onClick }: { active: boolean; label: string; count: string; title?: string; onClick: () => void }) {
  return (
    <button type="button" className={active ? "is-active" : ""} aria-pressed={active} title={title} onClick={onClick}>
      <strong>{label}</strong><small>{count}</small>
    </button>
  )
}

function BonusCriterion({ completed, title, detail }: { completed: boolean; title: string; detail: string }) {
  return (
    <article className={completed ? "is-completed" : ""}>
      <div className="facilitator-milestone-heading">
        <span>{completed ? <CheckCircle2 /> : <CircleHelp />}</span>
        <div><strong>{title}</strong><small>{detail}</small></div>
        <em>{completed ? "Confirmed" : "Pending"}</em>
      </div>
    </article>
  )
}

function Activity({ icon, label, current, target }: { icon: ReactNode; label: string; current: number; target: number }) {
  return (
    <article className={current >= target ? "is-completed" : ""}>
      <div><span>{icon}</span><strong>{label}</strong><b>{current} / {target}</b></div>
      <i role="progressbar" aria-label={`${label} progress`} aria-valuemin={0} aria-valuemax={target} aria-valuenow={Math.min(current, target)}>
        <b style={{ width: `${percentage(current, target)}%` }} />
      </i>
    </article>
  )
}
