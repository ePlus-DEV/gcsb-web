import assert from "node:assert/strict"
import test from "node:test"
import {
  evaluateTypeScript,
  readRepoFile,
} from "./helpers/typescript-source.mjs"

const model = evaluateTypeScript(
  readRepoFile("components/arcade/model.ts"),
  "components/arcade/model.ts",
)

const {
  OFFICIAL_MILESTONES,
  clamp,
  getNextTier,
  getTier,
  numeric,
  tierRangeLabel,
} = model

test("official Arcade tier thresholds stay stable", () => {
  assert.deepEqual(
    OFFICIAL_MILESTONES.map(({ points, maxPoints, league }) => ({
      points,
      maxPoints,
      league,
    })),
    [
      { points: 50, maxPoints: 74, league: "Arcade Trooper" },
      { points: 75, maxPoints: 94, league: "Arcade Ranger" },
      { points: 95, maxPoints: 119, league: "Arcade Champion" },
      { points: 120, maxPoints: null, league: "Arcade Legend" },
    ],
  )
})

test("getTier handles every tier boundary without off-by-one errors", () => {
  const cases = [
    [0, "No tier yet"],
    [49, "No tier yet"],
    [50, "Arcade Trooper"],
    [74, "Arcade Trooper"],
    [75, "Arcade Ranger"],
    [94, "Arcade Ranger"],
    [95, "Arcade Champion"],
    [119, "Arcade Champion"],
    [120, "Arcade Legend"],
    [999, "Arcade Legend"],
  ]

  for (const [points, expected] of cases) {
    assert.equal(getTier(points).name, expected, `${points} points`)
  }
})

test("getNextTier advances only after the current threshold is reached", () => {
  const cases = [
    [0, 50],
    [49, 50],
    [50, 75],
    [74, 75],
    [75, 95],
    [94, 95],
    [95, 120],
    [119, 120],
    [120, 120],
    [999, 120],
  ]

  for (const [points, expected] of cases) {
    assert.equal(getNextTier(points).points, expected, `${points} points`)
  }
})

test("numeric and clamp keep malformed external values from poisoning calculations", () => {
  assert.equal(numeric(undefined), 0)
  assert.equal(numeric("not-a-number"), 0)
  assert.equal(numeric(Number.POSITIVE_INFINITY), 0)
  assert.equal(numeric("75"), 75)
  assert.equal(numeric(95.5), 95.5)

  assert.equal(clamp(-5, 0, 100), 0)
  assert.equal(clamp(50, 0, 100), 50)
  assert.equal(clamp(150, 0, 100), 100)
})

test("tier range labels match the official threshold shape", () => {
  assert.equal(tierRangeLabel(OFFICIAL_MILESTONES[0]), "50–74 points")
  assert.equal(tierRangeLabel(OFFICIAL_MILESTONES.at(-1)), "120+ points")
})
