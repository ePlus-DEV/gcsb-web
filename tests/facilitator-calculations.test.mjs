import assert from "node:assert/strict"
import test from "node:test"
import {
  evaluateTypeScript,
  readRepoFile,
  sliceBetween,
} from "./helpers/typescript-source.mjs"

const source = readRepoFile("components/arcade/facilitator-panel.tsx")
const milestonesSource = sliceBetween(
  source,
  "const MILESTONES = [",
  "\n\nconst GEAR_SKILL_BADGES",
)
const calculationFunctions = sliceBetween(
  source,
  "function milestoneComplete(",
  "\nfunction getFocusableElements",
)
const milestoneStateSource = sliceBetween(
  source,
  "  const completedMilestones =",
  "\n  const overallArcadePoints =",
)

const calculations = evaluateTypeScript(
  `${milestonesSource}

type Counts = { games: number; skills: number }

${calculationFunctions}

export function evaluateFacilitatorState(counts: Counts, isParticipating: boolean) {
${milestoneStateSource}
  return {
    completedMilestones,
    currentMilestone,
    nextMilestone,
    milestoneBonus,
    appliedMilestoneBonus,
  }
}

export { MILESTONES, milestoneComplete, regularArcadePointsForActivities, percentage, milestoneProgress }
`,
  "tests/generated-facilitator-calculations.ts",
)

const { MILESTONES } = calculations

test("Facilitator milestone requirements and bonuses stay aligned with the program", () => {
  assert.deepEqual(
    MILESTONES.map(({ id, bonus, requirements }) => ({ id, bonus, requirements })),
    [
      { id: "1", bonus: 5, requirements: { games: 6, skills: 18 } },
      { id: "2", bonus: 15, requirements: { games: 8, skills: 34 } },
      { id: "3", bonus: 25, requirements: { games: 10, skills: 50 } },
      { id: "ultimate", bonus: 35, requirements: { games: 12, skills: 66 } },
    ],
  )
})

test("a Facilitator milestone requires both the game and skill-badge thresholds", () => {
  const target = MILESTONES[0].requirements
  assert.equal(calculations.milestoneComplete({ games: 6, skills: 18 }, target), true)
  assert.equal(calculations.milestoneComplete({ games: 5, skills: 99 }, target), false)
  assert.equal(calculations.milestoneComplete({ games: 99, skills: 17 }, target), false)
})

test("regular Arcade points use one point per game and one per two skill badges", () => {
  assert.equal(calculations.regularArcadePointsForActivities({ games: 6, skills: 18 }), 15)
  assert.equal(calculations.regularArcadePointsForActivities({ games: 8, skills: 34 }), 25)
  assert.equal(calculations.regularArcadePointsForActivities({ games: 12, skills: 66 }), 45)
  assert.equal(calculations.regularArcadePointsForActivities({ games: 1, skills: 3 }), 2)
})

test("milestone progress is capped at the target instead of exceeding 100%", () => {
  const target = MILESTONES[0].requirements
  assert.deepEqual(
    calculations.milestoneProgress({ games: 3, skills: 9 }, target),
    { completed: 12, total: 24, percent: 50 },
  )
  assert.deepEqual(
    calculations.milestoneProgress({ games: 60, skills: 180 }, target),
    { completed: 24, total: 24, percent: 100 },
  )
})

test("only the highest completed Facilitator bonus is applied, and only when enabled", () => {
  const disabled = calculations.evaluateFacilitatorState(
    { games: 10, skills: 50 },
    false,
  )
  assert.equal(disabled.currentMilestone.id, "3")
  assert.equal(disabled.nextMilestone.id, "ultimate")
  assert.equal(disabled.milestoneBonus, 25)
  assert.equal(disabled.appliedMilestoneBonus, 0)

  const enabled = calculations.evaluateFacilitatorState(
    { games: 10, skills: 50 },
    true,
  )
  assert.equal(enabled.milestoneBonus, 25)
  assert.equal(enabled.appliedMilestoneBonus, 25)
})

test("missing one requirement never grants a partial milestone bonus", () => {
  const state = calculations.evaluateFacilitatorState(
    { games: 5, skills: 100 },
    true,
  )
  assert.equal(state.currentMilestone, null)
  assert.equal(state.nextMilestone.id, "1")
  assert.equal(state.milestoneBonus, 0)
  assert.equal(state.appliedMilestoneBonus, 0)
})

test("Ultimate milestone is the final Facilitator state", () => {
  const state = calculations.evaluateFacilitatorState(
    { games: 12, skills: 66 },
    true,
  )
  assert.equal(state.currentMilestone.id, "ultimate")
  assert.equal(state.nextMilestone.id, "ultimate")
  assert.equal(state.milestoneBonus, 35)
  assert.equal(state.appliedMilestoneBonus, 35)
})
