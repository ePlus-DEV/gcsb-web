import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const source = await readFile(
  new URL("../components/seo/seo-content.tsx", import.meta.url),
  "utf8",
)

test("calculator structured data models the page and web application", () => {
  for (const schemaType of ["WebSite", "WebPage", "Organization", "WebApplication"]) {
    assert.match(source, new RegExp(`"@type": "${schemaType}"`))
  }

  assert.match(source, /applicationCategory: "EducationalApplication"/)
  assert.match(source, /isAccessibleForFree: true/)
  assert.match(source, /price: 0/)
  assert.match(source, /mainEntity:\s*\{\s*"@id": applicationId/s)
  assert.match(source, /mainEntityOfPage:\s*\{\s*"@id": webpageId/s)
})

test("structured data advertises current calculator capabilities", () => {
  const expectedFeatures = [
    "Facilitator milestone bonuses",
    "Google Skills public profile analysis",
    "Current monthly Arcade games, access codes, deadlines, and completion tracking",
    "live remaining-slot comparison",
    "Arcade Facilitator milestone and syllabus tracking",
  ]

  for (const feature of expectedFeatures) {
    assert.ok(source.includes(feature), `Missing schema feature: ${feature}`)
  }
})

test("shared third-party profiles are not marked as ProfilePage", () => {
  assert.doesNotMatch(source, /"@type": "ProfilePage"/)
})
