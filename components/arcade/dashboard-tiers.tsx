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
      <div className="panel-title-row">
        <h2 className="panel-title">{viewMessages.arcadeTiers}</h2>
        <span className={milestonesLive ? "tier-help is-live" : "tier-help"}>
          {milestonesLive ? viewMessages.liveSlots : viewMessages.totalSlotsOnly}
        </span>
      </div>
      <div className="tier-list">
        {[...milestones].reverse().map((tier) => {
          const active = activeTierPoints === tier.points
          return (
            <div className={`tier-list-row tier-${tier.points}${active ? " is-current" : ""}`} aria-current={active ? "step" : undefined} key={tier.points}>
              <span className="tier-list-icon" aria-hidden="true"><Trophy /></span>
              <div><strong>{tier.league.replace("Arcade ", "")}</strong><span>{tierRangeLabel(tier)}</span></div>
              <div className="tier-slot-count">
                <b>{tier.spotsLeft === null ? "—" : formatInteger(tier.spotsLeft)}</b>
                <small>{(tier.spotsLeft === null ? catalog.dynamic.totalSlots : catalog.dynamic.leftOf).replace("{count}", formatInteger(tier.slots))}</small>
                <SlotChangeBadge feed={slotHistory.feed} points={tier.points} currentSpotsLeft={tier.spotsLeft} catalog={catalog} locale={locale} />
              </div>
            </div>
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
