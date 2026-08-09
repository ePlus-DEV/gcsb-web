import type { Metadata } from "next"
import ArcadeEmbedWidget from "@/components/arcade/arcade-embed-widget"
import "./widget.css"
import "./widget-theme.css"

export const metadata: Metadata = {
  title: "Arcade Points Widget",
  description: "A compact embed for the Google Cloud Arcade Points tracker.",
  robots: { index: false, follow: true },
  other: {
    google: "notranslate",
  },
}

export default function WidgetPage() {
  return <ArcadeEmbedWidget />
}
