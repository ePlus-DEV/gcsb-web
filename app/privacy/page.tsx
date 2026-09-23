import type { Metadata } from "next"
import Link from "next/link"
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
      <div className="not-prose space-y-10">
<section className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-5 dark:border-cyan-300/15 dark:from-cyan-300/[0.06] dark:via-white/[0.025] dark:to-violet-300/[0.06] sm:p-8">
 <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(210px,.65fr)] lg:items-center">
  <div>
   <span className="text-[11px] font-bold uppercase tracking-[.18em] text-cyan-700 dark:text-cyan-300">Privacy at a glance</span>
   <h2 className="mt-3 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">Your public profile is all the calculator needs</h2>
   <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">Arcade Points by ePlus.DEV is designed to work with information you intentionally provide, such as a public Google Skills profile URL. We do not ask for your Google password or private account access.</p>
  </div>
  <aside className="rounded-2xl border border-slate-200 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-950/60">
   <h3 className="text-lg font-bold text-slate-950 dark:text-white">Useful links</h3>
   <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Learn how the calculator works and where to find more information.</p>
   <Link href="/guide/" className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-cyan-600 px-4 text-sm font-bold text-white transition hover:bg-cyan-700 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200">How the calculator works</Link>
  </aside>
 </div>
</section>
<section aria-label="Information and purpose"><div className="mb-5">
 <span className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300">Information & purpose</span>
 <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">What we process and why</h2>
</div><div className="grid gap-4 md:grid-cols-2"><article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">Information processed</h3>
  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
        <li>Public badge and profile information available from the profile URL you submit.</li>
        <li>Calculated point totals, milestone estimates, and interface preferences.</li>
        <li>Aggregated website usage information collected through Google Analytics.</li>
      </ul>
 </article><article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">How information is used</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Information is used to calculate estimated Arcade points, display badge and Facilitator progress, remember interface preferences, improve reliability, understand website usage, and diagnose errors. Calculated results are estimates and are not official Google program records.</p>
 </article></div></section>
<section aria-label="Browser storage and analytics"><div className="mb-5">
 <span className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300">Browser data</span>
 <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">Storage and analytics</h2>
</div><div className="grid gap-4 lg:grid-cols-2"><article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">Essential browser storage</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">The website and extension may store recent results, theme, language, interface preferences, and acknowledgement of the cookie information notice in browser storage on your device. You can remove this information by clearing site data, resetting the extension, or uninstalling it.</p>
 </article><article className="rounded-2xl border border-violet-200 dark:border-violet-300/15 bg-violet-50 dark:bg-violet-300/[0.045] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">Analytics and cookies</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Google Analytics is enabled when the production website loads. It may collect aggregated information such as page visits, browser or device details, and general interaction data. The cookie information popup is provided for transparency and does not include an analytics disable control.</p>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Google Analytics does not provide this website with your Google password, private Google account content, or private Google Skills profile data. Browser privacy controls, content blockers, and site-data settings may affect whether analytics requests or cookies are available.</p>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">You can reopen the information notice at any time:</p>
      <CookiePreferencesButton />
 </article></div></section>
<section aria-label="Services and controls"><div className="mb-5">
 <span className="text-[11px] font-bold uppercase tracking-[.18em] text-violet-700 dark:text-violet-300">Services & sharing</span>
 <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">Where information goes</h2>
</div><div className="grid gap-4 md:grid-cols-2"><article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">Service requests</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">When a public profile is analyzed, the submitted public URL may be sent to the service used to retrieve and process public profile information. Runtime endpoints, credentials, and internal service configuration are not exposed in public documentation.</p>
 </article>
<article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">Third-party services</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">The product links to or interacts with Google Skills, browser extension stores, and Google Analytics. Those services operate under their own privacy policies. This project is independent and is not affiliated with or endorsed by Google.</p>
 </article>
<article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">Data sharing</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">We do not sell personal information. Information is shared only with infrastructure and analytics providers required to operate and improve the service, when legally required, or when you initiate an interaction with a third-party service.</p>
 </article>
<article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.035] p-5 sm:p-7 ">
  <h3 className="text-xl font-bold text-slate-950 dark:text-white">Your controls</h3>
  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">You may review this notice, clear locally stored site data, use browser privacy or content-blocking controls, stop using the service, or request assistance regarding information under our control.</p>
 </article></div></section>
<section className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-slate-50 p-5 dark:border-cyan-300/15 dark:from-cyan-300/[0.06] dark:to-slate-950/40 sm:p-7">
 <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
  <div><span className="text-[11px] font-bold uppercase tracking-[.18em] text-cyan-700 dark:text-cyan-300">Contact</span>
   <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Questions about privacy?</h2>
   <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Questions about privacy can be sent to <a className="font-semibold text-cyan-700 underline underline-offset-4 dark:text-cyan-300" href="mailto:privacy@eplus.dev">privacy@eplus.dev</a>.</p>
  </div>
  <Link href="/terms/" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white transition hover:bg-cyan-700 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200">Read Terms of Service</Link>
 </div>
</section>
      </div>
    </InternalPageShell>
  )
}
