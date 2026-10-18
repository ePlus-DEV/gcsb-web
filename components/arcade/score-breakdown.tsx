import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import type { WebsiteCatalog, WebsiteLocale } from "@/lib/website-i18n"
import { getWebsiteLocaleInfo } from "@/lib/website-i18n"
import { formatNumber } from "./model"

type Item = { key: string; label: string; icon: ReactNode; value: number; tone: string }
type Props = { catalog: WebsiteCatalog; locale: WebsiteLocale; items: Item[]; total: number; scoreComplete: boolean; unknownBadges: string[] }

/** Native disclosure keeps the source calculation accessible without another total card. */
export default function ScoreBreakdown({ catalog, locale, items, total, scoreComplete, unknownBadges }: Props) {
  const m = catalog.messages
  const percent = new Intl.NumberFormat(getWebsiteLocaleInfo(locale).htmlLang, { style: "percent", maximumFractionDigits: 1 })
  const pointsLabel = (value: number) => catalog.dynamic.points.replace("{count}", formatNumber(value))
  const share = (value: number) => total > 0 ? Math.max(0, Math.min(1, value / total)) : 0
  return (
    <details id="score-breakdown" className="dashboard-panel breakdown-panel score-breakdown-disclosure">
      <summary><h2 className="panel-title">{m.pointBreakdown}</h2><ChevronDown aria-hidden="true" /></summary>
      <div className="score-breakdown-content">
        <div className="point-composition-bar" role="img" aria-label={`${m.pointBreakdown}: ${items.map(item => `${item.label} ${pointsLabel(item.value)}`).join(", ")}`}>
          {items.map(item => <span key={item.key} className={`point-composition-segment point-tone-${item.tone}`} style={{ width: `${share(item.value) * 100}%` }} aria-hidden="true" />)}
        </div>
        <div className="point-breakdown-list">
          {items.map(item => (
            <div className={`point-breakdown-row point-tone-${item.tone}`} key={item.key}>
              <span className="point-breakdown-source"><span className="point-breakdown-swatch" aria-hidden="true" />{item.icon}<span>{item.label}</span></span>
              <strong>{pointsLabel(item.value)}</strong><span className="point-breakdown-share">{percent.format(share(item.value))}</span>
            </div>
          ))}
        </div>
        <p className="score-breakdown-note">{scoreComplete ? m.allBadgesClassified : m.unknownShown}</p>
        {unknownBadges.length > 0 && <ul className="unknown-badge-list">{unknownBadges.map((badge, index) => <li key={`${badge}-${index}`}>{badge}</li>)}</ul>}
      </div>
    </details>
  )
}
