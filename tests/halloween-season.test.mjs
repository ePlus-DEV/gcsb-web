import assert from "node:assert/strict"
import test from "node:test"
import { evaluateTypeScript, readRepoFile } from "./helpers/typescript-source.mjs"

const { isHalloweenSeason, shouldEnableHalloween } = evaluateTypeScript(
  readRepoFile("components/seasonal/halloween-model.ts"),
)
const { WEBSITE_LOCALES } = evaluateTypeScript(readRepoFile("lib/website-i18n.ts"))

test("Halloween includes both boundary days and excludes the rest of the year", () => {
  for (const [month, day, expected] of [[8, 30, false], [9, 1, true], [9, 31, true], [10, 1, true], [10, 2, true], [10, 3, false], [0, 1, false]]) {
    assert.equal(isHalloweenSeason(new Date(2026, month, day, 12)), expected)
  }
})

test("Halloween preferences work outside the season, but never affect localized widgets", () => {
  const summer = new Date(2026, 6, 1)
  const october = new Date(2026, 9, 14)
  assert.equal(shouldEnableHalloween("/", null, summer), false)
  assert.equal(shouldEnableHalloween("/", "halloween", summer), true)
  assert.equal(shouldEnableHalloween("/", "off", october), false)
  assert.equal(shouldEnableHalloween("/guide/", null, october), true)
  for (const { path } of WEBSITE_LOCALES) {
    for (const trailing of ["", "/"]) {
      const route = `${path ? `/${path}` : ""}/widget${trailing}`
      assert.equal(shouldEnableHalloween(route, "halloween", october), false, route)
    }
  }
})

test("seasonal UI copy is catalog-owned and complete in every supported locale", () => {
  const calculator = readRepoFile("components/arcade/profile-analyzer.tsx")
  const styles = readRepoFile("app/styles/halloween-season.css")
  assert.match(calculator, /messages\.halloweenEdition/)
  assert.doesNotMatch(calculator, /Halloween [Ee]dition/)
  assert.doesNotMatch(styles, /content:\s*["'][^"']*(Halloween|Edition)/)
  for (const { code } of WEBSITE_LOCALES) {
    const catalog = JSON.parse(readRepoFile(`public/i18n/locales/${code}.json`))
    assert.ok(catalog.messages.halloweenEdition?.trim(), code)
    if (code !== "en") assert.notEqual(catalog.messages.halloweenEdition, "Halloween edition", code)
  }
})
