import assert from "node:assert/strict"
import test from "node:test"
import fs from "node:fs"
import ts from "typescript"
import { evaluateTypeScript, readRepoFile } from "./helpers/typescript-source.mjs"
const { mergeObservations, predictTier, validObservation } = evaluateTypeScript(readRepoFile("components/arcade/tier-prediction.ts"))
const at = "2026-10-20T12:00:00.000Z"
const slotsAt = "2026-10-20T06:00:00.000Z"
const sample = (points = 128, left = [50, 80, 200, 300]) => ({ version: 1, season: 2026, at, points, complete: true, slotsAt, slots: [120,95,75,50].map((points,i) => ({points,spotsLeft:left[i]})) })

test("128 points with open Legend gives supporting evidence, never a probability", () => {
  const x = sample(); const p = predictTier(x, [x], x)
  assert.equal(p.state, "supported"); assert.equal(p.supportedTier, 120)
  assert.equal("probability" in p, false)
})
test("later exhausted Legend does not downgrade existing 128-point evidence", () => {
  const first = sample(); const later = {...sample(128,[0,10,100,200]), at: "2026-10-21T12:00:00.000Z", slotsAt: "2026-10-21T06:00:00.000Z"}
  const p = predictTier(later, [first, later], later)
  assert.equal(p.state, "supported"); assert.equal(p.supportedTier, 120); assert.equal(p.evidenceAt, first.at)
  assert.equal(p.targetObservedFull, true)
  assert.equal(p.fallbackTier, 95)
  assert.equal(p.evidenceLagMinutes, 360)
  assert.equal(p.slotLagMinutes, 360)
})
test("first check with full Legend is uncertain, with cascading current-slot scenario", () => {
  for (const [left, expected] of [[[0,5,8,10],95],[[0,0,8,10],75],[[0,0,0,10],50],[[0,0,0,0],null]]) {
    const x = sample(128,left); const p = predictTier(x,[x],x)
    assert.equal(p.state,"uncertain"); assert.equal(p.supportedTier,expected); assert.equal(p.fallbackTier,expected)
  }
})
test("120+ points with zero Legend slots retains uncertainty and shows a crawler-only Champion scenario", () => {
  const x = sample(120, [0, 5, 0, 0])
  const p = predictTier(x, [x], x)
  assert.equal(p.scoreTier, 120)
  assert.equal(p.state, "uncertain")
  assert.equal(p.targetObservedFull, true)
  assert.equal(p.fallbackTier, 95)
  assert.equal(p.slotLagMinutes, 360)
  assert.equal(p.allEligibleFull, false)
})
test("all eligible pools exhausted does not prove an earlier allocation was missed", () => {
  const x = sample(128, [0, 0, 0, 0])
  const p = predictTier(x, [x], x)
  assert.equal(p.state, "uncertain")
  assert.equal(p.allEligibleFull, true)
  assert.equal(p.targetObservedFull, true)
  assert.equal(p.fallbackTier, null)
})
test("48h-old positive crawler evidence stays indicative; older snapshots cannot suggest fallback", () => {
  const within = { ...sample(128, [0, 10, 0, 0]), slotsAt: "2026-10-18T12:00:00.000Z" }
  const onBoundary = predictTier(within, [within], within)
  assert.equal(onBoundary.targetObservedFull, true)
  assert.equal(onBoundary.fallbackTier, 95)
  assert.equal(onBoundary.slotLagMinutes, 2880)
  const old = { ...within, slotsAt: "2026-10-18T11:59:00.000Z" }
  const stale = predictTier(old, [old], old)
  assert.equal(stale.targetObservedFull, false)
  assert.equal(stale.fallbackTier, null)
  assert.equal(stale.slotLagMinutes, 2881)
})
test("unknown higher-tier slots never silently become zero", () => {
  const x = {...sample(), slots:sample().slots.filter(s=>s.points!==120)}
  assert.equal(predictTier(x,[x],x).fallbackTier,null)
})
test("incomplete, changed scores, stale, future and previous-season data cannot confirm", () => {
  const x = sample()
  assert.equal(predictTier({...x,complete:false},[x],x).state,"review")
  assert.equal(predictTier({...x,at:"2026-10-21T12:00:00.000Z",points:119},[x],x).state,"review")
  for (const bad of [{...x,slotsAt:"2026-10-01T00:00:00.000Z"},{...x,slotsAt:"2026-10-21T00:00:00.000Z"},{...x,at:"2025-10-20T12:00:00.000Z",slotsAt:"2025-10-20T06:00:00.000Z"}]) {
    assert.equal(predictTier(x,[bad],bad).supportedTier,null)
  }
  assert.equal(predictTier({...x,points:49},[],null).state,"below")
})
test("upgrading into full Legend preserves only previously witnessed Champion evidence", () => {
  const old=sample(100,[3,8,10,12]); const now={...sample(128,[0,0,5,8]),at:"2026-10-21T12:00:00.000Z"}
  const p=predictTier(now,[old,now],now)
  assert.equal(p.state,"uncertain"); assert.equal(p.supportedTier,95)
})
test("history keeps first threshold evidence beyond 40 later checks and rejects corruption", () => {
  const first=sample(); let history=[first]
  for(let i=1;i<100;i++) history=mergeObservations(history,{...sample(128,[0,0,0,0]),at:new Date(Date.parse(at)+i*60000).toISOString()})
  assert.ok(history.length<=44); assert.equal(history[0].at,first.at)
  for(const bad of [null,{}, {...first,slots:[null]}, {...first,points:NaN}, {...first,season:2025}]) assert.equal(validObservation(bad),false)
})
test("all prediction UI copy is catalog-owned in all 13 locales with intact placeholders", () => {
  const en=JSON.parse(readRepoFile("public/i18n/locales/en.json")).additional
  const keys=Object.keys(en).filter(k=>k.startsWith("__prediction:"))
  assert.equal(keys.length,21)
  for(const file of fs.readdirSync("public/i18n/locales")) {
    const catalog=JSON.parse(readRepoFile(`public/i18n/locales/${file}`))
    for(const key of keys) {
      assert.ok(catalog.additional[key],`${file}: ${key}`)
      const tokens=s=>[...s.matchAll(/\{\w+\}/g)].map(x=>x[0]).sort()
      assert.deepEqual(tokens(catalog.additional[key]),tokens(en[key]))
    }
  }
  const file=ts.createSourceFile("panel.tsx",readRepoFile("components/arcade/tier-prediction-panel.tsx"),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
  function visit(node) {
    if(ts.isJsxText(node)) assert.equal(node.text.trim(),"","Visible text must use catalogs")
    ts.forEachChild(node,visit)
  }
  visit(file)
})
