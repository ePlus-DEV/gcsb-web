import {
  BookOpen,
  Chrome,
  ExternalLink,
  Gamepad2,
  Globe2,
  Sparkles,
  Trophy,
} from "lucide-react"
import type { ReactNode } from "react"
import type { CalculatorSnapshot } from "./model"
import { clamp, formatNumber } from "./model"

const TRAIL_POINTS = [
  { x: 80, y: 438 },
  { x: 220, y: 430 },
  { x: 360, y: 385 },
  { x: 520, y: 390 },
  { x: 680, y: 315 },
  { x: 835, y: 330 },
  { x: 950, y: 267 },
  { x: 1085, y: 228 },
  { x: 1185, y: 165 },
  { x: 1285, y: 116 },
]

function checkpointsFor(target: number): number[] {
  if (target <= 50) return [0, 10, 25, 50]
  if (target <= 75) return [0, 25, 50, 75]
  if (target <= 95) return [0, 25, 50, 95]
  return [0, 25, 75, target]
}

function pointOnTrail(progress: number) {
  const safeProgress = Number.isFinite(progress) ? clamp(progress, 0, 1) : 0
  const scaled = safeProgress * (TRAIL_POINTS.length - 1)
  const index = Math.min(Math.floor(scaled), TRAIL_POINTS.length - 2)
  const localProgress = scaled - index
  const start = TRAIL_POINTS[index]
  const end = TRAIL_POINTS[index + 1]

  return {
    x: start.x + (end.x - start.x) * localProgress,
    y: start.y + (end.y - start.y) * localProgress,
  }
}

export function JoystickLogo() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true" className="brand-mark">
      <path d="M16 48h43l5 13H10l6-13Z" fill="#fffdf6" stroke="currentColor" strokeWidth="3" />
      <path d="M21 43h33l5 9H16l5-9Z" fill="#d9f743" stroke="currentColor" strokeWidth="3" />
      <path d="M37 41V20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <circle cx="37" cy="15" r="11" fill="#d9f743" stroke="currentColor" strokeWidth="3" />
      <path d="M31 12c2-4 6-6 10-5" fill="none" stroke="#fffdf6" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="47" r="3" fill="#ff6657" stroke="currentColor" strokeWidth="2" />
      <circle cx="26" cy="47" r="3" fill="#8f78ff" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function FlagIcon() {
  return (
    <g transform="translate(1190 14)">
      <path d="M28 8v130" stroke="#071d49" strokeWidth="5" strokeLinecap="round" />
      <path d="M30 18c50-22 65 17 119-2-10 27-10 46 2 70-53 21-75-17-121 3V18Z" fill="#d9f743" stroke="#071d49" strokeWidth="4" strokeLinejoin="round" />
      <path d="M82 28 112 41v32L82 87 52 72V41l30-13Z" fill="#071d49" stroke="#071d49" strokeWidth="3" />
      <path d="m82 39 8 16 17 3-12 12 3 17-16-8-16 8 3-17-12-12 17-3 8-16Z" fill="#d9f743" />
      <path d="m158 12 10-11M165 34l16-1M157 58l13 8" stroke="#071d49" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

function TrailCheckpoint({ x, y, label }: { x: number; y: number; label: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="22" rx="34" ry="12" fill="#fffdf6" stroke="#071d49" strokeWidth="4" />
      <path d="M0 17v-44" stroke="#071d49" strokeWidth="5" strokeLinecap="round" />
      <circle cx="0" cy="-48" r="34" fill="#fffdf6" stroke="#071d49" strokeWidth="4" />
      <text x="0" y="-37" textAnchor="middle" className="checkpoint-label">{label}</text>
    </g>
  )
}

export function TrailMap({ snapshot }: { snapshot: CalculatorSnapshot }) {
  const currentPoints = Number.isFinite(snapshot.currentPoints) ? snapshot.currentPoints : 0
  const target = Number.isFinite(snapshot.targetPoints) ? Math.max(snapshot.targetPoints, 1) : 1
  const progress = clamp(currentPoints / target, 0, 1)
  const pin = pointOnTrail(progress)
  const checkpoints = checkpointsFor(target)
  const positions = [TRAIL_POINTS[0], TRAIL_POINTS[2], TRAIL_POINTS[4], TRAIL_POINTS[9]]
  const path = "M80 438C230 470 275 390 360 385c115-7 172 65 320-70 80-73 152 46 270-48 88-70 154-36 235-102 62-51 70-56 100-49"

  return (
    <svg className="trail-svg" viewBox="0 0 1440 520" role="img" aria-label={`Learning trail showing ${formatNumber(currentPoints)} of ${target} points`}>
      <path d="M14 477c107-118 198-17 305-87 105-69 206 4 310-81 100-82 184-15 273-80 114-83 178-32 273-130 81-83 171-85 251-47l-8 468H15Z" fill="#f2e6c9" opacity=".78" />
      <path d="M24 468c55-35 86-40 126-20 33 17 62 6 96-13M1124 189c42-18 72-12 111-46 34-30 70-38 107-28" fill="none" stroke="#e1d3b4" strokeWidth="14" strokeLinecap="round" />
      <g className="trail-decoration" stroke="#071d49" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M270 415c-9-25-4-41 10-51 15 11 18 27 9 51Z" fill="#d9f743" />
        <path d="M280 414v-38M260 396l20-9M300 392l-20-7" />
        <path d="M520 363h67l-10 45h-53Z" fill="#fffdf6" />
        <path d="M553 361v47M528 372c12-8 22-7 25-5M558 367c10-4 18-2 25 4" />
        <path d="M710 335c0-21 14-38 31-38s31 17 31 38v50h-62Z" fill="#d9f743" />
        <path d="M722 314h38M727 333h27M728 352h26M741 296v-15" />
        <path d="M955 265l18-38 18 38h-12l17 29h-48l17-29Z" fill="#9dde6a" />
        <path d="M972 294v22" />
        <path d="M1117 199c7-21 30-21 38-3 18-10 36 2 34 20h-78c-2-8 0-13 6-17Z" fill="#d9f743" />
        <path d="M1042 284c7-17 23-20 33-7 15-10 31-1 31 14h-69c-1-3 1-5 5-7Z" fill="#9dde6a" />
        <path d="M166 470 182 445l17 25M418 430l15-20 18 20M875 349l12-17 19 17" fill="#fffdf6" />
      </g>
      <path d={path} fill="none" stroke="#071d49" strokeWidth="88" strokeLinecap="round" />
      <path d={path} fill="none" stroke="#fff8e6" strokeWidth="78" strokeLinecap="round" />
      <path d={path} fill="none" stroke="#071d49" strokeWidth="4" strokeDasharray="13 14" strokeLinecap="round" />
      <path d={path} fill="none" stroke="#ff6657" strokeWidth="5" strokeDasharray={`${progress * 100} 100`} pathLength="100" strokeLinecap="round" />
      {checkpoints.map((label, index) => <TrailCheckpoint key={`${label}-${index}`} x={positions[index].x} y={positions[index].y} label={label} />)}
      <g transform={`translate(${pin.x} ${pin.y - 12})`} className="current-pin">
        <path d="M0 31c-30-28-48-48-48-75 0-30 21-51 48-51s48 21 48 51C48-17 30 3 0 31Z" fill="#ff6657" stroke="#071d49" strokeWidth="4" />
        <circle cx="0" cy="-45" r="31" fill="#fffdf6" stroke="#071d49" strokeWidth="3" />
        <text x="0" y="-34" textAnchor="middle" className="pin-label">{formatNumber(currentPoints)}</text>
        <ellipse cx="0" cy="38" rx="32" ry="10" fill="#fffdf6" stroke="#071d49" strokeWidth="4" />
      </g>
      <g transform={`translate(${clamp(pin.x - 76, 20, 1260)} ${clamp(pin.y - 160, 16, 300)})`}>
        <path d="M12 0h136a12 12 0 0 1 12 12v36a12 12 0 0 1-12 12H86L68 79 59 60H12A12 12 0 0 1 0 48V12A12 12 0 0 1 12 0Z" fill="#fffdf6" stroke="#ff6657" strokeWidth="3" />
        <text x="80" y="38" textAnchor="middle" className="you-are-here">You are here!</text>
      </g>
      <FlagIcon />
    </svg>
  )
}

export function StatCard({ icon, value, label, tone }: { icon: ReactNode; value: string; label: string; tone: "lime" | "coral" | "mint" }) {
  return (
    <article className="trail-stat-card">
      <span className={`stat-icon stat-icon--${tone}`}>{icon}</span>
      <span className="stat-copy"><strong>{value}</strong><small>{label}</small></span>
      <Sparkles className="stat-sparkle" aria-hidden="true" />
    </article>
  )
}

export function TrailStats({ snapshot }: { snapshot: CalculatorSnapshot }) {
  return (
    <div className="trail-stats" aria-label="Arcade statistics">
      <StatCard icon={<Trophy />} value={formatNumber(snapshot.currentPoints)} label="total points" tone="lime" />
      <StatCard icon={<Gamepad2 />} value={String(snapshot.gameBadges + snapshot.triviaBadges)} label="game & trivia badges" tone="coral" />
      <StatCard icon={<BookOpen />} value={String(snapshot.skillBadges)} label="skill badges" tone="mint" />
    </div>
  )
}

export function ExtensionStoreLinks() {
  return (
    <div className="store-links">
      <a className="store-button store-button--chrome" href="https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg/?utm_source=gcsb-web&utm_medium=website&utm_campaign=arcade-calculator" target="_blank" rel="noreferrer">
        <Chrome aria-hidden="true" /><span><small>Available on</small>Chrome Web Store</span><ExternalLink aria-hidden="true" />
      </a>
      <a className="store-button" href="https://addons.mozilla.org/addon/cloud-skills-boost-helper?utm_source=gcsb-web&utm_medium=website&utm_campaign=arcade-calculator" target="_blank" rel="noreferrer">
        <Globe2 aria-hidden="true" /><span><small>Get it for</small>Firefox</span><ExternalLink aria-hidden="true" />
      </a>
    </div>
  )
}
