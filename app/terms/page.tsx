import type { Metadata } from "next"
import Link from "next/link"
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
      <div className="not-prose space-y-10">
<section className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-5 dark:border-cyan-300/15 dark:from-cyan-300/[0.06] dark:via-white/[0.025] dark:to-violet-300/[0.06] sm:p-8">
 <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(210px,.65fr)] lg:items-center">
  <div>
   <span className="text-[11px] font-bold uppercase tracking-[.18em] text-cyan-700 dark:text-cyan-300">Terms at a glance</span>
   <h2 className="mt-3 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">Clear expectations for a community tool</h2>
   <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">By using Arcade Points by ePlus.DEV or the companion browser extension, you agree to these terms. Stop using the service if you do not agree.</p>
  </div>
  <aside className="rounded-2xl border border-slate-200 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-950/60">
   <h3 className="text-lg font-bold text-slate-950 dark:text-white">Useful links</h3>
   <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Learn how the calculator works and where to find more information.</p>
   <Link href="/guide/" className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-cyan-600 px-4 text-sm font-bold text-white transition hover:bg-cyan-700 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200">Read the guide</Link>
  </aside>
 </div>
</section>
<section aria-label="Service overview"><div className="mb-5">
 <span className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300">Project & estimates</span>
 <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">What the service provides</h2>
</div><div className="grid gap-4 md:grid-cols-2"><article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">1. Community tool</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Arcade Points is an independent community project. It is not affiliated with, sponsored by, or endorsed by Google. Google product names and trademarks belong to their respective owners.</p>
 </article>
<article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">2. Estimates and availability</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Point totals, badge classifications, reward tiers, slot availability, and Facilitator progress are estimates based on supported public information. Official program records and decisions always take precedence.</p>
 </article></div></section>
<section aria-label="Acceptable use"><div className="mb-5">
 <span className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300">Your responsibilities</span>
 <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">Use the service responsibly</h2>
</div><article className="rounded-2xl border border-amber-200 dark:border-amber-300/15 bg-amber-50 dark:bg-amber-300/[0.045] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">3. Acceptable use</h3>
  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
        <li>Use the service only for lawful personal or educational purposes.</li>
        <li>Do not attempt to bypass rate limits, access controls, or security measures.</li>
        <li>Do not disrupt the service, automate abusive traffic, or access non-public information.</li>
        <li>Do not present calculated results as official confirmation from Google or ePlus.DEV.</li>
      </ul>
 </article></section>
<section aria-label="Detailed terms"><div className="mb-5">
 <span className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300">Conditions & limitations</span>
 <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">Important terms</h2>
</div><div className="grid gap-4 md:grid-cols-2"><article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">4. Public profile responsibility</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">You are responsible for ensuring that any profile URL you submit is public and that you are permitted to use it. Do not submit private credentials, access tokens, passwords, or sensitive personal information.</p>
 </article>
<article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">5. Intellectual property</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">The project interface, original content, and code are protected by applicable licenses and intellectual-property laws. Third-party names, logos, and content remain the property of their owners.</p>
 </article>
<article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">6. No warranty</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">The service is provided “as is” and “as available.” We do not guarantee uninterrupted operation, complete badge detection, accurate reward eligibility, or continued compatibility with third-party websites.</p>
 </article>
<article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">7. Limitation of liability</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">To the maximum extent permitted by law, ePlus.DEV and project contributors are not liable for indirect, incidental, special, or consequential loss arising from use of or reliance on the service.</p>
 </article>
<article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">8. Changes</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Features and these terms may change as the Arcade program, Google Skills pages, browser APIs, or project infrastructure evolve. Continued use after an update means you accept the revised terms.</p>
 </article></div></section>
<section className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-slate-50 p-5 dark:border-cyan-300/15 dark:from-cyan-300/[0.06] dark:to-slate-950/40 sm:p-7">
 <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
  <div><span className="text-[11px] font-bold uppercase tracking-[.18em] text-cyan-700 dark:text-cyan-300">Contact</span>
   <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Questions about these terms?</h2>
   <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Questions about these terms can be sent to <a className="font-semibold text-cyan-700 underline underline-offset-4 dark:text-cyan-300" href="mailto:support@eplus.dev">support@eplus.dev</a>.</p>
  </div>
  <Link href="/privacy/" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white transition hover:bg-cyan-700 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200">Read Privacy Policy</Link>
 </div>
</section>
      </div>
    </InternalPageShell>
  )
}
