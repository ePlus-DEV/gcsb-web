import assert from "node:assert/strict"
import test from "node:test"
import { readRepoFile } from "./helpers/typescript-source.mjs"

const workflow = readRepoFile(".github/workflows/pr-preview.yml")

test("PR previews reuse published production rather than rebuilding a potentially broken main", () => {
  assert.doesNotMatch(workflow, /Checkout production source|Build current production version/)
  assert.doesNotMatch(workflow, /production-source\//)
  assert.match(workflow, /cache-dependency-path: preview-source\/yarn\.lock/)
  assert.match(workflow, /- name: Build pull request preview/)
})

test("PR previews preserve production files while adding or removing their own preview folder", () => {
  assert.match(workflow, /git clone --depth 1 --branch gh-pages/)
  assert.match(workflow, /if ! git ls-remote --exit-code --heads/)
  assert.match(workflow, /mkdir -p published-site\/pr-preview/)
  assert.match(workflow, /preview_dir="published-site\/pr-preview\/pr-\$\{PR_NUMBER\}"/)
  assert.match(workflow, /rm -rf "\$\{preview_dir\}"/)
  assert.doesNotMatch(workflow, /find published-site -mindepth 1/)
  assert.doesNotMatch(workflow, /cp -a production-source\/out/)
})

test("closed PR cleanup does not require a preview-source checkout", () => {
  assert.match(workflow, /- name: Setup Node\.js\n\s+if: github\.event\.action != 'closed'/)
  assert.match(workflow, /- name: Build pull request preview\n\s+if: github\.event\.action != 'closed'/)
})

const production = readRepoFile(".github/workflows/nextjs.yml")

test("production and preview publishing share the same concurrency group", () => {
  const group = (source) => source.match(/^\s*group: (gcsb-pages-content-[\w-]+)$/m)?.[1]
  assert.ok(group(production))
  assert.equal(group(production), group(workflow))
  assert.match(production, /cancel-in-progress: false/)
  assert.match(workflow, /cancel-in-progress: false/)
})

test("production waits for the current run's Pages artifact before deploying", () => {
  assert.match(production, /^  actions: read$/m)
  assert.match(production, /actions\/upload-pages-artifact@v5/)
  const upload = production.indexOf("- name: Upload Pages artifact")
  const wait = production.indexOf("- name: Wait for Pages artifact metadata")
  const deploy = production.indexOf("- name: Deploy GitHub Pages")
  assert.ok(upload >= 0 && upload < wait && wait < deploy)
  const readiness = production.slice(wait, deploy)
  assert.ok(readiness.includes('/actions/runs/${GITHUB_RUN_ID}/artifacts?name=github-pages'))
  assert.match(readiness, /\.name == "github-pages" and \.expired == false/)
  assert.match(readiness, /seq 1 12/)
  assert.match(readiness, /sleep 5/)
  assert.match(readiness, /exit 1/)
})
