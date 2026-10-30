"use client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { BadgeCheck, BookOpen, Chrome, Download, ExternalLink, Gamepad2, Globe2, Menu, Search, Trophy, X } from "lucide-react"
import { getWebsiteLocaleHref, type WebsiteCatalog, type WebsiteLocale } from "@/lib/website-i18n"
import { CURRENT_SWAG_SEASON, swagSeasonPath } from "./swag-seasons"
const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg"
const FIREFOX_EXTENSION_URL = "https://addons.mozilla.org/addon/cloud-skills-boost-helper"
type Props = { catalog: WebsiteCatalog; locale: WebsiteLocale; dashboard?: boolean; landing?: boolean }
export function ArcadeHeader({catalog, locale, dashboard = false, landing = false}: Props) {
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
          <span className="arcade-brand-copy">{landing ? <><strong>ePlus Arcade</strong><b>Track · Plan · Score · Get Rewards</b></> : <><strong>ARCADE</strong><b>POINTS</b></>}</span>
          {!landing && <em>PRO</em>}
        </Link>

        <nav id="arcade-primary-navigation" className={mobileMenuOpen ? "arcade-nav is-open" : "arcade-nav"}>
          {landing ? (<>
            <Link className="active" aria-current="page" href={homeHref} onClick={() => setMobileMenuOpen(false)}>{catalog.messages.homeNav}</Link>
            <Link href={dashboardHref} onClick={() => setMobileMenuOpen(false)}>{catalog.messages.dashboardNav}</Link>
            <a href="#programs" onClick={() => setMobileMenuOpen(false)}>{catalog.messages.facilitatorProgram}</a>
            <Link href="/guide/" onClick={() => setMobileMenuOpen(false)}>{catalog.messages.guide}</Link>
            <a href="#extension" onClick={() => setMobileMenuOpen(false)}>{catalog.messages.extension}</a>
          </>) : (<>

          <Link className={!dashboard ? "active" : ""} aria-current={!dashboard ? "page" : undefined} href={homeHref} onClick={() => setMobileMenuOpen(false)}>{catalog.messages.homeNav}</Link>
          <Link className={dashboard ? "active" : ""} aria-current={dashboard ? "page" : undefined} href={dashboardHref} onClick={() => setMobileMenuOpen(false)}>{catalog.messages.dashboardNav}</Link>
          <Link href={`${dashboardHref}#calculator`} onClick={() => setMobileMenuOpen(false)}>{catalog.messages.calculator}</Link>
          <Link href={`${dashboardHref}#tiers`} onClick={() => setMobileMenuOpen(false)}>{catalog.messages.tiers}</Link>
          {dashboard && <a href="#badges" onClick={() => setMobileMenuOpen(false)}>{catalog.messages.badges}</a>}
          <Link href={`${homeHref}#extension`} onClick={() => setMobileMenuOpen(false)}>{catalog.messages.extension}</Link>
          <Link
            data-arcade-swag-nav="true"
            href={swagSeasonPath(CURRENT_SWAG_SEASON)}
            onClick={() => setMobileMenuOpen(false)}
          >{catalog.additional["Swag Drops"]}</Link>
          <Link href={`${dashboardHref}#monthly-games`} onClick={() => setMobileMenuOpen(false)}>{catalog.messages.guestLabsLabel}</Link>
        
          </>)}
        </nav>

        <div className="arcade-header-actions">
          {landing && <Link className="landing-header-dashboard" href={dashboardHref}>{catalog.messages.dashboardNav} <Search aria-hidden="true"/></Link>}
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

type MobileSection = "calculator" | "tiers" | "badges" | "monthly-games" | "extension"

/** Section-aware nav: clicks, direct #links and manual scroll share one active item. */
function MobileBottomNavigation({ catalog, locale, dashboard }: Props) {
  const homeHref = getWebsiteLocaleHref(locale)
  const dashboardHref = `${homeHref}dashboard/`
  // Guest Dashboard has no earned badges section; monthly games live there.
  const [profileView, setProfileView] = useState(false)
  useEffect(() => {
    if (!dashboard) return
    const page = document.querySelector<HTMLElement>(".arcade-dashboard-page")
    if (!page) return
    const sync = () => setProfileView(page.dataset.dashboardView === "profile")
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(page, { attributes: true, attributeFilter: ["data-dashboard-view"] })
    return () => observer.disconnect()
  }, [dashboard])
  const thirdId: MobileSection = dashboard && profileView ? "badges" : "monthly-games"
  const thirdHref = dashboard && !profileView ? "#monthly-games" : "#" + thirdId
  const sectionIds: MobileSection[] = ["calculator", "tiers", thirdId, "extension"]
  const [active, setActive] = useState<MobileSection>("calculator")
  const [homeActive, setHomeActive] = useState<"home" | "extension">("home")
  const clickAt = useRef(0)

  useEffect(() => {
    if (dashboard) return
    const sync = () => {
      const extension = document.getElementById("extension")
      const nearExtension = Boolean(extension && extension.getBoundingClientRect().top <= window.innerHeight * .65)
      setHomeActive(nearExtension ? "extension" : "home")
    }
    const onHash = () => {
      if (window.location.hash === "#extension") setHomeActive("extension")
      else sync()
    }
    sync()
    window.addEventListener("scroll", sync, { passive: true })
    window.addEventListener("hashchange", onHash)
    window.addEventListener("pageshow", onHash)
    return () => {
      window.removeEventListener("scroll", sync)
      window.removeEventListener("hashchange", onHash)
      window.removeEventListener("pageshow", onHash)
    }
  }, [dashboard])

  useEffect(() => {
    let frame = 0
    const sync = () => {
      if (Date.now() - clickAt.current < 250) return
      const hash = window.location.hash.slice(1)
      const available = sectionIds.filter(id => document.getElementById(id))
      if (hash && available.includes(hash as MobileSection)) {
        const target = document.getElementById(hash)
        if (target && Math.abs(target.getBoundingClientRect().top) < 175) {
          setActive(hash as MobileSection)
          return
        }
      }
      const visible = available.map(id => ({
        id,
        top: document.getElementById(id)!.getBoundingClientRect().top,
      })).sort((left, right) => left.top - right.top)
      const reached = visible.filter(item => item.top <= 180)
      setActive((reached.at(-1) ?? visible[0])?.id ?? "calculator")
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(sync)
    }
    // Deep links may load before the browser scrolls to the destination.
    // Honor the URL fragment immediately; normal scrolling then takes over.
    const syncHash = () => {
      const hash = window.location.hash.slice(1)
      if (sectionIds.includes(hash as MobileSection) && document.getElementById(hash)) {
        clickAt.current = Date.now()
        setActive(hash as MobileSection)
      } else {
        schedule()
      }
    }
    syncHash()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("hashchange", syncHash)
    window.addEventListener("pageshow", syncHash)
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("hashchange", syncHash)
      window.removeEventListener("pageshow", syncHash)
      window.removeEventListener("resize", schedule)
    }
  }, [dashboard, thirdId])

  const select = (id: MobileSection) => {
    clickAt.current = Date.now()
    setActive(id)
  }
  const itemProps = (id: MobileSection) => ({
    className: active === id ? "is-active" : "",
    "aria-current": (active === id ? "location" : undefined) as "location" | undefined,
    onClick: () => select(id),
  })

  if (!dashboard) return (
    <nav className="mobile-bottom-nav home-bottom-nav" aria-label={catalog.messages.mobileNavigation}>
      <Link className={homeActive === "home" ? "is-active" : ""} aria-current={homeActive === "home" ? "page" : undefined} href={homeHref}><Gamepad2 /><span>{catalog.messages.homeNav}</span></Link>
      <Link href={dashboardHref}><Search /><span>{catalog.messages.dashboardNav}</span></Link>
      <Link href="/guide/"><BookOpen /><span>{catalog.messages.guide}</span></Link>
      <Link className={homeActive === "extension" ? "is-active" : ""} aria-current={homeActive === "extension" ? "location" : undefined} href="#extension" onClick={() => setHomeActive("extension")}><Chrome /><span>{catalog.messages.extension}</span></Link>
    </nav>
  )

  return (
    <nav className="mobile-bottom-nav" aria-label={catalog.messages.mobileNavigation}>
      <a href="#calculator" {...itemProps("calculator")}><Search /><span>{catalog.messages.calculator}</span></a>
      <a href="#tiers" {...itemProps("tiers")}><Trophy /><span>{catalog.messages.tiers}</span></a>
      <Link href={thirdHref} {...itemProps(thirdId)}>
        {dashboard && profileView ? <BadgeCheck /> : <Gamepad2 />}
        <span>{dashboard && profileView ? catalog.messages.badges : catalog.messages.guestLabsLabel}</span>
      </Link>
      <Link href={dashboard ? homeHref + "#extension" : "#extension"} {...itemProps("extension")}>
        <Chrome /><span>{catalog.messages.extension}</span>
      </Link>
    </nav>
  )
}

export function ArcadeFooter({catalog, locale, dashboard = false, landing = false}: Props) {
 const homeHref = getWebsiteLocaleHref(locale)
 return <>
      {landing ? (
        <footer className="arcade-footer landing-footer" data-home-order="footer">
          <div className="landing-footer-about">
            <Link className="arcade-brand footer-brand" href={homeHref}>
              <span className="arcade-brand-mark"><Gamepad2/></span>
              <span className="arcade-brand-copy"><strong>ePlus Arcade</strong><b>Track · Plan · Score · Get Rewards</b></span>
            </Link>
            <p>{catalog.messages.unofficial}</p>
          </div>
          <nav className="landing-footer-links" aria-label={catalog.messages.about}>
            <strong>{catalog.messages.about}</strong>
            <Link href={homeHref + "dashboard/"}>{catalog.messages.dashboardNav}</Link>
            <Link href="/guide/">{catalog.messages.guide}</Link>
            <Link href="/swag-drops/2026/">{catalog.additional["__score:swagArchive"]}</Link>
            <Link href="/about/">{catalog.messages.aboutArcade}</Link>
          </nav>
          <nav className="landing-footer-links" aria-label="Community">
            <strong>ePlus.DEV</strong>
            <a href="https://github.com/ePlus-DEV/gcsb-web" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://eplus.dev/" target="_blank" rel="noopener noreferrer">ePlus.DEV</a>
            <Link href="/privacy/">{catalog.messages.privacy}</Link>
            <Link href="/terms/">{catalog.messages.terms}</Link>
          </nav>
          <nav className="landing-footer-links" aria-label={catalog.messages.guide}>
            <strong>{catalog.messages.extension}</strong>
            <a href={CHROME_EXTENSION_URL} target="_blank" rel="noopener noreferrer">Chrome</a>
            <a href={FIREFOX_EXTENSION_URL} target="_blank" rel="noopener noreferrer">Firefox</a>
            <Link href={homeHref + "dashboard/"}>{catalog.messages.calculator}</Link>
          </nav>
          <div className="landing-footer-bottom">
            <span>© 2026 ePlus.DEV</span>
            <span>{catalog.messages.unofficial}</span>
          </div>
        </footer>
      ) : (
        <footer className="arcade-footer" data-home-order="footer">
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
      )}

            <MobileBottomNavigation catalog={catalog} locale={locale} dashboard={dashboard} /></>
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
