import { WEBSITE_SITE_URL } from "@/lib/website-i18n"
import { CURRENT_SWAG_SEASON, swagSeasonPath } from "@/components/arcade/swag-seasons"
const season = CURRENT_SWAG_SEASON

export default function BreadcrumbJsonLd({ label, path }: { label: string; path: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Swag Drops",
        item: new URL("/swag-drops/", WEBSITE_SITE_URL).toString(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: String(season),
        item: new URL(swagSeasonPath(season), WEBSITE_SITE_URL).toString(),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: label,
        item: new URL(path, WEBSITE_SITE_URL).toString(),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

