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
  // Check the real prerendered localized routes AND interactive modal.
  // Static catalog-key tests alone do not prove the locale reaches the dialog.
  for (const variant of [
    { code: "vi", title: "Lịch sử suất thưởng", showAll: "Hiện tất cả", days: "30 ngày" },
    { code: "ja", title: "報酬枠の履歴", showAll: "すべて表示", days: "30日間" },
    { code: "ar", title: "سجل فرص المكافآت", showAll: "إظهار الكل", days: "30 يومًا" },
  ]) {
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, reducedMotion: "reduce" })
    try {
      await page.goto(new URL(variant.code + "/", url).toString(), {
        waitUntil: "domcontentloaded", timeout: 30_000,
      })
      const trigger = page.locator(".tier-trends-trigger").first()
      await trigger.waitFor({ state: "visible", timeout: 20_000 })
      await assert.doesNotReject(() =>
        trigger.getByText(variant.title, { exact: true }).waitFor({ state: "visible" }))
      await trigger.click()
      const dialog = page.getByRole("dialog")
      await dialog.waitFor({ state: "visible", timeout: 8_000 })
      await dialog.getByRole("heading", { name: variant.title }).waitFor({ state: "visible" })
      await dialog.getByRole("button", { name: variant.showAll }).waitFor({ state: "visible" })
      await dialog.getByText(variant.days, { exact: true }).waitFor({ state: "visible" })
      if (variant.code === "ar") {
        assert.equal(await dialog.getAttribute("dir"), "rtl")
      }
      assert.doesNotMatch(await dialog.innerText(), /\b(?:git|commit|crawler)\b/i)
      console.log("PASS: localized modal in " + variant.code)
    } finally {
      await page.close()
    }
  }

  // The top-right language selector must navigate inside the preview base path;
  // the next page must render its dialog with the requested locale.
  const switchingPage = await browser.newPage({ viewport: { width: 1366, height: 900 } })
  try {
    await switchingPage.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 })
    await switchingPage.locator(".website-language-trigger").waitFor({ state: "visible", timeout: 20_000 })
    await switchingPage.locator(".website-language-trigger").click()
    await switchingPage.locator(".website-language-option", { hasText: "Tiếng Việt" }).click()
    await switchingPage.waitForURL(/\/pr-preview\/pr-75\/vi\/?$/, { timeout: 20_000 })
    const translatedTrigger = switchingPage.locator(".tier-trends-trigger").first()
    await translatedTrigger.getByText("Lịch sử suất thưởng", { exact: true }).waitFor({ state: "visible" })
    await translatedTrigger.click()
    await switchingPage.getByRole("dialog").getByRole("heading", {
      name: "Lịch sử suất thưởng",
    }).waitFor({ state: "visible" })
    console.log("PASS: website language switcher navigates and localizes slot history")
  } finally {
    await switchingPage.close()
  }
} finally {
  await browser.close()
}
