import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const widgetPage = readFileSync(new URL("../app/widget/page.tsx", import.meta.url), "utf8")
const websiteLanguage = readFileSync(
  new URL("../components/i18n/website-language.tsx", import.meta.url),
  "utf8",
)

test("widget stays outside the website translation pipeline", () => {
  assert.match(widgetPage, /data-no-translate/)
  assert.match(widgetPage, /className="notranslate"/)
  assert.match(widgetPage, /lang="en"/)
  assert.match(widgetPage, /translate="no"/)
  assert.match(websiteLanguage, /\[data-no-translate\]/)
})
