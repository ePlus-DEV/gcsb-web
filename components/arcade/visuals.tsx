import {
  BookOpen,
  CircleHelp,
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

const CHECKPOINTS = [
  { label: 0, x: 104, y: 560 },
  { label: 50, x: 548, y: 493 },
  { label: 75, x: 828, y: 411 },
  { label: 95, x: 1054, y: 302 },
  { label: 120, x: 1216, y: 207 },
]

function pointOnTrail(points: number) {
  const safePoints = Number.isFinite(points) ? clamp(points, 0, 120) : 0
  const endIndex = CHECKPOINTS.findIndex((checkpoint) => safePoints <= checkpoint.label)

  if (endIndex <= 0) {
    return { x: CHECKPOINTS[0].x, y: CHECKPOINTS[0].y }
  }

  const start = CHECKPOINTS[endIndex - 1]
  const end = CHECKPOINTS[endIndex]
  const segmentLength = end.label - start.label
  const localProgress = segmentLength > 0 ? (safePoints - start.label) / segmentLength : 0

  return {
    x: start.x + (end.x - start.x) * localProgress,
    y: start.y + (end.y - start.y) * localProgress,
  }
}

export function JoystickLogo() {
  return (
    <svg viewBox="0 0 88 82" aria-hidden="true" className="brand-mark">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 52 66 48l10 17-54 8L10 63l6-11Z" fill="#fffdf6" strokeWidth="3.5" />
        <path d="m21 48 42-4 7 12-47 7-9-7 7-8Z" fill="#e9e1cf" strokeWidth="3.2" />
        <path d="m25 54 36-4 4 6-39 6-5-4 4-4Z" fill="#d9f743" strokeWidth="2.8" />
        <path d="M43 47 41 23" strokeWidth="5" />
        <path d="M40 27c8 0 13-6 15-12" strokeWidth="2.4" />
        <circle cx="40" cy="16" r="12" fill="#d9f743" strokeWidth="3.4" />
        <path d="M34 13c2-4 6-6 11-5" stroke="#fffdf6" strokeWidth="3" />
        <circle cx="58" cy="52" r="3.7" fill="#ff6657" strokeWidth="2" />
        <circle cx="30" cy="57" r="3.7" fill="#8f78ff" strokeWidth="2" />
        <path d="m14 64 10 7M67 58l8 6" strokeWidth="2.4" />
      </g>
    </svg>
  )
}

function FlagIcon() {
  return (
    <g className="finish-flag">
      <path d="M1215-126v342" stroke="#071d49" strokeWidth="5" strokeLinecap="round" />
      <path d="M1220-108c54-26 78 18 136-4-14 30-12 58 4 83-61 24-87-19-140 6v-85Z" fill="#d9f743" stroke="#071d49" strokeWidth="4" strokeLinejoin="round" />
      <path d="m1271-95 31 13v36l-31 15-31-15v-36l31-13Z" fill="#071d49" stroke="#071d49" strokeWidth="3" />
      <path d="m1271-83 8 17 19 3-14 13 4 19-17-9-18 9 4-19-14-13 19-3 9-17Z" fill="#d9f743" />
      <path d="m1371-120 11-13M1380-95h18M1371-68l15 9" fill="none" stroke="#071d49" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

function TrailCheckpoint({ x, y, label }: { x: number; y: number; label: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="trail-checkpoint">
      <ellipse cx="0" cy="24" rx="35" ry="12" fill="#fffdf6" stroke="#071d49" strokeWidth="4" />
      <path d="M0 18v-48" stroke="#071d49" strokeWidth="5" strokeLinecap="round" />
      <circle cx="0" cy="-53" r="34" fill="#fffdf6" stroke="#071d49" strokeWidth="4" />
      <text x="0" y="-42" textAnchor="middle" className="checkpoint-label">{label}</text>
    </g>
  )
}

function TrailDecorations() {
  return (
    <g className="trail-decoration" stroke="#071d49" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(30 535)" strokeWidth="3">
        <path d="M2 22c9-22 25-25 37-9 10-18 30-17 39 4 13-11 29-4 31 13H0c-1-3 0-6 2-8Z" fill="#a9df45" />
        <path d="M15 25 7 8M39 21l1-20M70 24l12-16" />
      </g>

      <g transform="translate(108 592)" strokeWidth="3">
        <path d="m0 9 22-19 23 17 18-11 30 27H3Z" fill="#fffdf6" />
        <path d="m18 2 9 8M50 8l8 8M72 12l8 7" />
      </g>

      <g transform="translate(252 530)" strokeWidth="3">
        <path d="M20 45C6 22 10 7 22 0c7 9 7 22 0 43M21 27 6 19M22 19l14-9" fill="#d9f743" />
        <path d="M49 45c-7-21-2-34 11-41 10 12 10 25 2 41M58 25l-14-7M60 18l13-8" fill="#a9df45" />
      </g>

      <g transform="translate(405 464)" strokeWidth="3">
        <path d="M0 18c23-11 42-8 58 4v53C43 64 23 61 0 72V18Z" fill="#fffdf6" />
        <path d="M58 22c18-13 38-14 59-4v54c-23-9-42-7-59 3V22Z" fill="#fffdf6" />
        <path d="M58 22v53M10 31c14-5 26-4 38 2M10 44c14-5 26-4 38 2M69 32c13-5 25-5 37-1M69 45c13-5 25-5 37-1" />
        <path d="M0 72c23-7 42-4 58 7 18-12 38-14 59-7" stroke="#d9f743" strokeWidth="6" />
      </g>

      <g transform="translate(626 430)" strokeWidth="3">
        <path d="M19 30c0-18 12-30 29-30s29 12 29 30v73H19V30Z" fill="#d9f743" />
        <path d="M27 35h42M31 54h34M31 73h34M48 1v-16" />
        <path d="M10 43c-8 5-12 17-10 31l7 38h20M86 43c8 5 12 17 10 31l-7 38H69" fill="#d9f743" />
        <path d="m40 22 8-9 8 9-8 9-8-9Z" fill="#8f78ff" />
      </g>

      <g transform="translate(746 360)" strokeWidth="3">
        <path d="m31 0 18 37H38l20 34H4l20-34H14L31 0Z" fill="#79c96b" />
        <path d="M31 70v35" />
      </g>

      <g transform="translate(885 397)" strokeWidth="3">
        <path d="m0 19 13-18 15 18M28 19 43 4l19 19" fill="#fffdf6" />
      </g>

      <g transform="translate(1010 342)" strokeWidth="3">
        <path d="M3 29C9 7 29 2 42 18c14-19 39-10 41 13H0c0-1 1-2 3-2Z" fill="#a9df45" />
      </g>

      <g transform="translate(1133 245)" strokeWidth="3">
        <path d="m0 34 25-32 25 32 21-17 31 37H-8Z" fill="#fffdf6" />
        <path d="m16 15 9 12M60 28l11 10" />
      </g>

      <g transform="translate(1238 210)" strokeWidth="3">
        <path d="M0 36c8-24 29-29 44-10 11-21 39-18 48 7 15-11 32-3 34 17H-3c-1-5 0-10 3-14Z" fill="#a9df45" />
      </g>

      <g transform="translate(1308 -5)" strokeWidth="3">
        <path d="M0 31c5-16 19-21 31-11 8-20 34-21 44-2 19-10 39 1 39 21H-4c0-3 1-6 4-8Z" fill="#fffdf6" />
      </g>

      <g strokeWidth="2.5">
        <path d="M188 554c7-11 16-12 25-4M319 493c10-8 21-8 31 0M583 503c8-8 17-8 26-1M918 350c8-10 18-11 28-3M1105 278c10-8 20-8 30 0" fill="none" />
        <path d="M221 600l12-6M234 608l14-5M365 557l14 4M975 408l15-7M1140 337l13 4" />
      </g>
    </g>
  )
}

export function TrailMap({ snapshot }: { snapshot: CalculatorSnapshot }) {
  const currentPoints = Number.isFinite(snapshot.currentPoints) ? Math.max(snapshot.currentPoints, 0) : 0
  const target = 120
  const progress = clamp(currentPoints / target, 0, 1)
  const pin = pointOnTrail(currentPoints)
  const path = "M92 566C210 590 265 535 350 515c118-29 178 61 305-64 85-84 165 55 295-91 73-82 141-21 220-114 45-54 67-76 98-86"
  const bubbleX = clamp(pin.x - 80, 30, 1240)
  const bubbleY = clamp(pin.y - 168, 120, 420)

  return (
    <svg className="trail-svg" viewBox="0 0 1440 640" role="img" aria-label={`Learning trail showing ${formatNumber(currentPoints)} of ${target} points`}>
      <path d="M5 621c97-108 190-63 296-104 91-35 180-20 267-86 113-85 184-29 291-90 120-69 166-59 245-154 81-98 186-102 321-44l10 497H5Z" fill="#f2e6c9" opacity=".82" />
      <path d="M12 610c58-43 108-51 151-30 40 20 83 15 121-3M1090 251c67-39 116-77 177-104 47-21 102-18 148 5" fill="none" stroke="#e0d2b3" strokeWidth="13" strokeLinecap="round" />
      <path d={path} fill="none" stroke="#071d49" strokeWidth="84" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#fff8e6" strokeWidth="74" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#071d49" strokeWidth="4" strokeDasharray="13 15" strokeLinecap="round" />
      <path d={path} fill="none" stroke="#ff6657" strokeWidth="5" strokeDasharray={`${progress * 100} 100`} pathLength="100" strokeLinecap="round" />

      <TrailDecorations />

      {CHECKPOINTS.map((checkpoint) => (
        <TrailCheckpoint key={checkpoint.label} {...checkpoint} />
      ))}

      {currentPoints > 0 && (
        <g transform={`translate(${pin.x} ${pin.y - 5})`} className="current-pin">
          <path d="M0 38c-34-31-52-55-52-83 0-31 23-55 52-55s52 24 52 55C52-17 34 7 0 38Z" fill="#ff6657" stroke="#071d49" strokeWidth="4" />
          <circle cx="0" cy="-47" r="34" fill="#fffdf6" stroke="#071d49" strokeWidth="3" />
          <text x="0" y="-35" textAnchor="middle" className="pin-label">{formatNumber(currentPoints)}</text>
          <ellipse cx="0" cy="46" rx="35" ry="11" fill="#fffdf6" stroke="#071d49" strokeWidth="4" />
        </g>
      )}

      {currentPoints > 0 && (
        <g transform={`translate(${bubbleX} ${bubbleY})`} className="pin-callout">
          <path d="M14 0h150a14 14 0 0 1 14 14v42a14 14 0 0 1-14 14H98L78 91 68 70H14A14 14 0 0 1 0 56V14A14 14 0 0 1 14 0Z" fill="#fffdf6" stroke="#ff6657" strokeWidth="3" />
          <path d="m25 20 5 10 10 4-10 4-5 11-4-11-11-4 11-4 4-10Z" fill="none" stroke="#ff6657" strokeWidth="2.5" />
          <text x="102" y="44" textAnchor="middle" className="you-are-here">You are here!</text>
        </g>
      )}

      <FlagIcon />
    </svg>
  )
}

export function StatCard({ icon, value, label, tone }: { icon: ReactNode; value: string; label: string; tone: "lime" | "coral" | "purple" | "mint" }) {
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
    <div className="trail-stats" role="group" aria-label="Arcade statistics">
      <StatCard icon={<Trophy />} value={formatNumber(snapshot.currentPoints)} label="total points" tone="lime" />
      <StatCard icon={<Gamepad2 />} value={String(snapshot.gameBadges)} label="game badges" tone="coral" />
      <StatCard icon={<CircleHelp />} value={String(snapshot.triviaBadges)} label="trivia badges" tone="purple" />
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
