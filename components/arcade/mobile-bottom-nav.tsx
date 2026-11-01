"use client"

import { useEffect, useState } from "react"
import { BadgeCheck, Chrome, Gamepad2, Search, Trophy } from "lucide-react"
import type { DashboardViewMode } from "@/components/arcade/dashboard-state"
import type { WebsiteCatalog } from "@/lib/website-i18n"

type Props = {
  catalog: WebsiteCatalog
  viewMode: DashboardViewMode
  hasResult: boolean
  monthlyLabsLabel: string
}

export default function MobileBottomNav({ catalog, viewMode, hasResult, monthlyLabsLabel }: Props) {
  // The badges section does not exist until a profile has actually been analyzed.
  const showBadges = viewMode === "profile" && hasResult
  const thirdTarget = showBadges ? "badges" : "monthly-games"
  const [activeTarget, setActiveTarget] = useState("calculator")

  useEffect(() => {
    const targets = ["calculator", "tiers", thirdTarget, "extension"]
    let frame = 0

    const syncActive = () => {
      // Track physical section positions: CSS grids can change their visual order.
      const marker = Math.min(180, Math.max(110, window.innerHeight * 0.25))
      const sections = targets.flatMap((id) => {
        const node = document.getElementById(id)
        return node ? [{ id, top: node.getBoundingClientRect().top }] : []
      })
      if (!sections.length) return

      // Nearby anchors can share a row (Tiers / Badges); preserve the tapped
      // destination instead of arbitrarily selecting its neighbor.
      const hashed = sections.find((item) => item.id === window.location.hash.slice(1))
      if (hashed && Math.abs(hashed.top - marker) <= 160) {
        setActiveTarget(hashed.id)
        return
      }

      const reached = sections.filter((item) => item.top <= marker)
      const closest = (reached.length ? reached : sections)
        .reduce((a, b) => {
          if (!a) return b
          return (reached.length ? b.top > a.top : b.top < a.top) ? b : a
        }, null as (typeof sections)[number] | null)
      if (closest) setActiveTarget(closest.id)
    }

    const scheduleSync = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        syncActive()
      })
    }

    scheduleSync()
    window.addEventListener("scroll", scheduleSync, { passive: true })
    window.addEventListener("resize", scheduleSync)
    window.addEventListener("hashchange", scheduleSync)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", scheduleSync)
      window.removeEventListener("resize", scheduleSync)
      window.removeEventListener("hashchange", scheduleSync)
    }
  }, [thirdTarget])

  const entries = [
    { id: "calculator", label: catalog.messages.calculator, icon: Search },
    { id: "tiers", label: catalog.messages.tiers, icon: Trophy },
    { id: thirdTarget, label: showBadges ? catalog.messages.badges : monthlyLabsLabel, icon: showBadges ? BadgeCheck : Gamepad2 },
    { id: "extension", label: catalog.messages.extension, icon: Chrome },
  ]

  return (
    <nav className="mobile-bottom-nav" aria-label={catalog.messages.mobileNavigation}>
      {entries.map(({ id, label, icon: Icon }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={activeTarget === id ? "location" : undefined}
          onClick={() => setActiveTarget(id)}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  )
}
