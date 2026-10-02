import snapshot from "@/data/monthly-labs.json"
import { parseMonthlyLabs, type MonthlyLab } from "./model"

export const MONTHLY_LAB_MONTHS = Object.keys(snapshot.months).sort().reverse()
export function getMonthlyLabs(month: string): MonthlyLab[] {
  return parseMonthlyLabs(month, (snapshot.months as Record<string, unknown>)[month])
}
