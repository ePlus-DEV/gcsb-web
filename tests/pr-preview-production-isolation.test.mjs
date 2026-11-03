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
