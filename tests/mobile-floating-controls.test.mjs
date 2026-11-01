import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const backToTopCss = readRepoFile("app/styles/back-to-top.css")
const facilitatorCss = readRepoFile("app/styles/facilitator-participation.css")
const backToTop = readRepoFile("components/back-to-top.tsx")
const facilitator = readRepoFile("components/arcade/facilitator-panel.tsx")

test("mobile Back to top sits on the right above the Facilitator launcher", () => {
  const rule = backToTopCss.slice(backToTopCss.indexOf("/* Stack Back to top above"))
  assert.match(rule, /@media \(max-width: 600px\)\s*\{\s*\.back-to-top\s*\{\s*left: auto;\s*right: 14px;/)
  assert.match(rule, /bottom: calc\([\s\S]*82px \+ env\(safe-area-inset-bottom\) \+[\s\S]*var\(--mobile-facilitator-clearance, 0px\)/)
  assert.doesNotMatch(rule, /left: 14px;/)

  const mobileFacilitator = facilitatorCss.slice(facilitatorCss.indexOf("@media (max-width: 600px)"))
  assert.match(mobileFacilitator, /\.facilitator-launcher\s*\{[\s\S]*?right: 12px;/)
  assert.match(mobileFacilitator, /bottom: calc\(82px \+ env\(safe-area-inset-bottom\)\);/)
  assert.match(mobileFacilitator, /max-width: calc\(100vw - 24px\);/)
})

test("Back to top repositions as the Facilitator mounts, hides or resizes", () => {
  assert.match(backToTop, /useRef<HTMLButtonElement>\(null\)/)
  assert.match(backToTop, /document\.querySelector<HTMLElement>\("\.facilitator-launcher"\)/)
  assert.match(backToTop, /!launcher\.hidden/)
  assert.match(backToTop, /launcher\.getClientRects\(\)\.length > 0/)
  assert.match(backToTop, /Math\.ceil\(launcher\.getBoundingClientRect\(\)\.height\) \+ 12/)
  assert.match(backToTop, /"--mobile-facilitator-clearance"/)
  assert.match(backToTop, /new ResizeObserver/)
  assert.match(backToTop, /new MutationObserver/)
  assert.match(backToTop, /window\.visualViewport\?\.addEventListener\("resize", scheduleUpdate\)/)
  assert.match(backToTop, /resizeObserver\.disconnect\(\)/)
  assert.match(backToTop, /observer\.disconnect\(\)/)
})

test("mobile floating button gap remains at least 12px for varying card heights", () => {
  const navOffset = 82
  for (const viewportWidth of [320, 360, 375, 390, 430, 600]) {
    for (const launcherHeight of [44, 56, 72, 100, 140]) {
      const launcherTopFromBottom = navOffset + launcherHeight
      const backButtonBottomFromBottom = navOffset + Math.ceil(launcherHeight) + 12
      assert.ok(backButtonBottomFromBottom - launcherTopFromBottom >= 12, viewportWidth + "px, " + launcherHeight + "px")
    }
  }
})

test("Back to top remains above mobile navigation if Facilitator is hidden", () => {
  assert.match(backToTop, /const clearance = isLauncherVisible[\s\S]*:\s*0/)
  assert.match(backToTopCss, /var\(--mobile-facilitator-clearance, 0px\)/)
  assert.match(backToTop, /window\.scrollTo\(\{ top: 0, behavior: "smooth" \}\)/)
  assert.match(facilitator, /onClick=\{\(\) => setOpen\(true\)\}/)
})
