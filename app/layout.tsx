import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Google Cloud Skills Boost - Helper',
  description: 'Optimize your learning experience on Google Cloud Skills Boost with our powerful browser extension. Track progress, calculate Arcade points, and manage leaderboards efficiently!',
  generator: 'eplus.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
