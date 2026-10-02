"use client"

import { Gamepad2, Trophy } from "lucide-react"
import type { WebsiteCatalog, WebsiteLocale } from "@/lib/website-i18n"
import { formatInteger, tierRangeLabel, type ArcadeMilestone } from "./model"
import { SlotChangeBadge, type SlotHistoryState } from "./tier-slot-history"
import type { DashboardViewMode } from "./dashboard-state"

export default function GuestDashboard({
  viewMode, milestones, milestonesLive, slotHistory, catalog, locale,
}: {
  viewMode: DashboardViewMode
  milestones: ArcadeMilestone[]
  milestonesLive: boolean
  slotHistory: SlotHistoryState
  catalog: WebsiteCatalog
  locale: WebsiteLocale
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

      <div className="guest-tier-heading">
        <div>
          <span className="guest-tier-heading-icon" aria-hidden="true"><Trophy /></span>
          <div>
            <strong>{viewMessages.arcadeTiers}</strong>
            <span>{milestonesLive ? viewMessages.liveSlots : viewMessages.totalSlotsOnly}</span>
          </div>
        </div>
      </div>

      <div className="empty-tier-grid">
        {[...milestones].reverse().map((tier) => {
          const remainingPercent =
            tier.spotsLeft === null || tier.slots <= 0
              ? 0
              : Math.max(0, Math.min(100, (tier.spotsLeft / tier.slots) * 100))

          return (
            <article className={`guest-tier-card tier-${tier.points}`} key={tier.points}>
              <span className="guest-tier-icon" aria-hidden="true"><Trophy /></span>
              <div className="guest-tier-main">
                <div className="guest-tier-copy">
                  <strong>{tier.league.replace("Arcade ", "")}</strong>
                  <span>{tierRangeLabel(tier)}</span>
                </div>
                <div className="guest-tier-progress" aria-hidden="true">
                  <span style={{ width: `${remainingPercent}%` }} />
                </div>
              </div>
              <div className="guest-tier-availability">
                <strong>
                  {tier.spotsLeft === null ? "—" : formatInteger(tier.spotsLeft)}
                  <span> / {formatInteger(tier.slots)}</span>
                </strong>
                <small>{tier.spotsLeft === null ? viewMessages.totalSlotsOnly : viewMessages.spotsLeft}</small>
                <SlotChangeBadge
                  feed={slotHistory.feed}
                  points={tier.points}
                  currentSpotsLeft={tier.spotsLeft}
                  catalog={catalog}
                  locale={locale}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
