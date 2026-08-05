"use client"

import { Settings } from "lucide-react"
import { COOKIE_PREFERENCES_EVENT } from "@/components/privacy/cookie-consent"

export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      className="cookie-preferences-trigger"
      onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))}
    >
      <Settings /> Manage cookie preferences
    </button>
  )
}
