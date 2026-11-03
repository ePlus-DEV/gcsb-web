#!/usr/bin/env node
/**
 * Incremental Arcade design color gate.
 * Legacy styles are intentionally grandfathered; reject only NEW palette literals
 * or Tailwind palette utility classes in UI code changes.
 *
 * Usage: node scripts/design-color-guard.mjs --base origin/main
 * Design specification: docs/ui/DESIGN_SYSTEM.md
 */
import { execFileSync } from "node:child_process"
import { pathToFileURL } from "node:url"

const permittedTokenFile = "app/styles/design-tokens.css"
const exception = /design-color-exception:\s*\S+/i
const uiPath = /^(?:app|components|styles|lib)\/.*\.(?:css|scss|tsx?|jsx?)$/
const colorWord = "(?:slate|gray|zinc|neutral|stone|red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)"
const tailwindPalette = new RegExp(`(?<![\\w-])(?:bg|text|border|from|via|to|ring|fill|stroke|outline)-${colorWord}-(?:50|[1-9]00)(?:\\/\\d+)?(?![\\w-])`, "gi")
const rawHex = /#[\da-f]{3,4}(?![\da-f\w-])|#[\da-f]{6}(?![\da-f\w-])|#[\da-f]{8}(?![\da-f\w-])/gi
const rawFunction = /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\([^)]*\)/gi

export function colorLiterals(line) {
  const colors = []
  for (const match of line.matchAll(rawHex)) colors.push(`hex:${match[0].toLowerCase()}`)
  for (const match of line.matchAll(rawFunction)) {
    if (!/\bvar\(/.test(match[0])) {
      colors.push(`function:${match[0].toLowerCase().replace(/\s+/g, "")}`)
    }
  }
  for (const match of line.matchAll(tailwindPalette)) {
    colors.push(`tailwind:${match[0].toLowerCase()}`)
  }
  return colors
}

export function analyzeDiff(diff) {
  const violations = []
  let path = null
  let additions = []
  let removals = []
  let lineNumber = 0

  function flush() {
    if (!path || !uiPath.test(path) || path === permittedTokenFile) {
      additions = []
      removals = []
      return
    }
    const removed = new Map()
    for (const line of removals) {
      for (const token of colorLiterals(line)) removed.set(token, (removed.get(token) ?? 0) + 1)
    }
    for (const item of additions) {
      const found = colorLiterals(item.text)
      for (const token of found) {
        const available = removed.get(token) ?? 0
        if (available > 0) {
          removed.set(token, available - 1)
        } else if (!exception.test(item.text)) {
          violations.push({ path, line: item.line, token })
        }
      }
    }
    additions = []
    removals = []
  }

  for (const line of diff.split("\n")) {
    if (line.startsWith("diff --git ")) {
      flush()
      path = null
      lineNumber = 0
    } else if (line.startsWith("+++ b/")) {
      path = line.slice("+++ b/".length)
    } else if (line.startsWith("@@ ")) {
      const match = line.match(/\+(\d+)(?:,\d+)?\s+@@/)
      if (match) lineNumber = Number(match[1])
    } else if (path && line.startsWith("+") && !line.startsWith("+++")) {
      additions.push({ text: line.slice(1), line: lineNumber })
      lineNumber++
    } else if (path && line.startsWith("-") && !line.startsWith("---")) {
      removals.push(line.slice(1))
    } else if (path && line.startsWith(" ")) {
      lineNumber++
    }
  }
  flush()
  return violations
}

function run() {
  const index = process.argv.indexOf("--base")
  const base = index >= 0 ? process.argv[index + 1] : null
  if (!base || base.startsWith("-")) {
    console.error("Usage: node scripts/design-color-guard.mjs --base origin/main")
    process.exitCode = 2
    return
  }
  let diff
  try {
    diff = execFileSync("git", ["diff", "--no-ext-diff", "--no-color", "--unified=0", `${base}...HEAD`, "--", "app/", "components/", "styles/", "lib/"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 })
  } catch (error) {
    console.error(`Unable to diff from ${base}: ${error.message}`)
    process.exitCode = 2
    return
  }
  const violations = analyzeDiff(diff)
  if (violations.length) {
    console.error("Design color rule violations: new hardcoded UI palette colors detected.")
    for (const { path, line, token } of violations.slice(0, 80)) {
      console.error(`  ${path}:${line}: ${token}`)
    }
    if (violations.length > 80) console.error(`  …and ${violations.length - 80} more`)
    console.error("Use semantic --ds-* variables from app/styles/design-tokens.css.")
    console.error("If an exact literal is essential, document a justified 'design-color-exception: reason' on that same line and explain it in the PR.")
    console.error("See docs/ui/DESIGN_SYSTEM.md.")
    process.exitCode = 1
  } else {
    console.log("Design color guard passed: no newly introduced unapproved palette literals.")
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run()
