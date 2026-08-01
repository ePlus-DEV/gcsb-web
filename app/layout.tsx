import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import "./styles/redesign-dashboard.css"
import "./styles/redesign-results.css"
import "./styles/redesign-components.css"
import "./styles/redesign-responsive.css"

const siteUrl = "https://eplus-dev.github.io/gcsb-web/"
const googleFontsUrl =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Press+Start+2P&display=swap"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Arcade Points Calculator 2026 | ePlus.DEV",
  description:
    "Calculate Google Skills Arcade points from a public profile, review badges, check score eligibility and install the open-source Google Cloud Skills Boost Helper extension.",
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
    description:
      "Calculate points on the web and track automatically with the ePlus.DEV browser extension.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={googleFontsUrl} />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <GoogleAnalytics gaId="G-41VM0C9NGM" />
      </body>
    </html>
  )
}
