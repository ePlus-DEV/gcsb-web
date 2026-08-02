export const WEBSITE_LOCALES = [
  { code: "en", htmlLang: "en", label: "English", shortLabel: "EN" },
  { code: "vi", htmlLang: "vi", label: "Tiếng Việt", shortLabel: "VI" },
  { code: "ja", htmlLang: "ja", label: "日本語", shortLabel: "JA" },
  { code: "ko", htmlLang: "ko", label: "한국어", shortLabel: "KO" },
  { code: "zh_CN", htmlLang: "zh-CN", label: "简体中文", shortLabel: "ZH" },
  { code: "fr", htmlLang: "fr", label: "Français", shortLabel: "FR" },
  { code: "de", htmlLang: "de", label: "Deutsch", shortLabel: "DE" },
  { code: "es", htmlLang: "es", label: "Español", shortLabel: "ES" },
  { code: "pt_BR", htmlLang: "pt-BR", label: "Português (Brasil)", shortLabel: "PT" },
  { code: "it", htmlLang: "it", label: "Italiano", shortLabel: "IT" },
  { code: "ru", htmlLang: "ru", label: "Русский", shortLabel: "RU" },
  { code: "ar", htmlLang: "ar", label: "العربية", shortLabel: "AR" },
  { code: "hi", htmlLang: "hi", label: "हिन्दी", shortLabel: "HI" },
] as const

export type WebsiteLocale = (typeof WEBSITE_LOCALES)[number]["code"]

export type WebsiteCatalog = {
  messages: Record<string, string>
  additional: Record<string, string>
  dynamic: {
    memberSince: string
    badgesInView: string
    viewAllBadges: string
    needReview: string
    pointsToTrooper: string
    totalSlots: string
    leftOf: string
    remaining: string
    bonusPts: string
    points: string
    unknownBadges: string
    progressToward: string
    lastUpdated: string
    open: string
    profile: string
    progress: string
  }
}

export const DEFAULT_WEBSITE_LOCALE: WebsiteLocale = "en"
export const WEBSITE_LOCALE_STORAGE_KEY = "arcade-points-locale"

const catalogCache = new Map<WebsiteLocale, Promise<WebsiteCatalog>>()
const sourceMessageMaps = new WeakMap<WebsiteCatalog, Map<string, string>>()

export function getWebsiteLocale(value?: string | null): WebsiteLocale {
  if (!value) return DEFAULT_WEBSITE_LOCALE

  const normalized = value.replace("_", "-").toLowerCase()
  if (
    normalized === "zh" ||
    normalized.startsWith("zh-cn") ||
    normalized.startsWith("zh-sg")
  ) {
    return "zh_CN"
  }
  if (normalized === "pt" || normalized.startsWith("pt-br")) return "pt_BR"

  const direct = WEBSITE_LOCALES.find(
    (locale) =>
      locale.code.toLowerCase() === normalized ||
      locale.htmlLang.toLowerCase() === normalized,
  )
  if (direct) return direct.code

  const base = normalized.split("-")[0]
  return (
    WEBSITE_LOCALES.find((locale) => locale.code === base)?.code ??
    DEFAULT_WEBSITE_LOCALE
  )
}

export function getWebsiteLocaleInfo(locale: WebsiteLocale) {
  return WEBSITE_LOCALES.find((item) => item.code === locale) ?? WEBSITE_LOCALES[0]
}

export function loadWebsiteCatalog(locale: WebsiteLocale): Promise<WebsiteCatalog> {
  const cached = catalogCache.get(locale)
  if (cached) return cached

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
  const request = fetch(`${basePath}/i18n/${locale}.json`, {
    cache: "force-cache",
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Unable to load the ${locale} website locale.`)
    }

    return (await response.json()) as WebsiteCatalog
  })

  catalogCache.set(locale, request)
  return request
}

export function translateWebsiteText(
  source: string,
  sourceCatalog: WebsiteCatalog,
  targetCatalog: WebsiteCatalog,
): string {
  let sourceMessageMap = sourceMessageMaps.get(sourceCatalog)
  if (!sourceMessageMap) {
    sourceMessageMap = new Map(
      Object.entries(sourceCatalog.messages).map(([key, value]) => [value, key]),
    )
    sourceMessageMaps.set(sourceCatalog, sourceMessageMap)
  }

  const exactKey = sourceMessageMap.get(source)
  if (exactKey) return targetCatalog.messages[exactKey] ?? source

  const additional = targetCatalog.additional[source]
  if (additional) return additional

  return translateDynamicText(source, sourceCatalog, targetCatalog)
}

function translateDynamicText(
  source: string,
  sourceCatalog: WebsiteCatalog,
  targetCatalog: WebsiteCatalog,
): string {
  const messages = targetCatalog.dynamic
  let match = source.match(/^Member since (.+)$/)
  if (match) return messages.memberSince.replace("{value}", match[1])

  match = source.match(/^(\d+) badges? in this view$/)
  if (match) return messages.badgesInView.replace("{count}", match[1])

  match = source.match(/^View all (\d+) badges$/)
  if (match) return messages.viewAllBadges.replace("{count}", match[1])

  match = source.match(/^(\d+) badge\(s\) still need scoring review\.$/)
  if (match) return messages.needReview.replace("{count}", match[1])

  match = source.match(/^(\d+) points to Trooper$/)
  if (match) return messages.pointsToTrooper.replace("{count}", match[1])

  match = source.match(/^(\d[\d,.]*) total slots$/)
  if (match) return messages.totalSlots.replace("{count}", match[1])

  match = source.match(/^left of (\d[\d,.]*)$/)
  if (match) return messages.leftOf.replace("{count}", match[1])

  match = source.match(/^(\d[\d,.]*) \/ (\d[\d,.]*) left$/)
  if (match) {
    return messages.remaining
      .replace("{left}", match[1])
      .replace("{total}", match[2])
  }

  match = source.match(/^\+(\d[\d,.]*) bonus pts$/)
  if (match) return messages.bonusPts.replace("{count}", match[1])

  match = source.match(/^\+(\d[\d,.]*) pts$/)
  if (match) return messages.points.replace("{count}", match[1])

  match = source.match(/^(\d+) unknown badge\(s\)$/)
  if (match) return messages.unknownBadges.replace("{count}", match[1])

  match = source.match(/^Progress toward (.+)$/)
  if (match) {
    return messages.progressToward.replace(
      "{value}",
      translateWebsiteText(match[1], sourceCatalog, targetCatalog),
    )
  }

  match = source.match(/^Last updated: (.+)$/)
  if (match) return messages.lastUpdated.replace("{value}", match[1])

  match = source.match(/^Open (.+)$/)
  if (match) {
    return messages.open.replace(
      "{value}",
      translateWebsiteText(match[1], sourceCatalog, targetCatalog),
    )
  }

  match = source.match(/^(.+) profile$/)
  if (match) {
    return messages.profile.replace(
      "{value}",
      translateWebsiteText(match[1], sourceCatalog, targetCatalog),
    )
  }

  match = source.match(/^(.+) progress$/)
  if (match) {
    return messages.progress.replace(
      "{value}",
      translateWebsiteText(match[1], sourceCatalog, targetCatalog),
    )
  }

  return source
}
