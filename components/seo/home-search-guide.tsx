import Link from "next/link"
import { ExternalLink } from "lucide-react"
import type { WebsiteCatalog } from "@/lib/website-i18n"

/** Compact help destinations replace duplicate instructions and tier explanations. */
export default function HomeSearchGuide({ catalog }: { catalog: WebsiteCatalog }) {
  const m = catalog.messages
  return (
    <section id="arcade-seo-guide" data-home-order="about" aria-labelledby="arcade-seo-guide-title" className="home-help-strip">
      <h2 id="arcade-seo-guide-title">{m.aboutArcade}</h2>
      <div className="home-help-links">
        <Link href="/guide/" data-home-discovery-card="guide">{m.stepGuide}<ExternalLink aria-hidden="true" /></Link>
        <Link href="/swag-drops/2026/" data-home-discovery-card="rewards">{catalog.additional["Arcade 2026 rewards"]}<ExternalLink aria-hidden="true" /></Link>
        <Link href="/about/" data-home-discovery-card="accuracy">{m.accuracyOfficial}<ExternalLink aria-hidden="true" /></Link>
      </div>
    </section>
  )
}
