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

test("program countdown follows extension-style seasonal defaults and supports overrides", () => {
  assert.match(countdown, /month <= 6 \? "06-30" : "12-31"/)
  assert.match(countdown, /DEFAULT_TIME_ZONE_OFFSET = "\+05:30"/)
  assert.match(countdown, /NEXT_PUBLIC_COUNTDOWN_DEADLINE_FACILITATOR/)
  assert.match(countdown, /NEXT_PUBLIC_COUNTDOWN_ENABLED_FACILITATOR/)
  assert.match(countdown, /NEXT_PUBLIC_COUNTDOWN_DEADLINE_ARCADE/)
  assert.match(countdown, /NEXT_PUBLIC_COUNTDOWN_ENABLED_ARCADE/)
  assert.match(countdown, /setInterval\(\(\) => setNowMs\(Date\.now\(\)\), 1_000\)/)
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
