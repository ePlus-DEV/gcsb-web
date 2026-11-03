import { DASHBOARD_STORAGE_KEY, type ArcadeApiResponse } from "./model"
import { IS_PR_PREVIEW, PREVIEW_DEBUG_PROFILE_RESULT, PREVIEW_DEBUG_PROFILE_URL } from "./preview-debug-profile"

export type DashboardViewMode = "guest" | "profile"
export type StoredDashboard = { profileUrl: string; result: ArcadeApiResponse; checkedAt?: string }

export const DASHBOARD_CHANGE_EVENT = "arcade-dashboard-change"

// Share the last parsed value while the underlying localStorage snapshot is unchanged.
let lastRawDashboard: string | null | undefined
let lastParsedDashboard: StoredDashboard | null = null

export function notifyDashboardChanged(): void {
  window.dispatchEvent(new Event(DASHBOARD_CHANGE_EVENT))
}

const previewDashboard: StoredDashboard = {
  profileUrl: PREVIEW_DEBUG_PROFILE_URL,
  result: PREVIEW_DEBUG_PROFILE_RESULT,
}

/** Storage is optional; reject malformed records before restoring a profile. */
export function readStoredDashboard(): StoredDashboard | null {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (raw === lastRawDashboard) return lastParsedDashboard
    lastRawDashboard = raw
    lastParsedDashboard = null
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    const { profileUrl, result, checkedAt } = parsed as Record<string, unknown>
    if (typeof profileUrl !== "string" || !result || typeof result !== "object" || Array.isArray(result)) return null
    lastParsedDashboard = { profileUrl, result: result as ArcadeApiResponse, ...(typeof checkedAt === "string" ? { checkedAt } : {}) }
    return lastParsedDashboard
  } catch {
    lastRawDashboard = undefined
    lastParsedDashboard = null
    return null
  }
}

/** All dashboard enhancers follow the same guest and preview boundaries. */
export function readActiveDashboard(): StoredDashboard | null {
  const page = document.querySelector<HTMLElement>(".arcade-dashboard-page")
  if (page?.dataset.dashboardView === "guest") return null
  if (IS_PR_PREVIEW && page?.dataset.dashboardDebugFake === "true") {
    return previewDashboard
  }
  return readStoredDashboard()
}

/** Mode changes are attributes, so child-list observers alone miss them. */
export function observeDashboardMode(onChange: () => void): () => void {
  const page = document.querySelector<HTMLElement>(".arcade-dashboard-page")
  if (!page) return () => {}
  const observer = new MutationObserver(onChange)
  observer.observe(page, {
    attributes: true,
    attributeFilter: ["data-dashboard-view", "data-dashboard-debug-fake"],
  })
  return () => observer.disconnect()
}
