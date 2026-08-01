import { appendFile, readFile, writeFile } from "node:fs/promises"

const calculatorPath = "app/redesign-calculator.tsx"
const resultsCssPath = "app/styles/redesign-results.css"
const componentsCssPath = "app/styles/redesign-components.css"

function replaceOnce(source, search, replacement, label) {
  const first = source.indexOf(search)
  if (first === -1) throw new Error(`Missing patch anchor: ${label}`)
  if (source.indexOf(search, first + search.length) !== -1) {
    throw new Error(`Patch anchor is not unique: ${label}`)
  }
  return source.replace(search, replacement)
}

let calculator = await readFile(calculatorPath, "utf8")

calculator = replaceOnce(
  calculator,
  `  API_URL,\n  OFFICIAL_MILESTONES,`,
  `  API_URL,\n  ARCADE_MILESTONES_URL,\n  OFFICIAL_MILESTONES,`,
  "milestone URL import",
)

calculator = replaceOnce(
  calculator,
  `const GITHUB_URL = "https://github.com/ePlus-DEV/google-cloud-skills-boost-helper"\nconst STORAGE_KEY`,
  `const GITHUB_URL = "https://github.com/ePlus-DEV/google-cloud-skills-boost-helper"\nconst ARCADE_CRAWLER_URL = "https://github.com/hoangsvit/arcade-crawler"\nconst STORAGE_KEY`,
  "crawler source constant",
)

calculator = replaceOnce(
  calculator,
  `function getQualifiedMilestone(points: number): ArcadeMilestone | null {\n  return [...OFFICIAL_MILESTONES].reverse().find((tier) => points >= tier.points) ?? null\n}`,
  `function getQualifiedMilestone(\n  points: number,\n  milestones: ArcadeMilestone[],\n): ArcadeMilestone | null {\n  return [...milestones].reverse().find((tier) => points >= tier.points) ?? null\n}`,
  "qualified milestone helper",
)

calculator = replaceOnce(
  calculator,
  `  const [showAllBadges, setShowAllBadges] = useState(false)\n  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)\n  const abortControllerRef`,
  `  const [showAllBadges, setShowAllBadges] = useState(false)\n  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)\n  const [milestones, setMilestones] = useState<ArcadeMilestone[]>(OFFICIAL_MILESTONES)\n  const [milestonesLive, setMilestonesLive] = useState(false)\n  const abortControllerRef`,
  "milestone state",
)

calculator = replaceOnce(
  calculator,
  `  }, [committedProfileUrl, result])\n\n  const badges = useMemo<ArcadeBadge[]>(`,
  `  }, [committedProfileUrl, result])\n\n  useEffect(() => {\n    let active = true\n    const controller = new AbortController()\n    const timeout = window.setTimeout(() => controller.abort(), 15_000)\n\n    async function loadLiveMilestones() {\n      try {\n        const response = await fetch(ARCADE_MILESTONES_URL, {\n          cache: "no-store",\n          signal: controller.signal,\n        })\n        if (!response.ok) return\n\n        const payload: unknown = await response.json()\n        if (!Array.isArray(payload)) return\n\n        const liveMilestones = OFFICIAL_MILESTONES.map((fallback) => {\n          const candidate = payload.find(\n            (item) =>\n              typeof item === "object" &&\n              item !== null &&\n              numeric((item as { points?: unknown }).points) === fallback.points,\n          ) as Record<string, unknown> | undefined\n\n          if (!candidate) return fallback\n\n          const slots = numeric(candidate.slots)\n          const spotsLeft = numeric(candidate.spotsLeft)\n          if (slots <= 0 || spotsLeft < 0 || spotsLeft > slots) return fallback\n\n          return {\n            ...fallback,\n            league:\n              typeof candidate.league === "string"\n                ? candidate.league\n                : fallback.league,\n            slots,\n            spotsLeft,\n          }\n        })\n\n        if (active) {\n          setMilestones(liveMilestones)\n          setMilestonesLive(\n            liveMilestones.every((milestone) => milestone.spotsLeft !== null),\n          )\n        }\n      } catch {\n        // Keep the verified tier thresholds and total-slot fallback.\n      } finally {\n        window.clearTimeout(timeout)\n      }\n    }\n\n    void loadLiveMilestones()\n\n    return () => {\n      active = false\n      window.clearTimeout(timeout)\n      controller.abort()\n    }\n  }, [])\n\n  const badges = useMemo<ArcadeBadge[]>(`,
  "live milestone fetch",
)

calculator = replaceOnce(
  calculator,
  `  const qualifiedMilestone = getQualifiedMilestone(points)`,
  `  const qualifiedMilestone = getQualifiedMilestone(points, milestones)`,
  "dynamic qualified milestone",
)

calculator = replaceOnce(
  calculator,
  `  const nextMilestone =\n    OFFICIAL_MILESTONES.find((tier) => points < tier.points) ??\n    OFFICIAL_MILESTONES[OFFICIAL_MILESTONES.length - 1]\n  const pointsToNextTier = Math.max(0, nextMilestone.points - points)\n  const maxTierPoints =\n    OFFICIAL_MILESTONES[OFFICIAL_MILESTONES.length - 1]?.points ?? 0`,
  `  const nextMilestone =\n    milestones.find((tier) => points < tier.points) ??\n    milestones[milestones.length - 1]\n  const pointsToNextTier = Math.max(0, nextMilestone.points - points)\n  const maxTierPoints = milestones[milestones.length - 1]?.points ?? 0`,
  "dynamic next milestone",
)

calculator = replaceOnce(
  calculator,
  `<PanelTitle>Tier status · Arcade 2026</PanelTitle>`,
  `<PanelTitle>Point eligibility · Arcade 2026</PanelTitle>`,
  "tier status heading",
)

calculator = replaceOnce(
  calculator,
  `{isTierQualified ? "Score qualified" : "Score not qualified"}`,
  `{isTierQualified ? "Eligible by points" : "Not yet eligible"}`,
  "tier qualification label",
)

calculator = replaceOnce(
  calculator,
  `              <dl className="allocation-row">\n                <dt>Allocation status</dt>\n                <dd>Unknown <CircleHelp /></dd>\n              </dl>\n              <p className="allocation-message">\n                Google does not publicly expose your allocation order. This result confirms score eligibility only.\n              </p>`,
  `              {qualifiedMilestone && (\n                <div className="tier-availability-grid" aria-label="Tier slot availability">\n                  <div>\n                    <span>Total tier capacity</span>\n                    <strong>{formatInteger(qualifiedMilestone.slots)}</strong>\n                  </div>\n                  <div>\n                    <span>Spots currently left</span>\n                    <strong>\n                      {qualifiedMilestone.spotsLeft === null\n                        ? "Unavailable"\n                        : formatInteger(qualifiedMilestone.spotsLeft)}\n                    </strong>\n                  </div>\n                </div>\n              )}\n              <dl className="allocation-row">\n                <dt>Your queue position</dt>\n                <dd>Not available <CircleHelp /></dd>\n              </dl>\n              <p className="allocation-message">\n                Point eligibility and remaining spots are different. The slot count comes from the automated arcade-crawler, but Google does not expose whether your profile is ahead of other eligible users.\n              </p>`,
  "tier allocation explanation",
)

calculator = replaceOnce(
  calculator,
  `<span className="tier-help">Score only</span>`,
  `<span className={milestonesLive ? "tier-help is-live" : "tier-help"}>\n                  {milestonesLive ? "Live slot data" : "Total slots only"}\n                </span>`,
  "tier data status",
)

calculator = replaceOnce(
  calculator,
  `{[...OFFICIAL_MILESTONES].reverse().map((tier) => {`,
  `{[...milestones].reverse().map((tier) => {`,
  "result tier list source",
)

calculator = replaceOnce(
  calculator,
  `                      <b>{formatInteger(tier.slots)}<small> slots</small></b>`,
  `                      <div className="tier-slot-count">\n                        <b>\n                          {tier.spotsLeft === null\n                            ? "—"\n                            : formatInteger(tier.spotsLeft)}\n                        </b>\n                        <small>\n                          {tier.spotsLeft === null\n                            ? `${formatInteger(tier.slots)} total slots`\n                            : `left of ${formatInteger(tier.slots)}`}\n                        </small>\n                      </div>`,
  "tier remaining count",
)

calculator = replaceOnce(
  calculator,
  `              <p className="tier-note">\n                Slot limits are official totals. First-come allocation order is not public, so the site never claims a guaranteed reward.\n              </p>`,
  `              <p className="tier-note">\n                Total and remaining spots are loaded from the{` `}\n                <a href={ARCADE_CRAWLER_URL} target="_blank" rel="noreferrer noopener">\n                  arcade-crawler\n                </a>{` `}\n                dataset, which is refreshed every 6 hours. Your personal queue position is not included in that data.\n              </p>`,
  "tier source note",
)

calculator = replaceOnce(
  calculator,
  `{[...OFFICIAL_MILESTONES].reverse().map((tier) => (`,
  `{[...milestones].reverse().map((tier) => (`,
  "empty tier list source",
)

calculator = replaceOnce(
  calculator,
  `                <b>{formatInteger(tier.slots)} slots</b>`,
  `                <b>\n                  {tier.spotsLeft === null\n                    ? `${formatInteger(tier.slots)} total slots`\n                    : `${formatInteger(tier.spotsLeft)} / ${formatInteger(tier.slots)} left`}\n                </b>`,
  "empty tier availability",
)

await writeFile(calculatorPath, calculator, "utf8")

const resultsCss = await readFile(resultsCssPath, "utf8")
if (!resultsCss.includes(".tier-availability-grid")) {
  await appendFile(
    resultsCssPath,
    `.tier-availability-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 12px}.tier-availability-grid>div{display:grid;gap:5px;padding:10px 11px;border:1px solid rgba(148,163,184,.12);border-radius:8px;background:rgba(5,14,31,.58)}.tier-availability-grid span{color:var(--arcade-muted);font-size:.65rem}.tier-availability-grid strong{color:#edf4ff;font-size:.92rem}.allocation-row dd{white-space:nowrap}\n`,
    "utf8",
  )
}

const componentsCss = await readFile(componentsCssPath, "utf8")
if (!componentsCss.includes(".tier-slot-count")) {
  await appendFile(
    componentsCssPath,
    `.tier-help.is-live{color:var(--arcade-green)}.tier-slot-count{display:grid;justify-items:end;gap:3px;text-align:right}.tier-slot-count b{color:#dbe5f6;font-size:.76rem}.tier-slot-count small{color:#7e8da7;font-size:.61rem;font-weight:500}.tier-note a{color:#bca7ff;text-decoration:none}.tier-note a:hover{text-decoration:underline}\n`,
    "utf8",
  )
}
