"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, BadgeCheck, BookOpen, ShieldCheck } from "lucide-react"
import { ArcadeHeader, ArcadeFooter, ExtensionStrip } from "./route-shell"
import {
  getWebsiteLocale,
  getWebsiteLocaleFromPathname,
  getWebsiteLocaleHref,
  loadWebsiteCatalog,
  type WebsiteCatalog,
  type WebsiteLocale,
} from "@/lib/website-i18n"

/** Home is an introduction only. Personal analysis, saved scores, live tiers,
 * monthly game data and Facilitator tracking all belong to Dashboard. */
export default function HomePage({
  catalog, locale, children,
}: {
  catalog: WebsiteCatalog
  locale: WebsiteLocale
  children?: ReactNode
}) {
  const [language, setLanguage] = useState({ catalog, locale })

  useEffect(() => {
    let active = true
    const sync = async () => {
      const next = getWebsiteLocaleFromPathname(window.location.pathname)
        ?? getWebsiteLocale(document.documentElement.dataset.locale)
      const nextCatalog = await loadWebsiteCatalog(next).catch(() => null)
      if (active && nextCatalog) setLanguage({ catalog: nextCatalog, locale: next })
    }
    const observer = new MutationObserver(() => { void sync() })
    observer.observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-locale"],
    })
    void sync()
    return () => { active = false; observer.disconnect() }
  }, [])

  const m = language.catalog.messages
  const dashboardHref = `${getWebsiteLocaleHref(language.locale)}dashboard/`

  return (
    <main className="arcade-dashboard-page arcade-dashboard-v2 arcade-ui-refresh arcade-home-route" data-dashboard-view="guest">
      <div className="arcade-stars" aria-hidden="true" />
      <ArcadeHeader catalog={language.catalog} locale={language.locale} />
      <section id="top" className="arcade-hero home-intro-hero" data-home-order="hero">
        <div className="hero-heading">
          <span className="halloween-edition"><span aria-hidden="true">🎃</span>{m.halloweenEdition}</span>
          <h1>{m.heroTitleTop}<br /><span>{m.heroTitleBottom}</span></h1>
          <p className="hero-description">{m.heroDescription}</p>
          <div className="trust-pills">
            <span><ShieldCheck />{m.publicDataOnly}</span>
            <span><BadgeCheck />{m.noSignIn}</span>
          </div>
          <div className="home-intro-actions">
            <Link className="home-intro-primary" href={dashboardHref}>
              {m.startUsing} <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="home-intro-secondary" href="/guide/">
              <BookOpen aria-hidden="true" /> {m.stepGuide}
            </Link>
          </div>
        </div>
        <div className="home-intro-journey" aria-labelledby="home-intro-journey-title">
          <h2 id="home-intro-journey-title">{m.stepGuide}</h2>
          <ol>
            <li><span aria-hidden="true">01</span><p>{m.openProfile}</p></li>
            <li><span aria-hidden="true">02</span><p>{m.makePublic}</p></li>
            <li><span aria-hidden="true">03</span><p>{m.analyzeTheProfile}</p></li>
          </ol>
        </div>
      </section>
      <div className="program-countdown-host" data-home-order="program-countdown" />
      {children}
      <ExtensionStrip catalog={language.catalog} />
      <ArcadeFooter catalog={language.catalog} locale={language.locale} />
    </main>
  )
}
