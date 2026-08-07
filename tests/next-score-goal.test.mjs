import assert from "node:assert/strict"
import test from "node:test"
import {
  evaluateTypeScript,
  readRepoFile,
  sliceBetween,
} from "./helpers/typescript-source.mjs"

const calculatorSource = readRepoFile("app/redesign-calculator.tsx")
const qualifiedMilestoneSource = sliceBetween(
  calculatorSource,
  "function getQualifiedMilestone(",
  "\nfunction safeDateLabel",
)
const goalSource = sliceBetween(
  calculatorSource,
  "  const nextMilestone =",
  "\n\n  async function analyzeProfile",
)

const goalModule = evaluateTypeScript(
  `${qualifiedMilestoneSource}

export function evaluateNextScoreGoal(points: number, milestones: any[]) {
  const qualifiedMilestone = getQualifiedMilestone(points, milestones)
${goalSource}

  return {
    qualifiedMilestone,
    nextMilestone,
    pointsToNextTier,
    maxTierPoints,
    hasReachedMaxTier,
    goalStartPoints,
    goalRange,
    goalProgress,
  }
}
`,
  "tests/generated-next-score-goal.ts",
)

const milestones = [
  { points: 50, maxPoints: 74, league: "Arcade Trooper", slots: 6000, spotsLeft: null },
  { points: 75, maxPoints: 94, league: "Arcade Ranger", slots: 4000, spotsLeft: null },
  { points: 95, maxPoints: 119, league: "Arcade Champion", slots: 3000, spotsLeft: null },
  { points: 120, maxPoints: null, league: "Arcade Legend", slots: 2500, spotsLeft: null },
]

const evaluate = (points) => goalModule.evaluateNextScoreGoal(points, milestones)

test("next score goal resets progress at each newly reached tier", () => {
  const ranger = evaluate(75)
  assert.equal(ranger.qualifiedMilestone.league, "Arcade Ranger")
  assert.equal(ranger.nextMilestone.league, "Arcade Champion")
  assert.equal(ranger.pointsToNextTier, 20)
  assert.equal(ranger.goalStartPoints, 75)
  assert.equal(ranger.goalProgress, 0)

  const champion = evaluate(95)
  assert.equal(champion.qualifiedMilestone.league, "Arcade Champion")
  assert.equal(champion.nextMilestone.league, "Arcade Legend")
  assert.equal(champion.pointsToNextTier, 25)
  assert.equal(champion.goalStartPoints, 95)
  assert.equal(champion.goalProgress, 0)
})

test("next score goal progress is relative to the current tier range", () => {
  const cases = [
    { points: 0, next: 50, remaining: 50, progress: 0 },
    { points: 49, next: 50, remaining: 1, progress: 98 },
    { points: 50, next: 75, remaining: 25, progress: 0 },
    { points: 74, next: 75, remaining: 1, progress: 96 },
    { points: 85, next: 95, remaining: 10, progress: 50 },
    { points: 94, next: 95, remaining: 1, progress: 95 },
    { points: 119, next: 120, remaining: 1, progress: 96 },
  ]

  for (const expected of cases) {
    const actual = evaluate(expected.points)
    assert.equal(actual.nextMilestone.points, expected.next, `${expected.points}: next tier`)
    assert.equal(actual.pointsToNextTier, expected.remaining, `${expected.points}: remaining`)
    assert.equal(actual.goalProgress, expected.progress, `${expected.points}: progress`)
  }
})

test("maximum tier stays capped at MAX / 100%", () => {
  for (const points of [120, 121, 999]) {
    const actual = evaluate(points)
    assert.equal(actual.hasReachedMaxTier, true)
    assert.equal(actual.nextMilestone.league, "Arcade Legend")
    assert.equal(actual.pointsToNextTier, 0)
    assert.equal(actual.goalStartPoints, 120)
    assert.equal(actual.goalProgress, 100)
  }
})

test("goal progress never falls below zero for unexpected negative input", () => {
  const actual = evaluate(-10)
  assert.equal(actual.goalProgress, 0)
  assert.equal(actual.pointsToNextTier, 60)
})
