import MonthlyLabStructuredData from "@/components/monthly-labs/structured-data"
import { notFound } from "next/navigation"
import source from "@/public/i18n/locales/en.json"
import MonthlyLabsPage from "@/components/monthly-labs/pages"
import { MONTHLY_LAB_MONTHS, getMonthlyLabs } from "@/components/monthly-labs/data"
import { monthLabel, monthlyLabMonthPath, monthlyLabPath } from "@/components/monthly-labs/model"
import { monthlyLabsMetadata } from "@/components/monthly-labs/metadata"

type Props = { params: Promise<{ year: string; month: string }> }
export const dynamicParams = false
export function generateStaticParams() {
  return MONTHLY_LAB_MONTHS.map(value => { const [year, month] = value.split("-"); return { year, month } })
}
export async function generateMetadata({ params }: Props) {
  const { year, month } = await params
  const key = `${year}-${month}`
  if (!MONTHLY_LAB_MONTHS.includes(key)) return {}
  const label = monthLabel(key, "en")
  return monthlyLabsMetadata(monthlyLabMonthPath(key), `${source.messages.monthlyLabs} · ${label}`, source.messages.labMonthDescription.replace("{month}", label))
}
export default async function MonthlyLabMonthPage({ params }: Props) {
  const { year, month } = await params
  const key = `${year}-${month}`
  if (!MONTHLY_LAB_MONTHS.includes(key)) notFound()
  const labs = getMonthlyLabs(key)
  return <><MonthlyLabStructuredData path={monthlyLabMonthPath(key)} month={key} title={monthLabel(key, "en")} items={labs.map(lab => ({ path: monthlyLabPath(lab), title: lab.title }))} /><MonthlyLabsPage month={key} labs={labs} /></>
}
