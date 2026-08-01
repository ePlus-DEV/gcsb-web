import type { Metadata } from "next"
import Link from "next/link"
import InternalPageShell from "@/components/site/internal-page-shell"

const pageUrl = "https://arcade.eplus.dev/guide/"

export const metadata: Metadata = {
  title: "How to Check Google Cloud Arcade Points",
  description:
    "Step-by-step guide to find your public Google Skills profile URL, calculate Google Cloud Arcade points, review badges, and understand reward tiers.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "How to Check Google Cloud Arcade Points",
    description:
      "Find your public Google Skills profile URL and use Arcade Points to review badges, score estimates, and milestone progress.",
    url: pageUrl,
  },
}

export default function GuidePage() {
  return (
    <InternalPageShell
      eyebrow="Step-by-step guide"
      title="How to check your Arcade points"
      description="Make your Google Skills profile public, copy the correct URL, analyze it, and understand each part of the results dashboard."
    >
      <p className="lead">
        You only need a public Google Skills profile URL. Arcade Points does not require your Google password or a Google sign-in.
      </p>

      <h2>1. Open your Google Skills profile</h2>
      <p>
        Sign in to Google Skills, open your profile page, and locate the public profile or sharing settings. Your public URL normally contains <code>skills.google/public_profiles/</code> followed by your profile identifier.
      </p>

      <h2>2. Make the profile public</h2>
      <p>
        Enable public profile visibility so the badge list can be viewed without signing in. Open the copied URL in a private or incognito window to confirm that the profile and badges are visible publicly.
      </p>

      <h2>3. Copy the complete profile URL</h2>
      <p>
        Copy the URL from the browser address bar. Avoid copying a dashboard URL, course URL, badge URL, shortened link, or a page that still requires sign-in.
      </p>

      <h2>4. Analyze the profile</h2>
      <p>
        Return to the <Link href="/">Arcade Points calculator</Link>, paste the URL into the profile field, and select <strong>Analyze profile</strong>. The tool retrieves public badge information and calculates supported points.
      </p>

      <h2>5. Read your score</h2>
      <ul>
        <li><strong>Total points:</strong> the estimated sum of recognized badge categories.</li>
        <li><strong>Point breakdown:</strong> the contribution from game, skill, trivia, completion, and special badges.</li>
        <li><strong>Unknown badges:</strong> badges that are visible but do not yet have a verified point mapping.</li>
        <li><strong>Tier progress:</strong> the next point threshold and your estimated qualifying tier.</li>
        <li><strong>Facilitator:</strong> separate progress or bonus information when supported.</li>
      </ul>

      <h2>6. Understand limited reward slots</h2>
      <p>
        Reaching a point threshold does not always guarantee a reward. Some tiers have limited quantities and may be assigned based on program rules, timing, verification, region, or availability. Treat the displayed tier as an estimate until confirmed by official communications.
      </p>

      <h2>Common errors</h2>
      <h3>The profile URL is rejected</h3>
      <p>Confirm that you copied a public profile URL rather than a badge, course, or signed-in dashboard URL.</p>

      <h3>No badges are found</h3>
      <p>Open the URL in an incognito window. If the profile is hidden or requires sign-in, update its visibility and try again.</p>

      <h3>The score looks incomplete</h3>
      <p>
        Review the unknown badge section. New or renamed badges may need to be verified before they can be included in the point total.
      </p>

      <h3>The request times out</h3>
      <p>Wait briefly and retry. Temporary network, upstream profile, or service availability issues can interrupt analysis.</p>

      <h2>Accuracy and official results</h2>
      <p>
        Arcade Points provides a community estimate. Official Google Cloud Arcade rules, eligibility checks, communications, and reward confirmation always take precedence. Learn more on the <Link href="/about/">About Arcade Points</Link> page.
      </p>
    </InternalPageShell>
  )
}
