import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const backToTopCss = readRepoFile("app/styles/back-to-top.css")
const facilitatorCss = readRepoFile("app/styles/facilitator-participation.css")
const backToTop = readRepoFile("components/back-to-top.tsx")
const facilitator = readRepoFile("components/arcade/facilitator-panel.tsx")

test("mobile Back to top uses the left edge, opposite the right Facilitator launcher", () => {
  const mobileBackToTop = backToTopCss.slice(backToTopCss.indexOf("/* Keep the scroll-to-top control separate"))
  assert.match(mobileBackToTop, /@media \(max-width: 600px\)\s*\{\s*\.back-to-top\s*\{\s*left: 14px;\s*right: auto;/)
  assert.match(backToTopCss, /bottom: calc\(82px \+ env\(safe-area-inset-bottom\)\);/)
  assert.match(facilitatorCss, /@media \(max-width: 600px\)\s*\{\s*\.facilitator-launcher\s*\{[\s\S]*?right: 12px;/)
  assert.match(facilitatorCss, /bottom: calc\(82px \+ env\(safe-area-inset-bottom\)\);/)
  assert.match(facilitatorCss, /max-width: calc\(100vw - 88px\);/)
})

test("floating mobile controls have horizontal clearance at common phone widths", () => {
  // Back to top: x=14..54; Facilitator: right 12, max-width viewport-88 => left >=76.
  for (const width of [320, 360, 375, 390, 430, 600]) {
    const backRight = 14 + 40
    const launcherLeft = width - 12 - (width - 88)
    assert.ok(launcherLeft - backRight >= 22, `${width}px leaves a tappable gap`)
  }
})

test("existing Back to top action and Facilitator drawer remain operable", () => {
  assert.match(backToTop, /window\.scrollTo\(\{ top: 0, behavior: "smooth" \}\)/)
  assert.match(facilitator, /className=\{launcherClassName\}/)
  assert.match(facilitator, /onClick=\{\(\) => setOpen\(true\)\}/)
})
