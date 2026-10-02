"use client"

import { Trophy } from "lucide-react"
import type { WebsiteCatalog, WebsiteLocale } from "@/lib/website-i18n"
import { formatInteger, tierRangeLabel, type ArcadeMilestone } from "./model"
import { SlotChangeBadge, TierSlotHistoryPanel, type SlotHistoryState } from "./tier-slot-history"

export type DashboardTiersProps = {
  milestones: ArcadeMilestone[]
  milestonesLive: boolean
  slotHistory: SlotHistoryState
  catalog: WebsiteCatalog
  locale: WebsiteLocale
  activeTierPoints?: number
}

/** Public tier data and appearance are identical in guest and profile views. */
export default function DashboardTiers({
  milestones, milestonesLive, slotHistory, catalog, locale, activeTierPoints,
}: DashboardTiersProps) {
  const viewMessages = catalog.messages
  return (
    <aside id="tiers" className="dashboard-panel tier-list-panel shared-tier-panel">
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

          const active = activeTierPoints === tier.points
          return (
            <article
              className={`guest-tier-card tier-${tier.points}${active ? " is-current" : ""}`}
              aria-current={active ? "step" : undefined}
              key={tier.points}
            >
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
      <p className="tier-note">{viewMessages.tierNote}</p>
      <div data-home-order="tier-history">
        <TierSlotHistoryPanel {...slotHistory} milestones={milestones} catalog={catalog} locale={locale} />
      </div>
    </aside>
  )
}
