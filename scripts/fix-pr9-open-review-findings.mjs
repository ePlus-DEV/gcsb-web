import { readFile, writeFile } from "node:fs/promises"

function replaceOnce(source, search, replacement, label) {
  const first = source.indexOf(search)
  if (first === -1) throw new Error(`Missing patch anchor: ${label}`)
  if (source.indexOf(search, first + search.length) !== -1) {
    throw new Error(`Patch anchor is not unique: ${label}`)
  }
  return source.replace(search, replacement)
}

const calculatorPath = "app/redesign-calculator.tsx"
const modelPath = "components/arcade/model.ts"
const facilitatorPath = "components/arcade/facilitator-panel.tsx"
const previewWorkflowPath = ".github/workflows/pr-preview.yml"

let calculator = await readFile(calculatorPath, "utf8")
calculator = calculator.replace(/\bSTORAGE_KEY\b/g, "DASHBOARD_STORAGE_KEY")
calculator = replaceOnce(
  calculator,
  '  ARCADE_MILESTONES_URL,\n',
  '  ARCADE_MILESTONES_URL,\n  DASHBOARD_STORAGE_KEY,\n',
  "calculator shared dashboard storage import",
)
calculator = replaceOnce(
  calculator,
  'const DASHBOARD_STORAGE_KEY = "eplus-arcade-dashboard-v1"\n',
  "",
  "calculator local dashboard storage key",
)
calculator = replaceOnce(
  calculator,
  `          const slots = numeric(candidate.slots)\n          const spotsLeft = numeric(candidate.spotsLeft)\n          if (slots <= 0 || spotsLeft < 0 || spotsLeft > slots) return fallback\n`,
  `          const hasSlots =\n            candidate.slots !== undefined &&\n            candidate.slots !== null &&\n            candidate.slots !== ""\n          const hasSpotsLeft =\n            candidate.spotsLeft !== undefined &&\n            candidate.spotsLeft !== null &&\n            candidate.spotsLeft !== ""\n          if (!hasSlots || !hasSpotsLeft) return fallback\n\n          const slots = numeric(candidate.slots)\n          const spotsLeft = numeric(candidate.spotsLeft)\n          if (slots <= 0 || spotsLeft < 0 || spotsLeft > slots) return fallback\n`,
  "milestone missing spotsLeft handling",
)
await writeFile(calculatorPath, calculator)

let model = await readFile(modelPath, "utf8")
model = replaceOnce(
  model,
  'export const STORAGE_KEY = "eplus-arcade-calculator-v2"\n',
  'export const DASHBOARD_STORAGE_KEY = "eplus-arcade-dashboard-v1"\nexport const STORAGE_KEY = "eplus-arcade-calculator-v2"\n',
  "shared redesign dashboard storage key",
)
await writeFile(modelPath, model)

let facilitator = await readFile(facilitatorPath, "utf8")
facilitator = facilitator.replace(/\bSTORAGE_KEY\b/g, "DASHBOARD_STORAGE_KEY")
facilitator = replaceOnce(
  facilitator,
  'import { formatNumber, numeric } from "./model"\n',
  'import { DASHBOARD_STORAGE_KEY, formatNumber, numeric } from "./model"\n',
  "facilitator shared dashboard storage import",
)
facilitator = replaceOnce(
  facilitator,
  'const DASHBOARD_STORAGE_KEY = "eplus-arcade-dashboard-v1"\n',
  "",
  "facilitator local dashboard storage key",
)
await writeFile(facilitatorPath, facilitator)

let previewWorkflow = await readFile(previewWorkflowPath, "utf8")
previewWorkflow = replaceOnce(
  previewWorkflow,
  '          PREVIEW_PATH: "/pr-preview/pr-${{ github.event.number }}"\n',
  '          PREVIEW_PATH: "/pr-preview/pr-${{ github.event.number }}"\n          REPO_NAME: ${{ github.event.repository.name }}\n',
  "preview repository environment variable",
)
previewWorkflow = replaceOnce(
  previewWorkflow,
  '          if grep -q "/${{ github.event.repository.name }}/pr-preview/" out/index.html; then\n',
  '          if grep -q "/${REPO_NAME}/pr-preview/" out/index.html; then\n',
  "preview repository shell interpolation",
)
await writeFile(previewWorkflowPath, previewWorkflow)

console.log("Applied all open PR #9 review fixes.")
