import { Chrome, Download, ExternalLink, Globe2 } from "lucide-react"
import type { WebsiteCatalog } from "@/lib/website-i18n"
import { CHROME_EXTENSION_URL, FIREFOX_EXTENSION_URL } from "@/lib/extension-store-urls"

export default function ExtensionStrip({ catalog }: { catalog: WebsiteCatalog }) {
  return (
    <section id="extension" className="extension-strip" data-home-order="extension">
      <span className="extension-store-mark"><Download /></span>
      <div className="extension-copy-block">
        <strong>{catalog.messages.installExtension}</strong>
        <span>{catalog.messages.automaticTracking}</span>
      </div>
      <div className="extension-store-actions">
        <a
          className="store-button is-chrome"
          href={CHROME_EXTENSION_URL}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Chrome /> Chrome <ExternalLink />
        </a>
        <a
          className="store-button is-firefox"
          href={FIREFOX_EXTENSION_URL}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Globe2 /> Firefox <ExternalLink />
        </a>
      </div>
    </section>
  )
}
