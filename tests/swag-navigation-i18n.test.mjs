import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

test("internal non-localized pages switch language without leaving the current route", () => {
  const language = readRepoFile("components/i18n/website-language.tsx")

  assert.match(language, /const isHomepage = pathWithoutBase === "\/"/)
  assert.match(language, /if \(isHomepage \|\| pathLocale\)/)
  assert.match(language, /setLocale\(nextLocale\)/)
  assert.match(language, /Internal non-localized routes/)
})

test("swag routes expose an automatic visual breadcrumb trail", () => {
  const shell = readRepoFile("components/site/internal-page-shell.tsx")
  const breadcrumbs = readRepoFile("components/site/internal-breadcrumbs.tsx")

  assert.match(shell, /<InternalBreadcrumbs \/>/)
  assert.match(breadcrumbs, /segments\[0\] !== "swag-drops"/)
  assert.match(breadcrumbs, /label: "Swag Drops"/)
  assert.match(breadcrumbs, /Arcade Trooper/)
  assert.match(breadcrumbs, /Arcade Ranger/)
  assert.match(breadcrumbs, /Arcade Champion/)
  assert.match(breadcrumbs, /Arcade Legend/)
  assert.match(breadcrumbs, /Weather-Shield Jacket/)
  assert.match(breadcrumbs, /aria-label="Breadcrumb"/)
  assert.match(breadcrumbs, /aria-current=\{isCurrent \? "page" : undefined\}/)
})
