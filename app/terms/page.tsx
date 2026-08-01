import type { Metadata } from "next"
import InternalPageShell from "@/components/site/internal-page-shell"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of Arcade Points by ePlus.DEV and the companion browser extension.",
  alternates: { canonical: "https://arcade.eplus.dev/terms/" },
  openGraph: { url: "https://arcade.eplus.dev/terms/" },
}

export default function TermsPage() {
  return (
    <InternalPageShell
      eyebrow="Usage terms"
      title="Terms of Service"
      description="The rules and limitations that apply when using Arcade Points and the Google Cloud Skills Boost Helper extension."
      updated="August 1, 2026"
    >
      <p className="lead">By using Arcade Points by ePlus.DEV or the companion browser extension, you agree to these terms. Stop using the service if you do not agree.</p>

      <h2>1. Community tool</h2>
      <p>Arcade Points is an independent community project. It is not affiliated with, sponsored by, or endorsed by Google. Google product names and trademarks belong to their respective owners.</p>

      <h2>2. Estimates and availability</h2>
      <p>Point totals, badge classifications, reward tiers, slot availability, and Facilitator progress are estimates based on supported public information. Official program records and decisions always take precedence.</p>

      <h2>3. Acceptable use</h2>
      <ul>
        <li>Use the service only for lawful personal or educational purposes.</li>
        <li>Do not attempt to bypass rate limits, access controls, or security measures.</li>
        <li>Do not disrupt the service, automate abusive traffic, or access non-public information.</li>
        <li>Do not present calculated results as official confirmation from Google or ePlus.DEV.</li>
      </ul>

      <h2>4. Public profile responsibility</h2>
      <p>You are responsible for ensuring that any profile URL you submit is public and that you are permitted to use it. Do not submit private credentials, access tokens, passwords, or sensitive personal information.</p>

      <h2>5. Intellectual property</h2>
      <p>The project interface, original content, and code are protected by applicable licenses and intellectual-property laws. Third-party names, logos, and content remain the property of their owners.</p>

      <h2>6. No warranty</h2>
      <p>The service is provided “as is” and “as available.” We do not guarantee uninterrupted operation, complete badge detection, accurate reward eligibility, or continued compatibility with third-party websites.</p>

      <h2>7. Limitation of liability</h2>
      <p>To the maximum extent permitted by law, ePlus.DEV and project contributors are not liable for indirect, incidental, special, or consequential loss arising from use of or reliance on the service.</p>

      <h2>8. Changes</h2>
      <p>Features and these terms may change as the Arcade program, Google Skills pages, browser APIs, or project infrastructure evolve. Continued use after an update means you accept the revised terms.</p>

      <h2>9. Contact</h2>
      <p>Questions about these terms can be sent to <a href="mailto:support@eplus.dev">support@eplus.dev</a>.</p>
    </InternalPageShell>
  )
}
