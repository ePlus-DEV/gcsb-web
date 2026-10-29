"use client"

import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { BadgeCheck, ShieldCheck } from "lucide-react"
import { ArcadeHeader, ArcadeFooter, ExtensionStrip } from "./route-shell"
import ProfileAnalyzer from "./profile-analyzer"
import HomeProfileSummary from "./home-profile-summary"
import GuestDashboard from "./guest-dashboard"
import { useArcadeMilestones } from "./use-arcade-milestones"
import { useTierSlotHistory } from "./tier-slot-history"
import { PROFILE_URL_PATTERN } from "./model"
import { getWebsiteLocale, getWebsiteLocaleFromPathname, getWebsiteLocaleHref, loadWebsiteCatalog, type WebsiteCatalog, type WebsiteLocale } from "@/lib/website-i18n"

/** Home keeps discovery lightweight, with only an optional saved-score strip. */
export default function HomePage({catalog, locale, children}: {catalog: WebsiteCatalog; locale: WebsiteLocale; children?: ReactNode}) {
  const router = useRouter()
  const [language, setLanguage] = useState({catalog, locale})
  const [url, setUrl] = useState("")
  const [invalid, setInvalid] = useState(false)
  const {milestones, milestonesLive} = useArcadeMilestones()
  const slotHistory = useTierSlotHistory()
  useEffect(() => {
    let active = true
    const sync = async () => {
      const next = getWebsiteLocaleFromPathname(window.location.pathname) ?? getWebsiteLocale(document.documentElement.dataset.locale)
      const nextCatalog = await loadWebsiteCatalog(next).catch(() => null)
      if (active && nextCatalog) setLanguage({catalog: nextCatalog, locale: next})
    }
    const observer = new MutationObserver(() => { void sync() })
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ["data-locale"]})
    void sync()
    return () => { active = false; observer.disconnect() }
  }, [])
  const m = language.catalog.messages
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const profile = url.trim().replace(/\/$/, "")
    if (!PROFILE_URL_PATTERN.test(profile)) { setInvalid(true); return }
    setInvalid(false)
    router.push(`${getWebsiteLocaleHref(language.locale)}dashboard/?profile=${encodeURIComponent(profile)}`)
  }
  return <main className="arcade-dashboard-page arcade-dashboard-v2 arcade-ui-refresh arcade-home-route" data-dashboard-view="guest">
    <div className="arcade-stars" aria-hidden="true" />
    <ArcadeHeader catalog={language.catalog} locale={language.locale} />
    <section id="top" className="arcade-hero" data-home-order="hero">
      <div className="hero-heading">
        <span className="halloween-edition"><span aria-hidden="true">🎃</span>{m.halloweenEdition}</span>
        <h1>{m.heroTitleTop}<br /><span>{m.heroTitleBottom}</span></h1>
        <p className="hero-description">{m.heroDescription}</p>
        <div className="trust-pills"><span><ShieldCheck />{m.publicDataOnly}</span><span><BadgeCheck />{m.noSignIn}</span></div>
      </div>
      <ProfileAnalyzer catalog={language.catalog} value={url} onChange={setUrl} onSubmit={submit} onReset={() => setUrl("")} loading={false} error={invalid ? m.invalidProfileUrl : ""} hasResult={false} />
      <HomeProfileSummary catalog={language.catalog} locale={language.locale} />
    </section>
    <div className="program-countdown-host" data-home-order="program-countdown" />
    <ExtensionStrip catalog={language.catalog} />
    <GuestDashboard viewMode="guest" milestones={milestones} milestonesLive={milestonesLive} slotHistory={slotHistory} catalog={language.catalog} locale={language.locale} />
    {children}
    <ArcadeFooter catalog={language.catalog} locale={language.locale} />
  </main>
}
