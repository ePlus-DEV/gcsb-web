import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Shared layout primitives. All copy is supplied by the caller's locale catalog. */
export function SectionTitle({ children, className, ...props }: ComponentPropsWithoutRef<"h2">) {
  return <h2 className={cn("panel-title", className)} {...props}>{children}</h2>
}

export function MetricStat({ value, label, icon }: { value: string; label: string; icon?: ReactNode }) {
  return <div className="ui-metric-stat">
    {icon && <span className="profile-stat-icon" aria-hidden="true">{icon}</span>}
    <strong>{value}</strong><span>{label}</span>
  </div>
}

export function DashboardPanel({ className, ...props }: ComponentPropsWithoutRef<"article">) {
  return <article className={cn("dashboard-panel", className)} {...props} />
}
