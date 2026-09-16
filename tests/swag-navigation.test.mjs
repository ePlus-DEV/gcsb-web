import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

test("swag navigation is mounted globally and points at the current season", () => {
  const layout = readRepoFile("app/layout.tsx")
  const nav = readRepoFile("components/arcade/swag-nav-link.tsx")

  assert.match(layout, /import SwagNavLink/)
  assert.match(layout, /<SwagNavLink \/>/)

  assert.match(nav, /CURRENT_SWAG_SEASON/)
  assert.match(nav, /swagSeasonPath\(CURRENT_SWAG_SEASON\)/)
  assert.match(nav, /NEXT_PUBLIC_BASE_PATH/)
  assert.match(nav, /Swag Drops/)
  assert.match(nav, /\.arcade-nav/)
  assert.match(nav, /a\[href\$="#extension"\]/)
  assert.match(nav, /insertBefore\(link, extensionLink \?\? null\)/)
  assert.match(nav, /mobile-menu-toggle\[aria-expanded="true"\]/)
  assert.match(nav, /MutationObserver/)
})
