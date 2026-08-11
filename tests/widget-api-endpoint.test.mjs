import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"

const modelPath = path.join(process.cwd(), "components", "arcade", "model.ts")
const modelSource = await readFile(modelPath, "utf8")

test("widget runtime uses its own Arcade API endpoint", () => {
  assert.match(modelSource, /NEXT_PUBLIC_ARCADE_WIDGET_API_URL/)
  assert.match(modelSource, /https:\/\/hub\.eplus\.dev\/api\/arcade-widget/)
  assert.match(modelSource, /function isWidgetRuntime\(\)/)
  assert.match(modelSource, /widget\\\/\?\$/)
  assert.match(modelSource, /isWidgetRuntime\(\) \? WIDGET_API_URL : DEFAULT_API_URL/)
})
