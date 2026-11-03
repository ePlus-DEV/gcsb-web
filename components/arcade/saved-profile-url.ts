import { DASHBOARD_STORAGE_KEY, PROFILE_URL_PATTERN } from "./model"

/** Read only the public profile URL, not the cached score or preview fixtures.
 * This stays independent of Dashboard's heavier state/preview module. */
export function readSavedProfileUrl(): string {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!raw) return ""
    const saved: unknown = JSON.parse(raw)
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return ""
    const { profileUrl, result } = saved as Record<string, unknown>
    if (typeof profileUrl !== "string" || !result || typeof result !== "object" || Array.isArray(result)) return ""
    const value = profileUrl.trim()
    return PROFILE_URL_PATTERN.test(value) ? value : ""
  } catch {
    // Browsers may block localStorage; Home remains usable without it.
    return ""
  }
}
