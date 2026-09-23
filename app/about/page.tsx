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

const features = [
  {
    number: "01",
    label: "Profile analysis",
    title: "See your earned badges",
    description:
      "Read badge and profile information from a public Google Skills profile, with supported game, skill, trivia, completion, and special badges grouped together.",
  },
  {
    number: "02",
    label: "Score breakdown",
    title: "Understand your Arcade points",
    description:
      "Calculate an estimated point total from supported badge mappings and review unknown badges instead of silently ignoring them.",
  },
  {
    number: "03",
    label: "Reward progress",
    title: "See your tier and milestones",
    description:
      "Compare your estimated score with current reward thresholds and published prize-slot information without confusing eligibility with guaranteed rewards.",
  },
  {
    number: "04",
    label: "Facilitator",
    title: "Follow separate program progress",
    description:
      "Review Facilitator milestones and supported bonus estimates independently when you confirm program participation.",
  },
]

const workflow = [
  {
    number: "01",
    title: "Share your public profile URL",
    description:
      "No private account access, Google password, or Google sign-in to this calculator is required.",
  },
  {
    number: "02",
    title: "Review recognized badge activity",
    description:
      "The calculator classifies supported badges and shows items that still need scoring review.",
  },
  {
    number: "03",
    title: "Compare your progress",
    description:
      "Explore estimated points, reward milestones, remaining slots, and optional Facilitator progress.",
  },
]

export default function AboutPage() {
  return (
    <InternalPageShell
      eyebrow="About the tool"
      title="About Arcade Points"
      description="A community-built Google Cloud Arcade calculator and badge tracker focused on clarity, useful progress information, and a mobile-friendly experience."
    >
      <div className="not-prose space-y-10">
        <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-5 dark:border-cyan-300/15 dark:from-cyan-300/[0.06] dark:via-white/[0.025] dark:to-violet-300/[0.06] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(230px,.65fr)] lg:items-center">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[.18em] text-cyan-700 dark:text-cyan-300">
                Built for learners
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Turn your public badges into a clearer progress overview
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                Arcade Points by ePlus.DEV helps you understand badge activity already visible on
                your public Google Skills profile. It summarizes supported badges, estimates Arcade
                points, and shows where you stand against reward and Facilitator milestones.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white transition hover:bg-cyan-700 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                >
                  Check your score
                </Link>
                <Link
                  href="/guide/"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  How it works
                </Link>
              </div>
            </div>
            <aside className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-emerald-700 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                Public-profile tool
              </div>
              <p className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                No password. No account connection.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Paste a public Google Skills profile URL to inspect supported badge activity and
                estimate your progress.
              </p>
              <Link
                href="/privacy/"
                className="mt-4 inline-flex text-sm font-semibold text-cyan-700 underline underline-offset-4 dark:text-cyan-300"
              >
                Read our privacy policy
              </Link>
            </aside>
          </div>
        </section>

        <section aria-labelledby="about-features-title">
          <div className="mb-5">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300">
              What the tool does
            </span>
            <h2 id="about-features-title" className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
              All the useful Arcade information in one place
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
              Review supported badges, estimated points, reward tiers, and optional Facilitator progress
              without manually comparing separate program dashboards.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition hover:border-cyan-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-300/30 sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-100 font-mono text-sm font-black text-cyan-800 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200">
                    {feature.number}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-500 dark:text-slate-400">
                    {feature.label}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.035] sm:p-7">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-300">
              Why it exists
            </span>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
              Less manual checking. More useful context.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Arcade badge lists and reward rules can be difficult to review across multiple
              campaigns. This independent tool brings useful information into one dashboard
              without asking for private account access.
            </p>
            <div className="mt-6 space-y-5 border-l-2 border-cyan-200 pl-5 dark:border-cyan-300/20">
              {workflow.map((step) => (
                <div key={step.number}>
                  <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">
                    {step.number}
                  </span>
                  <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-300/15 dark:bg-violet-300/[0.045] sm:p-7">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300">
              How calculations should be understood
            </span>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
              Transparent estimates, not official results
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Calculations use supported badge mappings and public profile information. Google
              may change badge rules, eligibility, tiers, deadlines, or reward availability.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
              Reaching a point threshold does not guarantee a physical reward. Official
              program pages and Google communications remain the final source of truth.
            </p>
            <Link
              href="/swag-drops/2026/"
              className="mt-6 inline-flex min-h-10 items-center rounded-xl border border-violet-200 bg-white/80 px-4 text-sm font-semibold text-violet-800 transition hover:bg-white dark:border-violet-300/20 dark:bg-violet-300/10 dark:text-violet-100 dark:hover:bg-violet-300/15"
            >
              Explore 2026 rewards
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-300/15 dark:bg-emerald-300/[0.045] sm:p-7">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-300">
              Privacy by design
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
              Public information, not your credentials
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              The calculator only asks for a public profile URL and never your Google password.
              Recent results and preferences may be saved locally in your browser.
            </p>
            <Link href="/privacy/" className="mt-4 inline-flex text-sm font-semibold text-emerald-800 underline underline-offset-4 dark:text-emerald-200">
              Privacy policy
            </Link>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.035] sm:p-7">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-600 dark:text-slate-400">
              Independent community project
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
              Built by ePlus.DEV, not Google
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Arcade Points is developed by ePlus.DEV. It is not affiliated with, sponsored by,
              or endorsed by Google. Google Cloud, Google Skills, and related names remain the
              property of their respective owners.
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-slate-50 p-5 dark:border-cyan-300/15 dark:from-cyan-300/[0.06] dark:to-slate-950/40 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[.18em] text-cyan-700 dark:text-cyan-300">
                Get started
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                Ready to check your Arcade points?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                Follow the step-by-step guide to make your profile public, or go directly to
                the calculator and paste your public Google Skills URL.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/guide/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10">
                Read the guide
              </Link>
              <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white transition hover:bg-cyan-700 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200">
                Open calculator
              </Link>
            </div>
          </div>
        </section>
      </div>
    </InternalPageShell>
  )
}
