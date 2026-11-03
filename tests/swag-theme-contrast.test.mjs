import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const shell = readRepoFile("components/site/internal-page-shell.tsx")
const crumbs = readRepoFile("components/site/internal-breadcrumbs.tsx")
const internalCss = readRepoFile("app/styles/internal-page-theme.css")
const swagCss = readRepoFile("app/styles/swag-theme.css")
const layout = readRepoFile("app/layout.tsx")
const hub = readRepoFile("app/swag-drops/2026/page.tsx")
const detail = readRepoFile("app/swag-drops/2026/[slug]/page.tsx")
const archive = readRepoFile("app/swag-drops/page.tsx")

function cssDeclaration(source, selector, property) {
  const marker = `${selector} {`
  const start = source.indexOf(marker)
  assert.ok(start >= 0, `Missing selector ${selector}`)
  const body = source.slice(start + marker.length, source.indexOf("}", start))
  const match = body.match(new RegExp(`(?:^|\\n)\\s*${property}:\\s*([^;]+);`))
  assert.ok(match, `Missing ${property} in ${selector}`)
  return match[1].trim()
}

function contrastRatio(fg, bg) {
  const linear = color => [...color.matchAll(/[0-9a-f]{2}/gi)].map(m => {
    const channel = Number.parseInt(m[0], 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const lum = color => {
    const [r,g,b] = linear(color)
    return r * .2126 + g * .7152 + b * .0722
  }
  const a = lum(fg), b = lum(bg)
  return (Math.max(a,b) + .05)/(Math.min(a,b) + .05)
}

test("Swag hub and detail pages isolate utility-styled cards from generic prose rules", () => {
  for (const [label, source] of [["hub", hub], ["detail", detail], ["archive", archive]]) {
    assert.match(source, /not-prose swag-season-page/, label)
  }
  assert.match(shell, /<InternalBreadcrumbs \/>/)
  assert.match(crumbs, /className="internal-breadcrumbs /)
  assert.match(crumbs, /internal-breadcrumb-current/)
  assert.match(internalCss, /html\.light \.internal-prose a:not\(:where\(\.not-prose \*\)\)/)
  assert.match(internalCss, /html\.light \.internal-prose :where\(h1, h2, h3, h4, strong\):not\(:where\(\.not-prose \*\)\)/)
  assert.match(layout, /import "\.\/styles\/swag-theme\.css"/)
})

test("Swag buttons and linked reward cards have explicit light/dark palettes", () => {
  for (const klass of ["primary", "outline", "chip", "text"]) {
    assert.ok(hub.includes(`swag-action-${klass}`), `2026 hub missing ${klass} link`)
    for (const theme of ["light", "dark"]) {
      const selector = `html.${theme} .swag-season-page .swag-action-${klass}`
      const fg = cssDeclaration(swagCss, selector, "color")
      if (klass !== "text") {
        const bg = cssDeclaration(swagCss, selector, "background")
        assert.ok(contrastRatio(fg, bg) >= 4.5, `${selector}: insufficient contrast ${fg} on ${bg}`)
      }
    }
  }
  for (const klass of ["primary", "text"]) assert.ok(detail.includes(`swag-action-${klass}`))
  assert.match(swagCss, /\.swag-reward-card:focus-visible/)
})

test("breadcrumb colors are readable in light and dark themes", () => {
  for (const [theme,bg] of [["light", "#f4f7ff"], ["dark", "#050918"]]) {
    for (const klass of ["internal-breadcrumb-link", "internal-breadcrumb-current"]) {
      const selector = `html.${theme} .${klass}`
      const fg = cssDeclaration(internalCss, selector, "color")
      assert.ok(contrastRatio(fg, bg) >= 4.5, `${selector} contrast is below AA`)
    }
  }
  assert.match(internalCss, /\.internal-breadcrumb-link:focus-visible/)
})
