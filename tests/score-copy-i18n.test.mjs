import assert from "node:assert/strict"
import test from "node:test"
import fs from "node:fs"
import { evaluateTypeScript, readRepoFile } from "./helpers/typescript-source.mjs"
const catalogs = Object.fromEntries(fs.readdirSync("public/i18n/locales").filter(name => name.endsWith('.json')).map(name => [name.slice(0,-5), JSON.parse(readRepoFile(`public/i18n/locales/${name}`))]))
const { translateWebsiteText } = evaluateTypeScript(readRepoFile("lib/website-i18n.ts"))
test("score templates cover every locale and preserve runtime values", () => {
  for (const catalogKey of Object.keys(catalogs.en.additional).filter(key => /^__(score|countdown|profileOption):/.test(key))) {
    const tokens = value => [...value.matchAll(/\{\w+\}/g)].map(m => m[0]).sort()
    for (const [locale, catalog] of Object.entries(catalogs)) {
      assert.ok(catalog.additional[catalogKey], `${locale}: ${catalogKey}`)
      assert.deepEqual(tokens(catalog.additional[catalogKey]), tokens(catalogs.en.additional[catalogKey]))
    }
  }
  const source = readRepoFile("app/redesign-calculator.tsx")
  assert.doesNotMatch(source, /Includes \+\$\{|Point distribution:|pts \(\$\{share/)
  assert.match(source, /scoreText\("bonusIncluded"/)
})
test("Vietnamese dynamic bonus copy translates after score updates", () => {
  for (const count of [0, 35, 45]) assert.equal(translateWebsiteText(`Includes +${count} Facilitator bonus.`, catalogs.en, catalogs.vi), `Đã cộng ${count} điểm thưởng từ chương trình Facilitator.`)
})
test("Vietnamese analysis and monthly activity copy use plain Vietnamese terms", () => {
  for (const [key, value] of Object.entries(catalogs.vi.additional)) {
    if (!key.startsWith('__releasedPoints:') && !key.startsWith('__monthlyGames:')) continue
    assert.doesNotMatch(value, /\b(game|trivia|badge|bonus|lab)\b/i, key)
  }
  assert.equal(translateWebsiteText('Game', catalogs.en, catalogs.vi), 'Trò chơi')
  assert.equal(translateWebsiteText('Trivia', catalogs.en, catalogs.vi), 'Trắc nghiệm')
})

test("countdown and profile options use locale catalogs rather than embedded language maps", () => {
  const countdown = readRepoFile("components/arcade/program-countdown.tsx")
  assert.doesNotMatch(countdown, />Deadline unavailable<|>Awaiting Facilitator configuration<|: "Not announced"/)
  const options = readRepoFile("components/arcade/facilitator-analyzer-option.tsx")
  assert.doesNotMatch(options, /const COPY:/)
  assert.match(options, /__profileOption:/)
  const calculator = readRepoFile("app/redesign-calculator.tsx")
  assert.doesNotMatch(calculator, /badge\{filteredBadges|<b>\+\{formatNumber/)
})
