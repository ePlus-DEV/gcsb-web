"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function ChangelogRedirect() {
  useEffect(() => {
    window.location.replace("/guide/")
  }, [])

  return (
    <main className="grid min-h-screen place-items-center bg-[#070b16] px-6 text-center text-white">
      <div>
        <h1 className="text-2xl font-semibold">This page has moved</h1>
        <p className="mt-3 text-slate-400">
          The changelog is no longer published here. Redirecting to the guide.
        </p>
        <Link className="mt-6 inline-flex text-cyan-300 hover:text-cyan-200" href="/guide/">
          Continue to the guide
        </Link>
      </div>
    </main>
  )
}
