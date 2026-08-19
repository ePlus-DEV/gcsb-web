"use client"

import { Globe2, ShieldCheck, Star } from "lucide-react"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"

const TIER_ICON_SELECTOR = ".tier-status-main .tier-trophy"
const TIER_TITLE_SELECTOR = ".tier-status-main strong"

type TierKey = "trooper" | "ranger" | "champion" | "legend" | "none"

function getTierKey(label: string): TierKey {
  const normalized = label.trim().toLowerCase()
  if (normalized.includes("legend")) return "legend"
  if (normalized.includes("champion")) return "champion"
  if (normalized.includes("ranger")) return "ranger"
  if (normalized.includes("trooper")) return "trooper"
  return "none"
}

function TierRankIcon({ tier }: { tier: TierKey }) {
  if (tier === "champion") return <Star aria-hidden="true" />
  if (tier === "ranger") return <Globe2 aria-hidden="true" />
  if (tier === "trooper") return <ShieldCheck aria-hidden="true" />
  return null
}

function hideOriginalIcon(target: HTMLElement): void {
  target.querySelectorAll<SVGElement>(":scope > svg").forEach((icon) => {
    icon.dataset.originalTierTrophy = "true"
    icon.style.setProperty("display", "none", "important")
    icon.style.setProperty("visibility", "hidden", "important")
  })
}

function restoreOriginalIcon(target: HTMLElement | null): void {
  target
    ?.querySelectorAll<SVGElement>('svg[data-original-tier-trophy="true"]')
    .forEach((icon) => {
      icon.style.removeProperty("display")
      icon.style.removeProperty("visibility")
      delete icon.dataset.originalTierTrophy
    })
}

export default function TierStatusIconEnhancer() {
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [tier, setTier] = useState<TierKey>("none")

  useEffect(() => {
    let currentTarget: HTMLElement | null = null

    const syncTierIcon = () => {
      const nextTarget = document.querySelector<HTMLElement>(TIER_ICON_SELECTOR)
      const title = document.querySelector<HTMLElement>(TIER_TITLE_SELECTOR)

      if (!nextTarget || !title) {
        restoreOriginalIcon(currentTarget)
        currentTarget?.removeAttribute("data-arcade-tier-icon")
        currentTarget = null
        setTarget(null)
        setTier("none")
        return
      }

      const nextTier = getTierKey(title.textContent ?? "")

      if (currentTarget !== nextTarget) {
        restoreOriginalIcon(currentTarget)
        currentTarget?.removeAttribute("data-arcade-tier-icon")
        currentTarget = nextTarget
        setTarget(nextTarget)
      }

      if (nextTier === "legend" || nextTier === "none") {
        restoreOriginalIcon(nextTarget)
      } else {
        hideOriginalIcon(nextTarget)
      }

      if (nextTarget.dataset.arcadeTierIcon !== nextTier) {
        nextTarget.dataset.arcadeTierIcon = nextTier
      }
      setTier((current) => (current === nextTier ? current : nextTier))
    }

    syncTierIcon()

    const observer = new MutationObserver(syncTierIcon)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      observer.disconnect()
      restoreOriginalIcon(currentTarget)
      currentTarget?.removeAttribute("data-arcade-tier-icon")
    }
  }, [])

  return (
    <>
      <style>{`
        .arcade-tier-rank-icon {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
        }

        .arcade-tier-rank-icon svg {
          width: 23px;
          height: 23px;
          stroke-width: 2.15;
        }

        .tier-trophy[data-arcade-tier-icon="trooper"] {
          border-color: rgba(96, 165, 250, 0.34);
          background: rgba(37, 99, 235, 0.13);
          color: #60a5fa;
        }

        .tier-trophy[data-arcade-tier-icon="ranger"] {
          border-color: rgba(74, 222, 128, 0.32);
          background: rgba(34, 197, 94, 0.12);
          color: #4ade80;
        }

        .tier-trophy[data-arcade-tier-icon="champion"] {
          border-color: rgba(251, 146, 60, 0.35);
          background: rgba(249, 115, 22, 0.12);
          color: #fb923c;
        }

        .tier-trophy[data-arcade-tier-icon="legend"] {
          border-color: rgba(192, 132, 252, 0.4);
          background: linear-gradient(145deg, rgba(126, 34, 206, 0.16), rgba(79, 70, 229, 0.12));
          color: #c084fc;
          box-shadow: 0 0 18px rgba(168, 85, 247, 0.12);
        }

        .tier-trophy[data-arcade-tier-icon="none"] {
          border-color: rgba(148, 163, 184, 0.22);
          background: rgba(148, 163, 184, 0.08);
          color: #94a3b8;
        }

        html.light .tier-trophy[data-arcade-tier-icon="trooper"] {
          border-color: rgba(37, 99, 235, 0.24);
          background: #eff6ff;
          color: #2563eb;
        }

        html.light .tier-trophy[data-arcade-tier-icon="ranger"] {
          border-color: rgba(22, 163, 74, 0.24);
          background: #f0fdf4;
          color: #15803d;
        }

        html.light .tier-trophy[data-arcade-tier-icon="champion"] {
          border-color: rgba(234, 88, 12, 0.24);
          background: #fff7ed;
          color: #c2410c;
        }

        html.light .tier-trophy[data-arcade-tier-icon="legend"] {
          border-color: rgba(147, 51, 234, 0.26);
          background: linear-gradient(145deg, #faf5ff, #eef2ff);
          color: #9333ea;
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.08);
        }
      `}</style>
      {target && tier !== "legend" && tier !== "none"
        ? createPortal(
            <span className="arcade-tier-rank-icon" aria-hidden="true">
              <TierRankIcon tier={tier} />
            </span>,
            target,
          )
        : null}
    </>
  )
}
