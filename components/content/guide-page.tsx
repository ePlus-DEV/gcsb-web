import { steps, resultItems, errors } from "./guide-data"
import ContentCard from "@/components/site/content-card"
import Link from "next/link"
import InternalPageShell from "@/components/site/internal-page-shell"

export default function GuidePage() {
  return (
    <InternalPageShell
      eyebrow="Step-by-step guide"
      title="How to check your Arcade points"
      description="Make your Google Skills profile public, copy the correct URL, analyze it, and understand every important part of the result."
    >
      <div className="not-prose space-y-10">
        <section className="grid gap-4 rounded-[var(--ui-radius-lg)] border border-cyan-200 dark:border-cyan-300/15 bg-cyan-50 dark:bg-cyan-300/[0.045] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-cyan-700 dark:text-cyan-300">
              Before you start
            </span>
            <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
              You only need a public Google Skills profile URL
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
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
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300">
              6 simple steps
            </span>
            <h2 id="guide-steps-title" className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              From profile URL to Arcade score
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Each step is independent, so it is easy to identify where a profile or score problem starts.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {steps.map((step) => (
              <article
                key={step.number}
                className="group rounded-[var(--ui-radius-lg)] border border-border bg-card p-5 transition hover:border-cyan-300/25 hover:bg-slate-100 dark:hover:bg-white/[0.055] sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-200 dark:border-cyan-300/20 bg-cyan-100 dark:bg-cyan-300/10 font-mono text-sm font-black text-cyan-800 dark:text-cyan-200">
                    {step.number}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground sm:text-lg">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                    <p className="mt-3 border-l border-border pl-3 text-xs leading-5 text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <div className="site-surface rounded-[var(--ui-radius-lg)] border border-border bg-slate-50 dark:bg-white/[0.03] p-5 sm:p-6">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-300">
              Reading the dashboard
            </span>
            <h2 className="mt-2 text-2xl font-bold text-foreground">What each result means</h2>
            <div className="mt-5 divide-y divide-slate-200 dark:divide-white/10">
              {resultItems.map(([title, description]) => (
                <div key={title} className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-5">
                  <strong className="text-sm text-slate-900 dark:text-slate-100">{title}</strong>
                  <span className="text-sm leading-6 text-muted-foreground">{description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--ui-radius-lg)] border border-violet-200 dark:border-violet-300/15 bg-violet-50 dark:bg-violet-300/[0.045] p-5 sm:p-6">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300">
              Reward slots
            </span>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Points and availability are different</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Reaching a tier threshold tells you which tier your score qualifies for. It does not by
              itself guarantee a reward because some prize pools are limited.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Treat the displayed tier and live slot data as useful tracking information until official
              Google communications confirm final eligibility and allocation.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/swag-drops/2026/"
                className="inline-flex min-h-10 items-center rounded-lg border border-violet-200 dark:border-violet-300/20 bg-violet-100 dark:bg-violet-300/10 px-4 text-sm font-semibold text-violet-800 dark:text-violet-100 transition hover:bg-violet-200 dark:hover:bg-violet-300/15"
              >
                View 2026 rewards
              </Link>
              <Link
                href="/swag-drops/"
                className="inline-flex min-h-10 items-center rounded-lg border border-border px-4 text-sm font-semibold text-muted-foreground transition hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Reward archive
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="guide-errors-title">
          <div className="mb-5">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-amber-700 dark:text-amber-300">
              Troubleshooting
            </span>
            <h2 id="guide-errors-title" className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              Common errors
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {errors.map((error) => (
              <ContentCard key={error.title} className="dark:bg-black/10 p-5">
                <h3 className="text-base font-bold text-foreground">{error.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{error.body}</p>
              </ContentCard>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[var(--ui-radius-lg)] border border-emerald-200 dark:border-emerald-300/15 bg-gradient-to-br from-emerald-50 dark:from-emerald-300/[0.06] via-white dark:via-white/[0.025] to-cyan-50 dark:to-cyan-300/[0.05] p-5 sm:p-7">
          <span className="text-[11px] font-bold uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-300">
            Accuracy and official results
          </span>
          <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Use Arcade Points as a transparent community estimate</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                Official Google Cloud Arcade rules, eligibility checks, communications, and reward
                confirmation always take precedence. Unknown badges and limited public data are shown
                instead of being hidden so you can review the estimate yourself.
              </p>
            </div>
            <Link
              href="/about/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-300/20 bg-emerald-100 dark:bg-emerald-300/10 px-5 text-sm font-semibold text-emerald-800 dark:text-emerald-100 transition hover:bg-emerald-200 dark:hover:bg-emerald-300/15"
            >
              About Arcade Points
            </Link>
          </div>
        </section>
      </div>
    </InternalPageShell>
  )
}
