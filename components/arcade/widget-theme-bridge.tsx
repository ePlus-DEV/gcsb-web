"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

const WIDGET_THEME_STORAGE_KEY = "arcade-widget-theme-v1"

type WidgetTheme = "light" | "dark"

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function readWidgetTheme(): WidgetTheme {
  try {
    return window.localStorage.getItem(WIDGET_THEME_STORAGE_KEY) === "dark" ? "dark" : "light"
  } catch {
    return "light"
  }
}

function applyWidgetTheme(theme: WidgetTheme) {
  const root = document.documentElement
  root.dataset.widgetTheme = theme

  // The iframe has its own document, so these classes only affect the widget.
  // Keeping them aligned lets the existing widget theme stylesheet stay reusable.
  root.classList.toggle("dark", theme === "dark")
  root.classList.toggle("light", theme === "light")
}

/** Keeps the embed light by default and exposes a compact widget-only theme toggle. */
export default function WidgetThemeBridge() {
  const [theme, setWidgetTheme] = useState<WidgetTheme>("light")
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const initialTheme = readWidgetTheme()
    setWidgetTheme(initialTheme)
    applyWidgetTheme(initialTheme)
    setPortalTarget(document.querySelector<HTMLElement>(".arcade-widget-head"))

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== WIDGET_THEME_STORAGE_KEY && event.key !== null) return
      const nextTheme = readWidgetTheme()
      setWidgetTheme(nextTheme)
      applyWidgetTheme(nextTheme)
    }

    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener("storage", handleStorage)
      delete document.documentElement.dataset.widgetTheme
    }
  }, [])

  function toggleTheme() {
    const nextTheme: WidgetTheme = theme === "dark" ? "light" : "dark"
    setWidgetTheme(nextTheme)
    applyWidgetTheme(nextTheme)

    try {
      window.localStorage.setItem(WIDGET_THEME_STORAGE_KEY, nextTheme)
    } catch {
      // Theme switching still works for the current widget session without storage.
    }
  }

  if (!portalTarget) return null

  const nextTheme = theme === "dark" ? "light" : "dark"
  const label = `Switch widget to ${nextTheme} mode`

  return createPortal(
    <button
      className="arcade-widget-theme-toggle"
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={theme === "dark"}
      onClick={toggleTheme}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>,
    portalTarget,
  )
}
