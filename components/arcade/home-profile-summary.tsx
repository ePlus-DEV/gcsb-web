"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Trophy } from "lucide-react"
import type { WebsiteCatalog, WebsiteLocale } from "@/lib/website-i18n"
import { getWebsiteLocaleHref } from "@/lib/website-i18n"
import { readStoredDashboard, type StoredDashboard } from "./dashboard-state"
import { getFacilitatorAdjustedPoints } from "./facilitator-points"
import { FACILITATOR_PARTICIPATION_EVENT, readFacilitatorParticipation } from "./facilitator-participation"
import { OFFICIAL_MILESTONES, PROFILE_URL_PATTERN, numeric } from "./model"

/** A saved score preview only: Home never requests a personal score. */
export default function HomeProfileSummary({ catalog, locale }: { catalog: WebsiteCatalog; locale: WebsiteLocale }) {
  const [snapshot, setSnapshot] = useState<StoredDashboard | null>(null)
  const [points, setPoints] = useState(0)
  useEffect(() => {
    const sync = () => {
      const saved = readStoredDashboard()
      const base = saved?.result.arcadePoints?.totalPoints
      if (!saved || !PROFILE_URL_PATTERN.test(saved.profileUrl) || saved.result.success !== true || typeof base !== "number" || !Number.isFinite(base) || base < 0) {
        setSnapshot(null)
        return
      }
      setSnapshot(saved)
      setPoints(getFacilitatorAdjustedPoints(base, {
        games: numeric(saved.result.faciCounts?.faciGame),
        skills: numeric(saved.result.faciCounts?.faciSkill),
      }, readFacilitatorParticipation(saved.profileUrl)).totalPoints)
    }
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener("pageshow", sync)
    window.addEventListener("focus", sync)
    window.addEventListener(FACILITATOR_PARTICIPATION_EVENT, sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("pageshow", sync)
      window.removeEventListener("focus", sync)
      window.removeEventListener(FACILITATOR_PARTICIPATION_EVENT, sync)
    }
  }, [])
  if (!snapshot) return null
  const name = snapshot.result.userDetails?.[0]?.userName || catalog.messages.publicProfile
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join("").toLocaleUpperCase()
  const tier = [...OFFICIAL_MILESTONES].reverse().find(item => points >= item.points)
  const numberLocale = locale.replace("_", "-")
  const checked = snapshot.checkedAt ? new Date(snapshot.checkedAt) : null
  const time = checked && Number.isFinite(checked.getTime()) ? new Intl.DateTimeFormat(numberLocale, { dateStyle: "short", timeStyle: "short" }).format(checked) : null
  return <section className="home-profile-summary" aria-label={catalog.messages.homeSavedProfile}>
    <div className="home-profile-identity">
      <span className="home-profile-avatar" aria-hidden="true">{initials}</span>
      <div><strong>{name}</strong><small>{time ? catalog.messages.homeLastChecked.replace("{value}", time) : catalog.messages.homeSavedResult}</small></div>
    </div>
    <div className="home-profile-points"><strong>{new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 2 }).format(points)}</strong><span>{catalog.messages.arcadePoints}</span></div>
    <div className="home-profile-tier"><Trophy aria-hidden="true" /><div><strong>{tier?.league.replace("Arcade ", "") ?? catalog.messages.noTierYet}</strong><small>{catalog.messages.homeScoreTier}</small></div></div>
    <Link className="home-profile-dashboard-link" href={`${getWebsiteLocaleHref(locale)}dashboard/`} onClick={() => {
      try { localStorage.setItem("eplus-arcade-dashboard-view-mode-v1", "profile") } catch { /* Optional browser storage. */ }
    }}>{catalog.messages.homeOpenDashboard}<ArrowRight aria-hidden="true" /></Link>
  </section>
}
