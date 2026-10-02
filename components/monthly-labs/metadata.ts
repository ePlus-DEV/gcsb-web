import type { Metadata } from "next"
import source from "@/public/i18n/locales/en.json"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"

export function monthlyLabsMetadata(path: string, title = source.messages.monthlyLabs, description = source.messages.labArchiveDescription): Metadata {
  const url = new URL(path, WEBSITE_SITE_URL).href
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "website" }, twitter: { card: "summary", title, description } }
}
