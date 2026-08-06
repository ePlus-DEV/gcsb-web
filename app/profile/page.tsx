import type { Metadata } from "next"
import SharedProfileClient from "@/components/arcade/shared-profile-client"
import ProfileLocaleRouting from "@/components/i18n/profile-locale-routing"
import "./official-profile-overrides.css"

export const metadata: Metadata = {
  title: "Arcade Score",
  description: "View shared Google Cloud Arcade points, badges and tier progress.",
  robots: { index: false, follow: true },
}

export default function SharedProfilePage() {
  return (
    <>
      <ProfileLocaleRouting />
      <SharedProfileClient />
    </>
  )
}
