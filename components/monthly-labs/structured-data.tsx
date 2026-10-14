import { WEBSITE_SITE_URL } from "@/lib/website-i18n"
import source from "@/public/i18n/locales/en.json"
import { monthLabel, monthlyLabMonthPath } from "./model"

export default function MonthlyLabStructuredData({ path, title, month, items = [] }: {
  path: string; title: string; month?: string; items?: { path: string; title: string }[]
}) {
  const url = (value: string) => new URL(value, WEBSITE_SITE_URL).href
  const crumbs = [
    { "@type": "ListItem", position: 1, name: source.messages.calculator, item: WEBSITE_SITE_URL },
    { "@type": "ListItem", position: 2, name: source.messages.monthlyLabs, item: url("/monthly-labs/") },
  ]
  if (month) crumbs.push({ "@type": "ListItem", position: 3, name: monthLabel(month, "en"), item: url(monthlyLabMonthPath(month)) })
  if (month && path !== monthlyLabMonthPath(month)) crumbs.push({ "@type": "ListItem", position: 4, name: title, item: url(path) })
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": items.length ? "CollectionPage" : "WebPage", name: title, url: url(path) },
      { "@type": "BreadcrumbList", itemListElement: crumbs },
      ...(items.length ? [{ "@type": "ItemList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title, url: url(item.path) })) }] : []),
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
}
