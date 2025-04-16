"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Code,
  Download,
  FileText,
  Github,
  Home,
  Plus,
  Search,
  Zap,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"

export default function ChangelogPage() {
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">
              GC
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">Google Cloud Skills Boost - Helper</span>
            <span className="font-semibold text-lg sm:hidden">GC Helper</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" /> Home
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <FileText className="h-4 w-4 mr-2" /> Documentation
            </Button>
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Github className="h-4 w-4 mr-2" /> GitHub
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
              asChild
            >
              <Link href="/#download">
                <Download className="h-4 w-4 mr-2" /> Download
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 -z-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-200 dark:bg-cyan-900/20 rounded-full blur-3xl opacity-50 -z-10"></div>

        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Changelog</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Track the evolution of Google Cloud Skills Boost - Helper with our detailed changelog. See new features,
            improvements, and bug fixes for each version.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Badge className="px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900">
              Latest: v2.1.0
            </Badge>
            <Badge className="px-3 py-1.5 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Calendar className="h-3.5 w-3.5 mr-1.5" /> Last updated: April 15, 2025
            </Badge>
            <Badge className="px-3 py-1.5 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Code className="h-3.5 w-3.5 mr-1.5" /> 15 releases
            </Badge>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-4 mb-8">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search changelog..."
                className="flex-1 bg-transparent border-none outline-none text-slate-600 dark:text-slate-300 placeholder:text-slate-400"
              />
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-100"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-100"
              >
                <Plus className="h-4 w-4 mr-2" /> Features
              </TabsTrigger>
              <TabsTrigger
                value="improvements"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-100"
              >
                <Zap className="h-4 w-4 mr-2" /> Improvements
              </TabsTrigger>
              <TabsTrigger
                value="fixes"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-100"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Fixes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <ChangelogList />
            </TabsContent>

            <TabsContent value="features" className="mt-0">
              <ChangelogList filter="feature" />
            </TabsContent>

            <TabsContent value="improvements" className="mt-0">
              <ChangelogList filter="improvement" />
            </TabsContent>

            <TabsContent value="fixes" className="mt-0">
              <ChangelogList filter="fix" />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">
                  GC
                </div>
                <span className="font-semibold text-white">Google Cloud Skills Boost - Helper</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                A browser extension designed to optimize your learning experience on Google Cloud Skills Boost.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-400 transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Browsers</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Chrome
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Firefox
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Edge
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Opera
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Google Cloud Skills Boost - Helper. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface ChangelogListProps {
  filter?: "feature" | "improvement" | "fix"
}

function ChangelogList({ filter }: ChangelogListProps) {
  // Sample changelog data
  const changelogData = [
    {
      version: "2.1.0",
      date: "April 15, 2025",
      changes: [
        {
          type: "feature",
          title: "Added dark mode support",
          description: "Users can now toggle between light and dark themes.",
        },
        {
          type: "improvement",
          title: "Enhanced Arcade points calculation",
          description: "Improved algorithm for more accurate point calculations.",
        },
        {
          type: "fix",
          title: "Fixed leaderboard display issue",
          description: "Resolved an issue where the leaderboard would sometimes not display correctly.",
        },
      ],
    },
    {
      version: "2.0.0",
      date: "March 22, 2025",
      changes: [
        {
          type: "feature",
          title: "Complete UI redesign",
          description: "Completely redesigned the user interface for better usability and aesthetics.",
        },
        {
          type: "feature",
          title: "Added export functionality",
          description: "Users can now export their scores and progress as CSV or PDF.",
        },
        {
          type: "improvement",
          title: "Performance optimization",
          description: "Reduced memory usage and improved overall performance.",
        },
        {
          type: "fix",
          title: "Fixed compatibility issues with latest Chrome version",
          description: "Resolved compatibility issues with Chrome v120.",
        },
      ],
    },
    {
      version: "1.5.2",
      date: "February 10, 2025",
      changes: [
        {
          type: "improvement",
          title: "Updated API endpoints",
          description: "Updated to use the latest Google Cloud Skills Boost API endpoints.",
        },
        {
          type: "fix",
          title: "Fixed login persistence issue",
          description: "Resolved an issue where login state would not persist after browser restart.",
        },
      ],
    },
    {
      version: "1.5.1",
      date: "January 15, 2025",
      changes: [
        {
          type: "fix",
          title: "Fixed scoring bug",
          description: "Fixed a bug that caused incorrect score calculations in certain scenarios.",
        },
        {
          type: "fix",
          title: "Addressed Firefox-specific issues",
          description: "Fixed several issues that were specific to Firefox users.",
        },
      ],
    },
    {
      version: "1.5.0",
      date: "December 5, 2024",
      changes: [
        {
          type: "feature",
          title: "Added notification system",
          description: "Users now receive notifications for important events and updates.",
        },
        {
          type: "improvement",
          title: "Enhanced data visualization",
          description: "Improved charts and graphs for better data visualization.",
        },
        {
          type: "improvement",
          title: "Updated documentation",
          description: "Comprehensive update to user documentation and help resources.",
        },
      ],
    },
  ]

  // Filter changes if a filter is provided
  const filteredData = filter
    ? changelogData
        .map((release) => ({
          ...release,
          changes: release.changes.filter((change) => change.type === filter),
        }))
        .filter((release) => release.changes.length > 0)
    : changelogData

  return (
    <div className="space-y-12">
      {filteredData.map((release, index) => (
        <div key={index} className="relative">
          {/* Timeline connector */}
          {index < filteredData.length - 1 && (
            <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
          )}

          <div className="flex gap-6">
            {/* Version badge */}
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-semibold">
                v{release.version.split(".")[0]}
              </div>
            </div>

            {/* Release content */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h3 className="text-2xl font-bold">Version {release.version}</h3>
                <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" /> {release.date}
                </Badge>
              </div>

              <Card className="mb-6 border-slate-200 dark:border-slate-700">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {release.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center ${
                              change.type === "feature"
                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : change.type === "improvement"
                                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {change.type === "feature" ? (
                              <Plus className="h-3.5 w-3.5" />
                            ) : change.type === "improvement" ? (
                              <Zap className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{change.title}</h4>
                              <Badge
                                className={`text-xs ${
                                  change.type === "feature"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                                    : change.type === "improvement"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                                }`}
                              >
                                {change.type}
                              </Badge>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 mt-1">{change.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="text-xs">
                  <Github className="h-3.5 w-3.5 mr-1.5" /> View on GitHub
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download v{release.version}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center pt-8">
        <Button variant="outline">
          Load More Versions <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
