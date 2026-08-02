import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowLeft, Chrome, Gamepad2, Globe2, Sparkles } from "lucide-react"
import {
  CHROME_EXTENSION_URL,
  FIREFOX_EXTENSION_URL,
} from "@/lib/extension-store-urls"

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
    <div className="arcade-dashboard-page min-h-screen">
      <div className="arcade-stars" aria-hidden="true" />

      <header className="arcade-header">
        <Link className="arcade-brand" href="/" aria-label="Arcade Points home">
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
          <em>PRO</em>
        </Link>

        <nav className="arcade-nav" aria-label="Main navigation">
          <Link href="/">Calculator</Link>
          <Link href="/about/">About</Link>
          <Link href="/guide/">Guide</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
        </nav>

        <div className="arcade-header-actions">
          <a
            className="header-store-link is-chrome"
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Install the extension from Chrome Web Store"
          >
            <Chrome /> <span>Chrome</span>
          </a>
          <a
            className="header-store-link is-firefox"
            href={FIREFOX_EXTENSION_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Install the extension from Firefox Add-ons"
          >
            <Globe2 /> <span>Firefox</span>
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,.18),transparent_40%)]" />
          <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <Link href="/" className="mb-8 inline-flex items-center text-sm text-slate-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to calculator
            </Link>
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> {eyebrow}
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">{title}</h1>
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
            <Link href="/" className="hover:text-white">Calculator</Link>
            <Link href="/about/" className="hover:text-white">About</Link>
            <Link href="/guide/" className="hover:text-white">Guide</Link>
            <Link href="/privacy/" className="hover:text-white">Privacy</Link>
            <Link href="/terms/" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
