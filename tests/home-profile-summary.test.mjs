import assert from 'node:assert/strict'
import test from 'node:test'
import {readRepoFile} from './helpers/typescript-source.mjs'
test('Home saved-profile copy is translated in every source catalog',()=>{
 for(const locale of ['en','vi','ja','ko','zh_CN','fr','de','es','pt_BR','it','ru','ar','hi']){
  const c=JSON.parse(readRepoFile(`public/i18n/locales/${locale}.json`))
  for(const key of ['homeSavedProfile','homeLastChecked','homeSavedResult','homeScoreTier','homeOpenDashboard']) assert.ok(c.messages[key]?.trim(),`${locale}/${key}`)
  assert.ok(c.messages.homeLastChecked.includes('{value}'))
 }
 const component=readRepoFile('components/arcade/home-profile-summary.tsx')
 assert.doesNotMatch(component,/\bfetch\s*\(/)
 for(const copy of ['Last checked:', 'View Dashboard', 'Hạng theo điểm']) assert.equal(component.includes(copy),false)
})
