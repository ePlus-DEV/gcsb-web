import type { ReactNode } from "react"
import type { WebsiteCatalog } from "@/lib/website-i18n"
import { formatNumber } from "./model"

type Props = {
  catalog: WebsiteCatalog
  name: string
  memberSince?: string
  image: ReactNode
  points: number
  badgeCount: number
  tier?: string
  scoreComplete: boolean
  unknownBadgeCount: number
}

/** The current total appears once; source totals are available in the breakdown. */
export default function ScoreSummary({ catalog, name, memberSince, image, points, badgeCount, tier, scoreComplete, unknownBadgeCount }: Props) {
  const m = catalog.messages
  return (
    <article className="dashboard-panel profile-panel">
      <h2 className="panel-title">{m.profileSummary}</h2>
      <div className="profile-overview">
        <div className="profile-photo">{image}</div>
        <div className="profile-name-block">
          <h2>{name}</h2>
          <p>{memberSince ? catalog.dynamic.memberSince.replace("{value}", memberSince) : m.publicProfile}</p>
        </div>
      </div>
      <div className="score-metrics">
        <div className="score-primary"><strong>{formatNumber(points)}</strong><span>{m.arcadePoints}</span></div>
        <div className="profile-stat-grid">
          <div><strong>{badgeCount}</strong><span>{m.badges}</span></div>
          <div><strong>{tier ?? "—"}</strong><span>{m.scoreTier}</span></div>
        </div>
      </div>
      {!scoreComplete && (
        <p className="score-review-note" role="status">{catalog.dynamic.needReview.replace("{count}", String(unknownBadgeCount))}</p>
      )}
    </article>
  )
}
