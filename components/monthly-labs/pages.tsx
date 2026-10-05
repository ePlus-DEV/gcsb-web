"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Check, Copy, ExternalLink, Gamepad2 } from "lucide-react"
import InternalPageShell from "@/components/site/internal-page-shell"
import ContentCard from "@/components/site/content-card"
import ContentLink from "@/components/site/content-link"
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
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(timer) }, [])
  const label = month ? monthLabel(month, intlLocale) : m.monthlyLabs
  const title = lab?.title ?? label
  const description = month ? m.labMonthDescription.replace("{month}", label) : m.labArchiveDescription
  async function copyCode() {
    try { await navigator.clipboard.writeText(lab?.accessCode ?? ""); setCopyStatus("copied") }
    catch { setCopyStatus("failed") }
  }
  const formatNumber = (value: number) => new Intl.NumberFormat(intlLocale).format(value)
  const deadline = lab?.deadline && Number.isFinite(Date.parse(lab.deadline))
    ? new Intl.DateTimeFormat(intlLocale, { dateStyle: "long", timeStyle: "short", timeZone: lab.deadlineTimeZone ?? "UTC" }).format(new Date(lab.deadline))
    : text("deadlineUnavailable")
  const breadcrumbs = <nav className="monthly-lab-breadcrumbs" aria-label={m.labBreadcrumb}>
    <Link href="/">{m.calculator}</Link><span aria-hidden="true">/</span>
    {month ? <Link href="/monthly-labs/">{m.monthlyLabs}</Link> : <span aria-current="page">{m.monthlyLabs}</span>}
    {month && <><span aria-hidden="true">/</span>{lab ? <Link href={monthlyLabMonthPath(month)}>{label}</Link> : <span aria-current="page">{label}</span>}</>}
    {lab && <><span aria-hidden="true">/</span><span aria-current="page">{lab.title}</span></>}
  </nav>
  return <div>
    <InternalPageShell catalogDriven eyebrow={m.monthlyLabs} title={title} description={description} breadcrumbs={breadcrumbs}>
      <div className="not-prose space-y-6 monthly-labs-content">
        {months && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{months.map(item => <ContentCard key={item.month} className="p-5">
          <h2 className="text-xl font-bold"><Link href={monthlyLabMonthPath(item.month)}>{monthLabel(item.month, intlLocale)}</Link></h2>
          <p className="mt-2 text-muted-foreground">{m.labCount.replace("{count}", formatNumber(item.count))}</p>
          <ContentLink className="mt-4" href={monthlyLabMonthPath(item.month)}>{m.monthlyLabs}</ContentLink>
        </ContentCard>)}</div>}
        {labs && <><p className="text-muted-foreground">{m.labCount.replace("{count}", formatNumber(labs.length))}</p><div className="grid gap-4 md:grid-cols-2">{labs.map(item => <ContentCard key={item.slug} className="flex flex-col p-5">
          <Link href={monthlyLabPath(item)} className="monthly-lab-art">{item.imageUrl ? <SwagArtwork src={item.imageUrl} alt={item.title} className="h-40 w-full object-contain" /> : <Gamepad2 className="h-40 w-full p-12" aria-hidden="true" />}</Link>
          <span className={`monthly-lab-status ${labState(item, now)}`}>{m[labState(item, now)]}</span>
          <h2 className="mt-3 text-xl font-bold"><Link href={monthlyLabPath(item)}>{item.title}</Link></h2>
          {item.points !== null && <p className="mt-2 text-muted-foreground">{text(item.points === 1 ? "arcadePoint" : "arcadePoints", { count: formatNumber(item.points) })}</p>}
          <ContentLink className="mt-4 self-start" href={monthlyLabPath(item)}>{m.labDetails}</ContentLink>
        </ContentCard>)}</div></>}
        {lab && <>
          <ContentCard className="grid gap-6 p-5 sm:p-8 lg:grid-cols-2">
            <div className="monthly-lab-art">{lab.imageUrl ? <SwagArtwork src={lab.imageUrl} alt={lab.title} className="h-64 w-full object-contain" /> : <Gamepad2 className="h-64 w-full p-20" aria-hidden="true" />}</div>
            <div className="min-w-0">
              <span className={`monthly-lab-status ${labState(lab, now)}`}>{m[labState(lab, now)]}</span>
              <dl className="monthly-lab-facts">
                <div><dt>{text("accessCode")}</dt><dd>{lab.accessCode ? <><code>{lab.accessCode}</code><button className="monthly-copy-button" onClick={() => void copyCode()} type="button" aria-label={text("copyAccessCode")}>{copyStatus === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copyStatus === "copied" ? text("copied") : text("copy")}</button><span role="status">{copyStatus === "failed" ? m.labCopyFailed : ""}</span></> : m.notAvailable}</dd></div>
                <div><dt>{text("deadline")}</dt><dd>{lab.deadline && Number.isFinite(Date.parse(lab.deadline)) ? <time dateTime={lab.deadline}>{deadline} · {lab.deadlineTimeZone ?? "UTC"}</time> : deadline}</dd></div>
                {lab.points !== null && <div><dt>{m.arcadePoints}</dt><dd>{text(lab.points === 1 ? "arcadePoint" : "arcadePoints", { count: formatNumber(lab.points) })}</dd></div>}
                {lab.spotsRemaining !== null && <div><dt>{m.labHistoricalSlots}</dt><dd>{formatNumber(lab.spotsRemaining)}</dd></div>}
              </dl>
              <div className="mt-5 flex flex-wrap gap-3">
                {lab.joinUrl && labState(lab, now) !== "labArchived" && <a className="content-primary-action" href={lab.joinUrl} target="_blank" rel="noopener noreferrer">{text("openGame")}<ExternalLink className="h-4 w-4" aria-hidden="true" /></a>}
                {lab.sourceUrl && <a className="monthly-lab-source" href={lab.sourceUrl} target="_blank" rel="noopener noreferrer">{m.labSource}<ExternalLink className="h-4 w-4" aria-hidden="true" /></a>}
                {lab.joinUrl && labState(lab, now) === "labArchived" && <a className="monthly-lab-source" href={lab.joinUrl} target="_blank" rel="noopener noreferrer">{m.labDetails}<ExternalLink className="h-4 w-4" aria-hidden="true" /></a>}
              </div>
            </div>
          </ContentCard>
          <ContentCard className="p-5 sm:p-8"><h2 className="text-xl font-bold">{m.labSourceDescription}</h2><p lang={lab.description ? "en" : undefined} className="mt-4 leading-7 text-muted-foreground">{lab.description ?? m.labMissingDescription}</p></ContentCard>
        </>}
        {(month || lab) && <p className="rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">{m.labHistoricalNotice}</p>}
      </div>
    </InternalPageShell>
  </div>
}
