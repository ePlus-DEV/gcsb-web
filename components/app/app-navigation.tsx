import Link from "next/link"

const navItems = [
  { href: "/changelog/", label: "Changelog" },
  { href: "/privacy/", label: "Privacy" },
  { href: "/terms/", label: "Terms" },
]

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 text-white">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold shadow-lg shadow-cyan-500/20">
            AP
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold sm:text-base">Arcade Points</span>
            <span className="hidden text-xs text-slate-400 sm:block">Calculator & milestone tracker</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white sm:px-3 sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

export function AppFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 px-4 py-8 text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">Arcade Points by ePlus.DEV</p>
          <p className="mt-1 text-xs">Independent community tool. Results are estimates.</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
          <a
            href="https://ext.eplus.dev/google-cloud-skills-boost-helper/introduction"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            Extension
          </a>
        </nav>
      </div>
    </footer>
  )
}
