import type { MetadataRoute } from "next"
import {
  ARCADE_SWAG_SEASONS,
  ARCADE_SWAG_TIERS,
  getSwagDropsForSeason,
} from "@/components/arcade/swag-drops"
import {
  swagProductPath,
  swagSeasonPath,
  swagTierPath,
} from "@/components/arcade/swag-seasons"
import {
  getWebsiteCanonicalUrl,
  WEBSITE_LOCALES,
  WEBSITE_SITE_URL,
} from "@/lib/website-i18n"

export const dynamic = "force-static"

/** Generates canonical localized and supporting-page sitemap entries. */
export default function sitemap(): MetadataRoute.Sitemap {
  const localizedPages: MetadataRoute.Sitemap = WEBSITE_LOCALES.filter(
    (locale) => locale.path,
  ).map((locale) => ({
    url: getWebsiteCanonicalUrl(locale.code),
    changeFrequency: "weekly",
    priority: locale.code === "vi" ? 0.9 : 0.8,
  }))

  const swagPages: MetadataRoute.Sitemap = [
    {
      url: new URL("/swag-drops/", WEBSITE_SITE_URL).toString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: new URL("/swag-drops/2025/", WEBSITE_SITE_URL).toString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...ARCADE_SWAG_SEASONS.flatMap((season) => [
      {
        url: new URL(swagSeasonPath(season), WEBSITE_SITE_URL).toString(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      },
      ...ARCADE_SWAG_TIERS.map((tier) => ({
        url: new URL(swagTierPath(season, tier), WEBSITE_SITE_URL).toString(),
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
      ...getSwagDropsForSeason(season).map((drop) => ({
        url: new URL(swagProductPath(season, drop.id), WEBSITE_SITE_URL).toString(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        lastModified: drop.revealedOnIso,
      })),
    ]),
  ]

  return [
    {
      url: WEBSITE_SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...localizedPages,
    ...swagPages,
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
