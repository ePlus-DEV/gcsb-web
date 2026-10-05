"use client"

import { useEffect, useState } from "react"
import source from "@/public/i18n/locales/en.json"
import { getWebsiteLocale, loadWebsiteCatalog } from "@/lib/website-i18n"

/** Shared chrome also follows language changes on routes without a locale segment. */
export function useSiteMessages() {
  const [messages, setMessages] = useState(source.messages)
  useEffect(() => {
    let alive = true
    let request = 0
    const update = () => {
      const id = ++request
      void loadWebsiteCatalog(getWebsiteLocale(document.documentElement.dataset.locale))
        .then((catalog) => { if (alive && id === request) setMessages(catalog.messages as typeof source.messages) })
        .catch(() => { /* Keep the last complete catalog while offline. */ })
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-locale"] })
    return () => { alive = false; observer.disconnect() }
  }, [])
  return messages
}
