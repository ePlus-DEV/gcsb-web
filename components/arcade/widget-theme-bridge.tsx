"use client"

import { useEffect } from "react"

const WEBSITE_THEME_STORAGE_KEY = "arcade-theme"

function readWidgetTheme(): "light" | "dark" {
  try {
    return window.localStorage.getItem(WEBSITE_THEME_STORAGE_KEY) === "dark" ? "dark" : "light"
  } catch {
    return "light"
  }
}

/** Keeps the embed light by default without changing the website-wide theme preference. */
export default function WidgetThemeBridge() {
  useEffect(() => {
    const root = document.documentElement

    const applyTheme = () => {
      root.dataset.widgetTheme = readWidgetTheme()
    }

    applyTheme()
    window.addEventListener("storage", applyTheme)

    return () => {
      window.removeEventListener("storage", applyTheme)
      delete root.dataset.widgetTheme
    }
  }, [])

  return null
}
