import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import ts from "typescript"

const require = createRequire(import.meta.url)

export function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8")
}

export function sliceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker)
  if (start < 0) {
    throw new Error(`Start marker not found: ${startMarker}`)
  }

  const end = source.indexOf(endMarker, start)
  if (end < 0) {
    throw new Error(`End marker not found: ${endMarker}`)
  }

  return source.slice(start, end)
}

export function evaluateTypeScript(source, fileName = "inline.ts") {
  const result = ts.transpileModule(source, {
    fileName,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  })

  const errors = (result.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  )
  if (errors.length > 0) {
    const message = ts.formatDiagnosticsWithColorAndContext(errors, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: (name) => name,
      getNewLine: () => "\n",
    })
    throw new Error(message)
  }

  const module = { exports: {} }
  const execute = new Function("require", "module", "exports", result.outputText)
  execute(require, module, module.exports)
  return module.exports
}
