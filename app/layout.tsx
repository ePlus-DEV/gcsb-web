import type { Metadata, Viewport } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import WebsiteLanguage from "@/components/i18n/website-language"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import "./styles/redesign-dashboard.css"
import "./styles/redesign-results.css"
import "./styles/redesign-components.css"
import "./styles/redesign-responsive.css"
import "./styles/facilitator-panel.css"
import "./styles/fontawesome-icons.css"
import "./styles/website-language.css"

const siteUrl = "https://arcade.eplus.dev/"
const siteName = "Arcade Points by ePlus.DEV"
const title = "Google Cloud Arcade Points Calculator & Badge Tracker 2026"
const description =
  "Calculate Google Cloud Arcade points from your public Google Skills profile, review completed badges, estimate milestone progress, and track Arcade Facilitator rewards."
const googleFontsUrl =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Press+Start+2P&display=swap"
const fontAwesomeUrl =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"
const fontAwesomeIntegrity =
  "sha512-2SwdPD6INVrV/lHTZbO2nodKhrnDdJK9/kg2XD1r9uGqPo1cUbujc+IYdlYdEErWNu69gVcYgdxlmVmzTWnetw=="

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090b12",
  colorScheme: "dark",
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | ePlus.DEV",
  },
  description,
  generator: "Next.js",
  applicationName: siteName,
  authors: [{ name: "ePlus.DEV", url: "https://eplus.dev" }],
  creator: "ePlus.DEV",
  publisher: "ePlus.DEV",
  category: "technology",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Google Cloud Arcade points calculator",
    "Google Skills Arcade calculator",
    "Google Cloud Skills Boost badges",
    "Google Skills public profile tracker",
    "Arcade Facilitator points",
    "Google Cloud Arcade milestones",
    "Arcade points 2026",
    "Google Cloud Arcade rewards",
    "Google Cloud Skills Boost Helper",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName,
    locale: "en_US",
    images: [
      {
        url: "/head.png",
        width: 1280,
        height: 800,
        alt: "Google Cloud Arcade points calculator, badge tracker and Facilitator milestone dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/head.png"],
    creator: "@ePlusDEV",
  },
  manifest: "/manifest.webmanifest",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="stylesheet" href={googleFontsUrl} />
        <link
          rel="stylesheet"
          href={fontAwesomeUrl}
          integrity={fontAwesomeIntegrity}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <WebsiteLanguage />
          {children}
        </ThemeProvider>
        <GoogleAnalytics gaId="G-41VM0C9NGM" />
      </body>
    </html>
  )
}
