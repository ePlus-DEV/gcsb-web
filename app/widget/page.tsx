import type { Metadata } from "next"
import ArcadeEmbedWidget from "@/components/arcade/arcade-embed-widget"
import WidgetSourceBridge from "@/components/arcade/widget-source-bridge"
import WidgetThemeBridge from "@/components/arcade/widget-theme-bridge"
import "./widget.css"
import "./widget-theme.css"
import "./widget-default-light.css"
import "./widget-controls.css"

export const metadata: Metadata = {
  title: "Arcade Points Widget",
  description: "A compact embed for the Google Cloud Arcade Points tracker.",
  robots: { index: false, follow: true },
  other: {
    google: "notranslate",
  },
}

export default function WidgetPage() {
  return (
    <div
      className="notranslate"
      lang="en"
      translate="no"
      data-no-translate
    >
      <WidgetThemeBridge />
      <WidgetSourceBridge>
        <ArcadeEmbedWidget />
      </WidgetSourceBridge>
    </div>
  )
}
