import { notFound } from "next/navigation"
import {
  getWebsiteLocaleInfo,
  WEBSITE_LOCALES,
  type WebsiteLocale,
} from "@/lib/website-i18n"

type LocaleLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Validates localized route segments and provides matching subtree semantics.
 * The build postprocessor applies the same lang, dir, and data-locale values to
 * the prerendered root html element before the production response is served.
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: segment } = await params
  const locale = WEBSITE_LOCALES.find(
    (item) => item.path.toLowerCase() === segment.toLowerCase(),
  )?.code as WebsiteLocale | undefined

  if (!locale) notFound()

  const localeInfo = getWebsiteLocaleInfo(locale)
  return (
    <div
      lang={localeInfo.htmlLang}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-locale={locale}
    >
      {children}
    </div>
  )
}
