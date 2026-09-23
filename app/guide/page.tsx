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

const steps = [
  {
    number: "01",
    title: "Open your Google Skills profile",
    description:
      "Sign in to Google Skills, open your profile page, and locate the public profile or sharing settings.",
    detail:
      "Your public URL normally contains skills.google/public_profiles/ followed by your profile identifier.",
  },
  {
    number: "02",
    title: "Make the profile public",
    description:
      "Enable public profile visibility so your badge list can be viewed without signing in.",
    detail:
      "Open the copied URL in a private or incognito window to confirm the profile and badges are publicly visible.",
  },
  {
    number: "03",
    title: "Copy the complete profile URL",
    description:
      "Copy the public profile URL directly from the browser address bar.",
    detail:
      "Avoid dashboard URLs, course URLs, badge URLs, shortened links, or pages that still require sign-in.",
  },
  {
    number: "04",
    title: "Analyze the profile",
    description:
      "Paste the public profile URL into Arcade Points and select Analyze profile.",
    detail:
      "The calculator reads public badge information and maps recognized badges to supported Arcade points.",
  },
  {
    number: "05",
    title: "Read your score",
    description:
      "Review your total points, badge breakdown, unknown badges, tier progress, and Facilitator information.",
    detail:
      "Unknown badges remain visible so a new or renamed badge is not silently excluded from your review.",
  },
  {
    number: "06",
    title: "Check reward availability",
    description:
      "Compare your point tier with the current prize-slot information and reward pages.",
    detail:
      "Reaching a threshold does not guarantee a reward. Official program rules, verification, region, timing, and availability still apply.",
  },
]

const resultItems = [
  ["Total points", "Estimated sum of recognized Arcade badge categories."],
  ["Point breakdown", "Contribution from game, skill, trivia, completion, and special badges."],
  ["Unknown badges", "Visible badges that do not yet have a verified point mapping."],
  ["Tier progress", "Your current qualifying threshold and progress toward the next tier."],
  ["Facilitator", "Separate milestone and bonus information when the program is enabled."],
]

const errors = [
  {
    title: "Profile URL is rejected",
    body: "Confirm that you copied a public profile URL rather than a badge, course, or signed-in dashboard URL.",
  },
  {
    title: "No badges are found",
    body: "Open the same profile in an incognito window. If it is hidden or requires sign-in, update its public visibility first.",
  },
  {
    title: "Score looks incomplete",
    body: "Review the unknown-badge section. New or renamed badges may need verification before they receive a point mapping.",
  },
  {
    title: "Request times out",
    body: "Wait briefly and retry. Temporary network, upstream profile, or service availability issues can interrupt analysis.",
  },
]

export default function GuidePage() {
  return (
    <InternalPageShell
      eyebrow="Step-by-step guide"
      title="How to check your Arcade points"
      description="Make your Google Skills profile public, copy the correct URL, analyze it, and understand every important part of the result."
    >
      <div className="not-prose space-y-10">
        <section className="grid gap-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-cyan-300">
              Before you start
            </span>
            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
              You only need a public Google Skills profile URL
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Arcade Points does not need your Google password and does not require a Google sign-in.
              It works from information already visible on your public profile.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            Open calculator
          </Link>
        </section>

        <section aria-labelledby="guide-steps-title">
          <div className="mb-5">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-300">
              6 simple steps
            </span>
            <h2 id="guide-steps-title" className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              From profile URL to Arcade score
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Each step is independent, so it is easy to identify where a profile or score problem starts.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {steps.map((step) => (
              <article
                key={step.number}
                className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-300/25 hover:bg-white/[0.055] sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 font-mono text-sm font-black text-cyan-200">
                    {step.number}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white sm:text-lg">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{step.description}</p>
                    <p className="mt-3 border-l border-white/10 pl-3 text-xs leading-5 text-slate-500">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-emerald-300">
              Reading the dashboard
            </span>
            <h2 className="mt-2 text-2xl font-bold text-white">What each result means</h2>
            <div className="mt-5 divide-y divide-white/10">
              {resultItems.map(([title, description]) => (
                <div key={title} className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-5">
                  <strong className="text-sm text-slate-100">{title}</strong>
                  <span className="text-sm leading-6 text-slate-400">{description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-violet-300/15 bg-violet-300/[0.045] p-5 sm:p-6">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-300">
              Reward slots
            </span>
            <h2 className="mt-2 text-2xl font-bold text-white">Points and availability are different</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Reaching a tier threshold tells you which tier your score qualifies for. It does not by
              itself guarantee a reward because some prize pools are limited.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Treat the displayed tier and live slot data as useful tracking information until official
              Google communications confirm final eligibility and allocation.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/swag-drops/2026/"
                className="inline-flex min-h-10 items-center rounded-lg border border-violet-300/20 bg-violet-300/10 px-4 text-sm font-semibold text-violet-100 transition hover:bg-violet-300/15"
              >
                View 2026 rewards
              </Link>
              <Link
                href="/swag-drops/"
                className="inline-flex min-h-10 items-center rounded-lg border border-white/10 px-4 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
              >
                Reward archive
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="guide-errors-title">
          <div className="mb-5">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-amber-300">
              Troubleshooting
            </span>
            <h2 id="guide-errors-title" className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Common errors
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {errors.map((error) => (
              <article key={error.title} className="rounded-2xl border border-white/10 bg-black/10 p-5">
                <h3 className="text-base font-bold text-white">{error.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{error.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-emerald-300/15 bg-gradient-to-br from-emerald-300/[0.06] via-white/[0.025] to-cyan-300/[0.05] p-5 sm:p-7">
          <span className="text-[11px] font-bold uppercase tracking-[.18em] text-emerald-300">
            Accuracy and official results
          </span>
          <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="text-2xl font-bold text-white">Use Arcade Points as a transparent community estimate</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Official Google Cloud Arcade rules, eligibility checks, communications, and reward
                confirmation always take precedence. Unknown badges and limited public data are shown
                instead of being hidden so you can review the estimate yourself.
              </p>
            </div>
            <Link
              href="/about/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/15"
            >
              About Arcade Points
            </Link>
          </div>
        </section>
      </div>
    </InternalPageShell>
  )
}
