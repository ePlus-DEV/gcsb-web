export const FACILITATOR_PARTICIPATION_EVENT =
  "arcade-facilitator-participation-change"
export const FACILITATOR_PANEL_OPEN_EVENT = "arcade-facilitator-panel-open"

const PARTICIPATION_STORAGE_PREFIX =
  "arcade-facilitator-participation-v1"

export type FacilitatorParticipationDetail = {
  profileUrl: string
  participating: boolean
}

export function normalizeFacilitatorProfileUrl(profileUrl?: string): string {
  return profileUrl?.trim().replace(/\/$/, "") || "default-profile"
}

export function getFacilitatorParticipationStorageKey(
  profileUrl?: string,
): string {
  return `${PARTICIPATION_STORAGE_PREFIX}:${normalizeFacilitatorProfileUrl(
    profileUrl,
  )}`
}

export function readFacilitatorParticipation(profileUrl?: string): boolean {
  try {
    return (
      window.localStorage.getItem(
        getFacilitatorParticipationStorageKey(profileUrl),
      ) === "true"
    )
  } catch {
    return false
  }
}

export function writeFacilitatorParticipation(
  profileUrl: string | undefined,
  participating: boolean,
): void {
  const normalizedProfileUrl = normalizeFacilitatorProfileUrl(profileUrl)

  try {
    window.localStorage.setItem(
      getFacilitatorParticipationStorageKey(normalizedProfileUrl),
      participating ? "true" : "false",
    )
  } catch {
    // Keep the caller's in-memory state when storage is unavailable.
  }

  window.dispatchEvent(
    new CustomEvent<FacilitatorParticipationDetail>(
      FACILITATOR_PARTICIPATION_EVENT,
      {
        detail: {
          profileUrl: normalizedProfileUrl,
          participating,
        },
      },
    ),
  )
}
