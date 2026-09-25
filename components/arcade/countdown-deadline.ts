/** Choose deadlines independently; never reuse Arcade's seasonal estimate for Facilitator. */
export type CountdownProgramId = "facilitator" | "arcade"
export type DeadlineSource = "env" | "remote" | "program-fallback" | "season-fallback" | "unconfigured"
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
  facilitatorFallbackDeadline?: string,
): ResolvedDeadline {
  const configured = validatedDeadline(explicit)
  if (configured) return { deadline: configured, source: "env" }

  // Facilitator has its own last-known published deadline. It must never
  // inherit the Arcade season-end fallback when Remote Config is unavailable.
  if (program === "facilitator") {
    const facilitatorFallback = validatedDeadline(facilitatorFallbackDeadline)
    return facilitatorFallback
      ? { deadline: facilitatorFallback, source: "program-fallback" }
      : { deadline: null, source: "unconfigured" }
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
