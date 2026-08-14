import { normalizeFacilitatorProfileUrl } from "./facilitator-participation"

export const FACILITATOR_BONUS_MILESTONE_EVENT =
  "arcade-facilitator-bonus-milestone-change"

const BONUS_MILESTONE_STORAGE_PREFIX =
  "arcade-facilitator-bonus-milestone-v1"

export type FacilitatorBonusMilestoneDetail = {
  profileUrl: string
  completed: boolean
}

export function getFacilitatorBonusMilestoneStorageKey(
  profileUrl?: string,
): string {
  return `${BONUS_MILESTONE_STORAGE_PREFIX}:${normalizeFacilitatorProfileUrl(
    profileUrl,
  )}`
}

export function readFacilitatorBonusMilestoneCompletion(
  profileUrl?: string,
): boolean {
  try {
    return (
      window.localStorage.getItem(
        getFacilitatorBonusMilestoneStorageKey(profileUrl),
      ) === "true"
    )
  } catch {
    return false
  }
}

export function writeFacilitatorBonusMilestoneCompletion(
  profileUrl: string | undefined,
  completed: boolean,
): void {
  const normalizedProfileUrl = normalizeFacilitatorProfileUrl(profileUrl)
  const key = getFacilitatorBonusMilestoneStorageKey(normalizedProfileUrl)

  try {
    window.localStorage.setItem(key, completed ? "true" : "false")
  } catch {
    // Keep the caller's in-memory state when storage is unavailable.
  }

  window.dispatchEvent(
    new CustomEvent<FacilitatorBonusMilestoneDetail>(
      FACILITATOR_BONUS_MILESTONE_EVENT,
      {
        detail: {
          profileUrl: normalizedProfileUrl,
          completed,
        },
      },
    ),
  )

  // Existing score surfaces already listen for the storage event. Dispatching
  // one here makes the +10 update immediately in the current tab as well.
  window.dispatchEvent(new Event("storage"))
}
