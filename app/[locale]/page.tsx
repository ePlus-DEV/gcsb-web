import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import FacilitatorPanel from "@/components/arcade/facilitator-panel"
import ArcadeRouteLinks from "@/components/app/arcade-route-links"
import SeoContent from "@/components/seo/seo-content"
import {
  getWebsiteCanonicalUrl,
  getWebsiteLanguageAlternates,
  getWebsiteLocaleInfo,
  WEBSITE_LOCALES,
  type WebsiteCatalog,
  type WebsiteLocale,
} from "@/lib/website-i18n"
import RedesignCalculator from "../redesign-calculator"

export const dynamicParams = false

/** Generates every supported non-English localized homepage at build time. */
export function generateStaticParams() {
  return WEBSITE_LOCALES.filter((locale) => locale.path).map((locale) => ({
    locale: locale.path,
  }))
}

/** Resolves a route segment to a supported website locale. */
function resolveLocale(segment: string): WebsiteLocale | null {
  return (
    WEBSITE_LOCALES.find(
      (locale) => locale.path.toLowerCase() === segment.toLowerCase(),
    )?.code ?? null
  )
}

/** Reads one generated translation catalog during static rendering. */
async function readCatalog(locale: WebsiteLocale): Promise<WebsiteCatalog> {
  const filePath = path.join(process.cwd(), "public", "i18n", `${locale}.json`)
  return JSON.parse(await readFile(filePath, "utf8")) as WebsiteCatalog
}

/** Builds localized title and description values for metadata and JSON-LD. */
function getLocalizedSeo(locale: WebsiteLocale, catalog: WebsiteCatalog) {
  const translatedTitle = `${catalog.messages.heroTitleTop ?? "CHECK YOUR"} ${
    catalog.messages.heroTitleBottom ?? "ARCADE SCORE"
  }`
  const title =
    locale === "vi"
      ? "Máy tính điểm Google Cloud Arcade & Theo dõi huy hiệu 2026"
      : `${translatedTitle} – Google Cloud Arcade 2026`
  const description =
    catalog.messages.heroDescription ??
    "Analyze your public Google Skills profile, review earned badges and check your Google Cloud Arcade reward tier."

  return { title, description }
}

type LocalizedPageProps = {
  params: Promise<{ locale: string }>
}

/** Generates localized canonical, hreflang, social, and search metadata. */
export async function generateMetadata({
  params,
}: LocalizedPageProps): Promise<Metadata> {
  const { locale: segment } = await params
  const locale = resolveLocale(segment)
  if (!locale) return {}

  const localeInfo = getWebsiteLocaleInfo(locale)
  const catalog = await readCatalog(locale)
  const { title, description } = getLocalizedSeo(locale, catalog)
  const canonical = getWebsiteCanonicalUrl(locale)

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: getWebsiteLanguageAlternates(),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: localeInfo.htmlLang.replace("-", "_"),
      alternateLocale: WEBSITE_LOCALES.filter((item) => item.code !== locale).map(
        (item) => item.htmlLang.replace("-", "_"),
      ),
      images: [
        {
          url: "/head.png",
          width: 1280,
          height: 800,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/head.png"],
    },
  }
}

/** Renders one statically generated localized calculator homepage. */
export default async function LocalizedPage({ params }: LocalizedPageProps) {
  const { locale: segment } = await params
  const locale = resolveLocale(segment)
  if (!locale) notFound()

  const localeInfo = getWebsiteLocaleInfo(locale)
  const catalog = await readCatalog(locale)
  const { title, description } = getLocalizedSeo(locale, catalog)

  return (
    <>
      <section className="sr-only" lang={localeInfo.htmlLang}>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
      <RedesignCalculator />
      <ArcadeRouteLinks />
      <FacilitatorPanel />
      <SeoContent locale={locale} title={title} description={description} />
    </>
  )
}
