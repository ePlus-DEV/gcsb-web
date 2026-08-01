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
  const [navigation, setNavigation] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setNavigation(document.querySelector<HTMLElement>(".arcade-nav"))
  }, [])

  if (!navigation) return null

  return createPortal(
    <>
      {routeLinks.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </>,
    navigation,
  )
}
