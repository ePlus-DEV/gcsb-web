export const FACILITATOR_PARTICIPATION_EVENT =
  "arcade-facilitator-participation-change"
export const FACILITATOR_PANEL_OPEN_EVENT = "arcade-facilitator-panel-open"
export const FACILITATOR_PROGRAM_STATE_EVENT =
  "arcade-facilitator-program-state-change"

export type FacilitatorProgramState =
  | "unknown"
  | "active"
  | "ended"
  | "unconfigured"
  | "disabled"

export type FacilitatorProgramStateDetail = {
  state: FacilitatorProgramState
}

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

const FACILITATOR_PROGRAM_STATES = new Set<FacilitatorProgramState>([
  "unknown",
  "active",
  "ended",
  "unconfigured",
  "disabled",
])

export function readFacilitatorProgramState(): FacilitatorProgramState {
  if (typeof document === "undefined") return "unknown"

  const state = document.documentElement.dataset.facilitatorProgramState
  return FACILITATOR_PROGRAM_STATES.has(state as FacilitatorProgramState)
    ? (state as FacilitatorProgramState)
    : "unknown"
}

export function writeFacilitatorProgramState(
  state: FacilitatorProgramState,
): void {
  if (typeof document === "undefined" || typeof window === "undefined") return
  if (document.documentElement.dataset.facilitatorProgramState === state) return

  document.documentElement.dataset.facilitatorProgramState = state
  window.dispatchEvent(
    new CustomEvent<FacilitatorProgramStateDetail>(
      FACILITATOR_PROGRAM_STATE_EVENT,
      { detail: { state } },
    ),
  )
}
