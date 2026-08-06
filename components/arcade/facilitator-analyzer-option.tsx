"use client"

import { GraduationCap, RefreshCcw } from "lucide-react"
import { createPortal } from "react-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  FACILITATOR_PARTICIPATION_EVENT,
  normalizeFacilitatorProfileUrl,
  readFacilitatorParticipation,
  writeFacilitatorParticipation,
  type FacilitatorParticipationDetail,
} from "./facilitator-participation"
import { DASHBOARD_STORAGE_KEY, PROFILE_URL_PATTERN } from "./model"

const ANALYZER_SELECTOR = ".profile-analyzer-card"
const INPUT_SELECTOR = 'input[aria-label="Google Skills public profile URL"]'
const HELP_ROW_SELECTOR = ".analyzer-help-row"
const AUTO_FETCH_STORAGE_KEY = "gcsb-auto-fetch-latest-profile"
const SUPPORTED_LOCALES = new Set([
  "ar", "de", "es", "fr", "hi", "it", "ja", "ko", "pt-br", "ru", "vi", "zh-cn",
])

type Copy = {
  participating: string
  includeHighest: string
  pasteValid: string
  autoFetch: string
  autoFetchDescription: string
}

const COPY: Record<string, Copy> = {
  en: {
    participating: "Participating in Facilitator Program",
    includeHighest: "Include the highest eligible Facilitator milestone bonus.",
    pasteValid: "Paste a valid public profile URL to enable this option.",
    autoFetch: "Automatically fetch latest data",
    autoFetchDescription: "Refresh the saved profile once whenever this page is opened.",
  },
  vi: {
    participating: "Đang tham gia Facilitator Program",
    includeHighest: "Cộng phần thưởng của cột mốc Facilitator cao nhất đủ điều kiện.",
    pasteValid: "Dán URL hồ sơ công khai hợp lệ để bật tùy chọn này.",
    autoFetch: "Tự động lấy dữ liệu mới nhất",
    autoFetchDescription: "Tự làm mới hồ sơ đã lưu một lần mỗi khi mở trang.",
  },
  ja: {
    participating: "Facilitator Program に参加中",
    includeHighest: "対象となる最高マイルストーンの Facilitator ボーナスを加算します。",
    pasteValid: "有効な公開プロフィール URL を貼り付けると、この設定を有効にできます。",
    autoFetch: "最新データを自動取得",
    autoFetchDescription: "このページを開くたびに、保存済みプロフィールを一度更新します。",
  },
  ko: {
    participating: "Facilitator Program 참여 중",
    includeHighest: "조건을 충족한 가장 높은 Facilitator 마일스톤 보너스를 포함합니다.",
    pasteValid: "유효한 공개 프로필 URL을 붙여넣어 이 옵션을 활성화하세요.",
    autoFetch: "최신 데이터 자동 가져오기",
    autoFetchDescription: "페이지를 열 때마다 저장된 프로필을 한 번 새로고침합니다.",
  },
  "zh-cn": {
    participating: "正在参加 Facilitator Program",
    includeHighest: "计入符合条件的最高 Facilitator 里程碑奖励。",
    pasteValid: "粘贴有效的公开个人资料网址以启用此选项。",
    autoFetch: "自动获取最新数据",
    autoFetchDescription: "每次打开此页面时自动刷新一次已保存的个人资料。",
  },
  de: {
    participating: "Teilnahme am Facilitator Program",
    includeHighest: "Den höchsten berechtigten Facilitator-Meilensteinbonus einbeziehen.",
    pasteValid: "Füge eine gültige öffentliche Profil-URL ein, um diese Option zu aktivieren.",
    autoFetch: "Neueste Daten automatisch abrufen",
    autoFetchDescription: "Das gespeicherte Profil beim Öffnen dieser Seite einmal aktualisieren.",
  },
  es: {
    participating: "Participando en Facilitator Program",
    includeHighest: "Incluye la bonificación del hito Facilitator más alto elegible.",
    pasteValid: "Pega una URL de perfil público válida para activar esta opción.",
    autoFetch: "Obtener automáticamente los datos más recientes",
    autoFetchDescription: "Actualiza una vez el perfil guardado cada vez que se abre esta página.",
  },
  fr: {
    participating: "Participation au Facilitator Program",
    includeHighest: "Inclure le bonus du plus haut jalon Facilitator admissible.",
    pasteValid: "Collez une URL de profil public valide pour activer cette option.",
    autoFetch: "Récupérer automatiquement les dernières données",
    autoFetchDescription: "Actualiser une fois le profil enregistré à chaque ouverture de cette page.",
  },
  it: {
    participating: "Partecipazione al Facilitator Program",
    includeHighest: "Include il bonus del traguardo Facilitator idoneo più alto.",
    pasteValid: "Incolla un URL di profilo pubblico valido per abilitare questa opzione.",
    autoFetch: "Recupera automaticamente i dati più recenti",
    autoFetchDescription: "Aggiorna una volta il profilo salvato ogni volta che apri questa pagina.",
  },
  "pt-br": {
    participating: "Participando do Facilitator Program",
    includeHighest: "Inclui o bônus do maior marco Facilitator elegível.",
    pasteValid: "Cole uma URL de perfil público válida para ativar esta opção.",
    autoFetch: "Buscar automaticamente os dados mais recentes",
    autoFetchDescription: "Atualiza uma vez o perfil salvo sempre que esta página for aberta.",
  },
  ru: {
    participating: "Участие в Facilitator Program",
    includeHighest: "Учитывать бонус самого высокого доступного этапа Facilitator.",
    pasteValid: "Вставьте корректную ссылку на публичный профиль, чтобы включить эту настройку.",
    autoFetch: "Автоматически получать свежие данные",
    autoFetchDescription: "Обновлять сохранённый профиль один раз при каждом открытии страницы.",
  },
  hi: {
    participating: "Facilitator Program में भाग ले रहे हैं",
    includeHighest: "योग्य सबसे ऊँचे Facilitator milestone bonus को शामिल करें।",
    pasteValid: "इस विकल्प को चालू करने के लिए मान्य public profile URL पेस्ट करें।",
    autoFetch: "नवीनतम डेटा अपने आप प्राप्त करें",
    autoFetchDescription: "हर बार यह पेज खुलने पर सहेजे गए प्रोफ़ाइल को एक बार रीफ़्रेश करें।",
  },
  ar: {
    participating: "المشاركة في Facilitator Program",
    includeHighest: "تضمين مكافأة أعلى مرحلة Facilitator مؤهلة.",
    pasteValid: "ألصق رابط ملف شخصي عام صالحًا لتفعيل هذا الخيار.",
    autoFetch: "جلب أحدث البيانات تلقائيًا",
    autoFetchDescription: "تحديث الملف الشخصي المحفوظ مرة واحدة عند فتح هذه الصفحة.",
  },
}

function normalizeLocale(value: string | null | undefined): string {
  const normalized = value?.trim().toLowerCase().replace("_", "-") ?? ""
  if (normalized === "pt" || normalized.startsWith("pt-")) return "pt-br"
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh-cn"
  const language = normalized.split("-")[0]
  return SUPPORTED_LOCALES.has(normalized)
    ? normalized
    : SUPPORTED_LOCALES.has(language)
      ? language
      : "en"
}

function getLocale(): string {
  if (typeof window === "undefined") return "en"
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")
  const pathname = basePath && window.location.pathname.startsWith(basePath)
    ? window.location.pathname.slice(basePath.length)
    : window.location.pathname
  const segment = pathname.split("/").filter(Boolean)[0]
  const pathLocale = normalizeLocale(segment)
  if (pathLocale !== "en" || segment?.toLowerCase() === "en") return pathLocale
  return normalizeLocale(document.documentElement.lang)
}

function readStoredProfileUrl(): string {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!raw) return ""
    const parsed = JSON.parse(raw) as { profileUrl?: unknown }
    return typeof parsed.profileUrl === "string" ? parsed.profileUrl : ""
  } catch {
    return ""
  }
}

function validProfileUrl(value: string): string {
  const normalized = normalizeFacilitatorProfileUrl(value)
  return PROFILE_URL_PATTERN.test(normalized) ? normalized : ""
}

function readAutoFetchPreference(): boolean {
  try {
    return window.localStorage.getItem(AUTO_FETCH_STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

function writeAutoFetchPreference(enabled: boolean): void {
  try {
    window.localStorage.setItem(AUTO_FETCH_STORAGE_KEY, String(enabled))
  } catch {
    // The current-page preference still works without storage.
  }
}

function setInputValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
}

export default function FacilitatorAnalyzerOption() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [inputProfileUrl, setInputProfileUrl] = useState("")
  const [storedProfileUrl, setStoredProfileUrl] = useState("")
  const [participating, setParticipating] = useState(false)
  const [autoFetchLatest, setAutoFetchLatest] = useState(false)
  const [autoFetchLoaded, setAutoFetchLoaded] = useState(false)
  const [locale, setLocale] = useState("en")
  const autoFetchAttempted = useRef(false)
  const copy = COPY[locale] ?? COPY.en

  useEffect(() => {
    const syncLocale = () => setLocale(getLocale())
    syncLocale()
    const observer = new MutationObserver(syncLocale)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    })
    window.addEventListener("popstate", syncLocale)
    return () => {
      observer.disconnect()
      window.removeEventListener("popstate", syncLocale)
    }
  }, [])

  useEffect(() => {
    let currentInput: HTMLInputElement | null = null
    let slot: HTMLDivElement | null = null
    const syncInputValue = () => setInputProfileUrl(currentInput?.value ?? "")
    const attach = () => {
      const analyzer = document.querySelector<HTMLElement>(ANALYZER_SELECTOR)
      const helpRow = analyzer?.querySelector<HTMLElement>(HELP_ROW_SELECTOR)
      const nextInput = analyzer?.querySelector<HTMLInputElement>(INPUT_SELECTOR)
      if (!analyzer || !helpRow || !nextInput) return
      if (currentInput !== nextInput) {
        currentInput?.removeEventListener("input", syncInputValue)
        currentInput = nextInput
        currentInput.addEventListener("input", syncInputValue)
        syncInputValue()
      }
      if (!slot || !slot.isConnected) {
        slot = document.createElement("div")
        slot.className = "analyzer-facilitator-slot"
        helpRow.before(slot)
        setPortalTarget(slot)
      }
    }
    attach()
    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      currentInput?.removeEventListener("input", syncInputValue)
      slot?.remove()
    }
  }, [])

  useEffect(() => {
    setAutoFetchLatest(readAutoFetchPreference())
    setAutoFetchLoaded(true)
  }, [])

  useEffect(() => {
    const syncStoredProfile = () => setStoredProfileUrl(readStoredProfileUrl())
    syncStoredProfile()
    const timer = window.setInterval(syncStoredProfile, 1_000)
    window.addEventListener("focus", syncStoredProfile)
    window.addEventListener("storage", syncStoredProfile)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", syncStoredProfile)
      window.removeEventListener("storage", syncStoredProfile)
    }
  }, [])

  const profileUrl = useMemo(
    () => validProfileUrl(inputProfileUrl) || validProfileUrl(storedProfileUrl),
    [inputProfileUrl, storedProfileUrl],
  )

  useEffect(() => {
    if (profileUrl) return
    autoFetchAttempted.current = false
    setParticipating(false)
    if (autoFetchLatest) {
      setAutoFetchLatest(false)
      writeAutoFetchPreference(false)
    }
  }, [autoFetchLatest, profileUrl])

  useEffect(() => {
    if (!profileUrl) return
    const sync = () => setParticipating(readFacilitatorParticipation(profileUrl))
    const onParticipationChange = (event: Event) => {
      const detail = (event as CustomEvent<FacilitatorParticipationDetail>).detail
      if (detail && normalizeFacilitatorProfileUrl(detail.profileUrl) === normalizeFacilitatorProfileUrl(profileUrl)) {
        setParticipating(detail.participating)
      }
    }
    sync()
    const timer = window.setInterval(sync, 1_000)
    window.addEventListener("focus", sync)
    window.addEventListener("storage", sync)
    window.addEventListener(FACILITATOR_PARTICIPATION_EVENT, onParticipationChange)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", sync)
      window.removeEventListener("storage", sync)
      window.removeEventListener(FACILITATOR_PARTICIPATION_EVENT, onParticipationChange)
    }
  }, [profileUrl])

  useEffect(() => {
    if (!autoFetchLoaded || !autoFetchLatest || !portalTarget || !profileUrl || autoFetchAttempted.current) return
    const analyzer = document.querySelector<HTMLElement>(ANALYZER_SELECTOR)
    const input = analyzer?.querySelector<HTMLInputElement>(INPUT_SELECTOR)
    const form = input?.closest("form")
    if (!input || !form) return
    autoFetchAttempted.current = true
    setInputValue(input, profileUrl)
    window.setTimeout(() => form.requestSubmit(), 0)
  }, [autoFetchLatest, autoFetchLoaded, portalTarget, profileUrl])

  if (!portalTarget) return null

  return createPortal(
    <div style={{ display: "grid", gap: 8 }}>
      <label className={`analyzer-facilitator-option${participating ? " is-active" : ""}${profileUrl ? "" : " is-disabled"}`}>
        <input
          type="checkbox"
          checked={participating}
          disabled={!profileUrl}
          onChange={(event) => {
            const checked = event.target.checked
            setParticipating(checked)
            writeFacilitatorParticipation(profileUrl, checked)
          }}
          aria-describedby="analyzer-facilitator-description"
        />
        <span className="analyzer-facilitator-icon" aria-hidden="true"><GraduationCap /></span>
        <span className="analyzer-facilitator-copy">
          <strong>{copy.participating}</strong>
          <small id="analyzer-facilitator-description">{profileUrl ? copy.includeHighest : copy.pasteValid}</small>
        </span>
        <span className="analyzer-facilitator-switch" aria-hidden="true" />
      </label>

      <label className={`analyzer-facilitator-option${autoFetchLatest ? " is-active" : ""}${profileUrl ? "" : " is-disabled"}`}>
        <input
          type="checkbox"
          checked={autoFetchLatest}
          disabled={!profileUrl}
          onChange={(event) => {
            const checked = event.target.checked
            autoFetchAttempted.current = false
            setAutoFetchLatest(checked)
            writeAutoFetchPreference(checked)
          }}
          aria-describedby="analyzer-auto-fetch-description"
        />
        <span className="analyzer-facilitator-icon" aria-hidden="true"><RefreshCcw /></span>
        <span className="analyzer-facilitator-copy">
          <strong>{copy.autoFetch}</strong>
          <small id="analyzer-auto-fetch-description">
            {profileUrl ? copy.autoFetchDescription : copy.pasteValid}
          </small>
        </span>
        <span className="analyzer-facilitator-switch" aria-hidden="true" />
      </label>
    </div>,
    portalTarget,
  )
}
