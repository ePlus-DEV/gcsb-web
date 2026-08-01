import type { Metadata } from "next"
import Link from "next/link"
import InternalPageShell from "@/components/site/internal-page-shell"

const pageUrl = "https://arcade.eplus.dev/about/"

export const metadata: Metadata = {
  title: "About Arcade Points",
  description:
    "Learn how Arcade Points by ePlus.DEV analyzes public Google Skills profiles, estimates Google Cloud Arcade points, and tracks badges and Facilitator milestones.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "About Arcade Points",
    description:
      "Learn how the Arcade points calculator, badge tracker, and Facilitator milestone dashboard work.",
    url: pageUrl,
  },
}

export default function AboutPage() {
  return (
    <InternalPageShell
      eyebrow="About the tool"
      title="About Arcade Points"
      description="A community-built Google Cloud Arcade calculator and badge tracker focused on a fast, transparent, mobile-friendly experience."
    >
      <p className="lead">
        Arcade Points by ePlus.DEV helps learners understand the badge activity already visible on their public Google Skills profile. It summarizes supported badges, estimates Arcade points, and compares the result with available reward and Facilitator milestones.
      </p>

      <h2>What the tool does</h2>
      <ul>
        <li>Reads badge and profile information from a public Google Skills profile URL.</li>
        <li>Groups supported game, skill, trivia, completion, and special badges.</li>
        <li>Calculates an estimated Google Cloud Arcade point total.</li>
        <li>Shows progress toward reward tiers and limited milestone slots.</li>
        <li>Provides separate Facilitator progress where applicable.</li>
      </ul>

      <h2>Why it exists</h2>
      <p>
        Arcade badge lists and reward rules can be difficult to review manually, especially across several campaigns. This tool brings the useful information into one dashboard without requiring Google sign-in or access to private account data.
      </p>

      <h2>How calculations should be understood</h2>
      <p>
        Results are estimates based on supported badge mappings and publicly available profile information. Google may change badge rules, eligibility requirements, reward tiers, deadlines, or slot availability. The official program pages and communications remain the final source of truth.
      </p>

      <h2>Privacy by design</h2>
      <p>
        The calculator only asks for a public profile URL. It does not ask for your Google password. Recent results and preferences may be stored locally in your browser. More details are available in the <Link href="/privacy/">Privacy Policy</Link>.
      </p>

      <h2>Independent community project</h2>
      <p>
        Arcade Points is developed by ePlus.DEV and is not affiliated with, sponsored by, or endorsed by Google. Google Cloud, Google Skills, and related names remain the property of their respective owners.
      </p>

      <h2>Start using Arcade Points</h2>
      <p>
        Open the <Link href="/guide/">step-by-step guide</Link> to make your profile public and learn how to read the calculator results, or return to the <Link href="/">Arcade Points calculator</Link>.
      </p>
    </InternalPageShell>
  )
}
