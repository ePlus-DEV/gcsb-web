"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Gamepad2,
  Info,
  Trophy,
  Users,
} from "lucide-react"
import InternalPageShell from "@/components/site/internal-page-shell"
import ContentCard from "@/components/site/content-card"
import SwagArtwork from "@/components/arcade/swag-artwork"
import { useSiteCatalog } from "@/components/site/use-site-catalog"
import { getWebsiteLocaleInfo } from "@/lib/website-i18n"
import { monthlyGamesText } from "@/components/arcade/monthly-games-copy"
import { labState, monthLabel, monthlyLabMonthPath, monthlyLabPath, type MonthlyLab } from "./model"

type Props = { months?: { month: string; count: number }[]; month?: string; labs?: MonthlyLab[]; lab?: MonthlyLab }

export default function MonthlyLabsPage({ months, month, labs, lab }: Props) {
  const { catalog, locale } = useSiteCatalog()
  const m = catalog.messages
  const intlLocale = getWebsiteLocaleInfo(locale).htmlLang
  const text = (key: Parameters<typeof monthlyGamesText>[1], params?: Record<string, string | number>) => monthlyGamesText(catalog, key, params)
  const [now, setNow] = useState(() => Date.now())
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle")

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const label = month ? monthLabel(month, intlLocale) : m.monthlyLabs
  const title = lab?.title ?? label
  const description = month ? m.labMonthDescription.replace("{month}", label) : m.labArchiveDescription
  const detailState = lab ? labState(lab, now) : null

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(lab?.accessCode ?? "")
      setCopyStatus("copied")
    } catch {
      setCopyStatus("failed")
    }
  }

  const formatNumber = (value: number) => new Intl.NumberFormat(intlLocale).format(value)
  const deadline = lab?.deadline && Number.isFinite(Date.parse(lab.deadline))
    ? new Intl.DateTimeFormat(intlLocale, {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: lab.deadlineTimeZone ?? "UTC",
      }).format(new Date(lab.deadline))
    : text("deadlineUnavailable")

  const breadcrumbs = (
    <nav className="monthly-lab-breadcrumbs" aria-label={m.labBreadcrumb}>
      <Link href="/">{m.calculator}</Link>
      <span aria-hidden="true">/</span>
      {month ? <Link href="/monthly-labs/">{m.monthlyLabs}</Link> : <span aria-current="page">{m.monthlyLabs}</span>}
      {month && (
        <>
          <span aria-hidden="true">/</span>
          {lab ? <Link href={monthlyLabMonthPath(month)}>{label}</Link> : <span aria-current="page">{label}</span>}
        </>
      )}
      {lab && (
        <>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{lab.title}</span>
        </>
      )}
    </nav>
  )

  return (
    <div>
      <InternalPageShell
        catalogDriven
        eyebrow={m.monthlyLabs}
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
      >
        <div className="not-prose monthly-labs-content">
          {months && (
            <div className="monthly-lab-archive-grid">
              {months.map((item) => (
                <Link key={item.month} href={monthlyLabMonthPath(item.month)} className="monthly-lab-month-card">
                  <span className="monthly-lab-month-icon">
                    <Calendar aria-hidden="true" />
                  </span>
                  <span className="monthly-lab-month-copy">
                    <strong>{monthLabel(item.month, intlLocale)}</strong>
                    <span>{m.labCount.replace("{count}", formatNumber(item.count))}</span>
                  </span>
                  <ArrowRight className="monthly-lab-card-arrow" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}

          {labs && (
            <>
              <div className="monthly-lab-list-toolbar">
                <p>{m.labCount.replace("{count}", formatNumber(labs.length))}</p>
                <Link href="/monthly-labs/" className="monthly-lab-back-link">
                  <ArrowLeft aria-hidden="true" />
                  {m.monthlyLabs}
                </Link>
              </div>

              <div className="monthly-lab-game-grid">
                {labs.map((item) => {
                  const state = labState(item, now)
                  return (
                    <Link key={item.slug} href={monthlyLabPath(item)} className="monthly-lab-game-card">
                      <span className="monthly-lab-game-art">
                        {item.imageUrl ? (
                          <SwagArtwork src={item.imageUrl} alt={item.title} className="h-full w-full object-contain" />
                        ) : (
                          <Gamepad2 className="monthly-lab-placeholder-icon" aria-hidden="true" />
                        )}
                      </span>

                      <span className="monthly-lab-game-body">
                        <span className="monthly-lab-card-meta">
                          <span className={`monthly-lab-status ${state}`}>{m[state]}</span>
                          {item.points !== null && (
                            <span className="monthly-lab-points-badge">
                              <Trophy aria-hidden="true" />
                              {text(item.points === 1 ? "arcadePoint" : "arcadePoints", { count: formatNumber(item.points) })}
                            </span>
                          )}
                        </span>

                        <strong className="monthly-lab-game-title">{item.title}</strong>

                        <span className="monthly-lab-game-footer">
                          <span>{m.labDetails}</span>
                          <ArrowRight aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </>
          )}

          {lab && detailState && (
            <>
              <ContentCard className="monthly-lab-detail-card">
                <div className="monthly-lab-detail-media">
                  {lab.imageUrl ? (
                    <SwagArtwork src={lab.imageUrl} alt={lab.title} className="h-full w-full object-contain" />
                  ) : (
                    <Gamepad2 className="monthly-lab-detail-placeholder" aria-hidden="true" />
                  )}
                </div>

                <div className="monthly-lab-detail-body">
                  <div className="monthly-lab-card-meta monthly-lab-detail-meta">
                    <span className={`monthly-lab-status ${detailState}`}>{m[detailState]}</span>
                  </div>

                  <dl className="monthly-lab-fact-grid">
                    <div className="monthly-lab-fact monthly-lab-fact-access">
                      <dt><Copy aria-hidden="true" />{text("accessCode")}</dt>
                      <dd>
                        {lab.accessCode ? (
                          <>
                            <code>{lab.accessCode}</code>
                            <button
                              className="monthly-copy-button"
                              onClick={() => void copyCode()}
                              type="button"
                              aria-label={text("copyAccessCode")}
                            >
                              {copyStatus === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                              {copyStatus === "copied" ? text("copied") : text("copy")}
                            </button>
                            <span role="status">{copyStatus === "failed" ? m.labCopyFailed : ""}</span>
                          </>
                        ) : m.notAvailable}
                      </dd>
                    </div>

                    <div className="monthly-lab-fact monthly-lab-fact-deadline">
                      <dt><Clock aria-hidden="true" />{text("deadline")}</dt>
                      <dd>
                        {lab.deadline && Number.isFinite(Date.parse(lab.deadline))
                          ? <time dateTime={lab.deadline}>{deadline} · {lab.deadlineTimeZone ?? "UTC"}</time>
                          : deadline}
                      </dd>
                    </div>

                    {lab.points !== null && (
                      <div className="monthly-lab-fact monthly-lab-fact-points">
                        <dt><Trophy aria-hidden="true" />{m.arcadePoints}</dt>
                        <dd>{text(lab.points === 1 ? "arcadePoint" : "arcadePoints", { count: formatNumber(lab.points) })}</dd>
                      </div>
                    )}

                    {lab.spotsRemaining !== null && (
                      <div className="monthly-lab-fact monthly-lab-fact-places">
                        <dt><Users aria-hidden="true" />{m.labHistoricalSlots}</dt>
                        <dd>{formatNumber(lab.spotsRemaining)}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="monthly-lab-detail-actions">
                    {lab.joinUrl && detailState !== "labArchived" && (
                      <a className="content-primary-action" href={lab.joinUrl} target="_blank" rel="noopener noreferrer">
                        {text("openGame")}
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                    {lab.sourceUrl && (
                      <a className="monthly-lab-source" href={lab.sourceUrl} target="_blank" rel="noopener noreferrer">
                        {m.labSource}
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                    {lab.joinUrl && detailState === "labArchived" && (
                      <a className="monthly-lab-source" href={lab.joinUrl} target="_blank" rel="noopener noreferrer">
                        {m.labDetails}
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </ContentCard>

              <ContentCard className="monthly-lab-description-card">
                <div className="monthly-lab-section-heading">
                  <Info aria-hidden="true" />
                  <h2>{m.labSourceDescription}</h2>
                </div>
                <p lang={lab.description ? "en" : undefined}>{lab.description ?? m.labMissingDescription}</p>
              </ContentCard>
            </>
          )}

          {(month || lab) && (
            <aside className="monthly-lab-history-note">
              <Info aria-hidden="true" />
              <p>{m.labHistoricalNotice}</p>
            </aside>
          )}
        </div>
      </InternalPageShell>
    </div>
  )
}
