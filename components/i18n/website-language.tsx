"use client"

import { Globe2 } from "lucide-react"
import type { ChangeEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import {
  DEFAULT_WEBSITE_LOCALE,
  getWebsiteLocale,
  getWebsiteLocaleFromPathname,
  getWebsiteLocaleHref,
  getWebsiteLocaleInfo,
  loadWebsiteCatalog,
  translateWebsiteText,
  WEBSITE_LOCALES,
  WEBSITE_LOCALE_STORAGE_KEY,
  type WebsiteCatalog,
  type WebsiteLocale,
} from "@/lib/website-i18n"

const TRANSLATABLE_ATTRIBUTES = ["aria-label", "title", "placeholder"] as const
const SKIP_SELECTOR = "script, style, code, pre, textarea, [data-no-translate]"

type TextRecord = { source: string; translated: string }
type AttributeRecord = { source: string; translated: string }

const textRecords = new WeakMap<Text, TextRecord>()
const attributeRecords = new WeakMap<Element, Map<string, AttributeRecord>>()

function shouldSkip(node: Node): boolean {
  const element =
    node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement
  return Boolean(element?.closest(SKIP_SELECTOR))
}

function translateTextNode(
  node: Text,
  sourceCatalog: WebsiteCatalog,
  targetCatalog: WebsiteCatalog,
) {
  if (shouldSkip(node)) return

  const current = node.nodeValue ?? ""
  if (!current.trim()) return

  const existing = textRecords.get(node)
  const source = existing && current === existing.translated ? existing.source : current
  const leading = source.match(/^\s*/)?.[0] ?? ""
  const trailing = source.match(/\s*$/)?.[0] ?? ""
  const translatedValue = translateWebsiteText(
    source.trim(),
    sourceCatalog,
    targetCatalog,
  )
  const translated = `${leading}${translatedValue}${trailing}`

  textRecords.set(node, { source, translated })
  if (current !== translated) node.nodeValue = translated
}

function translateAttributes(
  element: Element,
  sourceCatalog: WebsiteCatalog,
  targetCatalog: WebsiteCatalog,
) {
  if (element.closest(SKIP_SELECTOR)) return

  let records = attributeRecords.get(element)
  if (!records) {
    records = new Map()
    attributeRecords.set(element, records)
  }

  for (const attribute of TRANSLATABLE_ATTRIBUTES) {
    const current = element.getAttribute(attribute)
    if (!current) continue

    const existing = records.get(attribute)
    const source = existing && current === existing.translated ? existing.source : current
    const translated = translateWebsiteText(source, sourceCatalog, targetCatalog)
    records.set(attribute, { source, translated })

    if (current !== translated) element.setAttribute(attribute, translated)
  }
}

function translateTree(
  root: Node,
  sourceCatalog: WebsiteCatalog,
  targetCatalog: WebsiteCatalog,
) {
  if (shouldSkip(root)) return

  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text, sourceCatalog, targetCatalog)
    return
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    translateAttributes(root as Element, sourceCatalog, targetCatalog)
  }

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
  )
  let node = walker.nextNode()
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      translateTextNode(node as Text, sourceCatalog, targetCatalog)
    } else {
      translateAttributes(node as Element, sourceCatalog, targetCatalog)
    }
    node = walker.nextNode()
  }
}

export default function WebsiteLanguage() {
  const [locale, setLocale] = useState<WebsiteLocale>(DEFAULT_WEBSITE_LOCALE)
  const [catalogs, setCatalogs] = useState<{
    locale: WebsiteLocale
    source: WebsiteCatalog
    target: WebsiteCatalog
  } | null>(null)
  const [ready, setReady] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const localeInfo = useMemo(() => getWebsiteLocaleInfo(locale), [locale])

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(WEBSITE_LOCALE_STORAGE_KEY)
    } catch {
      // Locale persistence is optional.
    }

    const pathLocale = getWebsiteLocaleFromPathname(window.location.pathname)
    setLocale(pathLocale ?? getWebsiteLocale(stored || navigator.language))
    setReady(true)
  }, [])

  useEffect(() => {
    const syncPortalTarget = () => {
      const nextTarget = document.querySelector<HTMLElement>(
        ".arcade-header-actions",
      )
      setPortalTarget((current: HTMLElement | null) =>
        current === nextTarget ? current : nextTarget,
      )
    }

    syncPortalTarget()
    const observer = new MutationObserver(syncPortalTarget)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!ready) return

    const html = document.documentElement
    html.lang = localeInfo.htmlLang
    html.dir = locale === "ar" ? "rtl" : "ltr"
    html.dataset.locale = locale

    try {
      window.localStorage.setItem(WEBSITE_LOCALE_STORAGE_KEY, locale)
    } catch {
      // Locale persistence is optional.
    }
  }, [locale, localeInfo.htmlLang, ready])

  useEffect(() => {
    if (!ready) return

    let active = true
    void Promise.all([loadWebsiteCatalog("en"), loadWebsiteCatalog(locale)])
      .then(([source, target]) => {
        if (active) setCatalogs({ locale, source, target })
      })
      .catch(() => {
        if (active) setCatalogs(null)
      })

    return () => {
      active = false
    }
  }, [locale, ready])

  useEffect(() => {
    if (!ready || !catalogs || catalogs.locale !== locale) return

    translateTree(document.body, catalogs.source, catalogs.target)

    let scheduled = false
    const observer = new MutationObserver((mutations) => {
      if (scheduled) return
      scheduled = true

      window.requestAnimationFrame(() => {
        scheduled = false
        for (const mutation of mutations) {
          if (mutation.type === "characterData") {
            translateTree(mutation.target, catalogs.source, catalogs.target)
          } else if (mutation.type === "attributes") {
            translateAttributes(
              mutation.target as Element,
              catalogs.source,
              catalogs.target,
            )
          }
          for (const addedNode of mutation.addedNodes) {
            translateTree(addedNode, catalogs.source, catalogs.target)
          }
        }
      })
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
      childList: true,
      characterData: true,
      subtree: true,
    })
    return () => observer.disconnect()
  }, [catalogs, locale, ready])

  function changeLocale(nextLocale: WebsiteLocale) {
    try {
      window.localStorage.setItem(WEBSITE_LOCALE_STORAGE_KEY, nextLocale)
    } catch {
      // Locale persistence is optional.
    }

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
    window.location.assign(`${basePath}${getWebsiteLocaleHref(nextLocale)}`)
  }

  if (!ready || !portalTarget) return null

  const languageLabel =
    catalogs && catalogs.locale === locale
      ? translateWebsiteText("Language", catalogs.source, catalogs.target)
      : "Language"

  return createPortal(
    <label className="website-language-switcher" data-no-translate>
      <Globe2 aria-hidden="true" />
      <span className="sr-only">{languageLabel}</span>
      <select
        aria-label={languageLabel}
        value={locale}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          changeLocale(event.target.value as WebsiteLocale)
        }
      >
        {WEBSITE_LOCALES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.shortLabel} · {item.label}
          </option>
        ))}
      </select>
    </label>,
    portalTarget,
  )
}
