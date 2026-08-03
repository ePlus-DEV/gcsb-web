"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

/** Toggles between the persisted light and dark website themes. */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = !mounted || resolvedTheme === "dark"
  const nextTheme = isDark ? "light" : "dark"
  const label = mounted
    ? `Switch to ${nextTheme} mode`
    : "Change color theme"

  return (
    <button
      className="website-theme-toggle"
      type="button"
      aria-label={label}
      title={label}
      disabled={!mounted}
      onClick={() => setTheme(nextTheme)}
    >
      <Sun className="theme-icon theme-icon-light" aria-hidden="true" />
      <Moon className="theme-icon theme-icon-dark" aria-hidden="true" />
    </button>
  )
}
