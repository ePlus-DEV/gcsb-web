import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"

const html = (part) => readFileSync(path.join(process.cwd(), "out", part, "index.html"), "utf8")
const home = html("")
const routes = [
  ["vi", "vi"], ["ja", "ja"], ["ko", "ko"], ["zh-cn", "zh-CN"],
  ["fr", "fr"], ["de", "de"], ["es", "es"], ["pt-br", "pt-BR"],
  ["it", "it"], ["ru", "ru"], ["ar", "ar"], ["hi", "hi"],
]
for (const href of ["/guide/", "/about/", "/swag-drops/2026/", "/swag-drops/"]) {
  assert.ok(home.includes('href="' + href + '"'), "Homepage missing static link " + href)
}
assert.match(home, /id="arcade-seo-guide"/)
assert.match(home, /Step-by-step guide/)
assert.match(home, /data-arcade-swag-nav="true"/)
assert.match(home, /<h1[^>]*>CHECK YOUR/)
assert.match(home, /rel="canonical" href="https:\/\/arcade\.eplus\.dev\/"/)
assert.doesNotMatch(home, /name="robots" content="noindex/i)
for (const [route, lang] of routes) {
  const page = html(route)
  assert.ok(page.includes('lang="' + lang + '"'), route + ": wrong language")
  assert.ok(page.includes('rel="canonical" href="https://arcade.eplus.dev/' + route + '/"'), route + ": canonical")
  assert.ok(page.includes('id="arcade-seo-guide"'), route + ": missing guide")
  assert.ok(page.includes('href="/guide/"'), route + ": missing guide link")
  assert.ok(page.includes('href="/swag-drops/2026/"'), route + ": missing rewards link")
  assert.ok(page.includes('data-arcade-swag-nav="true"'), route + ": missing native menu link")
  assert.doesNotMatch(page, /name="robots" content="noindex/i)
}
const vietnamese = html("vi")
assert.ok(vietnamese.includes("KIỂM TRA"), "Vietnamese heading is not prerendered")
assert.ok(vietnamese.includes("Hướng dẫn từng bước"), "Vietnamese guide is not prerendered")
console.log("SEO export verified: home + " + routes.length + " localized pages; static links, headings and canonicals.")
