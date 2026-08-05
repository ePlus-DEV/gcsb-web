import { facilitatorTranslationsLabels } from "./facilitator-translations-labels.mjs"

const LABEL_SOURCES = {
  enabled: "Enabled",
  disabled: "Disabled",
  off: "Off",
  completed: "Completed",
  notCompleted: "Not completed",
  ultimateTarget: "Ultimate target",
  allTracks: "All tracks",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  missing: "Missing",
  all: "All",
  notStarted: "Not started",
  milestone1: "Milestone 1",
  milestone2: "Milestone 2",
  milestone3: "Milestone 3",
  ultimateMilestone: "Ultimate Milestone",
  current: "Current",
  preview: "Preview",
  games: "Games",
  skills: "Skills",
  regularArcade: "Regular Arcade",
  completeM1: "Complete Milestone 1",
  gearSignup: "GEAR Sign-up badge",
  arcadeGear: "Arcade - GEAR badge",
  manual: "Manual",
  gearSkill: "GEAR skill badge",
  notFound: "Not found",
}

export function applyFacilitatorLabelTranslations(catalogs) {
  for (const [locale, catalog] of Object.entries(catalogs)) {
    catalog.additional ??= {}
    const target = facilitatorTranslationsLabels[locale] ?? {}

    for (const [key, source] of Object.entries(LABEL_SOURCES)) {
      if (locale !== "en" && !Object.hasOwn(target, key)) {
        throw new Error(`Missing Facilitator label translation ${locale}.${key}`)
      }
      catalog.additional[source] = target[key] ?? source
    }
  }
}
