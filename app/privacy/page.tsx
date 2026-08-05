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
        <li>Basic anonymous usage information only when you explicitly accept optional analytics.</li>
      </ul>

      <h2>How information is used</h2>
      <p>Information is used to calculate estimated Arcade points, display badge and Facilitator progress, remember interface preferences, improve reliability, and diagnose errors. Calculated results are estimates and are not official Google program records.</p>

      <h2>Essential browser storage</h2>
      <p>The website and extension may store recent results, theme, language, and interface preferences in browser storage on your device. This storage supports requested product features and remains available whether you accept or reject optional analytics. You can remove it by clearing site data, resetting the extension, or uninstalling it.</p>

      <h2>Optional analytics and cookies</h2>
      <p>Google Analytics is disabled by default. Its script is not loaded and analytics cookies are not created until you select <strong>Accept analytics</strong> in the privacy popup. Selecting <strong>Reject analytics</strong> does not limit calculator features. Your choice is stored locally so the site can remember it.</p>
      <p>You can review or change that choice at any time:</p>
      <CookiePreferencesButton />

      <h2>Service requests</h2>
      <p>When a public profile is analyzed, the submitted public URL may be sent to the service used to retrieve and process public profile information. Runtime endpoints, credentials, and internal service configuration are not exposed in public documentation.</p>

      <h2>Third-party services</h2>
      <p>The product links to or interacts with Google Skills, browser extension stores, and, after consent, Google Analytics. Those services operate under their own privacy policies. This project is independent and is not affiliated with or endorsed by Google.</p>

      <h2>Data sharing</h2>
      <p>We do not sell personal information. Information is shared only with infrastructure providers required to operate the service, when legally required, or when you explicitly initiate an interaction with a third-party service.</p>

      <h2>Your choices</h2>
      <p>You may reject optional analytics, change your analytics choice later, clear locally stored data, stop using the service, or request assistance regarding information under our control.</p>

      <h2>Contact</h2>
      <p>Questions about privacy can be sent to <a href="mailto:privacy@eplus.dev">privacy@eplus.dev</a>.</p>
    </InternalPageShell>
  )
}
