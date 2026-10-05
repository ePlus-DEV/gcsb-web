import Link from "next/link"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

/** Primary navigation action using the same brand colors in both themes. */
export default function ContentLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn("content-primary-action", className)} {...props} />
}
