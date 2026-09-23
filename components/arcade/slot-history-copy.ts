import type { WebsiteCatalog } from "@/lib/website-i18n"

export const SLOT_HISTORY_DEFAULTS = {
  "title": "Prize slot history",
  "subtitle": "Compare reward tiers",
  "viewAria": "View prize slot history",
  "eyebrow": "2026 REWARDS",
  "description": "Compare remaining slots. Tap a tier to show or hide it.",
  "loading": "Loading history…",
  "pending": "History is not available yet.",
  "checkAgain": "Check again",
  "unavailable": "Could not load history.",
  "retry": "Retry",
  "collecting": "History will appear after enough updates.",
  "timeRange": "TIME RANGE",
  "rewardTiers": "REWARD TIERS",
  "showAll": "Show all",
  "toggleTiers": "Show or hide tiers",
  "days": "{count} days",
  "remaining": "remaining",
  "liveDiffers": "Current count differs",
  "visibleSummary": "{count} of 4 tiers visible",
  "comparedWith": " · Compared with {date}",
  "chartTitle": "Remaining slots",
  "chartSubtitle": "{days}-day history",
  "noSelection": "Select a tier to view its history.",
  "noPeriodData": "No saved values in this period. Try a longer range.",
  "notEnoughData": "Not enough values yet. Try a longer range.",
  "chartNote": "Dots are saved values; lines connect known points.",
  "lastSaved": "Last updated: {date}",
  "aboutTitle": "About this chart",
  "aboutCounts": "This chart shows published remaining slots, not your personal position.",
  "aboutCompare": "Each color represents a reward tier. Counts are absolute, not percentages.",
  "aboutDates": "Older dates are based on saved records and may differ from the exact update time.",
  "aboutUpdate": "Counts can stay unchanged for days. An increase does not necessarily mean more rewards were added.",
  "tooltipValue": "{count} remaining",
  "changeTitle": "Change since the previous recorded update",
  "changeAria": "Remaining slots changed by {change}"
} as const

export type SlotHistoryTextKey = keyof typeof SLOT_HISTORY_DEFAULTS

/**
 * Read user-visible slot-history copy from the existing website locale catalogs.
 * Only internal data uses Git provenance; the public interface stays simple.
 */
export function slotHistoryText(
  catalog: WebsiteCatalog,
  key: SlotHistoryTextKey,
  params?: Record<string, string | number>,
): string {
  const template = catalog.additional[`__slotHistory:${key}`] ?? SLOT_HISTORY_DEFAULTS[key]
  if (!params) return template
  return template.replace(/\{([a-z]+)\}/g, (placeholder, name: string) =>
    params[name] === undefined ? placeholder : String(params[name]),
  )
}
