/** Choose deadlines independently; never reuse Arcade's seasonal estimate for Facilitator. */
export type CountdownProgramId = "facilitator" | "arcade"
/** Last published 2026 Facilitator deadline, verified against the project's Firebase console.
 * Only a safety fallback when an independent env/remote value is unavailable.
 * Never substitute Arcade's season-end timestamp.
 */
export const LAST_PUBLISHED_FACILITATOR_2026_DEADLINE =
  "2026-09-14T23:59:59+05:30"

export type DeadlineSource =
  | "env"
  | "remote"
  | "published-fallback"
  | "season-fallback"
  | "unconfigured"
export type ResolvedDeadline = {
  deadline: string | null
  source: DeadlineSource
}

/** Require an absolute ISO timestamp, so server and browser timezones agree. */
export function validatedDeadline(value: string | null | undefined): string | null {
  const candidate = value?.trim() ?? ""
  if (!/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/.test(candidate)) {
    return null
  }
  return Number.isFinite(Date.parse(candidate)) ? candidate : null
}

export function initialDeadline(
  program: CountdownProgramId,
  explicit: string | null | undefined,
  arcadeSeasonDeadline: string,
): ResolvedDeadline {
  const configured = validatedDeadline(explicit)
  if (configured) return { deadline: configured, source: "env" }

  // Firebase's last published 2026 Facilitator deadline is known to be
  // different from the Arcade season. Render it as ended when it has passed
  // even if Firebase is blocked. A newer env/remote value always overrides it.
  if (program === "facilitator") {
    return {
      deadline: LAST_PUBLISHED_FACILITATOR_2026_DEADLINE,
      source: "published-fallback",
    }
  }

  const season = validatedDeadline(arcadeSeasonDeadline)
  return season
    ? { deadline: season, source: "season-fallback" }
    : { deadline: null, source: "unconfigured" }
}

export function resolvedRemoteDeadline(
  initial: ResolvedDeadline,
  remoteValue: string,
  remoteSource: string | undefined,
): ResolvedDeadline {
  // Firebase's "default" and "static" values must not masquerade as a
  // separately configured remote deadline.
  if (remoteSource !== "remote") return initial
  const configured = validatedDeadline(remoteValue)
  return configured ? { deadline: configured, source: "remote" } : initial
}
