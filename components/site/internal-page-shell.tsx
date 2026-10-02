import SiteHeader from "./site-header"
import SiteFooter from "./site-footer"
import type { ReactNode } from "react"
import { Sparkles } from "lucide-react"
import InternalBreadcrumbs from "@/components/site/internal-breadcrumbs"

export default function InternalPageShell({
  eyebrow,
  title,
  description,
  updated,
  children,
  breadcrumbs,
  catalogDriven,
}: {
  eyebrow: string
  title: string
  description: string
  updated?: string
  children: ReactNode
  breadcrumbs?: ReactNode
  catalogDriven?: boolean
}) {
  return (
    <div className="arcade-dashboard-page site-content-page min-h-screen">
      <div className="arcade-stars" aria-hidden="true" />

      <SiteHeader />

      <main className="internal-page-main" data-no-translate={catalogDriven || undefined}>
        <section className="internal-page-hero relative overflow-hidden border-b border-white/10">
          <div className="internal-page-glow absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,.18),transparent_40%)]" />
          <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            {breadcrumbs ?? <InternalBreadcrumbs />}
            <div className="max-w-3xl">
              <div className="internal-eyebrow mb-4 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> {eyebrow}
              </div>
              <h1 className="internal-page-title text-4xl font-bold tracking-tight text-white sm:text-6xl">{title}</h1>
              <p className="internal-page-description mt-5 text-lg leading-8 text-slate-300">{description}</p>
              {updated ? <p className="internal-page-updated mt-4 text-sm text-slate-500">{`Last updated: ${updated}`}</p> : null}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="internal-content-card site-surface p-6 sm:p-10">
            <div className="internal-prose prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-a:text-cyan-300">
              {children}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
