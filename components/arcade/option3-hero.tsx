"use client"

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react"
import type { ArcadeMilestone, CalculatorSnapshot } from "./model"
import { formatNumber } from "./model"

type Option3HeroProps = {
  profileUrl: string
  setProfileUrl: Dispatch<SetStateAction<string>>
  analyzeProfile: (event: FormEvent<HTMLFormElement>) => void
  loading: boolean
  error: string
  manualMode: boolean
  setManualMode: Dispatch<SetStateAction<boolean>>
  snapshot: CalculatorSnapshot
  updateManual: (field: keyof CalculatorSnapshot, value: string) => void
  nextTier: ArcadeMilestone
  pointsRemaining: number
  hasResult: boolean
  resetCalculator: () => void
}

export function Option3Hero({
  profileUrl,
  setProfileUrl,
  analyzeProfile,
  loading,
  error,
  manualMode,
  setManualMode,
  snapshot,
  updateManual,
  nextTier,
  pointsRemaining,
  hasResult,
  resetCalculator,
}: Option3HeroProps) {
  const nextTierName = nextTier.league
  const nextTierPoints = nextTier.points === 120 ? "120+" : String(nextTier.points)
  const remainingLabel =
    pointsRemaining > 0 ? `${formatNumber(pointsRemaining)} points remaining` : "Top 2026 tier reached"

  return (
    <section
      id="calculator-option3"
      className={manualMode ? "option3-stage is-manual-open" : "option3-stage"}
      aria-labelledby="option3-hero-title"
    >
      <img
        className="option3-background"
        src="/design/option3-background.avif"
        alt=""
        aria-hidden="true"
      />

      <h1 id="option3-hero-title" className="sr-only">
        Know your points. Plan your next badge.
      </h1>

      <form className="option3-profile-form" onSubmit={analyzeProfile} noValidate>
        <label className="sr-only" htmlFor="option3-profile-url">
          Google Skills public profile URL
        </label>
        <input
          id="option3-profile-url"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://www.skills.google/my_account/profile/..."
          value={profileUrl}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setProfileUrl(event.target.value)}
          aria-describedby={error ? "option3-profile-error" : undefined}
        />

        <button
          className="option3-analyze-hitbox"
          type="submit"
          disabled={loading}
          aria-label={loading ? "Analyzing profile" : "Analyze profile"}
        >
          <span className="sr-only">{loading ? "Analyzing profile..." : "Analyze profile"}</span>
        </button>

        <button
          className="option3-manual-button"
          type="button"
          aria-expanded={manualMode}
          aria-controls="option3-manual-panel"
          aria-label={manualMode ? "Close manual entry" : "Enter points manually"}
          onClick={() => setManualMode((open) => !open)}
        >
          {manualMode ? "Close manual entry" : "Manual entry"}
        </button>

        {error && (
          <p id="option3-profile-error" className="option3-form-error" role="alert">
            {error}
          </p>
        )}
      </form>

      <div className="option3-next-tier" aria-label="Next Arcade tier">
        <strong>{nextTierName}</strong>
        <b>{nextTierPoints} points</b>
        <span>{remainingLabel}</span>
      </div>

      <span className="option3-finish-point" aria-label={`Destination ${nextTierPoints} points`}>
        {nextTierPoints}
      </span>
      <span className="option3-current-point" aria-label={`Current score ${formatNumber(snapshot.currentPoints)}`}>
        {formatNumber(snapshot.currentPoints)}
      </span>

      <strong className="option3-stat option3-stat-points">{formatNumber(snapshot.currentPoints)}</strong>
      <strong className="option3-stat option3-stat-game">{snapshot.gameBadges}</strong>
      <strong className="option3-stat option3-stat-skill">{snapshot.skillBadges}</strong>

      {hasResult && (
        <button className="option3-reset" type="button" onClick={resetCalculator}>
          Reset
        </button>
      )}

      {manualMode && (
        <div id="option3-manual-panel" className="option3-manual-panel">
          <div className="option3-manual-copy">
            <strong>Manual entry</strong>
            <span>Use this when the public crawler is temporarily unavailable.</span>
          </div>
          <label>
            Current points
            <input
              type="number"
              min="0"
              step="0.5"
              value={snapshot.currentPoints}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateManual("currentPoints", event.target.value)
              }
            />
          </label>
          <label>
            Game badges
            <input
              type="number"
              min="0"
              value={snapshot.gameBadges}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateManual("gameBadges", event.target.value)
              }
            />
          </label>
          <label>
            Trivia badges
            <input
              type="number"
              min="0"
              value={snapshot.triviaBadges}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateManual("triviaBadges", event.target.value)
              }
            />
          </label>
          <label>
            Skill badges
            <input
              type="number"
              min="0"
              value={snapshot.skillBadges}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateManual("skillBadges", event.target.value)
              }
            />
          </label>
        </div>
      )}
    </section>
  )
}
