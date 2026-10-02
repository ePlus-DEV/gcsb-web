"use client"

import SiteHeader from "@/components/site/site-header"
import SiteFooter from "@/components/site/site-footer"
import Link from "next/link"
import { useEffect } from "react"

const GUIDE_HREF = `${(process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")}/guide/`

export default function ChangelogRedirect() {
  useEffect(() => {
    window.location.replace(GUIDE_HREF)
  }, [])

  return (
    <div className="arcade-dashboard-page min-h-screen">
      <SiteHeader />
      <main className="grid min-h-[70vh] place-items-center px-6 text-center text-foreground">
      <div className="site-surface p-8">
        <h1 className="text-2xl font-semibold">This page has moved</h1>
        <p className="mt-3 text-muted-foreground">
          The changelog is no longer published here. Redirecting to the guide.
        </p>
        <Link className="mt-6 inline-flex text-primary hover:underline" href={GUIDE_HREF}>
          Continue to the guide
        </Link>
      </div>
      </main>
      <SiteFooter />
    </div>
  )
}
