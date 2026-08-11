import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"

const modelPath = path.join(process.cwd(), "components", "arcade", "model.ts")
const widgetPath = path.join(process.cwd(), "components", "arcade", "arcade-embed-widget.tsx")

const modelSource = await readFile(modelPath, "utf8")
const widgetSource = await readFile(widgetPath, "utf8")

test("widget uses its own Arcade API endpoint", () => {
  assert.match(modelSource, /NEXT_PUBLIC_ARCADE_WIDGET_API_URL/)
  assert.match(modelSource, /https:\/\/hub\.eplus\.dev\/api\/arcade-widget/)
  assert.match(widgetSource, /WIDGET_API_URL/)
  assert.doesNotMatch(widgetSource, /fetch\(API_URL/)
  assert.match(widgetSource, /fetch\(WIDGET_API_URL/)
})
