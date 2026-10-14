import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

type ContentCardProps = ComponentPropsWithoutRef<"article"> & {
  as?: "article" | "aside"
}

/** A semantic content surface shared by editorial and reward pages. */
export default function ContentCard({ as: Tag = "article", className, ...props }: ContentCardProps) {
  return <Tag className={cn("site-surface content-card", className)} {...props} />
}
