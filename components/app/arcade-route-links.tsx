"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

const routeLinks = [
  { href: "/about/", label: "About" },
  { href: "/guide/", label: "Guide" },
  { href: "/privacy/", label: "Privacy" },
  { href: "/terms/", label: "Terms" },
]

export default function ArcadeRouteLinks() {
  const [footer, setFooter] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const syncFooter = () => {
      const nextFooter = document.querySelector<HTMLElement>(".arcade-footer")
      setFooter((current) => (current === nextFooter ? current : nextFooter))
    }

    syncFooter()
    const observer = new MutationObserver(syncFooter)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

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
