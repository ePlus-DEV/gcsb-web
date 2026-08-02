import { access, readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"

const root = process.cwd()
const localizedRoutes = [
  { code: "vi", path: "vi", htmlLang: "vi", dir: "ltr" },
  { code: "ja", path: "ja", htmlLang: "ja", dir: "ltr" },
  { code: "ko", path: "ko", htmlLang: "ko", dir: "ltr" },
  { code: "zh_CN", path: "zh-cn", htmlLang: "zh-CN", dir: "ltr" },
  { code: "fr", path: "fr", htmlLang: "fr", dir: "ltr" },
  { code: "de", path: "de", htmlLang: "de", dir: "ltr" },
  { code: "es", path: "es", htmlLang: "es", dir: "ltr" },
  { code: "pt_BR", path: "pt-br", htmlLang: "pt-BR", dir: "ltr" },
  { code: "it", path: "it", htmlLang: "it", dir: "ltr" },
  { code: "ru", path: "ru", htmlLang: "ru", dir: "ltr" },
  { code: "ar", path: "ar", htmlLang: "ar", dir: "rtl" },
  { code: "hi", path: "hi", htmlLang: "hi", dir: "ltr" },
]

const outputRoots = [
  path.join(root, ".next", "server", "app"),
  path.join(root, "out"),
]

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(entryPath)))
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(entryPath)
    }
  }

  return files
}

function resolveRoute(filePath, outputRoot) {
  const relativeParts = path
    .relative(outputRoot, filePath)
    .split(path.sep)
    .map((part) => part.replace(/\.html$/, ""))

  return localizedRoutes.find((locale) => relativeParts.includes(locale.path))
}

function removeHtmlAttribute(attributes, name) {
  const pattern = new RegExp(
    `\\s${name}(?:=(?:"[^"]*"|'[^']*'|[^\\s>]+))?`,
    "gi",
  )
  return attributes.replace(pattern, "")
}

function setDocumentLocale(html, locale) {
  return html.replace(/<html\b([^>]*)>/i, (_match, attributes) => {
    let preserved = attributes
    for (const name of ["lang", "dir", "data-locale"]) {
      preserved = removeHtmlAttribute(preserved, name)
    }

    return `<html${preserved} lang="${locale.htmlLang}" dir="${locale.dir}" data-locale="${locale.code}">`
  })
}

const patchedLocales = new Set()
let patchedFiles = 0

for (const outputRoot of outputRoots) {
  if (!(await exists(outputRoot))) continue

  for (const filePath of await collectHtmlFiles(outputRoot)) {
    const locale = resolveRoute(filePath, outputRoot)
    if (!locale) continue

    const current = await readFile(filePath, "utf8")
    const patched = setDocumentLocale(current, locale)
    if (patched === current) {
      throw new Error(`Unable to set locale attributes in ${filePath}.`)
    }

    await writeFile(filePath, patched, "utf8")
    patchedLocales.add(locale.code)
    patchedFiles += 1
  }
}

const missingLocales = localizedRoutes.filter(
  (locale) => !patchedLocales.has(locale.code),
)
if (missingLocales.length > 0) {
  throw new Error(
    `No prerendered HTML was found for: ${missingLocales
      .map((locale) => locale.path)
      .join(", ")}.`,
  )
}

console.log(
  `Patched ${patchedFiles} localized HTML files for ${patchedLocales.size} locales.`,
)
