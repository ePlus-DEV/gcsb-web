"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldCheck, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { getWebsiteLocaleFromPathname } from "@/lib/website-i18n"

export const COOKIE_PREFERENCES_EVENT = "arcade:open-cookie-preferences"

const COOKIE_CONSENT_STORAGE_KEY = "arcade-cookie-consent-v1"
const GOOGLE_ANALYTICS_SCRIPT_ID = "google-analytics"

type ConsentChoice = "accepted" | "rejected"
type AnalyticsWindow = Window & {
  dataLayer?: unknown[][]
  gtag?: (...args: unknown[]) => void
} & Record<string, unknown>

const COPY = {
  en: {
    eyebrow: "Privacy choices",
    title: "Choose how we use analytics cookies",
    description:
      "Essential browser storage keeps your theme, language, and recent calculator results. Optional Google Analytics cookies help us understand site usage and are loaded only after you accept.",
    privacy: "Read the Privacy Policy",
    reject: "Reject analytics",
    accept: "Accept analytics",
    close: "Close cookie settings",
    currentAccepted: "Current choice: analytics accepted",
    currentRejected: "Current choice: analytics rejected",
  },
  vi: {
    eyebrow: "Lựa chọn quyền riêng tư",
    title: "Chọn cách chúng tôi sử dụng cookie phân tích",
    description:
      "Bộ nhớ thiết yếu trên trình duyệt dùng để lưu giao diện, ngôn ngữ và kết quả tính gần đây. Cookie Google Analytics là tùy chọn, chỉ được tải sau khi bạn đồng ý.",
    privacy: "Xem Chính sách quyền riêng tư",
    reject: "Từ chối phân tích",
    accept: "Chấp nhận phân tích",
    close: "Đóng cài đặt cookie",
    currentAccepted: "Lựa chọn hiện tại: đã chấp nhận phân tích",
    currentRejected: "Lựa chọn hiện tại: đã từ chối phân tích",
  },
} as const

function getAnalyticsWindow(): AnalyticsWindow {
  return window as AnalyticsWindow
}

function readStoredChoice(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    return value === "accepted" || value === "rejected" ? value : null
  } catch {
    return null
  }
}

function storeChoice(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice)
  } catch {
    // Consent still applies for the current page when browser storage is blocked.
  }
}

function analyticsCookieDomains(hostname: string): string[] {
  const labels = hostname.split(".").filter(Boolean)
  const domains = new Set<string>(["", hostname])

  for (let index = 0; index < labels.length - 1; index += 1) {
    domains.add(`.${labels.slice(index).join(".")}`)
  }

  return [...domains]
}

function clearAnalyticsCookies(): void {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=", 1)[0]?.trim())
    .filter(
      (name): name is string =>
        Boolean(name) &&
        (name === "_gid" || name === "_gat" || name.startsWith("_ga")),
    )

  for (const name of cookieNames) {
    for (const domain of analyticsCookieDomains(window.location.hostname)) {
      const domainAttribute = domain ? `; domain=${domain}` : ""
      document.cookie = `${name}=; Max-Age=0; path=/${domainAttribute}; SameSite=Lax`
    }
  }
}

function disableAnalytics(googleAnalyticsId: string): void {
  if (!googleAnalyticsId) return

  const analyticsWindow = getAnalyticsWindow()
  analyticsWindow[`ga-disable-${googleAnalyticsId}`] = true
  analyticsWindow.gtag?.("consent", "update", {
    analytics_storage: "denied",
  })
  clearAnalyticsCookies()
}

function enableAnalytics(googleAnalyticsId: string): void {
  if (!googleAnalyticsId) return

  const analyticsWindow = getAnalyticsWindow()
  analyticsWindow[`ga-disable-${googleAnalyticsId}`] = false
  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? []
  analyticsWindow.gtag =
    analyticsWindow.gtag ??
    ((...args: unknown[]) => {
      analyticsWindow.dataLayer?.push(args)
    })

  analyticsWindow.gtag("consent", "update", {
    analytics_storage: "granted",
  })

  if (analyticsWindow.__arcadeGaConfigured !== googleAnalyticsId) {
    analyticsWindow.gtag("js", new Date())
    analyticsWindow.gtag("config", googleAnalyticsId, {
      anonymize_ip: true,
    })
    analyticsWindow.__arcadeGaConfigured = googleAnalyticsId
  }

  if (document.getElementById(GOOGLE_ANALYTICS_SCRIPT_ID)) return

  const script = document.createElement("script")
  script.id = GOOGLE_ANALYTICS_SCRIPT_ID
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    googleAnalyticsId,
  )}`
  document.head.appendChild(script)
}

export default function CookieConsent({
  googleAnalyticsId,
}: {
  googleAnalyticsId: string
}) {
  const pathname = usePathname()
  const dialogRef = useRef<HTMLElement>(null)
  const [choice, setChoice] = useState<ConsentChoice | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const copy = useMemo(
    () =>
      getWebsiteLocaleFromPathname(pathname ?? "/") === "vi"
        ? COPY.vi
        : COPY.en,
    [pathname],
  )

  useEffect(() => {
    if (!googleAnalyticsId) return

    const storedChoice = readStoredChoice()
    setChoice(storedChoice)
    setIsOpen(storedChoice === null)

    if (storedChoice === "accepted") {
      enableAnalytics(googleAnalyticsId)
    } else {
      disableAnalytics(googleAnalyticsId)
    }

    const openPreferences = () => setIsOpen(true)
    window.addEventListener(COOKIE_PREFERENCES_EVENT, openPreferences)

    return () => {
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, openPreferences)
    }
  }, [googleAnalyticsId])

  useEffect(() => {
    if (!isOpen) return

    dialogRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && choice !== null) setIsOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [choice, isOpen])

  function applyChoice(nextChoice: ConsentChoice) {
    storeChoice(nextChoice)
    setChoice(nextChoice)
    setIsOpen(false)

    if (nextChoice === "accepted") {
      enableAnalytics(googleAnalyticsId)
    } else {
      disableAnalytics(googleAnalyticsId)
    }
  }

  if (!googleAnalyticsId || !isOpen) return null

  return (
    <div className="cookie-consent-layer">
      <section
        ref={dialogRef}
        className="cookie-consent-card"
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        tabIndex={-1}
      >
        <div className="cookie-consent-icon" aria-hidden="true">
          <ShieldCheck />
        </div>

        <div className="cookie-consent-copy">
          <span className="cookie-consent-eyebrow">{copy.eyebrow}</span>
          <h2 id="cookie-consent-title">{copy.title}</h2>
          <p id="cookie-consent-description">{copy.description}</p>
          <div className="cookie-consent-meta">
            <Link href="/privacy/">{copy.privacy}</Link>
            {choice ? (
              <span>
                {choice === "accepted"
                  ? copy.currentAccepted
                  : copy.currentRejected}
              </span>
            ) : null}
          </div>
        </div>

        <div className="cookie-consent-actions">
          <button
            type="button"
            className="cookie-consent-button is-reject"
            onClick={() => applyChoice("rejected")}
          >
            {copy.reject}
          </button>
          <button
            type="button"
            className="cookie-consent-button is-accept"
            onClick={() => applyChoice("accepted")}
          >
            {copy.accept}
          </button>
        </div>

        {choice ? (
          <button
            type="button"
            className="cookie-consent-close"
            aria-label={copy.close}
            onClick={() => setIsOpen(false)}
          >
            <X />
          </button>
        ) : null}
      </section>
    </div>
  )
}
