import type { MetadataRoute } from "next"
import {
  getWebsiteCanonicalUrl,
  WEBSITE_LOCALES,
  WEBSITE_SITE_URL,
} from "@/lib/website-i18n"

/** Generates canonical localized and supporting-page sitemap entries. */
export default function sitemap(): MetadataRoute.Sitemap {
  const localizedPages: MetadataRoute.Sitemap = WEBSITE_LOCALES.filter(
    (locale) => locale.path,
  ).map((locale) => ({
    url: getWebsiteCanonicalUrl(locale.code),
    changeFrequency: "weekly",
    priority: locale.code === "vi" ? 0.9 : 0.8,
  }))

  return [
    {
      url: WEBSITE_SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...localizedPages,
    {
      url: new URL("/about/", WEBSITE_SITE_URL).toString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: new URL("/guide/", WEBSITE_SITE_URL).toString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: new URL("/privacy/", WEBSITE_SITE_URL).toString(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: new URL("/terms/", WEBSITE_SITE_URL).toString(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ]
}
