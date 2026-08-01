import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { ManualEntryStageSync } from "@/components/arcade/manual-entry-stage-sync"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import "./styles/base.css"
import "./styles/trail.css"
import "./styles/content.css"
import "./styles/responsive.css"
import "./styles/refinement.css"
import "./styles/manual-entry-state.css"
import "./styles/option3-background.css"
import "./styles/mobile-hero-redesign.css"
import "./styles/redesign-dashboard.css"

const siteUrl = "https://eplus-dev.github.io/gcsb-web/"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Arcade Points Calculator 2026 | ePlus.DEV",
  description:
    "Calculate Google Skills Arcade points from a public profile, review badges, track tier progress and install the open-source Google Cloud Skills Boost Helper extension.",
  generator: "ePlus.DEV",
  applicationName: "Arcade Points by ePlus.DEV",
  keywords: [
    "Google Skills Arcade",
    "Arcade points calculator",
    "Google Cloud Skills Boost",
    "Arcade 2026",
    "browser extension",
  ],
  openGraph: {
    title: "Arcade Points Calculator 2026 | ePlus.DEV",
    description: "Calculate points on the web and track automatically with the ePlus.DEV browser extension.",
    type: "website",
    url: siteUrl,
    images: [
      {
        url: "head.png",
        width: 1280,
        height: 800,
        alt: "Arcade Points Calculator and Google Cloud Skills Boost Helper",
      },
    ],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ManualEntryStageSync />
          {children}
        </ThemeProvider>
        <GoogleAnalytics gaId="G-41VM0C9NGM" />
      </body>
    </html>
  )
}
