import type { Metadata } from "next"
import { notFound } from "next/navigation"
import SharedProfileClient from "@/components/arcade/shared-profile-client"
import ProfileLocaleRouting from "@/components/i18n/profile-locale-routing"
import { WEBSITE_LOCALES } from "@/lib/website-i18n"
import "../../profile/official-profile-overrides.css"

export const dynamicParams = false

export function generateStaticParams() {
  return WEBSITE_LOCALES.filter((locale) => locale.path).map((locale) => ({
    locale: locale.path,
  }))
}

export const metadata: Metadata = {
  title: "Arcade Score",
  description: "View shared Google Cloud Arcade points, badges and tier progress.",
  robots: { index: false, follow: true },
}

type Props = { params: Promise<{ locale: string }> }

export default async function LocalizedSharedProfilePage({ params }: Props) {
  const { locale } = await params
  if (!WEBSITE_LOCALES.some((item) => item.path === locale)) notFound()

  return (
    <>
      <ProfileLocaleRouting />
      <SharedProfileClient />
    </>
  )
}
