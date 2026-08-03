"use client"

import { Check, ChevronDown, Globe } from "lucide-react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
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
  const [open, setOpen] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const switcherRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
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

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  function focusOption(index: number) {
    const total = WEBSITE_LOCALES.length
    optionRefs.current[(index + total) % total]?.focus()
  }

  function openMenu(focusSelected = false) {
    setOpen(true)
    if (focusSelected) {
      const selectedIndex = WEBSITE_LOCALES.findIndex((item) => item.code === locale)
      window.requestAnimationFrame(() => focusOption(selectedIndex))
    }
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
    event.preventDefault()
    openMenu(true)
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const activeIndex = optionRefs.current.findIndex(
      (option) => option === document.activeElement,
    )

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault()
      focusOption(activeIndex + 1)
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault()
      focusOption(activeIndex - 1)
    } else if (event.key === "Home") {
      event.preventDefault()
      focusOption(0)
    } else if (event.key === "End") {
      event.preventDefault()
      focusOption(WEBSITE_LOCALES.length - 1)
    }
  }

  function changeLocale(nextLocale: WebsiteLocale) {
    setOpen(false)
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
    <div
      ref={switcherRef}
      className={`website-language-switcher${open ? " is-open" : ""}`}
      data-no-translate
    >
      <button
        ref={triggerRef}
        type="button"
        className="website-language-trigger"
        aria-label={`${languageLabel}: ${localeInfo.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="website-language-menu"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <Globe aria-hidden="true" />
        <span className="website-language-current-code">{localeInfo.shortLabel}</span>
        <span className="website-language-current-label">{localeInfo.label}</span>
        <ChevronDown className="website-language-chevron" aria-hidden="true" />
      </button>

      {open ? (
        <div
          id="website-language-menu"
          className="website-language-menu"
          role="listbox"
          aria-label={languageLabel}
          onKeyDown={handleMenuKeyDown}
        >
          <div className="website-language-menu-heading">
            <span>{languageLabel}</span>
            <small>{localeInfo.label}</small>
          </div>
          <div className="website-language-options">
            {WEBSITE_LOCALES.map((item, index) => {
              const selected = item.code === locale
              return (
                <button
                  key={item.code}
                  ref={(element) => {
                    optionRefs.current[index] = element
                  }}
                  type="button"
                  className={`website-language-option${selected ? " is-selected" : ""}`}
                  role="option"
                  aria-selected={selected}
                  onClick={() => changeLocale(item.code)}
                >
                  <span className="website-language-option-code">{item.shortLabel}</span>
                  <span className="website-language-option-label">{item.label}</span>
                  {selected ? <Check aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>,
    portalTarget,
  )
}
