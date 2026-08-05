import type { Metadata } from "next"
import CookiePreferencesButton from "@/components/privacy/cookie-preferences-button"
import InternalPageShell from "@/components/site/internal-page-shell"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy information for Arcade Points by ePlus.DEV and the Google Cloud Skills Boost Helper extension.",
  alternates: { canonical: "https://arcade.eplus.dev/privacy/" },
  openGraph: { url: "https://arcade.eplus.dev/privacy/" },
}

export default function PrivacyPage() {
  return (
    <InternalPageShell
      eyebrow="Privacy & data"
      title="Privacy Policy"
      description="How Arcade Points and the companion browser extension handle public profile data, local preferences, analytics, and third-party services."
      updated="August 5, 2026"
    >
      <p className="lead">Arcade Points by ePlus.DEV is designed to work with information you intentionally provide, such as a public Google Skills profile URL. We do not ask for your Google password or private account access.</p>

      <h2>Information processed</h2>
      <ul>
        <li>Public badge and profile information available from the profile URL you submit.</li>
        <li>Calculated point totals, milestone estimates, and interface preferences.</li>
        <li>Aggregated website usage information collected through Google Analytics.</li>
      </ul>

      <h2>How information is used</h2>
      <p>Information is used to calculate estimated Arcade points, display badge and Facilitator progress, remember interface preferences, improve reliability, understand website usage, and diagnose errors. Calculated results are estimates and are not official Google program records.</p>

      <h2>Essential browser storage</h2>
      <p>The website and extension may store recent results, theme, language, interface preferences, and acknowledgement of the cookie information notice in browser storage on your device. You can remove this information by clearing site data, resetting the extension, or uninstalling it.</p>

      <h2>Analytics and cookies</h2>
      <p>Google Analytics is enabled when the production website loads. It may collect aggregated information such as page visits, browser or device details, and general interaction data. The cookie information popup is provided for transparency and does not include an analytics disable control.</p>
      <p>Google Analytics does not provide this website with your Google password, private Google account content, or private Google Skills profile data. Browser privacy controls, content blockers, and site-data settings may affect whether analytics requests or cookies are available.</p>
      <p>You can reopen the information notice at any time:</p>
      <CookiePreferencesButton />

      <h2>Service requests</h2>
      <p>When a public profile is analyzed, the submitted public URL may be sent to the service used to retrieve and process public profile information. Runtime endpoints, credentials, and internal service configuration are not exposed in public documentation.</p>

      <h2>Third-party services</h2>
      <p>The product links to or interacts with Google Skills, browser extension stores, and Google Analytics. Those services operate under their own privacy policies. This project is independent and is not affiliated with or endorsed by Google.</p>

      <h2>Data sharing</h2>
      <p>We do not sell personal information. Information is shared only with infrastructure and analytics providers required to operate and improve the service, when legally required, or when you initiate an interaction with a third-party service.</p>

      <h2>Your controls</h2>
      <p>You may review this notice, clear locally stored site data, use browser privacy or content-blocking controls, stop using the service, or request assistance regarding information under our control.</p>

      <h2>Contact</h2>
      <p>Questions about privacy can be sent to <a href="mailto:privacy@eplus.dev">privacy@eplus.dev</a>.</p>
    </InternalPageShell>
  )
}
