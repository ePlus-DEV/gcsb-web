"use client"

import { Info } from "lucide-react"
import { COOKIE_PREFERENCES_EVENT } from "@/components/privacy/cookie-consent"

export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      className="cookie-preferences-trigger"
      onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))}
    >
      <Info /> View cookie information
    </button>
  )
}
