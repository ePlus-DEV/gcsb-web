"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { Gamepad2, Menu, X } from "lucide-react"
import { CURRENT_SWAG_SEASON, swagSeasonPath } from "@/components/arcade/swag-seasons"
import { useSiteMessages } from "./use-site-messages"

export default function SiteHeader({ homeHref = "/", dashboard = false, actions }: {
  homeHref?: string
  dashboard?: boolean
  actions?: ReactNode
}) {
  const messages = useSiteMessages()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)
  const close = () => setOpen(false)
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus() }
    }
    const onPointer = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open])
  const anchor = (id: string) => dashboard ? `#${id}` : `${homeHref}#${id}`
  return (
    <header ref={header} className="arcade-header site-header">
      <Link className="arcade-brand" href={dashboard ? "#top" : homeHref} aria-label={messages.goToCalculator}>
        <span className="arcade-brand-mark" aria-hidden="true"><Gamepad2 /></span>
        <span className="arcade-brand-copy" aria-hidden="true"><strong>ARCADE</strong><b>POINTS</b></span>
      </Link>
      <nav id="site-navigation" className={`arcade-nav${open ? " is-open" : ""}`} aria-label={messages.mobileNavigation}>
        <Link href={anchor("calculator")} onClick={close}>{messages.calculator}</Link>
        <Link href={anchor("tiers")} onClick={close}>{messages.tiers}</Link>
        <Link href={anchor("badges")} onClick={close}>{messages.badges}</Link>
        <Link href={anchor("extension")} onClick={close}>{messages.extension}</Link>
        <Link data-arcade-swag-nav="true" className={pathname?.includes("/swag-drops") ? "active" : undefined} href={swagSeasonPath(CURRENT_SWAG_SEASON)} onClick={close}>{messages.swagDrops}</Link>
        <Link className={pathname?.includes("/monthly-labs") ? "active" : undefined} href="/monthly-labs/" onClick={close}>{messages.monthlyLabs}</Link>
      </nav>
      <div className="arcade-header-actions">
        {actions}
        <button ref={toggle} className="mobile-menu-toggle" type="button" aria-controls="site-navigation" aria-expanded={open} aria-label={open ? messages.closeNavigation : messages.openNavigation} onClick={() => setOpen(!open)}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
    </header>
  )
}
