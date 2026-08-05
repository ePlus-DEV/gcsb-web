"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Check, ChevronDown, ShieldCheck, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { getWebsiteLocaleFromPathname } from "@/lib/website-i18n"

export const COOKIE_PREFERENCES_EVENT = "arcade:open-cookie-preferences"

const COOKIE_NOTICE_STORAGE_KEY = "arcade-cookie-notice-v1"
const COOKIE_NOTICE_PREVIEW_STORAGE_KEY = "arcade-cookie-notice-preview-v1"

const COPY = {
  en: {
    eyebrow: "Cookie information",
    title: "How this website uses cookies",
    description:
      "We use essential browser storage for core website features and Google Analytics to understand anonymous usage and improve the service.",
    usageTitle: "Cookie usage",
    essentialTitle: "Essential storage",
    essentialStatus: "Always active",
    essentialDescription:
      "Stores interface preferences such as theme, language, and recent calculator results on your device.",
    analyticsTitle: "Google Analytics",
    analyticsStatus: "Enabled",
    analyticsPreviewStatus: "Disabled in preview",
    analyticsDescription:
      "Collects aggregated usage information such as page visits and device or browser details. It does not provide access to your Google account or private profile data.",
    preview:
      "Preview mode: the notice is displayed for review, but Google Analytics is not loaded on this preview URL.",
    moreTitle: "More information",
    moreDescription:
      "Read the Privacy Policy for details about stored information, third-party services, and contact options.",
    privacy: "Privacy Policy",
    acknowledge: "I understand",
    close: "Close cookie information",
  },
  vi: {
    eyebrow: "Thông tin cookie",
    title: "Website này sử dụng cookie như thế nào",
    description:
      "Chúng tôi sử dụng bộ nhớ thiết yếu trên trình duyệt cho các chức năng chính và Google Analytics để hiểu dữ liệu sử dụng ẩn danh, từ đó cải thiện dịch vụ.",
    usageTitle: "Mục đích sử dụng cookie",
    essentialTitle: "Bộ nhớ thiết yếu",
    essentialStatus: "Luôn hoạt động",
    essentialDescription:
      "Lưu tùy chọn giao diện như chủ đề, ngôn ngữ và kết quả tính gần đây trên thiết bị của bạn.",
    analyticsTitle: "Google Analytics",
    analyticsStatus: "Đang bật",
    analyticsPreviewStatus: "Tắt trong preview",
    analyticsDescription:
      "Thu thập dữ liệu sử dụng tổng hợp như lượt xem trang và thông tin thiết bị hoặc trình duyệt. Dịch vụ này không truy cập tài khoản Google hay dữ liệu hồ sơ riêng tư của bạn.",
    preview:
      "Chế độ xem trước: popup được hiển thị để kiểm tra giao diện nhưng Google Analytics không được tải tại URL preview này.",
    moreTitle: "Thông tin thêm",
    moreDescription:
      "Xem Chính sách quyền riêng tư để biết chi tiết về dữ liệu được lưu, dịch vụ bên thứ ba và phương thức liên hệ.",
    privacy: "Chính sách quyền riêng tư",
    acknowledge: "Tôi đã hiểu",
    close: "Đóng thông tin cookie",
  },
} as const

function readAcknowledgement(storageKey: string): boolean {
  try {
    return window.localStorage.getItem(storageKey) === "acknowledged"
  } catch {
    return false
  }
}

function storeAcknowledgement(storageKey: string): void {
  try {
    window.localStorage.setItem(storageKey, "acknowledged")
  } catch {
    // The notice can still be closed for the current page if storage is blocked.
  }
}

type CookieConsentProps = {
  analyticsEnabled: boolean
  previewMode?: boolean
}

export default function CookieConsent({
  analyticsEnabled,
  previewMode = false,
}: CookieConsentProps) {
  const pathname = usePathname()
  const dialogRef = useRef<HTMLElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const copy = useMemo(
    () =>
      getWebsiteLocaleFromPathname(pathname ?? "/") === "vi"
        ? COPY.vi
        : COPY.en,
    [pathname],
  )
  const storageKey = previewMode
    ? COOKIE_NOTICE_PREVIEW_STORAGE_KEY
    : COOKIE_NOTICE_STORAGE_KEY
  const noticeEnabled = analyticsEnabled || previewMode

  useEffect(() => {
    if (!noticeEnabled) return

    setIsOpen(!readAcknowledgement(storageKey))

    const openNotice = () => setIsOpen(true)
    window.addEventListener(COOKIE_PREFERENCES_EVENT, openNotice)

    return () => {
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, openNotice)
    }
  }, [noticeEnabled, storageKey])

  useEffect(() => {
    if (!isOpen) return

    dialogRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      storeAcknowledgement(storageKey)
      setIsOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, storageKey])

  function acknowledgeNotice() {
    storeAcknowledgement(storageKey)
    setIsOpen(false)
  }

  if (!noticeEnabled || !isOpen) return null

  return (
    <div className="cookie-consent-layer">
      <section
        ref={dialogRef}
        className="cookie-consent-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        tabIndex={-1}
      >
        <header className="cookie-consent-header">
          <div>
            <span className="cookie-consent-eyebrow">{copy.eyebrow}</span>
            <h2 id="cookie-consent-title">{copy.title}</h2>
          </div>
          <button
            type="button"
            className="cookie-consent-close"
            aria-label={copy.close}
            onClick={acknowledgeNotice}
          >
            <X />
          </button>
        </header>

        <div className="cookie-consent-body">
          <p id="cookie-consent-description" className="cookie-consent-intro">
            {copy.description}
          </p>

          <h3>{copy.usageTitle}</h3>

          <div className="cookie-consent-categories">
            <details className="cookie-consent-category">
              <summary>
                <span className="cookie-category-chevron" aria-hidden="true">
                  <ChevronDown />
                </span>
                <span className="cookie-category-name">
                  <ShieldCheck />
                  {copy.essentialTitle}
                </span>
                <span className="cookie-category-status">
                  {copy.essentialStatus}
                </span>
                <span className="cookie-category-switch is-on" aria-hidden="true">
                  <Check />
                </span>
              </summary>
              <p>{copy.essentialDescription}</p>
            </details>

            <details className="cookie-consent-category">
              <summary>
                <span className="cookie-category-chevron" aria-hidden="true">
                  <ChevronDown />
                </span>
                <span className="cookie-category-name">
                  <BarChart3 />
                  {copy.analyticsTitle}
                </span>
                <span className="cookie-category-status">
                  {previewMode
                    ? copy.analyticsPreviewStatus
                    : copy.analyticsStatus}
                </span>
                <span
                  className={
                    previewMode
                      ? "cookie-category-switch is-preview"
                      : "cookie-category-switch is-on"
                  }
                  aria-hidden="true"
                >
                  <Check />
                </span>
              </summary>
              <p>{copy.analyticsDescription}</p>
            </details>
          </div>

          {previewMode ? (
            <p className="cookie-consent-preview" role="status">
              {copy.preview}
            </p>
          ) : null}

          <div className="cookie-consent-more">
            <strong>{copy.moreTitle}</strong>
            <p>{copy.moreDescription}</p>
            <Link href="/privacy/">{copy.privacy}</Link>
          </div>
        </div>

        <footer className="cookie-consent-footer">
          <button
            type="button"
            className="cookie-consent-button"
            onClick={acknowledgeNotice}
          >
            {copy.acknowledge}
          </button>
        </footer>
      </section>
    </div>
  )
}
