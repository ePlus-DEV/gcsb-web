(() => {
  const installFlag = "__eplusArcadeRequestDeduperInstalled"
  if (window[installFlag]) return

  const originalFetch = window.fetch.bind(window)
  const inFlight = new Map()
  const recent = new Map()
  const recentTtlMs = 5_000
  const apiOrigin = "https://hub.eplus.dev"
  const apiPaths = new Set(["/api/arcade-public", "/api/arcade-widget"])
  const participationPrefix = "arcade-facilitator-participation-v1"
  const bonusMilestonePrefix = "arcade-facilitator-bonus-milestone-v1"
  const dashboardStorageKey = "eplus-arcade-dashboard-v1"
  const scoreContextStoragePrefix = "arcade-api-score-context-v1"
  const latestScoreContextKey = "__eplusArcadeLatestScoreContext"

  function isRequest(input) {
    return typeof Request !== "undefined" && input instanceof Request
  }

  function getRequestUrl(input) {
    if (typeof input === "string") return input
    if (input instanceof URL) return input.toString()
    if (isRequest(input)) return input.url
    return ""
  }

  function getRequestMethod(input, init) {
    if (init?.method) return String(init.method).toUpperCase()
    if (isRequest(input)) return input.method.toUpperCase()
    return "GET"
  }

  function getConsumerSignal(input, init) {
    if (init?.signal !== undefined) return init.signal
    if (isRequest(input)) return input.signal
    return null
  }

  function getEffectiveHeaders(input, init) {
    if (typeof Headers === "undefined") return []
    const headers =
      init?.headers !== undefined
        ? new Headers(init.headers)
        : isRequest(input)
          ? new Headers(input.headers)
          : new Headers()

    return [...headers.entries()].sort(([left], [right]) => left.localeCompare(right))
  }

  function getEffectiveOption(input, init, name, fallback) {
    if (init?.[name] !== undefined) return init[name]
    if (isRequest(input) && input[name] !== undefined) return input[name]
    return fallback
  }

  function getRequestKey(url, input, init, body) {
    return JSON.stringify({
      url: `${url.origin}${url.pathname}${url.search}`,
      body,
      headers: getEffectiveHeaders(input, init),
      credentials: getEffectiveOption(input, init, "credentials", "same-origin"),
      mode: getEffectiveOption(input, init, "mode", "cors"),
      cache: getEffectiveOption(input, init, "cache", "default"),
      redirect: getEffectiveOption(input, init, "redirect", "follow"),
      referrerPolicy: getEffectiveOption(input, init, "referrerPolicy", ""),
    })
  }

  function normalizeProfileUrl(value) {
    return typeof value === "string" ? value.trim().replace(/\/$/, "") : ""
  }

  function readStoredBoolean(prefix, profileUrl) {
    if (!profileUrl) return false
    try {
      return window.localStorage.getItem(`${prefix}:${profileUrl}`) === "true"
    } catch {
      return false
    }
  }

  function isSharedProfilePage() {
    return /\/(?:profiles\/[^/]+|profile)\/?$/i.test(window.location.pathname)
  }

  function getFacilitatorContext(profileUrl) {
    const searchParams = new URLSearchParams(window.location.search)
    const shared = isSharedProfilePage()
    const participating = shared
      ? searchParams.get("facilitator") === "1"
      : readStoredBoolean(participationPrefix, profileUrl)
    const bonusMilestoneCompleted = shared
      ? searchParams.get("bonus") === "1"
      : searchParams.get("bonus") === "1" ||
        readStoredBoolean(bonusMilestonePrefix, profileUrl)

    return { participating, bonusMilestoneCompleted }
  }

  function addFacilitatorContext(body) {
    try {
      const payload = JSON.parse(body)
      if (!payload || typeof payload !== "object") return { body, profileUrl: "" }

      const profileUrl = normalizeProfileUrl(payload.url)
      if (!profileUrl) return { body, profileUrl: "" }

      payload.facilitator = getFacilitatorContext(profileUrl)
      return { body: JSON.stringify(payload), profileUrl }
    } catch {
      return { body, profileUrl: "" }
    }
  }

  function rememberApiScore(response, profileUrl) {
    if (!profileUrl || !response?.ok) return

    void response
      .clone()
      .json()
      .then((payload) => {
        const arcadePoints = payload?.arcadePoints
        const facilitator = payload?.beta?.facilitator ?? payload?.facilitator
        if (
          facilitator?.bonusIncludedInTotal !== true ||
          !Number.isFinite(Number(arcadePoints?.totalPoints)) ||
          !Number.isFinite(Number(arcadePoints?.baseTotalPoints))
        ) {
          return
        }

        const context = {
          profileUrl,
          participating: facilitator.participating === true,
          bonusMilestoneCompleted: facilitator.bonusMilestoneCompleted === true,
          baseTotalPoints: Number(arcadePoints.baseTotalPoints),
          totalPoints: Number(arcadePoints.totalPoints),
          facilitatorBonusPoints: Number(arcadePoints.facilitatorBonusPoints) || 0,
        }

        window[latestScoreContextKey] = context
        try {
          window.localStorage.setItem(
            `${scoreContextStoragePrefix}:${profileUrl}`,
            JSON.stringify(context),
          )
        } catch {
          // Runtime scoring still works through the in-memory context.
        }
      })
      .catch(() => {
        // Ignore non-JSON gateway responses; callers retain their existing errors.
      })
  }

  function createAbortError() {
    try {
      return new DOMException("The operation was aborted.", "AbortError")
    } catch {
      const error = new Error("The operation was aborted.")
      error.name = "AbortError"
      return error
    }
  }

  function responseForConsumer(sharedRequest, signal) {
    if (!signal) return sharedRequest.then((response) => response.clone())
    if (signal.aborted) return Promise.reject(createAbortError())

    return new Promise((resolve, reject) => {
      let settled = false

      const cleanup = () => signal.removeEventListener("abort", onAbort)
      const onAbort = () => {
        if (settled) return
        settled = true
        cleanup()
        reject(createAbortError())
      }

      signal.addEventListener("abort", onAbort, { once: true })
      sharedRequest.then(
        (response) => {
          if (settled) return
          settled = true
          cleanup()
          resolve(response.clone())
        },
        (error) => {
          if (settled) return
          settled = true
          cleanup()
          reject(error)
        },
      )
    })
  }

  function dedupeRequest(input, init, url, body, consumerSignal, profileUrl = "") {
    if (consumerSignal?.aborted) return Promise.reject(createAbortError())

    const key = getRequestKey(url, input, init, body)
    const now = Date.now()
    const cached = recent.get(key)

    if (cached) {
      if (cached.expiresAt > now) {
        rememberApiScore(cached.response, profileUrl)
        return Promise.resolve(cached.response.clone())
      }
      recent.delete(key)
    }

    const existing = inFlight.get(key)
    if (existing) return responseForConsumer(existing, consumerSignal)

    const sharedInit = isRequest(input)
      ? { ...(init ?? {}), signal: null }
      : init && "signal" in init
        ? { ...init, signal: null }
        : init

    const sharedRequest = originalFetch(input, sharedInit)
      .then((response) => {
        rememberApiScore(response, profileUrl)
        if (response.ok) {
          const entry = {
            response: response.clone(),
            expiresAt: Date.now() + recentTtlMs,
          }
          recent.set(key, entry)
          window.setTimeout(() => {
            if (recent.get(key) === entry) recent.delete(key)
          }, recentTtlMs)
        }
        return response
      })
      .finally(() => {
        if (inFlight.get(key) === sharedRequest) inFlight.delete(key)
      })

    inFlight.set(key, sharedRequest)
    return responseForConsumer(sharedRequest, consumerSignal)
  }

  window.fetch = (input, init) => {
    const rawUrl = getRequestUrl(input)
    let url

    try {
      url = new URL(rawUrl, window.location?.href ?? "https://arcade.eplus.dev/")
    } catch {
      return originalFetch(input, init)
    }

    if (
      getRequestMethod(input, init) !== "POST" ||
      url.origin !== apiOrigin ||
      !apiPaths.has(url.pathname)
    ) {
      return originalFetch(input, init)
    }

    const consumerSignal = getConsumerSignal(input, init)

    if (init?.body !== undefined) {
      if (typeof init.body !== "string") return originalFetch(input, init)
      const enriched = addFacilitatorContext(init.body)
      const nextInit = enriched.body === init.body ? init : { ...init, body: enriched.body }
      return dedupeRequest(
        input,
        nextInit,
        url,
        enriched.body,
        consumerSignal,
        enriched.profileUrl,
      )
    }

    if (!isRequest(input) || input.bodyUsed) return originalFetch(input, init)

    return input
      .clone()
      .text()
      .then(
        (body) => dedupeRequest(input, init, url, body, consumerSignal),
        () => originalFetch(input, init),
      )
  }

  // Keep the dashboard key visible here because score consumers use the same
  // persisted profile identity when reconciling cached API totals.
  window.__eplusArcadeDashboardStorageKey = dashboardStorageKey
  window.__eplusArcadeScoreContextStoragePrefix = scoreContextStoragePrefix
  window[installFlag] = true
})()
