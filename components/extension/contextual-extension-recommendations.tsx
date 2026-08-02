"use client"

import { Chrome, ExternalLink, Globe2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  CHROME_EXTENSION_URL,
  FIREFOX_EXTENSION_URL,
} from "@/lib/extension-store-urls"

type RecommendationTarget = {
  selector: string
  eyebrow: string
  title: string
  description: string
}

const TARGETS: RecommendationTarget[] = [
  {
    selector: ".breakdown-panel",
    eyebrow: "Faster next time",
    title: "Skip repeated profile URL entry",
    description:
      "The web calculator remains fully available. Install the extension only when you want your profile and score tools closer while browsing Google Skills.",
  },
  {
    selector: ".badges-panel",
    eyebrow: "Use your result while browsing",
    title: "Keep badge insights closer to Skills Boost",
    description:
      "Continue exploring every badge on the website, or use the extension as a convenient companion during your normal Skills Boost workflow.",
  },
  {
    selector: ".tier-status-panel",
    eyebrow: "For frequent progress checks",
    title: "Reduce repetitive Arcade checks",
    description:
      "The website provides the complete tier overview. The extension is recommended when you check progress often and want quicker access from the browser.",
  },
]

function RecommendationCard({ target }: { target: RecommendationTarget }) {
  return (
    <aside className="contextual-extension-card" aria-label="Optional extension recommendation">
      <span className="contextual-extension-card__icon" aria-hidden="true">
        <Sparkles />
      </span>
      <div className="contextual-extension-card__copy">
        <small>{target.eyebrow}</small>
        <strong>{target.title}</strong>
        <p>{target.description}</p>
      </div>
      <div className="contextual-extension-card__actions">
        <a href={CHROME_EXTENSION_URL} target="_blank" rel="noreferrer noopener">
          <Chrome aria-hidden="true" /> Chrome <ExternalLink aria-hidden="true" />
        </a>
        <a href={FIREFOX_EXTENSION_URL} target="_blank" rel="noreferrer noopener">
          <Globe2 aria-hidden="true" /> Firefox <ExternalLink aria-hidden="true" />
        </a>
      </div>
    </aside>
  )
}

export default function ContextualExtensionRecommendations() {
  const [targets, setTargets] = useState<Array<{ element: Element; config: RecommendationTarget }>>([])

  useEffect(() => {
    const syncTargets = () => {
      const next = TARGETS.flatMap((config) => {
        const element = document.querySelector(config.selector)
        return element ? [{ element, config }] : []
      })

      setTargets((current) => {
        const unchanged =
          current.length === next.length &&
          current.every((item, index) => item.element === next[index]?.element)
        return unchanged ? current : next
      })
    }

    syncTargets()
    const observer = new MutationObserver(syncTargets)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {targets.map(({ element, config }) =>
        createPortal(<RecommendationCard target={config} />, element),
      )}
      <style jsx global>{`
        .contextual-extension-card {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          margin-top: 18px;
          padding: 14px;
          border: 1px solid rgba(96, 165, 250, 0.28);
          border-radius: 14px;
          background: rgba(37, 99, 235, 0.08);
        }

        .contextual-extension-card__icon {
          display: grid;
          width: 36px;
          height: 36px;
          place-items: center;
          border-radius: 11px;
          background: rgba(37, 99, 235, 0.18);
          color: #93c5fd;
        }

        .contextual-extension-card__icon svg {
          width: 18px;
          height: 18px;
        }

        .contextual-extension-card__copy {
          min-width: 0;
        }

        .contextual-extension-card__copy small {
          display: block;
          margin-bottom: 3px;
          color: #93c5fd;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .contextual-extension-card__copy strong {
          display: block;
          color: #f8fafc;
          font-size: 0.92rem;
        }

        .contextual-extension-card__copy p {
          margin: 4px 0 0;
          color: #aebbd0;
          font-size: 0.8rem;
          line-height: 1.45;
        }

        .contextual-extension-card__actions {
          display: flex;
          gap: 7px;
        }

        .contextual-extension-card__actions a {
          display: inline-flex;
          gap: 6px;
          align-items: center;
          min-height: 34px;
          padding: 0 10px;
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 9px;
          color: #e2e8f0;
          font-size: 0.75rem;
          font-weight: 800;
          text-decoration: none;
        }

        .contextual-extension-card__actions a:first-child {
          border-color: rgba(96, 165, 250, 0.42);
          background: #2563eb;
          color: #fff;
        }

        .contextual-extension-card__actions svg {
          width: 14px;
          height: 14px;
        }

        .contextual-extension-card__actions svg:last-child {
          width: 11px;
          height: 11px;
          opacity: 0.65;
        }

        @media (max-width: 700px) {
          .contextual-extension-card {
            grid-template-columns: auto minmax(0, 1fr);
          }

          .contextual-extension-card__actions {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .contextual-extension-card__actions a {
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}
