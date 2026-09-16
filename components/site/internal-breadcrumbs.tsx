"use client"

import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

function stripBasePath(pathname: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
  if (basePath && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length) || "/"
  }
  return pathname
}

function swagSegmentLabel(segment: string): string {
  const tierLabels: Record<string, string> = {
    trooper: "Arcade Trooper",
    ranger: "Arcade Ranger",
    champion: "Arcade Champion",
    legend: "Arcade Legend",
  }
  if (tierLabels[segment]) return tierLabels[segment]
  if (segment === "weather-shield-jacket") return "Weather-Shield Jacket"

  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export default function InternalBreadcrumbs() {
  const [pathname, setPathname] = useState("")

  useEffect(() => {
    setPathname(stripBasePath(window.location.pathname))
  }, [])

  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    if (segments[0] !== "swag-drops") return null

    const result: Array<{ label: string; href?: string }> = [
      { label: "Swag Drops", href: "/swag-drops/" },
    ]

    if (segments[1]) {
      result.push({
        label: segments[1],
        href: segments[2] ? `/swag-drops/${segments[1]}/` : undefined,
      })
    }

    if (segments[2]) {
      result.push({ label: swagSegmentLabel(segments[2]) })
    }

    return result
  }, [pathname])

  if (!pathname) {
    return <div className="mb-8 h-5" aria-hidden="true" />
  }

  if (!crumbs) {
    return (
      <Link href="/" className="internal-back-link mb-8 inline-flex items-center text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to calculator
      </Link>
    )
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-8 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-2 text-sm text-slate-400"
    >
      <Link href="/" className="transition hover:text-white">
        Calculator
      </Link>
      {crumbs.map((item, index) => {
        const isCurrent = index === crumbs.length - 1
        return (
          <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" aria-hidden="true" />
            {item.href && !isCurrent ? (
              <Link href={item.href} className="truncate transition hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span
                className={isCurrent ? "truncate font-medium text-slate-200" : "truncate"}
                aria-current={isCurrent ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
