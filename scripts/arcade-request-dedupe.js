(() => {
  const installFlag = "__eplusArcadeRequestDeduperInstalled"
  if (window[installFlag]) return

  const originalFetch = window.fetch.bind(window)
  const inFlight = new Map()
  const recent = new Map()
  const recentTtlMs = 5_000
  const apiOrigin = "https://hub.eplus.dev"
  const apiPaths = new Set(["/api/arcade-public", "/api/arcade-widget"])
  const bonusMilestonePrefix = "arcade-facilitator-bonus-milestone-v1"

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

  function isSharedProfilePage() {
    return /\/(?:profiles\/[^/]+|profile)\/?$/i.test(window.location.pathname)
  }

  function readBonusMilestoneCompleted(profileUrl) {
    const searchParams = new URLSearchParams(window.location.search)
    if (isSharedProfilePage()) return searchParams.get("bonus") === "1"

    try {
      return (
        window.localStorage.getItem(`${bonusMilestonePrefix}:${profileUrl}`) ===
        "true"
      )
    } catch {
      return false
    }
  }

  function addBonusMilestoneFlag(body) {
    try {
      const payload = JSON.parse(body)
      if (!payload || typeof payload !== "object") return body

      const profileUrl = normalizeProfileUrl(payload.url)
      if (!profileUrl) return body

      const facilitator =
        payload.facilitator && typeof payload.facilitator === "object"
          ? payload.facilitator
          : {}
      payload.facilitator = {
        ...facilitator,
        bonusMilestoneCompleted: readBonusMilestoneCompleted(profileUrl),
      }
      return JSON.stringify(payload)
    } catch {
      return body
    }
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

  function dedupeRequest(input, init, url, body, consumerSignal) {
    if (consumerSignal?.aborted) return Promise.reject(createAbortError())

    const key = getRequestKey(url, input, init, body)
    const now = Date.now()
    const cached = recent.get(key)

    if (cached) {
      if (cached.expiresAt > now) {
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
      const body = addBonusMilestoneFlag(init.body)
      const nextInit = body === init.body ? init : { ...init, body }
      return dedupeRequest(input, nextInit, url, body, consumerSignal)
    }

    if (!isRequest(input) || input.bodyUsed) return originalFetch(input, init)

    return input
      .clone()
      .text()
      .then(
        (rawBody) => {
          const body = addBonusMilestoneFlag(rawBody)
          if (body === rawBody) {
            return dedupeRequest(input, init, url, body, consumerSignal)
          }
          const request = new Request(input, { body })
          return dedupeRequest(request, init, url, body, consumerSignal)
        },
        () => originalFetch(input, init),
      )
  }

  window[installFlag] = true
})()
