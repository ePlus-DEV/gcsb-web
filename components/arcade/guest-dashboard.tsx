"use client"

import { Gamepad2, Trophy } from "lucide-react"
import DashboardTiers, { type DashboardTiersProps } from "./dashboard-tiers"
import type { DashboardViewMode } from "./dashboard-state"

export default function GuestDashboard({
  viewMode, milestones, milestonesLive, slotHistory, catalog, locale,
}: Omit<DashboardTiersProps, "activeTierPoints"> & {
  viewMode: DashboardViewMode
}) {
  const viewMessages = catalog.messages
  return (
    <section
      className={`dashboard-empty-state guest-dashboard${viewMode === "guest" ? " is-guest" : " is-profile-empty"}`}
      data-home-order="dashboard-empty"
    >
      <div className="guest-dashboard-hero">
        <span className="guest-dashboard-orb" aria-hidden="true"><Trophy /></span>
        <div className="guest-dashboard-copy">
          <strong>{viewMode === "guest" ? viewMessages.guestDashboardTitle : viewMessages.dashboardPlaceholder}</strong>
          <p>{viewMode === "guest" ? viewMessages.guestDashboardHint : viewMessages.dashboardHint}</p>
        </div>
        <span className="guest-dashboard-decoration" aria-hidden="true"><Gamepad2 /></span>
      </div>

      <DashboardTiers
        milestones={milestones}
        milestonesLive={milestonesLive}
        slotHistory={slotHistory}
        catalog={catalog}
        locale={locale}
      />
    </section>
  )
}
