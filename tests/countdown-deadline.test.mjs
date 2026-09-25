import assert from "node:assert/strict"
import test from "node:test"
import { evaluateTypeScript, readRepoFile } from "./helpers/typescript-source.mjs"

const {
  validatedDeadline,
  initialDeadline,
  resolvedRemoteDeadline,
} = evaluateTypeScript(readRepoFile("components/arcade/countdown-deadline.ts"))

const arcade = "2026-12-31T23:59:59+05:30"
const facilitator = "2026-09-14T23:59:59+05:30"

test("Firebase console dates are independent: Facilitator Sep 14, Arcade Dec 31", () => {
  assert.deepEqual(initialDeadline("facilitator", facilitator, arcade), {
    deadline: facilitator, source: "env",
  })
  assert.deepEqual(initialDeadline("arcade", arcade, arcade), {
    deadline: arcade, source: "env",
  })
  assert.notEqual(Date.parse(facilitator), Date.parse(arcade))
})

test("missing, blank or invalid Facilitator setting never inherits Arcade fallback", () => {
  for (const missing of [null, undefined, "", "   ", "invalid", "2026-09-14"]) {
    assert.deepEqual(initialDeadline("facilitator", missing, arcade), {
      deadline: null, source: "unconfigured",
    })
  }
  assert.deepEqual(initialDeadline("arcade", "", arcade), {
    deadline: arcade, source: "season-fallback",
  })
})

test("Firebase remote values override only the matching program, including past dates", () => {
  const missingFacilitator = initialDeadline("facilitator", "", arcade)
  const localArcade = initialDeadline("arcade", "", arcade)
  assert.deepEqual(
    resolvedRemoteDeadline(missingFacilitator, facilitator, "remote"),
    { deadline: facilitator, source: "remote" },
  )
  assert.deepEqual(
    resolvedRemoteDeadline(localArcade, arcade, "remote"),
    { deadline: arcade, source: "remote" },
  )
  assert.deepEqual(
    resolvedRemoteDeadline(missingFacilitator, arcade, "default"),
    missingFacilitator,
  )
  assert.deepEqual(
    resolvedRemoteDeadline(missingFacilitator, facilitator, "static"),
    missingFacilitator,
  )
  assert.deepEqual(
    resolvedRemoteDeadline(missingFacilitator, "invalid", "remote"),
    missingFacilitator,
  )
})

test("deadlines need absolute, valid timestamps with timezone", () => {
  assert.equal(validatedDeadline(facilitator), facilitator)
  assert.equal(validatedDeadline(arcade), arcade)
  assert.equal(validatedDeadline("2026-09-14T23:59:59Z"), "2026-09-14T23:59:59Z")
  for (const invalid of ["tomorrow", "2026-09-14", "", "2026-09-14T23:59:59",
    "2026-09-14T25:00:00+05:30", "2026-09-14T23:59:59+99:30"]) {
    assert.equal(validatedDeadline(invalid), null, invalid)
  }
})

test("missing remote config is not silently relabeled as an Arcade date", () => {
  const ui = readRepoFile("components/arcade/program-countdown.tsx")
  const helper = readRepoFile("components/arcade/countdown-deadline.ts")
  assert.match(ui, /countdown_deadline_facilitator: facilitator\.deadline \?\? ""/)
  assert.match(ui, /countdown_deadline_arcade: arcade\.deadline \?\? ""/)
  assert.match(ui, /deadlineSource: facilitatorDeadline\.source/)
  assert.match(ui, /deadlineSource: arcadeDeadline\.source/)
  assert.match(ui, /data-deadline-source=\{config\.deadlineSource\}/)
  assert.match(ui, /Not announced/)
  assert.match(helper, /if \(program === "facilitator"\)/)
})
