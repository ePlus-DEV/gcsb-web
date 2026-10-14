import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, resolve, sep } from "node:path"

const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ico": "image/x-icon",
}

/** Serve a static export for browser verification using only Node built-ins. */
export async function startStaticServer({ directory = "out", port = 0, basePath = "" } = {}) {
  const root = resolve(directory)
  const server = createServer(async (req, res) => {
    try {
      if (!["GET", "HEAD"].includes(req.method)) {
        res.writeHead(405, { Allow: "GET, HEAD" }).end()
        return
      }
      let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname)
      if (basePath) {
        if (!pathname.startsWith(`${basePath}/`)) {
          res.writeHead(404).end()
          return
        }
        pathname = pathname.slice(basePath.length)
      }
      let file = resolve(root, `.${pathname}`)
      if (file !== root && !file.startsWith(root + sep)) {
        res.writeHead(403).end()
        return
      }
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html")
      const body = await readFile(file)
      res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream", "Content-Length": body.length })
      res.end(req.method === "HEAD" ? undefined : body)
    } catch (error) {
      res.writeHead(error instanceof URIError ? 400 : 404).end()
    }
  })
  await new Promise((accept, reject) => {
    server.once("error", reject)
    server.listen(port, "127.0.0.1", accept)
  })
  return {
    url: `http://127.0.0.1:${server.address().port}${basePath}/`,
    close: () => new Promise((accept, reject) => {
      server.closeAllConnections()
      server.close((error) => error ? reject(error) : accept())
    }),
  }
}
