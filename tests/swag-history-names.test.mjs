import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

test("Season 1 Ranger keeps the official Pen Set product name", () => {
  const source = readRepoFile("components/arcade/swag-history.ts")

  assert.match(source, /"The Arcade Pen Set"/)
  assert.doesNotMatch(source, /Color Palette Pen Set/)
})
