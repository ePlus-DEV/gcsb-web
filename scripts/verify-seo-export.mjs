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
for (const id of ["features", "how-it-works", "programs", "faq", "extension"]) {
  assert.ok(home.includes('id="' + id + '"'), "Homepage missing landing section: " + id)
}
assert.match(home, /How it works/)
assert.match(home, /landing-feature-card/)
assert.match(home, /landing-faq-item/)
assert.match(home, /data-arcade-swag-nav="true"/)
assert.ok(home.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].includes("Google Cloud Arcade"), "English landing heading is not prerendered")
assert.match(home, /rel="canonical" href="https:\/\/arcade\.eplus\.dev\/"/)
assert.doesNotMatch(home, /name="robots" content="noindex/i)
for (const [route, lang] of routes) {
  const page = html(route)
  assert.ok(page.includes('lang="' + lang + '"'), route + ": wrong language")
  assert.ok(page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].includes("Google Cloud Arcade"), route + ": landing heading is not prerendered")
  assert.ok(page.includes('rel="canonical" href="https://arcade.eplus.dev/' + route + '/"'), route + ": canonical")
  for (const id of ["features", "how-it-works", "programs", "faq", "extension"]) {
    assert.ok(page.includes('id="' + id + '"'), route + ": missing landing section " + id)
  }
  assert.ok(page.includes('href="/guide/"'), route + ": missing guide link")
  assert.ok(page.includes('href="/swag-drops/2026/"'), route + ": missing rewards link")
  assert.ok(page.includes('data-arcade-swag-nav="true"'), route + ": missing native menu link")
  assert.doesNotMatch(page, /name="robots" content="noindex/i)
}
for (const [route, heading] of [
  ["about", "All the useful Arcade information in one place"],
  ["guide", "From profile URL to Arcade score"],
  ["privacy", "Your public profile is all the calculator needs"],
  ["terms", "Clear expectations for a community tool"],
]) {
  const page = html(route)
  assert.ok(page.includes(heading), route + ": page-specific content missing")
  assert.ok(page.includes('href="/guide/"'), route + ": native guide link missing")
  assert.ok(page.includes('href="/"'), route + ": native calculator link missing")
  assert.ok(page.includes('rel="canonical" href="https://arcade.eplus.dev/' + route + '/"'), route + ": invalid canonical")
  assert.doesNotMatch(page, /name="robots" content="noindex/i)
}
const privacyHtml = html("privacy")
assert.ok(privacyHtml.includes("View cookie information"), "Privacy cookie information button missing")
assert.ok(privacyHtml.includes("does not include an analytics disable control"), "Analytics policy disclosure missing")
assert.ok(privacyHtml.includes("privacy@eplus.dev"), "Privacy contact missing")
const termsHtml = html("terms")
assert.ok(termsHtml.includes("Acceptable use"), "Terms acceptable use missing")
assert.ok(termsHtml.includes("support@eplus.dev"), "Terms contact missing")
const vietnamese = html("vi")
assert.ok(vietnamese.includes("Theo dõi, phân tích"), "Vietnamese landing heading is not prerendered")
assert.ok(vietnamese.includes("Cách thức hoạt động"), "Vietnamese steps are not prerendered")
console.log("SEO export verified: landing Home + " + routes.length + " localized pages; static links, heading, sections and canonicals.")
