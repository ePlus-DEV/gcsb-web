import type { Metadata } from "next"
import SharedProfileClient from "@/components/arcade/shared-profile-client"
import "./official-profile-overrides.css"

export const metadata: Metadata = {
  title: "Shared Arcade Profile",
  description: "View a shared Google Cloud Arcade 2026 profile.",
  robots: { index: false, follow: true },
}

export default function SharedProfilePage() {
  return <SharedProfileClient />
}
