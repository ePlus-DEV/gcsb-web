import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const css = readRepoFile("app/styles/cookie-consent.css")
const component = readRepoFile("components/privacy/cookie-consent.tsx")

function rule(selector) {
  const marker = `${selector} {`
  const position = css.indexOf(marker)
  assert.ok(position >= 0, `Missing selector: ${selector}`)
  const start = position + marker.length
  return css.slice(start, css.indexOf("}", start))
}

function contrast(foreground, background) {
  const luminance = (hex) => {
    const values = hex.match(/[0-9a-f]{2}/gi).map((v) => parseInt(v, 16) / 255)
    const [r, g, b] = values.map((v) =>
      v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    )
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const a = luminance(foreground), b = luminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

test("cookie acknowledgment uses a white label on an AA-compliant teal gradient", () => {
  const normal = rule(".cookie-consent-button")
  const hover = rule(".cookie-consent-button:hover")
  assert.match(normal, /color:\s*#ffffff;/)
  assert.match(hover, /color:\s*#ffffff;/)
  for (const state of [normal, hover]) {
    const gradient = state.match(/linear-gradient\(135deg,\s*(#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)/i)
    assert.ok(gradient, "Expected two explicit gradient endpoints")
    for (const endpoint of gradient.slice(1)) {
      assert.ok(contrast("#ffffff", endpoint) >= 4.5, `White text on ${endpoint} fails WCAG AA`)
    }
  }
  assert.doesNotMatch(normal, /color:\s*#07111f/)
})

test("cookie acknowledgment keeps keyboard focus, responsive sizing, and action", () => {
  assert.match(css, /\.cookie-consent-button:focus-visible/)
  assert.match(css, /@media \(max-width: 420px\)/)
  assert.match(component, /className="cookie-consent-button" onClick=\{acknowledgeNotice\}/)
})
