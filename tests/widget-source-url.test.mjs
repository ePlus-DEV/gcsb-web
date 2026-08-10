import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const widgetPage = readFileSync(new URL("../app/widget/page.tsx", import.meta.url), "utf8")
const sourceBridge = readFileSync(
  new URL("../components/arcade/widget-source-bridge.tsx", import.meta.url),
  "utf8",
)
const parentBridge = readFileSync(
  new URL("../public/arcade-widget-parent.js", import.meta.url),
  "utf8",
)

test("widget resolves and forwards the embedding page URL", () => {
  assert.match(widgetPage, /WidgetSourceBridge/)
  assert.match(sourceBridge, /window\.parent\.location\.href/)
  assert.match(sourceBridge, /document\.referrer/)
  assert.match(sourceBridge, /ancestorOrigins/)
  assert.match(sourceBridge, /source_url/)
  assert.match(sourceBridge, /eplus-arcade-widget:request-source/)
  assert.match(sourceBridge, /eplus-arcade-widget:source/)
})

test("cross-origin parent bridge strips query and hash before forwarding", () => {
  assert.match(parentBridge, /url\.search = ""/)
  assert.match(parentBridge, /url\.hash = ""/)
  assert.match(parentBridge, /eplus-arcade-widget:request-source/)
  assert.match(parentBridge, /eplus-arcade-widget:source/)
  assert.match(parentBridge, /frame\.contentWindow\.postMessage/)
})
