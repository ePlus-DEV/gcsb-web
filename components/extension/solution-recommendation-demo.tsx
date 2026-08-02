"use client"

import { BadgeCheck, Chrome, ExternalLink, Globe2, Sparkles } from "lucide-react"
import { useState } from "react"

const CHROME_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg"
const FIREFOX_EXTENSION_URL =
  "https://addons.mozilla.org/addon/cloud-skills-boost-helper"

type RecommendationKey = "calculator" | "badges" | "tiers"

const recommendations: Record<
  RecommendationKey,
  {
    label: string
    eyebrow: string
    title: string
    description: string
    benefits: string[]
  }
> = {
  calculator: {
    label: "After calculation",
    eyebrow: "Faster next time",
    title: "Let the extension detect your profile automatically",
    description:
      "The web calculator remains fully available. Install the helper only when you want to skip repeated profile URL entry and keep your score closer at hand.",
    benefits: [
      "Detect your Google Skills profile while you browse",
      "Reduce repeated copy-and-paste steps",
      "Recheck your score with fewer actions",
    ],
  },
  badges: {
    label: "While viewing badges",
    eyebrow: "Turn results into action",
    title: "See useful badge insights closer to Skills Boost",
    description:
      "Use the website for detailed badge exploration, then use the extension for convenient assistance during your normal Skills Boost workflow.",
    benefits: [
      "Keep relevant badge information easier to reach",
      "Avoid switching back and forth for common checks",
      "Use web results together with in-browser assistance",
    ],
  },
  tiers: {
    label: "When checking tiers",
    eyebrow: "Stay on top of progress",
    title: "Make repeat progress checks less repetitive",
    description:
      "The website is still the best place for the complete overview. The extension is the recommended companion for users who check Arcade progress frequently.",
    benefits: [
      "Reach progress tools from your browser toolbar",
      "Return to the calculator and guides more quickly",
      "Get future helper improvements where you work",
    ],
  },
}

export default function SolutionRecommendationDemo() {
  const [activeKey, setActiveKey] = useState<RecommendationKey>("calculator")
  const active = recommendations[activeKey]

  return (
    <section className="solution-demo" aria-labelledby="solution-demo-title">
      <div className="solution-demo__intro">
        <span className="solution-demo__kicker">
          <Sparkles aria-hidden="true" /> Optional companion
        </span>
        <h2 id="solution-demo-title">Use the web normally. Install the extension when it saves you time.</h2>
        <p>
          Recommendations appear only where the extension solves a clear repeated task. No feature is locked and no result is hidden behind installation.
        </p>
      </div>

      <div className="solution-demo__shell">
        <div className="solution-demo__tabs" role="tablist" aria-label="Recommendation examples">
          {(Object.keys(recommendations) as RecommendationKey[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeKey === key}
              className={activeKey === key ? "is-active" : undefined}
              onClick={() => setActiveKey(key)}
            >
              {recommendations[key].label}
            </button>
          ))}
        </div>

        <div className="solution-card" role="tabpanel">
          <div className="solution-card__icon" aria-hidden="true">
            <Sparkles />
          </div>
          <div className="solution-card__content">
            <span>{active.eyebrow}</span>
            <h3>{active.title}</h3>
            <p>{active.description}</p>
            <ul>
              {active.benefits.map((benefit) => (
                <li key={benefit}>
                  <BadgeCheck aria-hidden="true" /> {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="solution-card__actions">
            <a href={CHROME_EXTENSION_URL} target="_blank" rel="noreferrer noopener">
              <Chrome aria-hidden="true" /> Add to Chrome <ExternalLink aria-hidden="true" />
            </a>
            <a href={FIREFOX_EXTENSION_URL} target="_blank" rel="noreferrer noopener">
              <Globe2 aria-hidden="true" /> Add to Firefox <ExternalLink aria-hidden="true" />
            </a>
            <small>Recommended for frequent users · Web features remain available</small>
          </div>
        </div>
      </div>

      <style jsx>{`
        .solution-demo {
          position: relative;
          z-index: 1;
          width: min(1120px, calc(100% - 32px));
          margin: 40px auto 72px;
          padding: 32px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 28px;
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.94), rgba(30, 41, 59, 0.88));
          box-shadow: 0 24px 80px rgba(2, 6, 23, 0.34);
          color: #e2e8f0;
        }

        .solution-demo__intro {
          max-width: 760px;
          margin-bottom: 28px;
        }

        .solution-demo__kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #fbbf24;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .solution-demo__kicker :global(svg) {
          width: 18px;
          height: 18px;
        }

        h2 {
          margin: 12px 0;
          color: #fff;
          font-size: clamp(1.7rem, 4vw, 2.65rem);
          line-height: 1.08;
        }

        .solution-demo__intro p {
          margin: 0;
          color: #aebbd0;
          font-size: 1rem;
          line-height: 1.7;
        }

        .solution-demo__shell {
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 22px;
          background: rgba(2, 6, 23, 0.42);
        }

        .solution-demo__tabs {
          display: flex;
          gap: 8px;
          padding: 12px;
          overflow-x: auto;
          border-bottom: 1px solid rgba(148, 163, 184, 0.16);
        }

        .solution-demo__tabs button {
          flex: 0 0 auto;
          padding: 10px 14px;
          border: 1px solid transparent;
          border-radius: 999px;
          background: transparent;
          color: #94a3b8;
          font: inherit;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
        }

        .solution-demo__tabs button:hover,
        .solution-demo__tabs button.is-active {
          border-color: rgba(96, 165, 250, 0.34);
          background: rgba(37, 99, 235, 0.18);
          color: #dbeafe;
        }

        .solution-card {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) minmax(220px, 0.44fr);
          gap: 22px;
          align-items: start;
          padding: 26px;
        }

        .solution-card__icon {
          display: grid;
          width: 50px;
          height: 50px;
          place-items: center;
          border-radius: 16px;
          background: linear-gradient(145deg, #2563eb, #7c3aed);
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.28);
        }

        .solution-card__icon :global(svg) {
          width: 24px;
          height: 24px;
        }

        .solution-card__content > span {
          color: #93c5fd;
          font-size: 0.77rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        h3 {
          margin: 6px 0 10px;
          color: #fff;
          font-size: 1.35rem;
          line-height: 1.25;
        }

        .solution-card__content p {
          margin: 0;
          color: #aebbd0;
          line-height: 1.65;
        }

        ul {
          display: grid;
          gap: 9px;
          margin: 18px 0 0;
          padding: 0;
          list-style: none;
        }

        li {
          display: flex;
          gap: 9px;
          align-items: flex-start;
          color: #dbe4f0;
          font-size: 0.92rem;
        }

        li :global(svg) {
          flex: 0 0 auto;
          width: 18px;
          height: 18px;
          margin-top: 1px;
          color: #34d399;
        }

        .solution-card__actions {
          display: grid;
          gap: 10px;
        }

        .solution-card__actions a {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 46px;
          padding: 0 15px;
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 13px;
          background: rgba(15, 23, 42, 0.72);
          color: #fff;
          font-weight: 800;
          text-decoration: none;
          transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
        }

        .solution-card__actions a:first-child {
          border-color: rgba(96, 165, 250, 0.45);
          background: #2563eb;
        }

        .solution-card__actions a:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .solution-card__actions a :global(svg) {
          width: 18px;
          height: 18px;
        }

        .solution-card__actions a :global(svg:last-child) {
          width: 14px;
          height: 14px;
          opacity: 0.7;
        }

        small {
          color: #8290a6;
          font-size: 0.76rem;
          line-height: 1.5;
          text-align: center;
        }

        @media (max-width: 840px) {
          .solution-demo {
            padding: 24px;
          }

          .solution-card {
            grid-template-columns: auto minmax(0, 1fr);
          }

          .solution-card__actions {
            grid-column: 1 / -1;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          small {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 560px) {
          .solution-demo {
            width: min(100% - 20px, 1120px);
            margin-top: 24px;
            padding: 18px;
            border-radius: 22px;
          }

          .solution-card {
            grid-template-columns: 1fr;
            padding: 20px;
          }

          .solution-card__icon {
            width: 44px;
            height: 44px;
          }

          .solution-card__actions {
            grid-column: auto;
            grid-template-columns: 1fr;
          }

          small {
            grid-column: auto;
          }
        }
      `}</style>
    </section>
  )
}
