"use client"

import MonthlyGamesPanel from "./monthly-games-panel"
import type { ArcadeBadge } from "./model"

/** Render with the active React result; never infer profile state from storage. */
export default function MonthlyGamesSection({ badges = [], hasProfile = false }: { badges?: ArcadeBadge[]; hasProfile?: boolean }) {
  return (
    <div id="monthly-games" className="monthly-games-host" data-home-order="monthly-labs">
      <MonthlyGamesPanel badges={hasProfile ? badges : []} hasProfile={hasProfile} />
    </div>
  )
}
