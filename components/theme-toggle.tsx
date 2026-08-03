"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

const THEME_COLORS = {
  light: "#f4f7ff",
  dark: "#050918",
} as const

function SunIcon() {
  return (
    <svg
      className="theme-icon theme-icon-light"
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

function MoonIcon() {
  return (
    <svg
      className="theme-icon theme-icon-dark"
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

/** Toggles between the persisted light and dark website themes. */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setMounted(true)

    const syncPortalTarget = () => {
      const nextTarget = document.querySelector<HTMLElement>(
        ".arcade-header-actions",
      )
      setPortalTarget((current) =>
        current === nextTarget ? current : nextTarget,
      )
    }

    syncPortalTarget()
    const observer = new MutationObserver(syncPortalTarget)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const activeTheme = resolvedTheme === "light" ? "light" : "dark"
    let themeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    )

    if (!themeColor) {
      themeColor = document.createElement("meta")
      themeColor.name = "theme-color"
      document.head.append(themeColor)
    }

    themeColor.content = THEME_COLORS[activeTheme]
  }, [resolvedTheme])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"
  const nextTheme = isDark ? "light" : "dark"
  const label = `Switch to ${nextTheme} mode`
  const button = (
    <button
      className={`website-theme-toggle ${portalTarget ? "is-header-control" : "is-floating"}`}
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(nextTheme)}
    >
      <SunIcon />
      <MoonIcon />
    </button>
  )

  return portalTarget ? createPortal(button, portalTarget) : button
}
