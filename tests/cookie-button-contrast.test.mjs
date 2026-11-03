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

test("cookie acknowledgment follows approved violet CTA palette with accessible contrast", () => {
  const adoption = readRepoFile("app/styles/design-adoption.css")
  const tokens = readRepoFile("app/styles/design-tokens.css")
  const layout = readRepoFile("app/layout.tsx")
  assert.match(adoption, /\.cookie-consent-button,[\s\S]*?background:\s*var\(--ds-primary\);/)
  assert.match(adoption, /\.cookie-consent-button:hover,[\s\S]*?background:\s*var\(--ds-primary-hover\);/)
  assert.match(adoption, /color:\s*var\(--ds-on-primary\);/)
  assert.ok(layout.indexOf('import "./styles/design-adoption.css"') > layout.indexOf('import "./styles/cookie-consent.css"'))
  const readToken = (name) => tokens.match(new RegExp(`\\b${name}:\\s*(#[0-9a-f]{6});`, "i"))?.[1]
  for (const key of ["--ds-primary", "--ds-primary-hover"]) {
    assert.ok(contrast(readToken("--ds-on-primary"), readToken(key)) >= 4.5, `${key} fails normal text contrast`)
  }
})

test("cookie acknowledgment keeps keyboard focus, responsive sizing, and action", () => {
  assert.match(css, /\.cookie-consent-button:focus-visible/)
  assert.match(css, /@media \(max-width: 420px\)/)
  assert.match(component, /className="cookie-consent-button" onClick=\{acknowledgeNotice\}/)
})
