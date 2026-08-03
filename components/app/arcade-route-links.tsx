"use client"

import Link from "next/link"
import { createPortal } from "react-dom"
import { usePortalTarget } from "@/components/use-portal-target"

const routeLinks = [
  { href: "/about/", label: "About" },
  { href: "/guide/", label: "Guide" },
  { href: "/privacy/", label: "Privacy" },
  { href: "/terms/", label: "Terms" },
]

export default function ArcadeRouteLinks() {
  const footer = usePortalTarget(".arcade-footer")

  if (!footer) return null

  return createPortal(
    <nav className="footer-route-links" aria-label="Site information">
      {routeLinks.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>,
    footer,
  )
}
