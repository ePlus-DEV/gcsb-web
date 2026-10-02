"use client"

import Link from "next/link"
import { useSiteMessages } from "./use-site-messages"

export default function SiteFooter() {
  const messages = useSiteMessages()
  return (
    <footer className="arcade-footer site-footer" data-home-order="footer">
      <p>{messages.unofficial}</p>
      <nav className="footer-route-links" aria-label={messages.aboutTool}>
        <Link href="/about/">{messages.about}</Link>
        <Link href="/guide/">{messages.guide}</Link>
        <Link href="/swag-drops/">{messages.swagDrops}</Link>
        <Link href="/monthly-labs/">{messages.monthlyLabs}</Link>
        <Link href="/privacy/">{messages.privacy}</Link>
        <Link href="/terms/">{messages.terms}</Link>
      </nav>
    </footer>
  )
}
