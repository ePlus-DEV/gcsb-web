import source from "@/public/i18n/locales/en.json"
import MonthlyLabStructuredData from "@/components/monthly-labs/structured-data"
import { monthLabel, monthlyLabMonthPath } from "@/components/monthly-labs/model"
import MonthlyLabsPage from "@/components/monthly-labs/pages"
import { MONTHLY_LAB_MONTHS, getMonthlyLabs } from "@/components/monthly-labs/data"
import { monthlyLabsMetadata } from "@/components/monthly-labs/metadata"

export const metadata = monthlyLabsMetadata("/monthly-labs/")
export default function MonthlyLabsArchivePage() {
  return <>
    <MonthlyLabStructuredData path="/monthly-labs/" title={source.messages.monthlyLabs} items={MONTHLY_LAB_MONTHS.map(month => ({ path: monthlyLabMonthPath(month), title: monthLabel(month, "en") }))} />
    <MonthlyLabsPage months={MONTHLY_LAB_MONTHS.map(month => ({ month, count: getMonthlyLabs(month).length }))} />
  </>
}
