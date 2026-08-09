"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ChevronDown, ShieldCheck, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { getWebsiteLocaleFromPathname } from "@/lib/website-i18n"

export const COOKIE_PREFERENCES_EVENT = "arcade:open-cookie-preferences"

const COOKIE_NOTICE_STORAGE_KEY = "arcade-cookie-notice-v1"
const COOKIE_NOTICE_PREVIEW_STORAGE_KEY = "arcade-cookie-notice-preview-v1"

const COPY = {
  en: { eyebrow:"Cookie information", title:"We use cookies and analytics", description:"Essential storage supports core features. Google Analytics measures anonymous usage so we can improve the service.", usageTitle:"Cookie usage details", essentialTitle:"Essential storage", essentialStatus:"Always active", essentialDescription:"Stores interface preferences such as theme, language, and recent calculator results on your device.", analyticsTitle:"Google Analytics", analyticsStatus:"Enabled", analyticsPreviewStatus:"Disabled in preview", analyticsDescription:"Collects aggregated information such as page visits and browser or device details. It does not provide access to your Google account or private profile data.", preview:"Preview mode: this notice is displayed for review, but Google Analytics is not loaded on the preview URL.", moreTitle:"More information", moreDescription:"Read the Privacy Policy for details about stored information, third-party services, and contact options.", privacy:"Privacy Policy", showDetails:"View details", hideDetails:"Hide details", acknowledge:"I understand", close:"Close cookie information" },
  vi: { eyebrow:"Thông tin cookie", title:"Chúng tôi sử dụng cookie và analytics", description:"Bộ nhớ thiết yếu hỗ trợ chức năng chính. Google Analytics đo lường dữ liệu sử dụng ẩn danh để cải thiện dịch vụ.", usageTitle:"Chi tiết sử dụng cookie", essentialTitle:"Bộ nhớ thiết yếu", essentialStatus:"Luôn hoạt động", essentialDescription:"Lưu tùy chọn giao diện như chủ đề, ngôn ngữ và kết quả tính gần đây trên thiết bị của bạn.", analyticsTitle:"Google Analytics", analyticsStatus:"Đang bật", analyticsPreviewStatus:"Tắt trong preview", analyticsDescription:"Thu thập dữ liệu tổng hợp như lượt xem trang và thông tin trình duyệt hoặc thiết bị. Dịch vụ này không truy cập tài khoản Google hay dữ liệu hồ sơ riêng tư của bạn.", preview:"Chế độ xem trước: banner được hiển thị để kiểm tra giao diện nhưng Google Analytics không được tải tại URL preview.", moreTitle:"Thông tin thêm", moreDescription:"Xem Chính sách quyền riêng tư để biết chi tiết về dữ liệu được lưu, dịch vụ bên thứ ba và phương thức liên hệ.", privacy:"Chính sách quyền riêng tư", showDetails:"Xem chi tiết", hideDetails:"Thu gọn", acknowledge:"Tôi đã hiểu", close:"Đóng thông tin cookie" },
} as const

function readAcknowledgement(storageKey:string){try{return window.localStorage.getItem(storageKey)==="acknowledged"}catch{return false}}
function storeAcknowledgement(storageKey:string){try{window.localStorage.setItem(storageKey,"acknowledged")}catch{}}

type CookieConsentProps={analyticsEnabled:boolean;previewMode?:boolean}

export default function CookieConsent({analyticsEnabled,previewMode=false}:CookieConsentProps){
  const pathname=usePathname()
  const [isOpen,setIsOpen]=useState(false)
  const [showDetails,setShowDetails]=useState(false)
  const isEmbedWidget=pathname === "/widget" || pathname?.endsWith("/widget") || pathname?.endsWith("/widget/")
  const copy=useMemo(()=>getWebsiteLocaleFromPathname(pathname??"/")==="vi"?COPY.vi:COPY.en,[pathname])
  const storageKey=previewMode?COOKIE_NOTICE_PREVIEW_STORAGE_KEY:COOKIE_NOTICE_STORAGE_KEY
  const noticeEnabled=(analyticsEnabled||previewMode)&&!isEmbedWidget
  useEffect(()=>{if(!noticeEnabled){setIsOpen(false);return}setShowDetails(false);setIsOpen(previewMode||!readAcknowledgement(storageKey));const openNotice=()=>{setShowDetails(false);setIsOpen(true)};window.addEventListener(COOKIE_PREFERENCES_EVENT,openNotice);return()=>window.removeEventListener(COOKIE_PREFERENCES_EVENT,openNotice)},[noticeEnabled,previewMode,storageKey])
  function acknowledgeNotice(){storeAcknowledgement(storageKey);setShowDetails(false);setIsOpen(false)}
  if(!noticeEnabled||!isOpen)return null
  return <div className="cookie-consent-layer"><section className={`cookie-consent-card${showDetails?" is-expanded":""}`} role="region" aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-description"><div className="cookie-consent-main"><div className="cookie-consent-icon" aria-hidden="true"><ShieldCheck/></div><div className="cookie-consent-copy"><span className="cookie-consent-eyebrow">{copy.eyebrow}</span><h2 id="cookie-consent-title">{copy.title}</h2><p id="cookie-consent-description">{copy.description}</p></div><button type="button" className="cookie-consent-close" aria-label={copy.close} onClick={acknowledgeNotice}><X/></button><div className="cookie-consent-actions"><button type="button" className="cookie-consent-detail-button" aria-expanded={showDetails} aria-controls="cookie-consent-details" onClick={()=>setShowDetails(v=>!v)}><ChevronDown aria-hidden="true"/>{showDetails?copy.hideDetails:copy.showDetails}</button><button type="button" className="cookie-consent-button" onClick={acknowledgeNotice}>{copy.acknowledge}</button></div></div>{showDetails?<div id="cookie-consent-details" className="cookie-consent-details"><h3>{copy.usageTitle}</h3><div className="cookie-consent-categories"><article className="cookie-consent-category"><div className="cookie-category-header"><span className="cookie-category-name"><ShieldCheck/>{copy.essentialTitle}</span><span className="cookie-category-status is-enabled">{copy.essentialStatus}</span></div><p>{copy.essentialDescription}</p></article><article className="cookie-consent-category"><div className="cookie-category-header"><span className="cookie-category-name"><BarChart3/>{copy.analyticsTitle}</span><span className={`cookie-category-status${previewMode?" is-preview":" is-enabled"}`}>{previewMode?copy.analyticsPreviewStatus:copy.analyticsStatus}</span></div><p>{copy.analyticsDescription}</p></article></div>{previewMode?<p className="cookie-consent-preview" role="status">{copy.preview}</p>:null}<div className="cookie-consent-more"><div><strong>{copy.moreTitle}</strong><p>{copy.moreDescription}</p></div><Link href="/privacy/">{copy.privacy}</Link></div></div>:null}</section></div>
}
