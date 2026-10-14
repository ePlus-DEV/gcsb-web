import type { Metadata } from "next"
import TermsPage from "@/components/content/terms-page"



export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of Arcade Points by ePlus.DEV and the companion browser extension.",
  alternates: { canonical: "https://arcade.eplus.dev/terms/" },
  openGraph: { url: "https://arcade.eplus.dev/terms/" },
}

export default TermsPage
