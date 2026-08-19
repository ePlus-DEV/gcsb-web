import assert from "node:assert/strict"
import test from "node:test"
import {
  evaluateTypeScript,
  readRepoFile,
} from "./helpers/typescript-source.mjs"

const source = readRepoFile("components/arcade/facilitator-points.ts")
const facilitator = evaluateTypeScript(
  source,
  "tests/generated-facilitator-points.ts",
)

test("Facilitator standard milestone bonuses stay 5, 15, 25 and 35", () => {
  assert.deepEqual(
    facilitator.FACILITATOR_MILESTONES.map(({ id, bonus, requirements }) => ({
      id,
      bonus,
      requirements,
    })),
    [
      { id: "1", bonus: 5, requirements: { games: 6, skills: 18 } },
      { id: "2", bonus: 15, requirements: { games: 8, skills: 34 } },
      { id: "3", bonus: 25, requirements: { games: 10, skills: 50 } },
      { id: "ultimate", bonus: 35, requirements: { games: 12, skills: 66 } },
    ],
  )
})

test("score uses only the highest completed standard milestone bonus", () => {
  assert.equal(facilitator.getFacilitatorMilestoneBonus({ games: 6, skills: 18 }), 5)
  assert.equal(facilitator.getFacilitatorMilestoneBonus({ games: 8, skills: 34 }), 15)
  assert.equal(facilitator.getFacilitatorMilestoneBonus({ games: 10, skills: 50 }), 25)
  assert.equal(facilitator.getFacilitatorMilestoneBonus({ games: 12, skills: 66 }), 35)
})

test("displayed Arcade points include the active Facilitator milestone bonus", () => {
  assert.deepEqual(
    facilitator.getFacilitatorAdjustedPoints(75, { games: 6, skills: 18 }, true),
    { basePoints: 75, bonus: 5, totalPoints: 80 },
  )
  assert.deepEqual(
    facilitator.getFacilitatorAdjustedPoints(75, { games: 8, skills: 34 }, true),
    { basePoints: 75, bonus: 15, totalPoints: 90 },
  )
})

test("participation off keeps the crawler score unchanged", () => {
  assert.deepEqual(
    facilitator.getFacilitatorAdjustedPoints(75, { games: 12, skills: 66 }, false),
    { basePoints: 75, bonus: 0, totalPoints: 75 },
  )
})

test("missing either requirement grants no partial milestone bonus", () => {
  assert.equal(facilitator.getFacilitatorMilestoneBonus({ games: 5, skills: 99 }), 0)
  assert.equal(facilitator.getFacilitatorMilestoneBonus({ games: 99, skills: 17 }), 0)
})

test("Bonus Milestone stays separate from standard milestone lookup", () => {
  assert.equal(facilitator.FACILITATOR_BONUS_MILESTONE_POINTS, 10)
  assert.equal(facilitator.getFacilitatorMilestoneBonus({ games: 6, skills: 18 }), 5)
})

test("legacy API responses keep the current +10 compatibility fallback", () => {
  assert.deepEqual(
    facilitator.getFacilitatorAdjustedPoints(
      75,
      { games: 6, skills: 18 },
      true,
      true,
    ),
    { basePoints: 75, bonus: 15, totalPoints: 90 },
  )
})

function withDashboardResult(result, callback) {
  const previousWindow = globalThis.window
  const profileUrl =
    "https://www.skills.google/public_profiles/11111111-1111-4111-8111-111111111111"
  const dashboard = JSON.stringify({ profileUrl, result })

  globalThis.window = {
    location: { search: "", pathname: "/" },
    localStorage: {
      getItem(key) {
        if (key === "eplus-arcade-dashboard-v1") return dashboard
        if (key === `arcade-facilitator-bonus-milestone-v1:${profileUrl}`) {
          return "true"
        }
        return null
      },
    },
  }

  try {
    callback()
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
}

test("API metadata owns the applied Bonus Milestone amount", () => {
  withDashboardResult(
    {
      beta: {
        facilitator: {
          bonusMilestoneEnabled: true,
          bonusMilestoneAvailablePoints: 12,
          bonusMilestoneCompleted: true,
          bonusMilestonePoints: 12,
        },
      },
    },
    () => {
      assert.deepEqual(
        facilitator.getFacilitatorAdjustedPoints(
          75,
          { games: 6, skills: 18 },
          true,
          true,
        ),
        { basePoints: 75, bonus: 17, totalPoints: 92 },
      )
    },
  )
})

test("API can disable Bonus Milestone for a later season without a client release", () => {
  withDashboardResult(
    {
      beta: {
        facilitator: {
          bonusMilestoneEnabled: false,
          bonusMilestoneAvailablePoints: 0,
          bonusMilestoneCompleted: true,
          bonusMilestonePoints: 0,
        },
      },
    },
    () => {
      assert.deepEqual(
        facilitator.getFacilitatorAdjustedPoints(
          75,
          { games: 6, skills: 18 },
          true,
          true,
        ),
        { basePoints: 75, bonus: 5, totalPoints: 80 },
      )
    },
  )
})

test("checked Bonus Milestone is ignored when Facilitator participation is off", () => {
  assert.deepEqual(
    facilitator.getFacilitatorAdjustedPoints(
      75,
      { games: 12, skills: 66 },
      false,
      true,
    ),
    { basePoints: 75, bonus: 0, totalPoints: 75 },
  )
})
