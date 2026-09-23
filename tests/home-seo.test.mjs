import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const locales = ["en", "vi", "ja", "ko", "zh_CN", "fr", "de", "es", "pt_BR", "it", "ru", "ar", "hi"]
const required = ["heroTitleTop", "heroTitleBottom", "heroDescription", "stepGuide", "openProfile", "makePublic", "copyUrl", "analyzeTheProfile", "readScore", "arcadeTiers", "tierNote", "allocationMessage", "accuracyOfficial", "unofficial", "guide", "aboutArcade"]

test("all published languages can prerender the calculator guide", () => {
  for (const locale of locales) {
    const c = JSON.parse(readFileSync(new URL("../public/i18n/locales/" + locale + ".json", import.meta.url), "utf8"))
    for (const key of required) assert.ok(c.messages[key]?.trim(), locale + " missing " + key)
    assert.ok(c.additional["Arcade 2026 rewards"]?.trim(), locale + " missing rewards label")
  }
})

test("homepage navigation and guide have server-renderable native links", () => {
  const calc = readRepoFile("app/redesign-calculator.tsx")
  const root = readRepoFile("app/page.tsx")
  const localized = readRepoFile("app/[locale]/page.tsx")
  const guide = readRepoFile("components/seo/home-search-guide.tsx")
  assert.match(calc, /data-arcade-swag-nav="true"/)
  assert.match(calc, /<nav className="footer-route-links" aria-label="Site information">/)
  assert.match(calc, /href="\/guide\/"/)
  assert.match(calc, /href="\/about\/"/)
  assert.match(root, /footerContent=\{<HomeSearchGuide catalog=\{englishCatalog\} \/>\}/)
  assert.match(localized, /footerContent=\{<HomeSearchGuide catalog=\{catalog\} \/>\}/)
  assert.match(localized, /top: catalog.messages.heroTitleTop/)
  assert.doesNotMatch(localized, /<section className="sr-only"[^>]*><h1>/)
  assert.match(guide, /id="arcade-seo-guide"/)
  assert.match(guide, /href="\/swag-drops\/2026\/"/)
})
