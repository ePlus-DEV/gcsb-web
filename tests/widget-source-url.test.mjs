import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const widget = readFileSync(
  new URL("../components/arcade/arcade-embed-widget.tsx", import.meta.url),
  "utf8",
)
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")

test("widget reads the embedding page from the iframe referrer", () => {
  assert.match(widget, /params\.get\("source_url"\)/)
  assert.match(widget, /document\.referrer/)
  assert.match(widget, /url\.search = ""/)
  assert.match(widget, /url\.hash = ""/)
})

test("iframe embed exposes the parent pathname without an extra script", () => {
  assert.match(readme, /referrerpolicy="no-referrer-when-downgrade"/)
  assert.doesNotMatch(readme, /arcade-widget-parent\.js/)
})
