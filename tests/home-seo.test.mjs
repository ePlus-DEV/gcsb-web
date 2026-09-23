import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const locales = ["en", "vi", "ja", "ko", "zh_CN", "fr", "de", "es", "pt_BR", "it", "ru", "ar", "hi"]
const required = ["heroTitleTop", "heroTitleBottom", "heroDescription", "stepGuide", "openProfile", "makePublic", "copyUrl", "analyzeTheProfile", "readScore", "arcadeTiers", "tierNote", "allocationMessage", "accuracyOfficial", "unofficial", "guide", "aboutArcade", "unknownShown"]

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

test("homepage discovery is compact, responsive, and crawlable", () => {
  const component = readRepoFile("components/seo/home-search-guide.tsx")
  assert.match(component, /md:grid-cols-3/)
  assert.match(component, /min\(1280px, calc\(100% - 40px\)\)/)
  assert.match(component, /dark:bg-white\/\[0\.035\]/)
  for (const id of ["guide", "rewards", "accuracy"]) {
    assert.ok(component.includes('data-home-discovery-card="' + id + '"'))
  }
  assert.match(component, /href="\/guide\/"/)
  assert.match(component, /href="\/swag-drops\/2026\/"/)
  assert.match(component, /href="\/about\/"/)
  assert.doesNotMatch(component, /lg:grid-cols-2 lg:gap-12/)
})
