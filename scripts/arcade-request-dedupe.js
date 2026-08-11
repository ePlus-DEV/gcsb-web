(() => {
  const installFlag = "__eplusArcadeRequestDeduperInstalled"
  if (window[installFlag]) return

  const originalFetch = window.fetch.bind(window)
  const inFlight = new Map()
  const recent = new Map()
  const recentTtlMs = 5_000
  const apiHost = "hub.eplus.dev"
  const apiPaths = new Set(["/api/arcade-public", "/api/arcade-widget"])

  function getRequestUrl(input) {
    if (typeof input === "string") return input
    if (input instanceof URL) return input.toString()
    if (typeof Request !== "undefined" && input instanceof Request) return input.url
    return ""
  }

  function getRequestMethod(input, init) {
    if (init?.method) return String(init.method).toUpperCase()
    if (typeof Request !== "undefined" && input instanceof Request) {
      return input.method.toUpperCase()
    }
    return "GET"
  }

  function getRequestBody(init) {
    return typeof init?.body === "string" ? init.body : null
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
      url.hostname.toLowerCase() !== apiHost ||
      !apiPaths.has(url.pathname)
    ) {
      return originalFetch(input, init)
    }

    const body = getRequestBody(init)
    if (body === null) return originalFetch(input, init)

    const key = `${url.origin}${url.pathname}${url.search}|${body}`
    const now = Date.now()
    const cached = recent.get(key)

    if (cached) {
      if (cached.expiresAt > now) {
        if (init?.signal?.aborted) return Promise.reject(createAbortError())
        return Promise.resolve(cached.response.clone())
      }
      recent.delete(key)
    }

    const existing = inFlight.get(key)
    if (existing) return responseForConsumer(existing, init?.signal)

    let sharedInit = init
    if (init && "signal" in init) {
      const { signal: _consumerSignal, ...withoutSignal } = init
      sharedInit = withoutSignal
    }

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
    return responseForConsumer(sharedRequest, init?.signal)
  }

  window[installFlag] = true
})()
