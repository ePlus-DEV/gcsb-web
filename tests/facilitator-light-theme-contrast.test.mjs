import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const css = readRepoFile("app/styles/facilitator-bonus-milestone.css")
const control = readRepoFile("components/arcade/facilitator-bonus-milestone-control.tsx")
const layout = readRepoFile("app/layout.tsx")

function rule(selector) {
  const index = css.indexOf(`${selector} {`)
  assert.ok(index >= 0, `Missing theme selector: ${selector}`)
  const open = css.indexOf("{", index)
  return css.slice(open + 1, css.indexOf("}", open))
}

function contrast(foreground, background) {
  function luminance(hex) {
    const channels = hex.match(/[\da-f]{2}/gi).map((c) => parseInt(c, 16) / 255)
    const linear = channels.map((c) => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)
    return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722
  }
  const a = luminance(foreground.replace("#", ""))
  const b = luminance(background.replace("#", ""))
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
}

test("completed bonus milestone uses readable light surfaces and colors", () => {
  const root = "html.light .facilitator-drawer"
  assert.match(rule(root), /--facilitator-text:\s*#172033/)
  const completed = rule(`${root} .bonus-milestone-confirmation-card.is-completed`)
  assert.match(completed, /background:\s*#ecfdf5/)
  const strong = rule(`${root} .bonus-milestone-confirmation-card.is-completed .bonus-milestone-confirmation-copy strong`)
  assert.match(strong, /color:\s*#14532d/)
  const description = rule(`${root} .bonus-milestone-confirmation-copy small`)
  assert.match(description, /color:\s*#475569/)
  const button = rule(`${root} .bonus-milestone-confirmation-button.is-completed`)
  assert.match(button, /background:\s*#dcfce7/)
  assert.match(button, /color:\s*#166534/)
  for (const [label, fg, bg] of [
    ["Completed title", "#14532d", "#ecfdf5"],
    ["Completed subtitle", "#475569", "#ecfdf5"],
    ["Completed button", "#166534", "#dcfce7"],
    ["Default button", "#5b21b6", "#ede9fe"],
    ["Syllabus link", "#075985", "#e0f2fe"],
    ["Syllabus description", "#475569", "#ffffff"],
  ]) {
    assert.ok(contrast(fg, bg) >= 4.5, `${label} needs WCAG AA text contrast`)
  }
})

test("Facilitator's light theme includes syllabus statuses, inputs, and completion toggle", () => {
  for (const selector of [
    "html.light .facilitator-drawer .bonus-gear-toggle.is-complete",
    "html.light .facilitator-drawer .facilitator-syllabus-summary article.is-missing > svg",
    "html.light .facilitator-drawer .facilitator-syllabus-list article.is-completed .facilitator-badge-status",
    "html.light .facilitator-drawer .facilitator-syllabus-toolbar input::placeholder",
    "html.light .facilitator-drawer .facilitator-syllabus-list article > a",
    "html.light .facilitator-drawer .facilitator-participation-card.is-active .facilitator-participation-toggle em",
  ]) {
    rule(selector)
  }
  assert.match(css, /\.bonus-milestone-confirmation-button:focus-visible/)
  assert.match(css, /\.bonus-gear-toggle:focus-visible/)
})

test("styles are centralized, loaded last, and keep dark mode unchanged", () => {
  assert.doesNotMatch(control, /<style>\s*\{/)
  assert.match(control, /className="bonus-milestone-confirmation"/)
  assert.match(css, /\.bonus-milestone-confirmation-card\.is-completed \{/)
  assert.match(css, /--facilitator-text:\s*#f8fafc/)
  const contrastImport = 'import "./styles/facilitator-bonus-milestone.css"'
  const lastThemeImport = 'import "./styles/interface-refresh.css"'
  assert.ok(layout.includes(contrastImport))
  assert.ok(layout.indexOf(contrastImport) > layout.indexOf(lastThemeImport))
})
