"use client"

import DashboardTiers, { type DashboardTiersProps } from "./dashboard-tiers"
import type { DashboardViewMode } from "./dashboard-state"

export default function GuestDashboard({
  viewMode, milestones, milestonesLive, slotHistory, catalog, locale,
}: Omit<DashboardTiersProps, "activeTierPoints"> & {
  viewMode: DashboardViewMode
}) {
  return (
    <section
      className={`dashboard-shell guest-dashboard${viewMode === "guest" ? " is-guest" : " is-profile-empty"}`}
      data-home-order="dashboard-empty"
    >

      <DashboardTiers
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
