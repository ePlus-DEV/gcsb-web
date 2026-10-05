"use client"

import Link from "next/link"
import { Chrome, Gamepad2, Globe2 } from "lucide-react"
import { CHROME_EXTENSION_URL, FIREFOX_EXTENSION_URL } from "@/components/arcade/model"
import { useSiteMessages } from "./use-site-messages"

export default function SiteFooter() {
  const messages = useSiteMessages()
  return (
    <footer className="arcade-footer site-footer" data-home-order="footer">
      <div className="arcade-brand footer-brand">
        <span className="arcade-brand-mark"><Gamepad2 /></span>
        <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
      </div>
      <p>{messages.unofficial}</p>
      <nav className="footer-route-links" aria-label={messages.aboutTool}>
        <Link href="/about/">{messages.about}</Link>
        <Link href="/guide/">{messages.guide}</Link>
        <Link href="/swag-drops/">{messages.swagDrops}</Link>
        <Link href="/monthly-labs/">{messages.monthlyLabs}</Link>
        <Link href="/privacy/">{messages.privacy}</Link>
        <Link href="/terms/">{messages.terms}</Link>
      </nav>
      <div className="footer-store-links">
        <a href={CHROME_EXTENSION_URL} target="_blank" rel="noreferrer noopener">
          <Chrome /> Chrome
        </a>
        <a href={FIREFOX_EXTENSION_URL} target="_blank" rel="noreferrer noopener">
          <Globe2 /> Firefox
        </a>
      </div>
    </footer>
  )
}
