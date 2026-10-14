"use client"
import { useEffect, useState } from "react"
import source from "@/public/i18n/locales/en.json"
import { getWebsiteLocale, loadWebsiteCatalog, type WebsiteCatalog, type WebsiteLocale } from "@/lib/website-i18n"

export function useSiteCatalog() {
  const [catalog, setCatalog] = useState<WebsiteCatalog>(source)
  const [locale, setLocale] = useState<WebsiteLocale>("en")
  useEffect(() => {
    let active = true
    let request = 0
    const update = () => {
      const next = getWebsiteLocale(document.documentElement.dataset.locale || document.documentElement.lang)
      const id = ++request
      void loadWebsiteCatalog(next).then(value => {
        if (active && request === id) { setCatalog(value); setLocale(next) }
      }).catch(() => {})
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-locale", "lang"] })
    return () => { active = false; observer.disconnect() }
  }, [])
  return { catalog, locale }
}
