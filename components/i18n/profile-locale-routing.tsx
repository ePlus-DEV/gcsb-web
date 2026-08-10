"use client"

import { useEffect } from "react"
import { WEBSITE_LOCALES } from "@/lib/website-i18n"

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")
const PROFILE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function getActiveProfileId(): string | null {
  const path = BASE_PATH && window.location.pathname.startsWith(BASE_PATH)
    ? window.location.pathname.slice(BASE_PATH.length)
    : window.location.pathname
  const segments = path.split("/").filter(Boolean)
  const route = segments[segments.length - 2]?.toLowerCase()
  const profileId = segments[segments.length - 1]

  if (
    (route === "profiles" || route === "public_profiles") &&
    PROFILE_ID_PATTERN.test(profileId)
  ) {
    return profileId
  }

  const queryProfileId = new URLSearchParams(window.location.search).get("id")
  return queryProfileId && PROFILE_ID_PATTERN.test(queryProfileId)
    ? queryProfileId
    : null
}

/** Keeps the active shared profile and query string when the global locale menu changes language. */
export default function ProfileLocaleRouting() {
  useEffect(() => {
    function handleLocaleClick(event: MouseEvent) {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>(".website-language-option")
        : null
      if (!target) return

      const options = Array.from(
        document.querySelectorAll<HTMLButtonElement>(".website-language-option"),
      )
      const index = options.indexOf(target)
      const locale = WEBSITE_LOCALES[index]
      if (!locale) return

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      const localePrefix = locale.path ? `/${locale.path}` : ""
      const profileId = getActiveProfileId()
      const params = new URLSearchParams(window.location.search)

      if (profileId) {
        // The friendly URL does not expose `id` in its query string. Keep the
        // ID in the pathname and retain only the remaining options such as the
        // Facilitator flag when changing locale.
        params.delete("id")
        const query = params.toString()
        window.location.assign(
          `${BASE_PATH}${localePrefix}/profiles/${profileId}${query ? `?${query}` : ""}${window.location.hash}`,
        )
        return
      }

      window.location.assign(
        `${BASE_PATH}${localePrefix}/profile/${window.location.search}${window.location.hash}`,
      )
    }

    document.addEventListener("click", handleLocaleClick, true)
    return () => document.removeEventListener("click", handleLocaleClick, true)
  }, [])

  return null
}
