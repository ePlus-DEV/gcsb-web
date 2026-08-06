"use client"

import { useEffect } from "react"
import { WEBSITE_LOCALES } from "@/lib/website-i18n"

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")

/** Keeps the active shared profile and query string when the global locale menu changes language. */
export default function ProfileLocaleRouting() {
  useEffect(() => {
    function handleLocaleClick(event: MouseEvent) {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>(".website-language-option")
        : null
      if (!target) return

      const options = Array.from(
        document.querySelectorAll<HTMLButtonElement>(".website-language-option"),
      )
      const index = options.indexOf(target)
      const locale = WEBSITE_LOCALES[index]
      if (!locale) return

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      const localePrefix = locale.path ? `/${locale.path}` : ""
      window.location.assign(
        `${BASE_PATH}${localePrefix}/profile/${window.location.search}${window.location.hash}`,
      )
    }

    document.addEventListener("click", handleLocaleClick, true)
    return () => document.removeEventListener("click", handleLocaleClick, true)
  }, [])

  return null
}
