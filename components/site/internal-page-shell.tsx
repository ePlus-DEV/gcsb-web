import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowLeft, Download, Sparkles } from "lucide-react"

export default function InternalPageShell({
  eyebrow,
  title,
  description,
  updated,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  updated?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#070b16] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b16]/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 font-bold text-cyan-200">A+</div>
            <div>
              <p className="font-semibold">Arcade Points</p>
              <p className="text-xs text-slate-400">by ePlus.DEV</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1 text-sm text-slate-300">
            <Link href="/changelog" className="hidden rounded-lg px-3 py-2 hover:bg-white/10 sm:block">Changelog</Link>
            <Link href="/privacy" className="hidden rounded-lg px-3 py-2 hover:bg-white/10 md:block">Privacy</Link>
            <Link href="/terms" className="hidden rounded-lg px-3 py-2 hover:bg-white/10 md:block">Terms</Link>
            <Link href="/#download" className="ml-2 inline-flex items-center rounded-xl bg-white px-3 py-2 font-medium text-slate-950 hover:bg-cyan-100">
              <Download className="mr-2 h-4 w-4" /> Extension
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,.18),transparent_40%)]" />
          <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <Link href="/" className="mb-8 inline-flex items-center text-sm text-slate-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to landing page
            </Link>
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> {eyebrow}
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{title}</h1>
              <p className="mt-5 text-lg leading-8 text-slate-300">{description}</p>
              {updated ? <p className="mt-4 text-sm text-slate-500">Last updated: {updated}</p> : null}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 sm:p-10">
            <div className="prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-a:text-cyan-300">
              {children}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} ePlus.DEV. Independent community project.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/changelog" className="hover:text-white">Changelog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
