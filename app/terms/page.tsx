"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, Download, FileText, Home } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
              <Link href="/privacy">Privacy</Link>
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
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
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
                  Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Google
                  Cloud Skills Boost - Helper browser extension.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">1. Agreement to Terms</h2>

                <p>
                  By accessing or using the Google Cloud Skills Boost - Helper extension, you agree to be bound by these
                  Terms. If you disagree with any part of the terms, you may not access or use the extension.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. Intellectual Property</h2>

                <p>
                  The Google Cloud Skills Boost - Helper extension and its original content, features, and functionality
                  are and will remain the exclusive property of the extension developers and its licensors. The
                  extension is protected by copyright, trademark, and other laws of both the United States and foreign
                  countries.
                </p>

                <p>
                  Our trademarks and trade dress may not be used in connection with any product or service without the
                  prior written consent of the extension developers.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. User Responsibilities</h2>

                <p>When using the Google Cloud Skills Boost - Helper extension, you agree to:</p>

                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>Use the extension in compliance with all applicable laws and regulations</li>
                  <li>
                    Not use the extension in any way that could damage, disable, overburden, or impair the extension or
                    interfere with any other party's use of the extension
                  </li>
                  <li>
                    Not attempt to gain unauthorized access to any part of the extension, other accounts, computer
                    systems, or networks connected to the extension
                  </li>
                  <li>Not use the extension to collect or harvest any personally identifiable information</li>
                  <li>Not use the extension for any commercial purposes without our express written consent</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">4. Disclaimer of Warranties</h2>

                <p>
                  The Google Cloud Skills Boost - Helper extension is provided "as is" and "as available" without any
                  warranties of any kind, either express or implied, including but not limited to the implied warranties
                  of merchantability, fitness for a particular purpose, or non-infringement.
                </p>

                <p>We do not warrant that:</p>

                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>
                    The extension will function uninterrupted, secure, or available at any particular time or location
                  </li>
                  <li>Any errors or defects will be corrected</li>
                  <li>The extension is free of viruses or other harmful components</li>
                  <li>The results of using the extension will meet your requirements</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">5. Limitation of Liability</h2>

                <p>
                  In no event shall the extension developers, its directors, employees, partners, agents, suppliers, or
                  affiliates be liable for any indirect, incidental, special, consequential, or punitive damages,
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                  resulting from:
                </p>

                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>Your access to or use of or inability to access or use the extension</li>
                  <li>Any conduct or content of any third party on the extension</li>
                  <li>Any content obtained from the extension</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">6. Third-Party Links</h2>

                <p>
                  The extension may contain links to third-party websites or services that are not owned or controlled
                  by the extension developers. We have no control over, and assume no responsibility for, the content,
                  privacy policies, or practices of any third-party websites or services.
                </p>

                <p>
                  You acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any
                  damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any
                  such content, goods, or services available on or through any such websites or services.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">7. Changes to Terms</h2>

                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will
                  provide notice of any changes by posting the new Terms on this page and updating the "Last updated"
                  date.
                </p>

                <p>
                  Your continued use of the extension after any such changes constitutes your acceptance of the new
                  Terms. If you do not agree to the new terms, you are no longer authorized to use the extension.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">8. Termination</h2>

                <p>
                  We may terminate or suspend your access to the extension immediately, without prior notice or
                  liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>

                <p>
                  All provisions of the Terms which by their nature should survive termination shall survive
                  termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and
                  limitations of liability.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">9. Governing Law</h2>

                <p>
                  These Terms shall be governed and construed in accordance with the laws of the United States, without
                  regard to its conflict of law provisions.
                </p>

                <p>
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those
                  rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the
                  remaining provisions of these Terms will remain in effect.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Us</h2>

                <p>If you have any questions about these Terms, please contact us at:</p>

                <p className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md my-4">
                  Email: terms@gcskillsboosthelper.com
                  <br />
                  GitHub: https://github.com/gcskillsboosthelper/extension/issues
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/privacy">Privacy Policy</Link>
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
