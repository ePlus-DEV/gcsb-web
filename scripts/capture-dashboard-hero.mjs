import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"
import { chromium } from "playwright"
import { startStaticServer } from "./serve-static.mjs"

/**
 * Capture the REAL Dashboard component tree, not a CSS imitation.
 * All profile data are clearly synthetic and already used by the
 * repo's PR-preview debug profile. The image is a presentation asset,
 * never shown as live-user or guaranteed reward information.
 */
const profileUrl = "https://www.skills.google/public_profiles/11111111-2222-4333-8444-555555555555"
const game = [
  { title: "Arcade Base Camp", points: 15, dateEarned: "2026-09-29T08:00:00Z" },
  { title: "Arcade Adventure", points: 15, dateEarned: "2026-09-24T08:00:00Z" },
  { title: "Arcade Expedition", points: 20, dateEarned: "2026-09-18T08:00:00Z" },
]
const skill = [
  { title: "Build Infrastructure with Terraform on Google Cloud", points: 12, dateEarned: "2026-09-27T08:00:00Z" },
  { title: "Implement Load Balancing on Compute Engine", points: 10, dateEarned: "2026-09-21T08:00:00Z" },
  { title: "Develop Serverless Apps with Firebase", points: 10, dateEarned: "2026-09-14T08:00:00Z" },
  { title: "Prompt Design in Vertex AI", points: 10, dateEarned: "2026-09-10T08:00:00Z" },
]
const trivia = [{title:"Arcade Trivia September",points:10,dateEarned:"2026-09-25T08:00:00Z"}]
const special = [{title:"Arcade Special Challenge",points:10,dateEarned:"2026-09-16T08:00:00Z"}]
const result = {
  success: true,
  userDetails: [{userName:"Demo Learner",memberSince:"Jan 2025",league:"Arcade Champion",points:"112"}],
  badges: [...game,...skill,...trivia,...special],
  game,skill,trivia,special,completion:[],
  arcadePoints: {totalPoints:112,gamePoints:50,skillPoints:42,triviaPoints:10,specialPoints:10,completionPoints:0},
  milestone:"Arcade Champion",
  faciCounts:{faciGame:8,faciTrivia:1,faciSkill:34,faciCompletion:0,bonusMilestonePoints:0},
  beta:{scoreComplete:true,unknownBadgeCount:0,unknownBadges:[],profileBadgeCount:9,eligibleBadgeCount:9,tier:"Arcade Champion"},
}
const output = path.resolve(process.argv[2] ?? "public/images")
await fs.mkdir(output,{recursive:true})
const server = await startStaticServer({directory:"out"})
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {}),
})
try {
  for(const locale of ["en","vi"]){
    const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1})
    await context.addInitScript(record => {
      localStorage.setItem("arcade-theme","light")
      localStorage.setItem("arcade-seasonal-theme","off")
      localStorage.setItem("arcade-cookie-notice-v1","acknowledged")
      localStorage.setItem("eplus-arcade-dashboard-v1",JSON.stringify(record))
    },{profileUrl,result,checkedAt:"2026-09-30T08:00:00Z"})
    const page=await context.newPage()
    const route=locale==="vi"?"vi/dashboard/":"dashboard/"
    await page.goto(server.url+route,{waitUntil:"domcontentloaded"})
    const summary=page.locator(".dashboard-summary-grid")
    await summary.waitFor({state:"visible",timeout:25000})
    await page.waitForFunction(()=>
      document.querySelector(".arcade-dashboard-page")?.getAttribute("data-dashboard-view")==="profile" &&
      document.querySelector(".dashboard-summary-grid .points-total")
    )
    await page.evaluate(async()=>{await document.fonts.ready})
    const width=await summary.evaluate(el=>Math.round(el.getBoundingClientRect().width))
    assert.ok(width>650,"actual Dashboard summary must be readable")
    await summary.screenshot({path:path.join(output,"dashboard-hero-"+locale+".png"),animations:"disabled"})
    await context.close()
  }
  console.log("Captured the original ePlus Dashboard's real summary panels in English and Vietnamese.")
} finally {
  await browser.close()
  await server.close()
}
