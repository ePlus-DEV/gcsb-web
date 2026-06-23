"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Code,
  Download,
  ExternalLink,
  Github,
  Home,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react"
import Link from "next/link"

type ChangeType = "feature" | "improvement" | "fix"

type Change = {
  type: ChangeType
  title: string
  description: string
  pullRequest?: string
}

type Release = {
  version: string
  date: string
  status?: "Latest"
  summary: string
  changes: Change[]
}

const repositoryUrl = "https://github.com/ePlus-DEV/google-cloud-skills-boost-helper"
const releasesUrl = `${repositoryUrl}/releases`

const changelogData: Release[] = [
  {
    version: "1.2.9",
    date: "March 23, 2026",
    status: "Latest",
    summary: "Search matching refinements plus automated dependency and GitHub Actions maintenance.",
    changes: [
      {
        type: "feature",
        title: "Smarter search tokenization",
        description: "Improves word tokenization and matching for hyphenated or compound terms in search results.",
        pullRequest: "#100",
      },
      {
        type: "improvement",
        title: "Release automation maintenance",
        description: "Updates GitHub Actions upload, checkout, and setup-node workflows to newer major versions.",
        pullRequest: "#95–#97",
      },
      {
        type: "improvement",
        title: "Dependency refresh",
        description: "Refreshes production and development dependencies to keep the extension build current.",
        pullRequest: "#98–#99",
      },
    ],
  },
  {
    version: "1.2.8",
    date: "March 13, 2026",
    summary: "Stability release focused on dependency updates and release packaging.",
    changes: [
      {
        type: "improvement",
        title: "Dependency upgrades",
        description: "Updates dependabot/fetch-metadata, axios, and rollup for more reliable development and release workflows.",
        pullRequest: "#90–#92",
      },
      {
        type: "fix",
        title: "Versioned release package",
        description: "Publishes the v1.2.8 release package for supported browser builds.",
        pullRequest: "#93",
      },
    ],
  },
  {
    version: "1.2.7",
    date: "January 11, 2026",
    summary: "Small release package update for the browser extension.",
    changes: [
      {
        type: "fix",
        title: "Release package update",
        description: "Ships the v1.2.7 extension package and related release artifacts.",
        pullRequest: "#89",
      },
    ],
  },
  {
    version: "1.2.6",
    date: "January 10, 2026",
    summary: "Development-to-release handoff for v1.2.6.",
    changes: [
      {
        type: "improvement",
        title: "Development build finalized",
        description: "Promotes the v1.2.6 development work into a public release.",
        pullRequest: "#87–#88",
      },
    ],
  },
  {
    version: "1.2.5",
    date: "December 29, 2025",
    summary: "Security hardening and dependency maintenance.",
    changes: [
      {
        type: "fix",
        title: "Code scanning follow-up",
        description: "Addresses workflow permission and insecure randomness code scanning alerts.",
        pullRequest: "#76–#77",
      },
      {
        type: "improvement",
        title: "Maintenance updates",
        description: "Includes dependency and release hygiene improvements from the public changelog.",
      },
    ],
  },
]

const typeConfig = {
  feature: {
    label: "Features",
    singular: "Feature",
    icon: Plus,
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    iconWrap: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  improvement: {
    label: "Improvements",
    singular: "Improvement",
    icon: Zap,
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    iconWrap: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
  },
  fix: {
    label: "Fixes",
    singular: "Fix",
    icon: CheckCircle2,
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    iconWrap: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  },
}

export default function ChangelogPage() {
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [query, setQuery] = useState("")

  const latestRelease = changelogData[0]
  const totalChanges = changelogData.reduce((total, release) => total + release.changes.length, 0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-950 dark:text-white">
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-white/10 bg-slate-950/85 shadow-2xl shadow-blue-950/20 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold shadow-lg shadow-cyan-500/20">
              GC
            </div>
            <div>
              <span className="hidden font-semibold sm:block">Google Cloud Skills Boost - Helper</span>
              <span className="font-semibold sm:hidden">GC Helper</span>
              <p className="hidden text-xs text-slate-400 md:block">Release notes & product updates</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" asChild className="hidden text-slate-200 hover:bg-white/10 hover:text-white md:flex">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Home
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden text-slate-200 hover:bg-white/10 hover:text-white md:flex">
              <a href={releasesUrl} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" /> GitHub
              </a>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600" asChild>
              <Link href="/#download">
                <Download className="mr-2 h-4 w-4" /> Download
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.34),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.24),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_42%,_#f8fafc_42%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.34),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.24),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_48%,_#020617_48%,_#020617_100%)]">
        <section className="container mx-auto px-4 pb-12 pt-32 text-white lg:pb-20">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <Button variant="outline" size="sm" asChild className="mb-6 border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
              </Button>
              <Badge className="mb-5 border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 text-cyan-100 hover:bg-cyan-400/10">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Synced from GitHub releases
              </Badge>
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
                Changelog được thiết kế lại chuyên nghiệp hơn
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                Theo dõi các bản phát hành mới nhất của Google Cloud Skills Boost - Helper: tính năng mới, cải tiến,
                sửa lỗi và các gói cài đặt từ GitHub release chính thức.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button className="bg-white text-slate-950 hover:bg-slate-100" asChild>
                  <a href={`${releasesUrl}/latest`} target="_blank" rel="noopener noreferrer">
                    View latest release <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" asChild>
                  <Link href="/#download">
                    Download extension <Download className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <Card className="border-white/10 bg-white/10 text-white shadow-2xl shadow-blue-950/40 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Latest stable</p>
                    <h2 className="mt-2 text-4xl font-bold">v{latestRelease.version}</h2>
                  </div>
                  <PackageCheck className="h-12 w-12 text-cyan-300" />
                </div>
                <p className="mt-4 text-slate-300">{latestRelease.summary}</p>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <StatCard label="Releases" value={changelogData.length.toString()} />
                  <StatCard label="Changes" value={totalChanges.toString()} />
                  <StatCard label="Latest" value="2026" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <Card className="border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
            <CardContent className="p-4 md:p-8">
              <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Tìm theo version, pull request, feature, dependency..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-700 outline-none ring-blue-500/20 transition focus:border-blue-400 focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Badge variant="outline" className="px-3 py-1.5">
                    <Calendar className="mr-1.5 h-3.5 w-3.5" /> Updated from releases
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1.5">
                    <Code className="mr-1.5 h-3.5 w-3.5" /> v{latestRelease.version}
                  </Badge>
                </div>
              </div>

              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-8 grid h-auto grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-950 md:grid-cols-4">
                  <TabsTrigger value="all" className="rounded-xl py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-cyan-200">
                    All updates
                  </TabsTrigger>
                  {Object.entries(typeConfig).map(([type, config]) => {
                    const Icon = config.icon
                    return (
                      <TabsTrigger key={type} value={type} className="rounded-xl py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-cyan-200">
                        <Icon className="mr-2 h-4 w-4" /> {config.label}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <ChangelogList query={query} />
                </TabsContent>
                <TabsContent value="feature" className="mt-0">
                  <ChangelogList filter="feature" query={query} />
                </TabsContent>
                <TabsContent value="improvement" className="mt-0">
                  <ChangelogList filter="improvement" query={query} />
                </TabsContent>
                <TabsContent value="fix" className="mt-0">
                  <ChangelogList filter="fix" query={query} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-slate-950 px-4 py-10 text-slate-400">
        <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm">© {new Date().getFullYear()} Google Cloud Skills Boost - Helper.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <a href={repositoryUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wider text-slate-300">{label}</div>
    </div>
  )
}

function ChangelogList({ filter, query }: { filter?: ChangeType; query: string }) {
  const normalizedQuery = query.trim().toLowerCase()

  const filteredData = useMemo(() => {
    return changelogData
      .map((release) => {
        const changes = release.changes.filter((change) => {
          const matchesType = filter ? change.type === filter : true
          const searchable = [release.version, release.date, release.summary, change.type, change.title, change.description, change.pullRequest]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
          const matchesQuery = normalizedQuery ? searchable.includes(normalizedQuery) : true

          return matchesType && matchesQuery
        })

        return { ...release, changes }
      })
      .filter((release) => release.changes.length > 0)
  }, [filter, normalizedQuery])

  if (filteredData.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
        <Search className="mx-auto mb-4 h-10 w-10 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Không tìm thấy cập nhật phù hợp</h3>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Thử đổi từ khóa hoặc chuyển sang tab All updates.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {filteredData.map((release, index) => (
        <article key={release.version} className="relative grid gap-5 md:grid-cols-[150px_1fr]">
          <div className="md:text-right">
            <div className="sticky top-24 inline-flex flex-col items-start gap-2 md:items-end">
              <Badge className="bg-slate-950 px-3 py-1.5 text-white hover:bg-slate-950 dark:bg-white dark:text-slate-950">
                v{release.version}
              </Badge>
              {release.status && <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-100">{release.status}</Badge>}
              <span className="text-sm text-slate-500 dark:text-slate-400">{release.date}</span>
            </div>
          </div>

          <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 md:p-6">
            {index < filteredData.length - 1 && <div className="absolute -bottom-8 left-8 h-8 w-px bg-slate-200 dark:bg-slate-800" />}
            <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Version {release.version}</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{release.summary}</p>
              </div>
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <a href={`${releasesUrl}/tag/v.${release.version}`} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" /> Release
                </a>
              </Button>
            </div>

            <div className="space-y-3">
              {release.changes.map((change) => {
                const config = typeConfig[change.type]
                const Icon = config.icon

                return (
                  <div key={`${release.version}-${change.title}`} className="flex gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.iconWrap}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-slate-950 dark:text-white">{change.title}</h4>
                        <Badge className={`text-xs ${config.badge}`}>{config.singular}</Badge>
                        {change.pullRequest && <span className="text-xs font-medium text-slate-400">{change.pullRequest}</span>}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{change.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </article>
      ))}

      <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-cyan-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 h-6 w-6 text-blue-600 dark:text-cyan-300" />
            <div>
              <h3 className="font-semibold text-slate-950 dark:text-white">Nguồn dữ liệu changelog</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Nội dung được biên tập lại từ GitHub Releases để dễ đọc hơn trên website.
              </p>
            </div>
          </div>
          <Button asChild>
            <a href={releasesUrl} target="_blank" rel="noopener noreferrer">
              Open all releases <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
