import type { WebsiteCatalog } from "@/lib/website-i18n"
import { formatNumber, type ArcadeMilestone } from "./model"

type NextScoreGoalProps = {
  catalog: WebsiteCatalog
  nextMilestone: ArcadeMilestone
  points: number
  pointsToNextTier: number
  maxTierPoints: number
  hasReachedMaxTier: boolean
  goalStartPoints: number
  goalProgress: number
}

/** Keep the next useful action beside the profile's current score. */
export default function NextScoreGoal({ catalog, nextMilestone, points, pointsToNextTier, maxTierPoints, hasReachedMaxTier, goalStartPoints, goalProgress }: NextScoreGoalProps) {
  const messages = catalog.messages
  return (
    <article className="dashboard-panel compact-panel next-goal-panel">
      <div className="compact-heading">
        <h2 className="panel-title">{messages.nextGoal}</h2>
        <span>{nextMilestone.league.replace("Arcade ", "")}</span>
      </div>
      <div className="next-goal-value">
        <strong>{hasReachedMaxTier ? messages.max : formatNumber(pointsToNextTier)}</strong>
        <span>{hasReachedMaxTier ? messages.topTierReached : messages.morePointsNeeded}</span>
      </div>
      <div
        className="goal-progress"
        role="progressbar"
        aria-label={hasReachedMaxTier ? messages.topTierReached : catalog.dynamic.progressToward.replace("{value}", nextMilestone.league)}
        aria-valuemin={goalStartPoints}
        aria-valuemax={hasReachedMaxTier ? maxTierPoints : nextMilestone.points}
        aria-valuenow={hasReachedMaxTier ? maxTierPoints : Math.min(Math.max(points, goalStartPoints), nextMilestone.points)}
      >
        <span style={{ width: `${goalProgress}%` }} />
      </div>
    </article>
  )
}
