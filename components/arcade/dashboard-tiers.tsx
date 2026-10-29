"use client"

import Link from "next/link"
import { ARCADE_SWAG_DROPS } from "./swag-drops"
import { ArcadeSurface, ArcadeMetric } from "./ui/surface"
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
  overview?: boolean
  activeTierPoints?: number
}

/** Public tier data and appearance are identical in guest and profile views. */
export default function DashboardTiers({
  milestones, milestonesLive, slotHistory, catalog, locale, activeTierPoints, overview = false,
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
        {(overview ? milestones : [...milestones].reverse()).map((tier) => {
          const active = activeTierPoints === tier.points
          const tierName = tier.league.replace("Arcade ", "").toLowerCase()
          const giftIds: Record<string, string[]> = {trooper: ["arcade-travel-bottle"], ranger: ["arcade-backpack"], champion: ["weather-shield-jacket"], legend: ["arcade-popup-pro", "weather-shield-jacket"]}
          const artwork = ARCADE_SWAG_DROPS.filter(drop => giftIds[tierName]?.includes(drop.id))
          return (
            <ArcadeSurface className={`tier-list-row tier-${tier.points}${active ? " is-current" : ""}`} aria-current={active ? "step" : undefined} key={tier.points}>
              <span className="tier-list-icon" aria-hidden="true"><Trophy /></span>
              <div><strong>{tier.league.replace("Arcade ", "")}</strong><span>{tierRangeLabel(tier)}</span></div>
              {overview && artwork.length > 0 && <Link className="tier-reward-art" href={`/swag-drops/2026/${tierName}/`} aria-label={catalog.dynamic.open.replace("{value}", tier.league)}>
                {artwork.map(drop => <img key={drop.id} src={drop.imageUrl} alt="" loading="lazy" onError={event => { event.currentTarget.style.visibility = "hidden" }} />)}
              </Link>}
              <ArcadeMetric className="tier-slot-count">
                <b>{tier.spotsLeft === null ? "—" : formatInteger(tier.spotsLeft)}</b>
                <small>{(tier.spotsLeft === null ? catalog.dynamic.totalSlots : catalog.dynamic.leftOf).replace("{count}", formatInteger(tier.slots))}</small>
                <SlotChangeBadge feed={slotHistory.feed} points={tier.points} currentSpotsLeft={tier.spotsLeft} catalog={catalog} locale={locale} />
              </ArcadeMetric>
            </ArcadeSurface>
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
