import type { Metadata, Viewport } from "next"
import WebsiteLanguage from "@/components/i18n/website-language"
import CookieConsent from "@/components/privacy/cookie-consent"
import { ThemeProvider } from "@/components/theme-provider"
import ThemeToggle from "@/components/theme-toggle"
import { WEBSITE_SITE_URL } from "@/lib/website-i18n"
import "./globals.css"
import "./styles/redesign-dashboard.css"
import "./styles/redesign-results.css"
import "./styles/redesign-components.css"
import "./styles/redesign-responsive.css"
import "./styles/monthly-games.css"
import "./styles/monthly-games-mobile-deadline.css"
import "./styles/facilitator-panel.css"
import "./styles/facilitator-syllabus.css"
import "./styles/fontawesome-icons.css"
import "./styles/website-language.css"
import "./styles/theme-modes.css"
import "./styles/header-compact.css"
import "./styles/theme-light-components.css"
import "./styles/facilitator-participation.css"
import "./styles/facilitator-launcher-visibility.css"
import "./styles/internal-page-theme.css"
import "./styles/cookie-consent.css"

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
const googleAnalyticsIdPattern = /^G-[A-Z0-9]+$/
const analyticsRequested =
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true"
const cookieNoticePreviewMode =
  process.env.NEXT_PUBLIC_COOKIE_CONSENT_PREVIEW === "true"
const analyticsEnabled = analyticsRequested && !cookieNoticePreviewMode
const configuredGoogleAnalyticsId = (process.env.NEXT_PUBLIC_GA_ID ?? "")
  .trim()
  .toUpperCase()
const websiteCatalogBuildVersion =
  process.env.GITHUB_SHA ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.NEXT_PUBLIC_BUILD_VERSION ??
  "local"
const websiteCatalogCacheBootstrap = `(() => {
  const version = ${JSON.stringify(websiteCatalogBuildVersion)};
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    const rawUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input instanceof Request
            ? input.url
            : "";

    let url;
    try {
      url = new URL(rawUrl, window.location.href);
    } catch {
      return originalFetch(input, init);
    }

    if (!url.pathname.includes("/i18n/") || !url.pathname.endsWith(".json")) {
      return originalFetch(input, init);
    }

    url.searchParams.set("v", version);
    return originalFetch(url.toString(), { ...init, cache: "no-store" });
  };
})();`

if (analyticsEnabled && configuredGoogleAnalyticsId.length === 0) {
  throw new Error(
    "Google Analytics is enabled but NEXT_PUBLIC_GA_ID is empty.",
  )
}

if (
  analyticsEnabled &&
  !googleAnalyticsIdPattern.test(configuredGoogleAnalyticsId)
) {
  throw new Error(
    `NEXT_PUBLIC_GA_ID contains an invalid GA4 measurement ID: ${configuredGoogleAnalyticsId}`,
  )
}

const googleAnalyticsId = analyticsEnabled ? configuredGoogleAnalyticsId : ""
const googleAnalyticsBootstrap = googleAnalyticsId
  ? `(() => {
  const widgetPathPattern = /^\\/(?:[a-z]{2}(?:-[a-z]{2})?\\/)?widget\\/?$/i;
  if (widgetPathPattern.test(window.location.pathname)) return;

  const loader = document.createElement("script");
  loader.id = "google-analytics";
  loader.async = true;
  loader.src = "https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}";
  document.head.appendChild(loader);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", ${JSON.stringify(googleAnalyticsId)}, { anonymize_ip: true });
})();`
  : ""

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
}

export const metadata: Metadata = {
  metadataBase: new URL(WEBSITE_SITE_URL),
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
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@ePlusDEV",
  },
  manifest: "/manifest.webmanifest",
}

/** Provides the shared document shell and default English document semantics. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-locale="en"
      suppressHydrationWarning
    >
      <head>
        <script
          id="website-catalog-cache-buster"
          dangerouslySetInnerHTML={{ __html: websiteCatalogCacheBootstrap }}
        />
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
        {cookieNoticePreviewMode ? (
          <meta name="cookie-notice-preview" content="true" />
        ) : null}
        {googleAnalyticsId ? (
          <>
            <meta name="google-analytics-id" content={googleAnalyticsId} />
            <meta name="analytics-mode" content="always-enabled" />
            <meta
              name="cookie-notice-storage"
              content="arcade-cookie-notice-v1"
            />
            <script
              id="google-analytics-bootstrap"
              dangerouslySetInnerHTML={{ __html: googleAnalyticsBootstrap }}
            />
          </>
        ) : null}
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="arcade-theme"
        >
          <WebsiteLanguage />
          <ThemeToggle />
          {children}
          <CookieConsent
            analyticsEnabled={Boolean(googleAnalyticsId)}
            previewMode={cookieNoticePreviewMode}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
