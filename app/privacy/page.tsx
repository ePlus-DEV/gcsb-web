import type { Metadata } from "next"
import PrivacyPage from "@/components/content/privacy-page"



export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy information for Arcade Points by ePlus.DEV and the Google Cloud Skills Boost Helper extension.",
  alternates: { canonical: "https://arcade.eplus.dev/privacy/" },
  openGraph: { url: "https://arcade.eplus.dev/privacy/" },
}

export default PrivacyPage
