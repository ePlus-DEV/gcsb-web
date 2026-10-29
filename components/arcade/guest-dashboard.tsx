"use client"

import DashboardTiers, { type DashboardTiersProps } from "./dashboard-tiers"
import type { DashboardViewMode } from "./dashboard-state"

export default function GuestDashboard({
  viewMode, overview = true, milestones, milestonesLive, slotHistory, catalog, locale,
}: Omit<DashboardTiersProps, "activeTierPoints"> & {
  viewMode: DashboardViewMode
  overview?: boolean
}) {
  return (
    <section
      className={`dashboard-shell guest-dashboard${overview ? "" : " dashboard-guest-start"}${viewMode === "guest" ? " is-guest" : " is-profile-empty"}`}
      data-home-order="dashboard-empty"
    >

      <DashboardTiers
        overview={overview}
        milestones={milestones}
        milestonesLive={milestonesLive}
        slotHistory={slotHistory}
        catalog={catalog}
        locale={locale}
      />
      <div id="monthly-games" className="monthly-games-host" data-home-order="monthly-labs" />

    </section>
  )
}
