"use client"

import { useEffect } from "react"
import {
  CURRENT_SWAG_SEASON,
  swagSeasonPath,
} from "@/components/arcade/swag-seasons"

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")
const SWAG_PATH = swagSeasonPath(CURRENT_SWAG_SEASON)
const SWAG_HREF = `${BASE_PATH}${SWAG_PATH}`
const LINK_SELECTOR = 'a[data-arcade-swag-nav="true"]'

function isSwagRoute(): boolean {
  const pathname = window.location.pathname
  const pathWithoutBase =
    BASE_PATH && pathname.startsWith(BASE_PATH)
      ? pathname.slice(BASE_PATH.length) || "/"
      : pathname

  return pathWithoutBase.startsWith("/swag-drops/")
}

function closeMobileNavigation() {
  const expandedToggle = document.querySelector<HTMLButtonElement>(
    '.mobile-menu-toggle[aria-expanded="true"]',
  )
  expandedToggle?.click()
}

function ensureSwagNavLinks() {
  const active = isSwagRoute()

  document.querySelectorAll<HTMLElement>(".arcade-nav").forEach((nav) => {
    const existing = nav.querySelector<HTMLAnchorElement>(LINK_SELECTOR)
    if (existing) {
      existing.classList.toggle("active", active)
      return
    }

    const link = document.createElement("a")
    link.href = SWAG_HREF
    link.textContent = "Swag Drops"
    link.dataset.arcadeSwagNav = "true"
    link.classList.toggle("active", active)
    link.addEventListener("click", closeMobileNavigation)

    const extensionLink = nav.querySelector<HTMLAnchorElement>('a[href$="#extension"]')
    nav.insertBefore(link, extensionLink ?? null)
  })
}

/** Adds the current-season Swag page to every Arcade header navigation. */
export default function SwagNavLink() {
  useEffect(() => {
    ensureSwagNavLinks()

    const observer = new MutationObserver(() => ensureSwagNavLinks())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return null
}
