import type { Metadata } from "next"
import ChangelogRedirect from "./changelog-redirect"

export const metadata: Metadata = {
  title: "Page moved",
  description: "The former Arcade Points changelog route now redirects to the product guide.",
  alternates: {
    canonical: "https://arcade.eplus.dev/guide/",
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function ChangelogPage() {
  return <ChangelogRedirect />
}
