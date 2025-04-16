"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, Download, Home, Shield } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  const [scrolled, setScrolled] = useState(false)
  const lastUpdated = "April 10, 2025"

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
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link href="/changelog">Changelog</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link href="/terms">Terms</Link>
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
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
          </div>
          <div className="flex flex-wrap gap-3 mb-8">
            <Badge className="px-3 py-1.5 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Calendar className="h-3.5 w-3.5 mr-1.5" /> Last updated: {lastUpdated}
            </Badge>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-slate-200 dark:border-slate-700 shadow-md mb-8">
            <CardContent className="p-6 md:p-8">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="lead text-lg text-slate-600 dark:text-slate-300">
                  This Privacy Policy describes how your personal information is collected, used, and shared when you
                  use the Google Cloud Skills Boost - Helper browser extension.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>

                <p>
                  When you use our extension, we collect certain information about your interaction with Google Cloud
                  Skills Boost. This information includes:
                </p>

                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>Your Google Cloud Skills Boost username (if you choose to provide it)</li>
                  <li>Your Arcade points and scores</li>
                  <li>Your position on leaderboards</li>
                  <li>Your progress through Google Cloud Skills Boost courses</li>
                  <li>Extension settings and preferences</li>
                </ul>

                <p>
                  We do not collect any personal information beyond what is necessary for the functionality of the
                  extension.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>

                <p>We use the information we collect to:</p>

                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>Provide and maintain the core functionality of the extension</li>
                  <li>Calculate and display your Arcade points</li>
                  <li>Show your position on leaderboards</li>
                  <li>Save your preferences for future sessions</li>
                  <li>Improve the extension based on usage patterns</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Data Storage</h2>

                <p>
                  All data collected by the extension is stored locally on your device using browser storage mechanisms
                  (localStorage and/or chrome.storage). We do not transmit your data to our servers except in the
                  following cases:
                </p>

                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>Anonymous usage statistics (with your consent)</li>
                  <li>Error reporting (with your consent)</li>
                </ul>

                <p>
                  You can clear all stored data at any time by using the "Reset Data" option in the extension settings.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Services</h2>

                <p>
                  Our extension interacts with Google Cloud Skills Boost to retrieve and display information. We do not
                  share your data with any third parties beyond what is necessary for the extension to function.
                </p>

                <p>
                  The extension may contain links to external websites or services. This Privacy Policy only applies to
                  our extension, and we are not responsible for the privacy practices or content of any third-party
                  websites or services.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>

                <p>
                  Depending on your location, you may have certain rights regarding your personal information,
                  including:
                </p>

                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>The right to access the personal information we have about you</li>
                  <li>The right to request that we delete your personal information</li>
                  <li>The right to object to the processing of your personal information</li>
                  <li>The right to data portability</li>
                </ul>

                <p>To exercise any of these rights, please contact us using the information provided below.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Privacy Policy</h2>

                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or for other
                  operational, legal, or regulatory reasons. We will notify you of any changes by posting the new
                  Privacy Policy on this page and updating the "Last updated" date.
                </p>

                <p>
                  We encourage you to review this Privacy Policy periodically to stay informed about how we are
                  protecting your information.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>

                <p>
                  If you have any questions or concerns about this Privacy Policy or our data practices, please contact
                  us at:
                </p>

                <p className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md my-4">
                  Email: privacy@eplus.dev
                  <br />
                  GitHub: <a className="text-blue-600" href="https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues">https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues</a>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/terms">Terms of Service</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/changelog">Changelog</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
            >
              <Link href="/#download">
                <Download className="h-4 w-4 mr-2" /> Download Extension
              </Link>
            </Button>
          </div>
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
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/changelog" className="text-slate-400 hover:text-white transition-colors">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Email
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
              <Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">
                Terms
              </Link>
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
