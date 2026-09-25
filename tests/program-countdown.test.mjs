import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const countdown = readFileSync(
  new URL("../components/arcade/program-countdown.tsx", import.meta.url),
  "utf8",
)
const styles = readFileSync(
  new URL("../app/styles/program-countdown.css", import.meta.url),
  "utf8",
)
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8")
const nextConfig = readFileSync(new URL("../next.config.mjs", import.meta.url), "utf8")
const calculator = readFileSync(new URL("../app/redesign-calculator.tsx", import.meta.url), "utf8")
const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")
const localizedPage = readFileSync(
  new URL("../app/[locale]/page.tsx", import.meta.url),
  "utf8",
)

test("program countdown is mounted on default and localized homepages", () => {
  assert.match(page, /import ProgramCountdown/)
  assert.match(page, /<ProgramCountdown \/>/)
  assert.match(localizedPage, /import ProgramCountdown/)
  assert.match(localizedPage, /<ProgramCountdown \/>/)
})


test("program countdown keeps a deterministic home position for every locale", () => {
  assert.match(calculator, /className="program-countdown-host" data-home-order="program-countdown"/)
  assert.ok(
    calculator.indexOf('className="program-countdown-host"') <
      calculator.indexOf('id="extension" className="extension-strip"'),
  )
})

test("program countdown separates last published Facilitator date from Arcade seasonal fallback", () => {
  assert.match(countdown, /month <= 6 \? "06-30" : "12-31"/)
  assert.match(countdown, /DEFAULT_TIME_ZONE_OFFSET = "\+05:30"/)
  assert.match(countdown, /WXT_COUNTDOWN_DEADLINE_FACILITATOR/)
  assert.match(countdown, /WXT_COUNTDOWN_ENABLED_FACILITATOR/)
  assert.match(countdown, /WXT_COUNTDOWN_DEADLINE_ARCADE/)
  assert.match(countdown, /WXT_COUNTDOWN_ENABLED_ARCADE/)
  assert.match(countdown, /initialDeadline\(/)
  assert.match(countdown, /"facilitator"/)
  assert.match(countdown, /"arcade"/)
  assert.match(countdown, /setInterval\(\(\) => setNowMs\(Date\.now\(\)\), 1_000\)/)
})

test("program countdown fetches Firebase Remote Config and accepts only remote values", () => {
  assert.match(countdown, /firebase-app\.js/)
  assert.match(countdown, /firebase-remote-config\.js/)
  assert.match(countdown, /fetchAndActivate\(remoteConfig\)/)
  assert.match(countdown, /getValue: \(remoteConfig: RemoteConfigInstance, key: string\)/)
  assert.match(countdown, /resolvedRemoteDeadline\(fallback, value\.asString\(\), value\.getSource\?\.\(\)\)/)
  assert.match(countdown, /"countdown_deadline_facilitator"/)
  assert.match(countdown, /"countdown_deadline_arcade"/)
  assert.match(countdown, /data-deadline-source=\{config\.deadlineSource\}/)
  assert.match(countdown, /minimumFetchIntervalMillis/)
  assert.match(countdown, /fetchTimeoutMillis/)
  assert.match(countdown, /WXT_FORCE_REMOTE_CONFIG/)
})

test("Next exposes the extension-compatible WXT Firebase settings to the browser build", () => {
  for (const key of [
    "WXT_FIREBASE_API_KEY",
    "WXT_FIREBASE_AUTH_DOMAIN",
    "WXT_FIREBASE_PROJECT_ID",
    "WXT_FIREBASE_STORAGE_BUCKET",
    "WXT_FIREBASE_MESSAGING_SENDER_ID",
    "WXT_FIREBASE_APP_ID",
    "WXT_FIREBASE_FETCH_INTERVAL_MS",
    "WXT_FIREBASE_FETCH_TIMEOUT_MS",
    "WXT_COUNTDOWN_DEADLINE_FACILITATOR",
    "WXT_COUNTDOWN_ENABLED_FACILITATOR",
    "WXT_COUNTDOWN_DEADLINE_ARCADE",
    "WXT_COUNTDOWN_ENABLED_ARCADE",
  ]) {
    assert.match(nextConfig, new RegExp(key))
  }
  assert.match(nextConfig, /env: publicRuntimeEnv/)
})

test("program countdown uses localized Intl unit labels and a responsive stylesheet", () => {
  assert.match(countdown, /new Intl\.NumberFormat\(locale/)
  assert.match(countdown, /formatToParts\(2\)/)
  assert.match(countdown, /new Intl\.DateTimeFormat\(locale/)
  assert.match(countdown, /hero\.insertAdjacentElement\("afterend", countdownHost\)/)
  assert.match(layout, /\.\/styles\/program-countdown\.css/)
  assert.match(styles, /\.program-countdown-grid/)
  assert.match(styles, /@media \(max-width:720px\)/)
  assert.match(styles, /\.light \.program-countdown-card/)
})

test("ended programs switch from zero countdown boxes to an archive-style state", () => {
  assert.match(countdown, /data-program-state=\{!remaining \? "unconfigured" : remaining\.ended \? "ended" : "active"\}/)
  assert.match(countdown, /remaining\.ended \? \(/)
  assert.match(countdown, /program-countdown-ended/)
  assert.match(countdown, /"Unavailable"/)
  assert.match(countdown, /"Event ended"/)
  assert.match(countdown, /"Program tracker"/)
  assert.match(countdown, /View program details/)
  assert.match(countdown, /FACILITATOR_LAUNCHER_SELECTOR/)
  assert.match(styles, /\.program-countdown-card\.is-ended/)
  assert.match(styles, /\.program-countdown-ended-action/)
})

test("expired Facilitator event displays ended rather than awaiting configuration", () => {
  const deadline = readFileSync(
    new URL("../components/arcade/countdown-deadline.ts", import.meta.url),
    "utf8",
  )
  assert.match(countdown, /deadline: facilitatorDeadline\.deadline/)
  assert.match(countdown, /deadline: arcadeDeadline\.deadline/)
  assert.match(countdown, /countdown_deadline_facilitator: facilitator\.deadline \?\? ""/)
  assert.match(countdown, /Last published 2026 deadline/)
  assert.match(countdown, /Event ended/)
  assert.doesNotMatch(countdown, /Awaiting Facilitator configuration/)
  assert.match(countdown, /Firebase browser config is incomplete/)
  assert.match(countdown, /data-program-state/)
  assert.match(styles, /program-countdown-unconfigured/)
  assert.match(deadline, /if \(program === "facilitator"\)/)
  assert.match(deadline, /source: "published-fallback"/)
  assert.match(deadline, /LAST_PUBLISHED_FACILITATOR_2026_DEADLINE/)
  assert.match(deadline, /source: "season-fallback"/)
})
