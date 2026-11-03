import type { Metadata } from "next"
import DashboardPage from "@/components/arcade/dashboard-page"
import catalog from "@/public/i18n/locales/en.json"
export const metadata: Metadata = {
  title: catalog.messages.dashboardNav,
  robots: { index: false, follow: true },
  alternates: { canonical: "https://arcade.eplus.dev/dashboard/" },
}
export default function Page() { return <DashboardPage catalog={catalog} locale="en" /> }
