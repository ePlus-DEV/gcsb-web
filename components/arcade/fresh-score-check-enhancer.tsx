"use client"

import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"

const ANALYZER_SELECTOR = ".profile-analyzer-card"
const BUTTON_SELECTOR = ".analyze-button"
const INPUT_SELECTOR = 'input[aria-label="Google Skills public profile URL"]'
const FACILITATOR_SLOT_SELECTOR = ".analyzer-facilitator-slot"
const HELP_ROW_SELECTOR = ".analyzer-help-row"
const MANUAL_INTENT_TTL_MS = 5_000

type SupportedLocale =
  | "ar"
  | "de"
  | "en"
  | "es"
  | "fr"
  | "hi"
  | "it"
  | "ja"
  | "ko"
  | "pt-br"
  | "ru"
  | "vi"
  | "zh-cn"

const CACHE_NOTE: Record<SupportedLocale, string> = {
  en: "Automatic refresh may use a recent cached snapshot. For the freshest available score, run a manual check. Fresh checks bypass Hub cache and are rate-limited.",
  vi: "Tự động làm mới có thể dùng dữ liệu cache gần đây. Muốn kiểm tra điểm mới nhất, hãy bấm kiểm tra thủ công. Lượt kiểm tra mới sẽ bỏ qua cache của Hub và bị giới hạn tần suất.",
  ja: "自動更新では最近のキャッシュ結果が使われる場合があります。最新のスコアを確認するには手動でチェックしてください。最新チェックは Hub のキャッシュを回避しますが、実行頻度は制限されます。",
  ko: "자동 새로고침은 최근 캐시된 결과를 사용할 수 있습니다. 가장 최신 점수를 확인하려면 수동으로 확인하세요. 새 확인은 Hub 캐시를 건너뛰지만 요청 빈도가 제한됩니다.",
  "zh-cn": "自动刷新可能会使用最近的缓存结果。如需查看尽可能新的分数，请手动检查。手动新检查会绕过 Hub 缓存，但会受到频率限制。",
  de: "Die automatische Aktualisierung kann einen kürzlich zwischengespeicherten Stand verwenden. Für den aktuellsten verfügbaren Punktestand manuell prüfen. Frische Prüfungen umgehen den Hub-Cache und sind rate-limitiert.",
  es: "La actualización automática puede usar una copia reciente en caché. Para obtener la puntuación más reciente disponible, ejecuta una comprobación manual. Las comprobaciones nuevas omiten la caché del Hub y tienen límite de frecuencia.",
  fr: "L’actualisation automatique peut utiliser un résultat récent en cache. Pour obtenir le score le plus récent disponible, lancez une vérification manuelle. Les vérifications fraîches contournent le cache du Hub et sont limitées en fréquence.",
  it: "L’aggiornamento automatico può usare un risultato recente in cache. Per il punteggio più aggiornato disponibile, esegui un controllo manuale. I controlli aggiornati ignorano la cache Hub e sono soggetti a limite di frequenza.",
  "pt-br": "A atualização automática pode usar um resultado recente em cache. Para obter a pontuação mais recente disponível, faça uma verificação manual. Verificações novas ignoram o cache do Hub e têm limite de frequência.",
  ru: "Автообновление может использовать недавний результат из кэша. Чтобы получить максимально свежий счёт, запустите ручную проверку. Такая проверка обходит кэш Hub, но ограничена по частоте.",
  hi: "स्वचालित रीफ़्रेश हाल का कैश किया गया परिणाम इस्तेमाल कर सकता है। सबसे नया उपलब्ध स्कोर देखने के लिए मैन्युअल चेक चलाएँ। नया चेक Hub कैश को बायपास करता है, लेकिन इसकी आवृत्ति सीमित है।",
  ar: "قد يستخدم التحديث التلقائي نتيجة حديثة من ذاكرة التخزين المؤقت. للحصول على أحدث نتيجة متاحة، شغّل فحصًا يدويًا. يتجاوز الفحص الجديد ذاكرة Hub المؤقتة لكنه يخضع لحد لمعدل الطلبات.",
}

function normalizeLocale(value: string | null | undefined): SupportedLocale {
  const normalized = value?.trim().toLowerCase().replace("_", "-") ?? ""
  if (normalized === "pt" || normalized.startsWith("pt-")) return "pt-br"
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh-cn"

  const language = normalized.split("-")[0] as SupportedLocale
  if (language in CACHE_NOTE) return language

  return "en"
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input
  if (input instanceof URL) return input.toString()
  return input.url
}

function isArcadePost(input: RequestInfo | URL, init?: RequestInit): boolean {
  const method = String(
    init?.method ?? (input instanceof Request ? input.method : "GET"),
  ).toUpperCase()

  if (method !== "POST") return false

  try {
    const url = new URL(requestUrl(input), window.location.href)
    return url.pathname.startsWith("/api/arcade")
  } catch {
    return false
  }
}

export default function FreshScoreCheckEnhancer() {
  const [noteTarget, setNoteTarget] = useState<HTMLElement | null>(null)
  const [locale, setLocale] = useState<SupportedLocale>("en")
  const freshIntentUntilRef = useRef(0)

  useEffect(() => {
    const markManualFreshCheck = () => {
      freshIntentUntilRef.current = Date.now() + MANUAL_INTENT_TTL_MS
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest(BUTTON_SELECTOR)) {
        markManualFreshCheck()
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return
      const target = event.target
      if (target instanceof Element && target.matches(INPUT_SELECTOR)) {
        markManualFreshCheck()
      }
    }

    document.addEventListener("click", onClick, true)
    document.addEventListener("keydown", onKeyDown, true)

    return () => {
      document.removeEventListener("click", onClick, true)
      document.removeEventListener("keydown", onKeyDown, true)
    }
  }, [])

  useEffect(() => {
    const originalFetch = window.fetch.bind(window)

    const enhancedFetch: typeof window.fetch = async (input, init) => {
      const manualFreshCheck = Date.now() <= freshIntentUntilRef.current

      if (
        !manualFreshCheck ||
        !isArcadePost(input, init) ||
        typeof init?.body !== "string"
      ) {
        return originalFetch(input, init)
      }

      freshIntentUntilRef.current = 0

      try {
        const payload = JSON.parse(init.body) as Record<string, unknown>
        return originalFetch(input, {
          ...init,
          body: JSON.stringify({ ...payload, force: true }),
        })
      } catch {
        return originalFetch(input, init)
      }
    }

    window.fetch = enhancedFetch

    return () => {
      if (window.fetch === enhancedFetch) {
        window.fetch = originalFetch
      }
    }
  }, [])

  useEffect(() => {
    const syncLocale = () => setLocale(normalizeLocale(document.documentElement.lang))
    syncLocale()

    const observer = new MutationObserver(syncLocale)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let slot: HTMLDivElement | null = null

    const attach = () => {
      const analyzer = document.querySelector<HTMLElement>(ANALYZER_SELECTOR)
      if (!analyzer) return

      const facilitatorSlot = analyzer.querySelector<HTMLElement>(FACILITATOR_SLOT_SELECTOR)
      const helpRow = analyzer.querySelector<HTMLElement>(HELP_ROW_SELECTOR)
      if (!helpRow) return

      if (!slot || !slot.isConnected) {
        slot = document.createElement("div")
        slot.dataset.freshScoreNote = "true"

        if (facilitatorSlot) {
          facilitatorSlot.after(slot)
        } else {
          helpRow.before(slot)
        }

        setNoteTarget(slot)
      } else if (facilitatorSlot && slot.previousElementSibling !== facilitatorSlot) {
        facilitatorSlot.after(slot)
      }
    }

    attach()
    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      slot?.remove()
    }
  }, [])

  if (!noteTarget) return null

  return createPortal(
    <p
      role="note"
      style={{
        margin: "0",
        padding: "2px 2px 4px",
        color: "var(--muted-foreground, #64748b)",
        fontSize: "12px",
        lineHeight: 1.5,
      }}
    >
      {CACHE_NOTE[locale]}
    </p>,
    noteTarget,
  )
}
