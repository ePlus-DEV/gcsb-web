import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

/** Layout-only primitives: callers own semantics, localized copy and behavior. */
export function ArcadeSurface({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("arcade-ui-surface", className)} {...props} />
}

export function ArcadeMetric({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("arcade-ui-metric", className)} {...props} />
}
