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
  assert.equal(await page.locator(".landing-dashboard-shot-image").count(),1,"Home Hero must contain the real Dashboard screenshot")
  assert.equal(await page.locator(".landing-demo-card").count(),0,"No invented dashboard card markup may appear in the Hero")
  await page.waitForFunction(()=>{
    const image=document.querySelector(".landing-dashboard-shot-image")
    return image instanceof HTMLImageElement && image.complete && image.naturalWidth>400
  },{timeout:15000})
  const source=await page.locator(".landing-dashboard-shot-image").getAttribute("src")
  assert.ok(source?.includes("dashboard-hero-"+(locale==="vi"?"vi":"en")+".png"),"Locale-matched screenshot missing")

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
  const sharedPalette=await page.evaluate(()=>{
    const home=getComputedStyle(document.querySelector(".landing-home"))
    const panel=getComputedStyle(document.querySelector(".landing-activity"))
    const features=getComputedStyle(document.querySelector(".landing-feature-card"))
    const root=getComputedStyle(document.documentElement)
    return {
      homeText:home.color,
      tokenText:home.getPropertyValue("--arcade-text").trim(),
      tokenBg:root.getPropertyValue("--arcade-bg").trim(),
      accent:home.getPropertyValue("--arcade-purple").trim(),
      panelColor:panel.color,
      featureColor:features.color,
      homeBackground:home.backgroundImage,
    }
  })
  assert.equal(sharedPalette.homeText,sharedPalette.panelColor,label+": Activity text differs from Dashboard palette")
  assert.equal(sharedPalette.homeText,sharedPalette.featureColor,label+": feature card text differs from Dashboard palette")
  assert.ok(sharedPalette.homeBackground.includes("radial-gradient"),label+": missing Dashboard radial background")
  assert.equal(sharedPalette.accent,theme==="dark"?"#8b5cf6":"#7c3aed",label+": does not use Dashboard accent")
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
  // Demonstration only: never imply an actual visitor just checked a score.
  const activity=page.locator('.landing-activity[data-activity-mode="demo"]')
  assert.equal(await activity.count(),1,label+": missing demo activity")
  assert.equal(await page.locator(".landing-activity-demo-badge").count(),1,label+": missing demo badge")
  assert.equal(await page.locator(".landing-activity-disclosure").count(),1,label+": missing demo disclosure")
  assert.ok((await page.locator(".landing-activity-detail").innerText()).includes("112"),label+": synthetic 112-point fixture missing on first item")
  if (locale==="vi" && theme==="light" && width===390) {
    const controls=page.locator(".landing-activity-controls button")
    assert.equal(await controls.count(),2,"Demo must have pause and hide controls")
    await controls.nth(0).click()
    assert.equal(await controls.nth(0).getAttribute("aria-pressed"),"true","Pause should persist in control state")
    await controls.nth(1).click()
    assert.equal(await page.locator(".landing-activity").count(),0,"Hide must remove activity from view")
    assert.equal(await page.locator(".landing-activity-restore").count(),1,"Restore action is missing")
    await page.reload({waitUntil:"domcontentloaded"})
    await page.locator(".landing-activity-restore").waitFor({state:"visible"})
    await page.locator(".landing-activity-restore").click()
    await page.locator('.landing-activity[data-activity-mode="demo"]').waitFor({state:"visible"})
  }
  if (locale==="en" && theme==="light" && width===1440) {
    const initial=await activity.getAttribute("data-activity-index")
    await page.waitForFunction(initial=>document.querySelector(".landing-activity")?.getAttribute("data-activity-index")!==initial,initial,{timeout:12000})
  }
  await context.close()
 }
 // Home now uses Dashboard's one persisted site theme. A previously saved
 // Dashboard dark preference stays dark when navigating between the routes.
 const migrated=await browser.newContext({viewport:{width:1440,height:900}})
 await migrated.addInitScript(()=>{
  localStorage.setItem("arcade-theme","dark")
  localStorage.setItem("arcade-home-theme-v1","light")
  localStorage.setItem("arcade-home-theme-v2","light")
  localStorage.setItem("arcade-seasonal-theme","off")
 })
 const migratedPage=await migrated.newPage()
 await migratedPage.goto(server.url,{waitUntil:"domcontentloaded"})
 await migratedPage.waitForFunction(()=>document.documentElement.classList.contains("dark"))
 assert.equal(await migratedPage.locator(".landing-demo").isVisible(),true)
 await migratedPage.goto(server.url+"dashboard/",{waitUntil:"domcontentloaded"})
 await migratedPage.waitForFunction(()=>document.documentElement.classList.contains("dark"))
 await migrated.close()
 console.log("Landing visual QA: 6 screenshots and responsive geometry passed.")
}finally{
 await browser?.close()
 await server.close()
}
