import assert from "node:assert/strict"
import test from "node:test"
import {
  evaluateTypeScript,
  readRepoFile,
} from "./helpers/typescript-source.mjs"

const syllabus = evaluateTypeScript(
  readRepoFile("components/arcade/facilitator-syllabus.ts"),
  "components/arcade/facilitator-syllabus.ts",
)

const {
  FACILITATOR_SYLLABUS_2026,
  evaluateFacilitatorSyllabus,
  getCourseTemplateId,
  normalizeFacilitatorBadgeTitle,
} = syllabus

test("the 2026 Facilitator syllabus keeps 51 unique badges across three tracks", () => {
  assert.equal(FACILITATOR_SYLLABUS_2026.length, 51)
  assert.equal(new Set(FACILITATOR_SYLLABUS_2026.map((item) => item.courseTemplateId)).size, 51)

  const counts = FACILITATOR_SYLLABUS_2026.reduce((result, item) => {
    result[item.track] = (result[item.track] ?? 0) + 1
    return result
  }, {})
  assert.deepEqual(counts, { beginner: 17, intermediate: 17, advanced: 17 })
})

test("course template IDs are extracted only from course-template URLs", () => {
  assert.equal(
    getCourseTemplateId("https://www.skills.google/paths/1/course_templates/1586"),
    "1586",
  )
  assert.equal(getCourseTemplateId("https://www.skills.google/course_templates/754"), "754")
  assert.equal(getCourseTemplateId("https://www.skills.google/paths/1"), null)
  assert.equal(getCourseTemplateId(undefined), null)
})

test("badge title normalization ignores harmless punctuation and spacing", () => {
  assert.equal(
    normalizeFacilitatorBadgeTitle("Build Real-World AI Applications with Gemini & Imagen"),
    normalizeFacilitatorBadgeTitle("Build Real World AI Applications with Gemini and Imagen"),
  )
})

test("syllabus matching prefers course ID when a public badge URL provides it", () => {
  const result = evaluateFacilitatorSyllabus([
    {
      title: "A renamed badge title that no longer matches",
      badgeURL: "https://www.skills.google/course_templates/754",
    },
  ])
  const matched = result.find((item) => item.courseTemplateId === "754")

  assert.equal(matched.completed, true)
  assert.equal(matched.matchReason, "course-id")
})

test("known renamed badge aliases still count as completed", () => {
  const result = evaluateFacilitatorSyllabus([
    { title: "Develop AI-Powered Prototypes with Google AI Studio" },
  ])
  const matched = result.find((item) => item.courseTemplateId === "1426")

  assert.equal(matched.completed, true)
  assert.equal(matched.matchReason, "title")
})

test("one earned badge cannot be reused to satisfy multiple syllabus entries", () => {
  const result = evaluateFacilitatorSyllabus([
    { title: "Develop AI-Powered Prototypes with Google AI Studio" },
  ])
  assert.equal(result.filter((item) => item.completed).length, 1)
})
