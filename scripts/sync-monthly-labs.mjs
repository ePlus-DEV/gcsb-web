/** Build-time refresh; checked-in snapshots keep static builds usable offline. */
import { readFile, writeFile } from "node:fs/promises"

const file = new URL("../data/monthly-labs.json", import.meta.url)
const snapshot = JSON.parse(await readFile(file, "utf8"))
const root = "https://raw.githubusercontent.com/hoangsvit/arcade-crawler/main/"
async function json(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { "User-Agent": "gcsb-web-monthly-labs" } })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
try {
  const tree = await json("https://api.github.com/repos/hoangsvit/arcade-crawler/git/trees/main?recursive=1")
  if (!Array.isArray(tree.tree) || tree.truncated) throw new Error("Incomplete history index")
  const paths = tree.tree.filter(item => item.type === "blob" && /^data\/arcade_monthly_games_history\/\d{4}\/(0[1-9]|1[0-2])\.json$/.test(item.path))
  if (!paths.length) throw new Error("No month archives")
  let refreshed = 0
  for (let index = 0; index < paths.length; index += 6) {
    const results = await Promise.allSettled(paths.slice(index, index + 6).map(async item => {
      const match = item.path.match(/\/(\d{4})\/(\d{2})\.json$/)
      const month = `${match[1]}-${match[2]}`
      const games = await json(root + item.path)
      if (!Array.isArray(games) || !games.length || games.some(game => !game || typeof game.title !== "string" || !game.title.trim() || (game.month && game.month !== month))) throw new Error(`Invalid archive ${month}`)
      return { month, games }
    }))
    for (const result of results) {
      if (result.status === "fulfilled") { snapshot.months[result.value.month] = result.value.games; refreshed++ }
      else console.warn(`Monthly labs: retaining stored month (${result.reason.message})`)
    }
  }
  if (!refreshed) throw new Error("No archives refreshed")
  snapshot.capturedAt = new Date().toISOString()
  snapshot.months = Object.fromEntries(Object.entries(snapshot.months).sort(([a], [b]) => a.localeCompare(b)))
  await writeFile(file, JSON.stringify(snapshot, null, 2) + "\n")
  console.log(`Monthly labs: refreshed ${refreshed} archives; retained ${Object.keys(snapshot.months).length} months.`)
} catch (error) {
  console.warn(`Monthly labs: using checked-in archives (${error.message}).`)
}

// Publish only registered detail paths to the live dashboard; fresh feed entries
// without a built route keep their official link until the next deployment.
const routes = new Set()
for (const [month, games] of Object.entries(snapshot.months)) for (const game of games) {
  let gameId = null
  try { gameId = new URL(game.joinUrl).pathname.match(/^\/games\/(\d+)\/?$/)?.[1] } catch {}
  const slug = gameId ? `game-${gameId}` : `badge-${game.title.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`
  routes.add(`/monthly-labs/${month.replace("-", "/")}/${slug}/`)
}
await writeFile(new URL("../data/monthly-lab-routes.json", import.meta.url), JSON.stringify([...routes].sort(), null, 2) + "\n")
