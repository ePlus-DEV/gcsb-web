export const WEBSITE_LOCALES = [
  { code: "en", path: "", htmlLang: "en", label: "English", shortLabel: "EN" },
  { code: "vi", path: "vi", htmlLang: "vi", label: "Tiếng Việt", shortLabel: "VI" },
  { code: "ja", path: "ja", htmlLang: "ja", label: "日本語", shortLabel: "JA" },
  { code: "ko", path: "ko", htmlLang: "ko", label: "한국어", shortLabel: "KO" },
  { code: "zh_CN", path: "zh-cn", htmlLang: "zh-CN", label: "简体中文", shortLabel: "ZH" },
  { code: "fr", path: "fr", htmlLang: "fr", label: "Français", shortLabel: "FR" },
  { code: "de", path: "de", htmlLang: "de", label: "Deutsch", shortLabel: "DE" },
  { code: "es", path: "es", htmlLang: "es", label: "Español", shortLabel: "ES" },
  { code: "pt_BR", path: "pt-br", htmlLang: "pt-BR", label: "Português (Brasil)", shortLabel: "PT" },
  { code: "it", path: "it", htmlLang: "it", label: "Italiano", shortLabel: "IT" },
  { code: "ru", path: "ru", htmlLang: "ru", label: "Русский", shortLabel: "RU" },
  { code: "ar", path: "ar", htmlLang: "ar", label: "العربية", shortLabel: "AR" },
  { code: "hi", path: "hi", htmlLang: "hi", label: "हिन्दी", shortLabel: "HI" },
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
export const WEBSITE_SITE_URL = "https://arcade.eplus.dev/"

const catalogRequests = new Map<WebsiteLocale, Promise<WebsiteCatalog>>()
const sourceMessageMaps = new WeakMap<WebsiteCatalog, Map<string, string>>()

/** Resolves browser, URL, or stored locale values to a supported locale code. */
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
      locale.path.toLowerCase() === normalized ||
      locale.htmlLang.toLowerCase() === normalized,
  )
  if (direct) return direct.code

  const base = normalized.split("-")[0]
  return (
    WEBSITE_LOCALES.find((locale) => locale.code === base)?.code ??
    DEFAULT_WEBSITE_LOCALE
  )
}

/** Returns display and routing metadata for a supported locale. */
export function getWebsiteLocaleInfo(locale: WebsiteLocale) {
  return WEBSITE_LOCALES.find((item) => item.code === locale) ?? WEBSITE_LOCALES[0]
}

/** Returns the public route for a locale, with English kept at the site root. */
export function getWebsiteLocaleHref(locale: WebsiteLocale): string {
  const localeInfo = getWebsiteLocaleInfo(locale)
  return localeInfo.path ? `/${localeInfo.path}/` : "/"
}

/** Returns an absolute canonical URL for a supported locale. */
export function getWebsiteCanonicalUrl(locale: WebsiteLocale): string {
  return new URL(getWebsiteLocaleHref(locale), WEBSITE_SITE_URL).toString()
}

/**
 * Reads an explicit locale segment from a pathname.
 * Returns null for the homepage and non-localized routes so stored preferences
 * and browser language detection can be used by the client.
 */
export function getWebsiteLocaleFromPathname(
  pathname: string,
): WebsiteLocale | null {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
  const pathWithoutBase =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length)
      : pathname
  const segment = pathWithoutBase.split("/").filter(Boolean)[0]

  if (!segment) return null

  return (
    WEBSITE_LOCALES.find(
      (locale) => locale.path && locale.path.toLowerCase() === segment.toLowerCase(),
    )?.code ?? null
  )
}

/** Builds the absolute hreflang URL map used by localized metadata. */
export function getWebsiteLanguageAlternates(): Record<string, string> {
  return Object.fromEntries([
    ...WEBSITE_LOCALES.map((locale) => [
      locale.htmlLang,
      getWebsiteCanonicalUrl(locale.code),
    ]),
    ["x-default", WEBSITE_SITE_URL],
  ])
}

/** Loads and caches one generated website translation catalog. */
export function loadWebsiteCatalog(locale: WebsiteLocale): Promise<WebsiteCatalog> {
  const cached = catalogRequests.get(locale)
  if (cached) return cached

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
  const request = fetch(`${basePath}/i18n/${locale}.json`, {
    cache: "force-cache",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Unable to load the ${locale} website locale.`)
      }

      return (await response.json()) as WebsiteCatalog
    })
    .catch((error) => {
      catalogRequests.delete(locale)
      throw error
    })

  catalogRequests.set(locale, request)
  return request
}

/** Translates exact, additional, and dynamic English UI text in that order. */
export function translateWebsiteText(
  source: string,
  sourceCatalog: WebsiteCatalog,
  targetCatalog: WebsiteCatalog,
): string {
  let sourceMessageMap = sourceMessageMaps.get(sourceCatalog)
  if (!sourceMessageMap) {
    sourceMessageMap = new Map()
    for (const [key, value] of Object.entries(sourceCatalog.messages)) {
      if (!sourceMessageMap.has(value)) sourceMessageMap.set(value, key)
    }
    sourceMessageMaps.set(sourceCatalog, sourceMessageMap)
  }

  const exactKey = sourceMessageMap.get(source)
  if (exactKey) return targetCatalog.messages[exactKey] ?? source

  const additional = targetCatalog.additional[source]
  if (additional) return additional

  return translateDynamicText(source, sourceCatalog, targetCatalog)
}

function facilitatorTemplate(
  targetCatalog: WebsiteCatalog,
  key: string,
  fallback: string,
): string {
  return targetCatalog.additional[`__facilitator:${key}`] ?? fallback
}

/** Translates UI strings whose values contain runtime numbers or labels. */
function translateDynamicText(
  source: string,
  sourceCatalog: WebsiteCatalog,
  targetCatalog: WebsiteCatalog,
): string {
  const messages = targetCatalog.dynamic
  let match = source.match(/^\+([\d,.]+) bonus · ([\d,.]+) badges left$/)
  if (match) {
    return facilitatorTemplate(
      targetCatalog,
      "bonusBadgesLeft",
      "+{bonus} bonus · {count} badges left",
    )
      .replace("{bonus}", match[1])
      .replace("{count}", match[2])
  }

  match = source.match(/^Potential \+([\d,.]+); participation is not enabled$/)
  if (match) {
    return facilitatorTemplate(
      targetCatalog,
      "potentialBonus",
      "Potential +{bonus}; participation is not enabled",
    ).replace("{bonus}", match[1])
  }

  match = source.match(/^(\d+)% completed$/)
  if (match) {
    return facilitatorTemplate(
      targetCatalog,
      "percentCompleted",
      "{percent}% completed",
    ).replace("{percent}", match[1])
  }

  match = source.match(/^(\d+) of (\d+) syllabus badges completed$/)
  if (match) {
    return facilitatorTemplate(
      targetCatalog,
      "syllabusProgress",
      "{count} of {total} syllabus badges completed",
    )
      .replace("{count}", match[1])
      .replace("{total}", match[2])
  }

  match = source.match(/^Earned (.+)$/)
  if (match) {
    return facilitatorTemplate(targetCatalog, "earned", "Earned {value}").replace(
      "{value}",
      match[1],
    )
  }

  match = source.match(/^(\d+) \/ (\d+) profile checks$/)
  if (match) {
    return facilitatorTemplate(
      targetCatalog,
      "profileChecks",
      "{count} / {total} profile checks",
    )
      .replace("{count}", match[1])
      .replace("{total}", match[2])
  }

  match = source.match(/^(?:Member since\s+)+(.+)$/i)
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
