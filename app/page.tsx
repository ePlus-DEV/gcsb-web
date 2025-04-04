"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Chrome,
  ChromeIcon as Firefox,
  Globe,
  ArrowRight,
  ChevronDown,
  BarChart2,
  PieChart,
  Eye,
  Download,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function DownloadPage() {
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState("chrome")

  const chrome = "https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg/?utm_source=web"
  const firefox = "https://addons.mozilla.org/addon/cloud-skills-boost-helper?utm_source=web"
  const edge = "https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/releases/?utm_source=github"
  const opera = "https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/releases/?utm_source=github"

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
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Features
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex"
              onClick={() => document.getElementById("download")?.scrollIntoView({ behavior: "smooth" })}
            >
              Installation
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex"
              onClick={() => document.getElementById("screenshots")?.scrollIntoView({ behavior: "smooth" })}
            >
              Screenshots
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
              onClick={() => document.getElementById("download")?.scrollIntoView({ behavior: "smooth" })}
            >
              Download
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 -z-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-200 dark:bg-cyan-900/20 rounded-full blur-3xl opacity-50 -z-10"></div>

        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900">
                Browser Extension
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                Google Cloud Skills Boost - Helper
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Optimize your learning experience on Google Cloud Skills Boost with our powerful browser extension.
                Track progress, calculate Arcade points, and manage leaderboards efficiently!
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                  onClick={() => document.getElementById("download")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Download Now <Download className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Learn More <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    <Chrome className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    <Firefox className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    <Globe className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Available for all major browsers</span>
              </div>
              <div className="pt-4">
                <a
                  href="https://www.producthunt.com/posts/google-cloud-skills-boost-helper?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-google&#0045;cloud&#0045;skills&#0045;boost&#0045;helper"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=947339&theme=light&t=1743747200801"
                    alt="Google&#0032;Cloud&#0032;Skills&#0032;Boost&#0032;&#0045;&#0032;Helper - Optimize&#0032;Google&#0032;Cloud&#0032;learning&#0032;with&#0032;smart&#0032;tracking&#0032;tools&#0046; | Product Hunt"
                    style={{ width: "250px", height: "54px" }}
                    width="250"
                    height="54"
                  />
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-30 dark:opacity-40"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="h-8 bg-slate-100 dark:bg-slate-700 flex items-center px-4 gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 text-xs text-slate-500 dark:text-slate-400">Google Cloud Skills Boost</div>
                </div>
                <Image
                  src="/head.png"
                  alt="Extension screenshot"
                  width={300}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900">
              Key Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Supercharge Your Google Cloud Learning</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Our extension provides powerful tools to help you track progress, calculate points, and manage
              leaderboards efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart2 className="h-10 w-10 text-blue-500" />}
              title="Arcade Points Calculator"
              description="Automatically calculates and displays your Arcade points, helping you track your progress."
              gradient="from-blue-500 to-blue-600"
            />

            <FeatureCard
              icon={<PieChart className="h-10 w-10 text-cyan-500" />}
              title="Scoreboard with Quick Actions"
              description="Easily track your scores and take quick actions with our intuitive scoreboard interface."
              gradient="from-cyan-500 to-cyan-600"
            />

            <FeatureCard
              icon={<Eye className="h-10 w-10 text-indigo-500" />}
              title="Toggle Leaderboard Visibility"
              description="Customize the display of the leaderboard as needed with a simple toggle feature."
              gradient="from-indigo-500 to-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section id="screenshots" className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900">
              Screenshots
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Take a look at how Google Cloud Skills Boost - Helper enhances your learning experience.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Arcade Points Calculator",
                description: "Track your points in real-time with our intuitive calculator.",
                image: "/placeholder.svg?height=400&width=600&text=Arcade+Points+Calculator",
              },
              {
                title: "Scoreboard Interface",
                description: "View and manage your scores with our comprehensive scoreboard.",
                image: "/placeholder.svg?height=400&width=600&text=Scoreboard+Interface",
              },
              {
                title: "Leaderboard Toggle",
                description: "Customize your view by toggling leaderboard visibility.",
                image: "/placeholder.svg?height=400&width=600&text=Leaderboard+Toggle",
              },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="relative rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/80 to-cyan-500/80 opacity-0 group-hover:opacity-30 transition-opacity duration-300 z-10"></div>
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    width={600}
                    height={400}
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <Button variant="secondary" className="bg-white/90 hover:bg-white">
                      View Larger
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900">
              Installation
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in Minutes</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Choose your browser and follow the simple installation steps.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="chrome" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger
                  value="chrome"
                  className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-100"
                >
                  <Chrome className="h-5 w-5 mr-2" /> Chrome
                </TabsTrigger>
                <TabsTrigger
                  value="firefox"
                  className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-100"
                >
                  <Firefox className="h-5 w-5 mr-2" /> Firefox
                </TabsTrigger>
                <TabsTrigger
                  value="edge"
                  className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-100"
                >
                  <Globe className="h-5 w-5 mr-2" /> Edge
                </TabsTrigger>
                <TabsTrigger
                  value="opera"
                  className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900/50 dark:data-[state=active]:text-blue-100"
                >
                  <Globe className="h-5 w-5 mr-2" /> Opera
                </TabsTrigger>
              </TabsList>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <TabsContent value="chrome" className="m-0">
                  <BrowserTab
                    title="Chrome Web Store"
                    steps={[
                      "Visit the Chrome Web Store",
                      "Click 'Add to Chrome'",
                      "Confirm the installation when prompted",
                      "The extension will appear in your toolbar",
                    ]}
                    manualSteps={[
                      "Download and unzip google-cloud-skills-boost-helper-{version}-chrome.zip",
                      "Rename the extracted folder to google-cloud-helper",
                      "Open Chrome and go to Extensions",
                      "Enable Developer mode",
                      "Click 'Load unpacked extension...'",
                      "Select the google-cloud-helper folder you extracted",
                    ]}
                    image="/chrome.jpg"
                    downloadUrl={chrome}
                  />
                </TabsContent>

                <TabsContent value="firefox" className="m-0">
                  <BrowserTab
                    title="Firefox Add-ons"
                    steps={[
                      "Visit Firefox Add-ons website",
                      "Click 'Add to Firefox'",
                      "Confirm the installation when prompted",
                      "The extension will appear in your toolbar",
                    ]}
                    image="/firefox.jpg"
                    downloadUrl={firefox}
                  />
                </TabsContent>

                <TabsContent value="edge" className="m-0">
                  <BrowserTab
                    title="Microsoft Edge Add-ons"
                    steps={[
                      "Visit the Edge Add-ons store",
                      "Click 'Get'",
                      "Confirm the installation when prompted",
                      "The extension will appear in your toolbar",
                    ]}
                    image="/edge-browser.jpg"
                    downloadUrl={edge}
                  />
                </TabsContent>

                <TabsContent value="opera" className="m-0">
                  <BrowserTab
                    title="Opera Add-ons"
                    steps={[
                      "Visit the Opera Add-ons store",
                      "Click 'Add to Opera'",
                      "Confirm the installation when prompted",
                      "The extension will appear in your toolbar",
                    ]}
                    image="/opera-browser.jpg"
                    downloadUrl={opera}
                  />
                </TabsContent>

                <TabsContent value="other" className="m-0">
                  <BrowserTab
                    title="Manual Installation"
                    steps={[
                      "Download and unzip google-cloud-skills-boost-helper-{version}-chrome.zip",
                      "Rename the extracted folder to google-cloud-helper",
                      "Open Chrome and go to Extensions",
                      "Enable Developer mode",
                      "Click 'Load unpacked extension...'",
                      "Select the google-cloud-helper folder you extracted",
                    ]}
                    image="/chrome.jpg"
                    downloadUrl={chrome}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Why Use Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900">
              Benefits
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Use Google Cloud Skills Boost - Helper?</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Our extension provides several advantages to enhance your Google Cloud learning experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <WhyUseCard
              icon="🚀"
              title="Speed Up Learning"
              description="Accelerate your learning and practice on Google Cloud with our intuitive tools."
            />
            <WhyUseCard
              icon="📌"
              title="Track Arcade Scores"
              description="Easily track and improve your Arcade scores with our comprehensive tracking system."
            />
            <WhyUseCard
              icon="💡"
              title="Visualize Information"
              description="Better manage and optimize your learning strategy with our visualization tools."
            />
          </div>

          <div className="mt-16 text-center">
            <p className="text-xl font-medium mb-6">
              Try it today and conquer Google Cloud Skills Boost challenges smarter! 🌟
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
              onClick={() => document.getElementById("download")?.scrollIntoView({ behavior: "smooth" })}
            >
              Download Now <Download className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200&text=Pattern')] opacity-10 mix-blend-overlay"></div>
            <div className="relative p-8 md:p-12 text-white">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Ready to enhance your Google Cloud learning?</h2>
                  <p className="mb-6 text-blue-100">
                    Download Google Cloud Skills Boost - Helper today and take your learning experience to the next
                    level.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => document.getElementById("download")?.scrollIntoView({ behavior: "smooth" })}>
                      Download Now <Download className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="lg" className="text-blue-600 border-white hover:bg-white/10">
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-white/20 rounded-xl blur-sm"></div>
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">Easy Installation</h3>
                          <p className="text-sm text-blue-100">Available for all major browsers</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">Powerful Features</h3>
                          <p className="text-sm text-blue-100">Track points, manage leaderboards</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">Regular Updates</h3>
                          <p className="text-sm text-blue-100">New features and improvements</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <div className="flex gap-3">
                <a
                  href="https://facebook.com/hoangsvit"
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
                  href="https://twitter.com/david_nguyen94"
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-400 transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="http://github.com/hoangsvit"
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
                  <a href={chrome} className="text-slate-400 hover:text-white transition-colors">
                    Chrome
                  </a>
                </li>
                <li>
                  <a href={firefox} className="text-slate-400 hover:text-white transition-colors">
                    Firefox
                  </a>
                </li>
                <li>
                  <a href={edge} className="text-slate-400 hover:text-white transition-colors">
                    Edge
                  </a>
                </li>
                <li>
                  <a href={opera} className="text-slate-400 hover:text-white transition-colors">
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
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
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

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700">
      <CardContent className="p-6">
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300">{description}</p>
      </CardContent>
    </Card>
  )
}

interface WhyUseCardProps {
  icon: string
  title: string
  description: string
}

function WhyUseCard({ icon, title, description }: WhyUseCardProps) {
  return (
    <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300">{description}</p>
      </CardContent>
    </Card>
  )
}

interface BrowserTabProps {
  title: string
  steps: string[]
  manualSteps?: string[]
  image: string
  downloadUrl: string
}

function BrowserTab({ title, steps, manualSteps, image, downloadUrl }: BrowserTabProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8 p-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="mb-6">
          <h4 className="font-medium mb-2">Official Installation</h4>
          <ol className="space-y-2 ml-5 list-decimal">
            {steps.map((step, i) => (
              <li key={i} className="text-slate-600 dark:text-slate-300">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {manualSteps && (
          <div>
            <h4 className="font-medium mb-2">Manual Installation</h4>
            <ol className="space-y-2 ml-5 list-decimal">
              {manualSteps.map((step, i) => (
                <li key={i} className="text-slate-600 dark:text-slate-300">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        <Button
          asChild
          className="mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
        >
          <Link href={downloadUrl} target="_blank" rel="noopener noreferrer">
            Download <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-30"></div>
        <div className="relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <Image src={image || "/placeholder.svg"} alt={title} width={500} height={300} className="w-full h-auto" />
        </div>
      </div>
    </div>
  )
}

