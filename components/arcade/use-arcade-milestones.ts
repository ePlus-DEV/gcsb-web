"use client"
import { useEffect, useState } from "react"
import { ARCADE_MILESTONES_URL, OFFICIAL_MILESTONES, numeric, type ArcadeMilestone } from "./model"
export function useArcadeMilestones() {
 const [milestones, setMilestones] = useState<ArcadeMilestone[]>(OFFICIAL_MILESTONES)
 const [milestonesLive, setMilestonesLive] = useState(false)
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15_000)

    async function loadLiveMilestones() {
      try {
        const response = await fetch(ARCADE_MILESTONES_URL, {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) return

        const payload: unknown = await response.json()
        if (!Array.isArray(payload)) return

        const liveMilestones = OFFICIAL_MILESTONES.map((fallback) => {
          const candidate = payload.find(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              numeric((item as { points?: unknown }).points) === fallback.points,
          ) as Record<string, unknown> | undefined

          if (!candidate) return fallback

          const hasSlots =
            candidate.slots !== undefined &&
            candidate.slots !== null &&
            candidate.slots !== ""
          const hasSpotsLeft =
            candidate.spotsLeft !== undefined &&
            candidate.spotsLeft !== null &&
            candidate.spotsLeft !== ""
          if (!hasSlots || !hasSpotsLeft) return fallback

          const slots = numeric(candidate.slots)
          const spotsLeft = numeric(candidate.spotsLeft)
          if (slots <= 0 || spotsLeft < 0 || spotsLeft > slots) return fallback

          return {
            ...fallback,
            league:
              typeof candidate.league === "string"
                ? candidate.league
                : fallback.league,
            slots,
            spotsLeft,
          }
        })

        if (active) {
          setMilestones(liveMilestones)
          setMilestonesLive(
            liveMilestones.every((milestone) => milestone.spotsLeft !== null),
          )
        }
      } catch {
        // Keep the verified tier thresholds and total-slot fallback.
      } finally {
        window.clearTimeout(timeout)
      }
    }

    void loadLiveMilestones()

    return () => {
      active = false
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [])
 return { milestones, milestonesLive }
}
