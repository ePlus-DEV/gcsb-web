import MonthlyLabStructuredData from "@/components/monthly-labs/structured-data"
import { notFound } from "next/navigation"
import source from "@/public/i18n/locales/en.json"
import MonthlyLabsPage from "@/components/monthly-labs/pages"
import { MONTHLY_LAB_MONTHS, getMonthlyLabs } from "@/components/monthly-labs/data"
import { monthLabel, monthlyLabPath } from "@/components/monthly-labs/model"
import { monthlyLabsMetadata } from "@/components/monthly-labs/metadata"

type Props = { params: Promise<{ year: string; month: string; slug: string }> }
export const dynamicParams = false
export function generateStaticParams() {
  return MONTHLY_LAB_MONTHS.flatMap(key => {
    const [year, month] = key.split("-")
    return getMonthlyLabs(key).map(lab => ({ year, month, slug: lab.slug }))
  })
}
export async function generateMetadata({ params }: Props) {
  const { year, month, slug } = await params
  const lab = getMonthlyLabs(`${year}-${month}`).find(item => item.slug === slug)
  if (!lab) return {}
  return monthlyLabsMetadata(monthlyLabPath(lab), lab.title, source.messages.labMonthDescription.replace("{month}", monthLabel(lab.month, "en")))
}
export default async function MonthlyLabDetailPage({ params }: Props) {
  const { year, month, slug } = await params
  const lab = getMonthlyLabs(`${year}-${month}`).find(item => item.slug === slug)
  if (!lab) notFound()
  return <><MonthlyLabStructuredData path={monthlyLabPath(lab)} title={lab.title} month={lab.month} /><MonthlyLabsPage month={lab.month} lab={lab} /></>
}
