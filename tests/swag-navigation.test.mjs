import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

test("every full-page shell owns current-season navigation through the shared header", () => {
  const nav = readRepoFile("components/site/site-header.tsx")
  assert.match(nav, /swagSeasonPath\(CURRENT_SWAG_SEASON\)/)
  assert.match(nav, /messages.swagDrops/)
  assert.match(nav, /data-arcade-swag-nav="true"/)
  assert.match(nav, /onClick=\{close\}/)
  for (const path of ["app/redesign-calculator.tsx", "components/site/internal-page-shell.tsx", "components/arcade/shared-profile-client.tsx", "components/site/not-found-redirect.tsx"]) {
    assert.match(readRepoFile(path), /<SiteHeader/)
  }
  assert.doesNotMatch(readRepoFile("app/layout.tsx"), /SwagNavLink/)
})
