import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"
import {chromium} from "playwright"
import {startStaticServer} from "./serve-static.mjs"

// Visual evidence for the approved landing. A successful build alone is not design QA.
const output=path.join(process.cwd(),"artifacts","landing-reference")
await fs.mkdir(output,{recursive:true})
const server=await startStaticServer({directory:"out"})
let browser
try {
 browser=await chromium.launch({
  ...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})
 })
 const cases=[
  ["en","light",390],["vi","light",390],["en","light",1440],
  ["vi","light",1440],["vi","light",1920],["vi","dark",390]
 ]
 for(const [locale,theme,width] of cases){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1})
  await context.addInitScript((theme)=>{
   localStorage.setItem("arcade-theme",theme)
   localStorage.setItem("arcade-home-theme-v2",theme)
   localStorage.setItem("arcade-seasonal-theme","off")
  },theme)
  const page=await context.newPage()
  await page.goto(server.url+(locale==="vi"?"vi/":""),{waitUntil:"domcontentloaded"})
  await page.locator(".landing-demo").waitFor({state:"visible"})
  await page.waitForFunction(theme=>document.documentElement.classList.contains(theme),theme)
  await page.evaluate(()=>document.fonts.ready)
  const wordmark = await page.locator(".landing-home .arcade-brand-copy").first().evaluate(el=>getComputedStyle(el).fontFamily)
  assert.ok(wordmark.includes("Inter"),locale+"-"+width+": wordmark must not inherit legacy pixel font")
  if(width<=390){
   const nav=page.locator("#arcade-primary-navigation")
   assert.equal(await nav.isVisible(),false,"Mobile navigation must remain collapsed on load")
   const hamburger=page.locator(".mobile-menu-toggle")
   assert.equal(await hamburger.isVisible(),true,"Mobile hamburger missing")
   await hamburger.click()
   assert.equal(await nav.isVisible(),true,"Mobile hamburger does not open navigation")
   await hamburger.click()
   assert.equal(await nav.isVisible(),false,"Mobile hamburger does not close navigation")
  }
  const m=await page.evaluate(()=>{
   const q=(s)=>document.querySelector(s)
   const r=(s)=>q(s).getBoundingClientRect()
   const cols=getComputedStyle(q(".landing-feature-grid")).gridTemplateColumns.split(/\s+/).filter(Boolean).length
   return {
    order:[...document.querySelectorAll(".landing-home > section")].map(e=>e.id),
    features:document.querySelectorAll(".landing-feature-card").length,
    steps:document.querySelectorAll(".landing-step-card").length,
    programs:document.querySelectorAll(".landing-program-card").length,
    faq:document.querySelectorAll(".landing-faq-item").length,
    faqClosed:r(".landing-faq-item > p").height===0,
    deadlinesHidden:getComputedStyle(q(".program-countdown-host")).display==="none",
    cols,sectionWidth:r(".landing-section").width,previewWidth:r(".landing-demo").width,
    titleWidth:r(".landing-hero h1").width,
    viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,
    illustrationVisible:getComputedStyle(q(".landing-faq-art")).display!=="none"
   }
  })
  const label=locale+"-"+theme+"-"+width
  assert.deepEqual(m.order,["top","features","how-it-works","programs","faq","extension"],label+": order")
  assert.equal(m.features,6,label+": features")
  assert.equal(m.steps,3,label+": steps")
  assert.equal(m.programs,3,label+": programs")
  assert.equal(m.faq,6,label+": FAQs")
  assert.equal(m.faqClosed,true,label+": FAQ initially closed")
  assert.equal(m.deadlinesHidden,true,label+": countdown initially collapsed")
  assert.equal(m.cols,width<=600?1:3,label+": responsive feature grid")
  assert.equal(m.illustrationVisible,width>860,label+": FAQ artwork responsive")
  assert.ok(m.pageWidth<=m.viewport+1,label+": horizontal overflow")
  if(width>=1440){
   assert.ok(m.sectionWidth/m.viewport>.75,label+": content too narrow")
   assert.ok(m.previewWidth>470,label+": preview too small")
   assert.ok(m.titleWidth>450,label+": hero text too narrow")
  }
  // Keep the cookie consent visible in one separate audit image, then dismiss
  // it so the design screenshot itself can be compared with the approved mock.
  const cookie=page.locator(".cookie-consent-button")
  if(await cookie.count() && await cookie.isVisible()){
   if(locale==="vi" && theme==="light" && width===1440){
    await page.screenshot({path:path.join(output,label+"-cookie-visible.png"),fullPage:true,animations:"disabled"})
   }
   await cookie.click()
   await cookie.waitFor({state:"hidden"})
  }
  await page.screenshot({path:path.join(output,label+".png"),fullPage:true,animations:"disabled"})
  await fs.writeFile(path.join(output,label+".json"),JSON.stringify(m,null,2))
  await context.close()
 }
 // New Home routes should show the approved light design even when a visitor's
 // older global Dashboard preference is dark. Respect later explicit Home changes.
 const migrated=await browser.newContext({viewport:{width:1440,height:900}})
 await migrated.addInitScript(()=>{
  localStorage.setItem("arcade-theme","dark")
  localStorage.setItem("arcade-home-theme-v1","dark")
  localStorage.removeItem("arcade-home-theme-v2")
  localStorage.setItem("arcade-seasonal-theme","off")
 })
 const migratedPage=await migrated.newPage()
 await migratedPage.goto(server.url,{waitUntil:"domcontentloaded"})
 await migratedPage.waitForFunction(()=>document.documentElement.classList.contains("light"))
 assert.equal(await migratedPage.locator(".landing-demo").isVisible(),true)
 await migrated.close()
 console.log("Landing visual QA: 6 screenshots and responsive geometry passed.")
}finally{
 await browser?.close()
 await server.close()
}
