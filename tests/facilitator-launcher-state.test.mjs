import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const participation = readFileSync(
  new URL("../components/arcade/facilitator-participation.ts", import.meta.url),
  "utf8",
)
const countdown = readFileSync(
  new URL("../components/arcade/program-countdown.tsx", import.meta.url),
  "utf8",
)
const gate = readFileSync(
  new URL("../components/arcade/facilitator-panel-gate.tsx", import.meta.url),
  "utf8",
)
const backToTopStyles = readFileSync(
  new URL("../app/styles/back-to-top.css", import.meta.url),
  "utf8",
)

test("Facilitator season state is shared with the launcher gate", () => {
  assert.match(participation, /FACILITATOR_PROGRAM_STATE_EVENT/)
  assert.match(participation, /writeFacilitatorProgramState/)
  assert.match(countdown, /facilitatorProgramState\(facilitatorProgram, nowMs\)/)
  assert.match(gate, /programState === "active" \|\| programState === "unconfigured"/)
  assert.match(gate, /facilitatorLauncherVisible/)
})

test("ended Facilitator uses the existing detail event instead of a visible launcher", () => {
  assert.match(countdown, /Season ended/)
  assert.match(countdown, /FACILITATOR_PANEL_OPEN_EVENT/)
  assert.doesNotMatch(countdown, /FACILITATOR_LAUNCHER_SELECTOR/)
  assert.match(gate, /FACILITATOR_PANEL_OPEN_EVENT/)
})

test("mobile back-to-top moves above a visible Facilitator launcher", () => {
  assert.match(
    backToTopStyles,
    /html\[data-facilitator-launcher-visible="true"\] \.back-to-top/,
  )
  assert.match(backToTopStyles, /bottom: calc\(148px \+ env\(safe-area-inset-bottom\)\)/)
})
