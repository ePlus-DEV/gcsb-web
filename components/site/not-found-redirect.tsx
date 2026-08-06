"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Clock, Gamepad2, Home, LoaderCircle } from "lucide-react"
import { WEBSITE_LOCALES } from "@/lib/website-i18n"

const REDIRECT_DELAY_SECONDS = 5
const PROFILE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function getPathWithoutBase(pathname: string): string {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "")
  return basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : pathname
}

function getProfileRedirectHref(pathname: string): string | null {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "")
  const segments = getPathWithoutBase(pathname).split("/").filter(Boolean)
  const route = segments[0]?.toLowerCase()
  const profileId = segments[1]
  const isProfileRoute = route === "profiles" || route === "public_profiles"

  if (segments.length !== 2 || !isProfileRoute || !PROFILE_ID_PATTERN.test(profileId)) return null

  return `${basePath}/profile/?id=${profileId}`
}

/** Keeps 404 redirects inside the locale that was requested, when possible. */
function getLocalizedHomeHref(pathname: string): string {
  const firstSegment = getPathWithoutBase(pathname).split("/").filter(Boolean)[0]
  const locale = WEBSITE_LOCALES.find(
    (item) =>
      item.path && item.path.toLowerCase() === firstSegment?.toLowerCase(),
  )

  return locale?.path ? `/${locale.path}/` : "/"
}

export default function NotFoundRedirect() {
  const pathname = usePathname()
  const router = useRouter()
  const profileRedirectHref = useMemo(
    () => getProfileRedirectHref(pathname ?? "/"),
    [pathname],
  )
  const homeHref = useMemo(
    () => getLocalizedHomeHref(pathname ?? "/"),
    [pathname],
  )
  const [secondsRemaining, setSecondsRemaining] = useState(
    REDIRECT_DELAY_SECONDS,
  )

  useEffect(() => {
    if (profileRedirectHref) {
      router.replace(profileRedirectHref)
      return
    }

    setSecondsRemaining(REDIRECT_DELAY_SECONDS)

    const countdownId = window.setInterval(() => {
      setSecondsRemaining((current) => Math.max(current - 1, 0))
    }, 1000)
    const redirectId = window.setTimeout(() => {
      router.replace(homeHref)
    }, REDIRECT_DELAY_SECONDS * 1000)

    return () => {
      window.clearInterval(countdownId)
      window.clearTimeout(redirectId)
    }
  }, [homeHref, profileRedirectHref, router])

  if (profileRedirectHref) {
    return (
      <main className="arcade-dashboard-page flex min-h-screen items-center justify-center px-4">
        <div className="arcade-stars" aria-hidden="true" />
        <section className="relative rounded-3xl border border-white/10 bg-slate-950/70 px-8 py-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-cyan-300" aria-hidden="true" />
          <h1 className="mt-5 text-2xl font-bold text-white">Loading shared profile…</h1>
        </section>
      </main>
    )
  }

  const progress =
    ((REDIRECT_DELAY_SECONDS - secondsRemaining) / REDIRECT_DELAY_SECONDS) * 100

  return (
    <div className="arcade-dashboard-page min-h-screen">
      <div className="arcade-stars" aria-hidden="true" />

      <header className="arcade-header">
        <Link
          className="arcade-brand"
          href={homeHref}
          aria-label="Arcade Points home"
        >
          <span className="arcade-brand-mark"><Gamepad2 /></span>
          <span className="arcade-brand-copy"><strong>ARCADE</strong><b>POINTS</b></span>
          <em>PRO</em>
        </Link>

        <nav className="arcade-nav" aria-label="Main navigation">
          <Link href={homeHref}>Calculator</Link>
          <Link href={`${homeHref}#tiers`}>Tiers</Link>
          <Link href={`${homeHref}#badges`}>Badges</Link>
          <Link href={`${homeHref}#extension`}>Extension</Link>
        </nav>

        <div className="arcade-header-actions" />
      </header>

      <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,.16),transparent_34%),radial-gradient(circle_at_75%_65%,rgba(99,102,241,.14),transparent_32%)]"
          aria-hidden="true"
        />

        <section className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute -right-8 -top-16 select-none font-mono text-[10rem] font-black leading-none text-white/[0.025] sm:text-[14rem]" aria-hidden="true">
            404
          </div>

          <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_50px_rgba(34,211,238,.12)]">
            <Clock className="absolute h-12 w-12 text-cyan-200/20" aria-hidden="true" />
            <span className="relative text-4xl font-extrabold text-white" aria-hidden="true">
              {secondsRemaining}
            </span>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[.28em] text-cyan-300">
            Error 404
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Page not found
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            The page may have been moved, renamed, or is no longer available.
            You will be returned to the homepage automatically.
          </p>

          <div className="mx-auto mt-7 max-w-md" aria-live="polite">
            <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
              <span>Redirecting to homepage</span>
              <span className="font-semibold text-cyan-200">
                {secondsRemaining} second{secondsRemaining === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-[width] duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={homeHref}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              <Home className="mr-2 h-4 w-4" /> Go home now
            </Link>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:border-white/25 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Go back
            </button>
          </div>
        </section>
      </main>

      <footer className="internal-page-footer border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} ePlus.DEV. Independent community project.</p>
          <Link href={homeHref} className="hover:text-white">Arcade Points homepage</Link>
        </div>
      </footer>
    </div>
  )
}
