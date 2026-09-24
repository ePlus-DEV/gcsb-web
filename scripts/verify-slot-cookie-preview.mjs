/**
 * Browser regression: dismiss the cookie notice while the independent Radix
 * prize-slot history dialog is open and verify it remains interactive.
 * Run against the deployed GitHub Pages preview.
 */
import assert from "node:assert/strict"
import { chromium } from "playwright"

const url = process.env.PREVIEW_URL
if (!url || !/^https:\/\/arcade\.eplus\.dev\/pr-preview\/pr-75\/?$/.test(url)) {
  throw new Error("PREVIEW_URL must be the PR #75 HTTPS preview.")
}
const browser = await chromium.launch({ headless: true })
try {
  for (const viewport of [{ width: 1366, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: "reduce" })
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 })
      const cookie = page.locator(".cookie-consent-card")
      await cookie.waitFor({ state: "visible", timeout: 20_000 })
      const trigger = page.locator(".tier-trends-trigger").first()
      await trigger.waitFor({ state: "visible", timeout: 20_000 })
      await trigger.click()
      const dialog = page.getByRole("dialog")
      await dialog.waitFor({ state: "visible", timeout: 8_000 })
      assert.equal(await dialog.isVisible(), true)

      // Clicking acknowledge must dismiss only the cookie notice.
      await cookie.locator(".cookie-consent-button").click({ timeout: 8_000 })
      await cookie.waitFor({ state: "detached", timeout: 8_000 })
      assert.equal(await dialog.isVisible(), true,
        "Closing the cookie banner must not close the history dialog")

      // The history dialog must remain fully interactive.
      const tier = dialog.locator(".tier-trends-tier-card").first()
      await tier.waitFor({ state: "visible", timeout: 12_000 })
      assert.equal(await tier.getAttribute("data-state"), "on")
      await tier.click()
      assert.equal(await tier.getAttribute("data-state"), "off")
      await dialog.getByRole("button", { name: /show all/i }).click()
      assert.equal(await tier.getAttribute("data-state"), "on")
      await page.keyboard.press("Escape")
      await dialog.waitFor({ state: "hidden", timeout: 8_000 })
      console.log("PASS: independent cookie and slot dialogs at " + viewport.width + "px")
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
}
