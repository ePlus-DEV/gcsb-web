import assert from "node:assert/strict"
import test from "node:test"
import { verifyAnalyticsHtml } from "../scripts/verify-google-analytics-html.mjs"

const id = "G-EXAMPLE123"
const html = `<meta name="google-analytics-id" content="${id}">
<meta name="analytics-mode" content="always-enabled">
<meta name="cookie-notice-storage" content="arcade-cookie-notice-v1">
<script>const widgetPathPattern = /widget/; const path = window.location.pathname;
document.createElement("script"); const src="https://www.googletagmanager.com/gtag/js?id=${id}";
gtag("config", "${id}");</script>`

test("GA validator accepts production markers and rejects duplicate initializers", () => {
  verifyAnalyticsHtml(html, id)
  assert.throws(() => verifyAnalyticsHtml(html + html.slice(html.indexOf("<script>")), id), /exactly one/)
})
test("GA validator rejects missing widget guards, wrong IDs and fake metadata inside scripts", () => {
  assert.throws(() => verifyAnalyticsHtml(html.replace("widgetPathPattern", "otherPattern"), id), /widget exclusion/)
  assert.throws(() => verifyAnalyticsHtml(html, "G-OTHER"), /exactly one/)
  assert.throws(() => verifyAnalyticsHtml(html.replace(`<meta name="analytics-mode" content="always-enabled">`, `<script>const fake='<meta name="analytics-mode" content="always-enabled">';</script>`), id), /analytics-mode/)
})
