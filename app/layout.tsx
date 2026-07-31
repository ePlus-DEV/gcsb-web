import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import "./styles/base.css"
import "./styles/trail.css"
import "./styles/content.css"
import "./styles/responsive.css"
import "./styles/refinement.css"

export const metadata: Metadata = {
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
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <GoogleAnalytics gaId="G-41VM0C9NGM" />
      </body>
    </html>
  )
}
