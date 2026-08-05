import type { Metadata } from "next"
import { notFound } from "next/navigation"
import SharedProfileClient from "@/components/arcade/shared-profile-client"
import { WEBSITE_LOCALES } from "@/lib/website-i18n"

export const dynamicParams = false

export function generateStaticParams() {
  return WEBSITE_LOCALES.filter((locale) => locale.path).map((locale) => ({
    locale: locale.path,
  }))
}

export const metadata: Metadata = {
  title: "Shared Arcade Profile",
  description: "View a shared Google Cloud Arcade 2026 profile.",
  robots: { index: false, follow: true },
}

type Props = { params: Promise<{ locale: string }> }

export default async function LocalizedSharedProfilePage({ params }: Props) {
  const { locale } = await params
  if (!WEBSITE_LOCALES.some((item) => item.path === locale)) notFound()
  return <SharedProfileClient />
}
