"use client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { BadgeCheck, Chrome, Download, ExternalLink, Gamepad2, Globe2, Menu, Search, Trophy, X } from "lucide-react"
import { getWebsiteLocaleHref, type WebsiteCatalog, type WebsiteLocale } from "@/lib/website-i18n"
import { CURRENT_SWAG_SEASON, swagSeasonPath } from "./swag-seasons"
const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg"
const FIREFOX_EXTENSION_URL = "https://addons.mozilla.org/addon/cloud-skills-boost-helper"
type Props = { catalog: WebsiteCatalog; locale: WebsiteLocale; dashboard?: boolean }
export function ArcadeHeader({catalog, locale, dashboard = false}: Props) {
 const homeHref = getWebsiteLocaleHref(locale)
 const dashboardHref = `${homeHref}dashboard/`
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  // Header height can grow when navigation or translations wrap at tablet widths.
  // Keep sticky Tiers below its actual size rather than a fixed 72px assumption.
  useEffect(() => {
    const header = headerRef.current
    const dashboard = header?.closest<HTMLElement>(".arcade-dashboard-page")
    if (!header || !dashboard) return

    const syncHeaderHeight = () => {
      dashboard.style.setProperty(
        "--arcade-sticky-header-height",
        `${Math.ceil(header.getBoundingClientRect().height)}px`,
      )
    }
    syncHeaderHeight()
    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(syncHeaderHeight)
      : null
    observer?.observe(header)
    window.addEventListener("resize", syncHeaderHeight)
    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", syncHeaderHeight)
      dashboard.style.removeProperty("--arcade-sticky-header-height")
    }
  }, [])
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setMobileMenuOpen(false)
      menuToggleRef.current?.focus()
    }
    const onResize = () => { if (window.innerWidth > 1100) setMobileMenuOpen(false) }
    window.addEventListener("keydown", onKey)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onResize)
    }
  }, [mobileMenuOpen])

 return (<header ref={headerRef} className="arcade-header">
        <Link className="arcade-brand" href={homeHref} aria-label={catalog.messages.backToCalculator}>
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
          <em>PRO</em>
        </Link>

        <nav id="arcade-primary-navigation" className={mobileMenuOpen ? "arcade-nav is-open" : "arcade-nav"}>
          <Link className={!dashboard ? "active" : ""} aria-current={!dashboard ? "page" : undefined} href={homeHref} onClick={() => setMobileMenuOpen(false)}>{catalog.messages.homeNav}</Link>
          <Link className={dashboard ? "active" : ""} aria-current={dashboard ? "page" : undefined} href={dashboardHref} onClick={() => setMobileMenuOpen(false)}>{catalog.messages.dashboardNav}</Link>
          <a href="#calculator" onClick={() => setMobileMenuOpen(false)}>{catalog.messages.calculator}</a>
          <a href="#tiers" onClick={() => setMobileMenuOpen(false)}>{catalog.messages.tiers}</a>
          {dashboard && <a href="#badges" onClick={() => setMobileMenuOpen(false)}>{catalog.messages.badges}</a>}
          <Link href={`${homeHref}#extension`} onClick={() => setMobileMenuOpen(false)}>{catalog.messages.extension}</Link>
          <Link
            data-arcade-swag-nav="true"
            href={swagSeasonPath(CURRENT_SWAG_SEASON)}
            onClick={() => setMobileMenuOpen(false)}
          >{catalog.additional["Swag Drops"]}</Link>
          <Link href={`${homeHref}#monthly-games`} onClick={() => setMobileMenuOpen(false)}>{catalog.messages.guestLabsLabel}</Link>
        </nav>

        <div className="arcade-header-actions">
          <a
            className="header-store-link is-chrome"
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={catalog.messages.installChrome}
          >
            <Chrome /> <span>Chrome</span>
          </a>
          <a
            className="header-store-link is-firefox"
            href={FIREFOX_EXTENSION_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={catalog.messages.installFirefox}
          >
            <Globe2 /> <span>Firefox</span>
          </a>
          <button
            className="mobile-menu-toggle"
            ref={menuToggleRef}
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="arcade-primary-navigation"
            aria-label={mobileMenuOpen ? catalog.messages.closeNavigation : catalog.messages.openNavigation}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>)
}
export function ArcadeFooter({catalog, locale, dashboard = false}: Props) {
 const homeHref = getWebsiteLocaleHref(locale)
 return <>      <footer className="arcade-footer" data-home-order="footer">
        <div className="arcade-brand footer-brand">
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
        </div>
        <p>{catalog.messages.unofficial}</p>
        <nav className="footer-route-links" aria-label={catalog.messages.about}>
          <Link href="/about/">{catalog.messages.about}</Link>
          <Link href="/guide/">{catalog.messages.guide}</Link>
          <Link href="/swag-drops/">{catalog.additional["__score:swagArchive"]}</Link>
          <Link href="/privacy/">{catalog.messages.privacy}</Link>
          <Link href="/terms/">{catalog.messages.terms}</Link>
        </nav>
      </footer>

      <nav className="mobile-bottom-nav" aria-label={catalog.messages.mobileNavigation}>
        <Link href={dashboard ? "#calculator" : homeHref}><Search /><span>{catalog.messages.calculator}</span></Link>
        <a href="#tiers"><Trophy /><span>{catalog.messages.tiers}</span></a>
        <a href={!dashboard ? "#monthly-games" : "#badges"}>{!dashboard ? <Gamepad2 /> : <BadgeCheck />}<span>{!dashboard ? catalog.messages.guestLabsLabel : catalog.messages.badges}</span></a>
        <Link href={`${homeHref}#extension`}><Chrome /><span>{catalog.messages.extension}</span></Link>
      </nav></>
}
export function ExtensionStrip({catalog}: {catalog: WebsiteCatalog}) {
  return (
    <section id="extension" className="extension-strip" data-home-order="extension">
      <span className="extension-store-mark"><Download /></span>
      <div className="extension-copy-block">
        <strong>{catalog.messages.installExtension}</strong>
        <span>{catalog.messages.automaticTracking}</span>
      </div>
      <div className="extension-store-actions">
        <a
          className="store-button is-chrome"
          href={CHROME_EXTENSION_URL}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Chrome /> Chrome <ExternalLink />
        </a>
        <a
          className="store-button is-firefox"
          href={FIREFOX_EXTENSION_URL}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Globe2 /> Firefox <ExternalLink />
        </a>
      </div>
    </section>
  )
}
