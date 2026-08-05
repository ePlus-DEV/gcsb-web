import { facilitatorTranslationsAsian } from "./facilitator-translations-asian.mjs"
import { facilitatorTranslationsFragments } from "./facilitator-translations-fragments.mjs"
import { facilitatorTranslationsWestern } from "./facilitator-translations-western.mjs"

const SOURCE = {
  participating: "Participating in Facilitator Program",
  includeHighest: "Include the highest eligible Facilitator milestone bonus.",
  pasteValid: "Paste a valid public profile URL to enable this option.",
  viewDetails: "View program details",
  program: "Facilitator Program",
  programTracker: "Program tracker",
  enableBonus: "Enable to include bonus points",
  headerDescription:
    "Confirm program participation, track milestone bonuses, and find syllabus badges that are still missing.",
  analyzeFirst: "Analyze a public profile first",
  trackerUses:
    "The tracker uses the same public-profile result as the calculator.",
  goCalculator: "Go to calculator",
  enrolledOnly:
    "Turn this on only for players who officially enrolled in the program.",
  preferenceSaved:
    "The preference is saved on this device for the current public profile. When disabled, milestone progress remains visible as a preview but no Facilitator bonus is added to the total.",
  overallPoints: "Overall Arcade points",
  regularIncluded:
    "Includes regular points earned from games and skill badges",
  facilitatorBonus: "Facilitator bonus",
  highestOnly: "Highest completed milestone only",
  estimatedTotal: "Estimated total after bonus",
  optionalBonus: "Optional +10 Bonus Milestone not included",
  noBonus: "No Facilitator bonus included",
  countsOnly:
    "Facilitator game and skill-badge counts determine the milestone bonus only. Their regular Arcade points are already included in the overall score and are not added twice.",
  previewMode:
    "Facilitator calculations are in preview mode. Enable participation above only when this player is enrolled in the Facilitator Program; otherwise no Facilitator bonus is added.",
  activityUnavailable:
    "Facilitator activity totals are unavailable, so milestone progress and bonus cannot be estimated yet.",
  checklist: "2026 syllabus badge checklist",
  compare51: "Compare the profile with all 51 listed skill badges.",
  eligible66: "66 eligible skill badges total",
  noMatches: "No badges match these filters",
  clearFilters: "Clear the search or select another track/status.",
  syllabusDisclaimer:
    "Based on the July–September 2026 syllabus. Google's official syllabus and program records remain the final source of truth.",
  milestoneProgress: "Milestone progress",
  allMilestones: "All standard milestones completed",
  previewOnly: "Preview only",
  arcadeGames: "Arcade games",
  skillBadges: "Skill badges",
  facilitatorMilestones: "Facilitator milestones",
  officialProgress:
    "Progress follows Google's official combined completed requirements display. Only the highest milestone bonus applies when participation is enabled.",
  bonusMilestone: "Bonus Milestone",
  bonusThrough: "bonus points through GEAR and AI agent verification.",
  participationOff: "Participation off",
  profileRequirements:
    "requirements can be checked from the public profile. Agent verification is manual.",
  earnGear: "Earn the GEAR program enrolment badge.",
  earnArcadeGear:
    "Earn the Arcade - GEAR badge on your developer profile.",
  reachM1: "Reach at least 6 Arcade Games and 18 Skill Badges.",
  complete4Gear: "Complete all 4 GEAR skill badges",
  buildAgent: "Build and submit your AI agent",
  manualDetail:
    "Free Trial, agent creation, Project Name and Billing ID verification cannot be detected from a public profile.",
  readGuide: "Read official guide",
  submitForm: "Submit verification form",
  referenceOnly:
    "This section is shown for reference only because Facilitator participation is disabled for this profile.",
  readySubmit:
    "All profile-checkable requirements appear complete. Follow the guide, build your AI agent, then submit the verification form.",
  completeRemaining:
    "Complete the remaining profile requirements first. Google recommends finishing enrolment before starting the Bonus Milestone steps.",
  disclaimerStart:
    "Facilitator bonuses are included only after the player confirms participation above. Game and skill-badge points are never counted twice. The optional Bonus Milestone adds +",
  disclaimerEnd:
    "after Google verifies the submitted form. Final recognition remains subject to Google's program records.",
  trackBeginner:
    "Start with foundational cloud, AI, security, and data skills.",
  trackIntermediate:
    "Build practical application, infrastructure, networking, and AI skills.",
  trackAdvanced:
    "Complete advanced infrastructure, security, data, and AI paths.",
  closeTracker: "Close Facilitator tracker",
  openTracker: "Open Facilitator Program tracker",
  openTrackerConfirm:
    "Open Facilitator Program tracker and confirm participation",
  searchBadges: "Search syllabus badges",
  filterTrack: "Filter syllabus by learning track",
  filterStatus: "Filter syllabus by completion status",
  earnExtra: "Earn an extra +",
  foundProfile: "found on the public profile.",
  completeAny: "Complete any",
  arcadeGamesAnd: "Arcade Games and",
  syllabusBadgesCompleted: "syllabus badges completed",
  profileChecksLabel: "profile checks",
  of: "of",
  earnedLabel: "Earned",
  lab: "lab",
  labs: "labs",
  credit: "credit",
  credits: "credits",
}

const DYNAMIC_FALLBACKS = {
  bonusBadgesLeft: "+{bonus} bonus · {count} badges left",
  potentialBonus: "Potential +{bonus}; participation is not enabled",
  percentCompleted: "{percent}% completed",
  syllabusProgress: "{count} of {total} syllabus badges completed",
  earned: "Earned {value}",
  profileChecks: "{count} / {total} profile checks",
}

const translations = {
  ...facilitatorTranslationsAsian,
  ...facilitatorTranslationsWestern,
}

export function applyFacilitatorTranslations(catalogs) {
  for (const [locale, catalog] of Object.entries(catalogs)) {
    catalog.additional ??= {}
    const target = {
      ...(translations[locale] ?? {}),
      ...(facilitatorTranslationsFragments[locale] ?? {}),
    }
    const requireTranslation = locale !== "en"

    for (const [key, source] of Object.entries(SOURCE)) {
      if (requireTranslation && !Object.hasOwn(target, key)) {
        throw new Error(`Missing Facilitator translation ${locale}.${key}`)
      }
      catalog.additional[source] = target[key] ?? source
    }

    for (const [key, fallback] of Object.entries(DYNAMIC_FALLBACKS)) {
      if (requireTranslation && !Object.hasOwn(target, key)) {
        throw new Error(`Missing Facilitator dynamic translation ${locale}.${key}`)
      }
      catalog.additional[`__facilitator:${key}`] = target[key] ?? fallback
    }
  }
}
