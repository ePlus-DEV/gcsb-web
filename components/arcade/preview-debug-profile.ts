"use client"

import type { ArcadeApiResponse, ArcadeBadge } from "./model"

export const IS_PR_PREVIEW =
  (process.env.NEXT_PUBLIC_BASE_PATH ?? "").startsWith("/pr-preview/pr-")

export const PREVIEW_DEBUG_PROFILE_URL =
  "https://www.skills.google/public_profiles/11111111-2222-4333-8444-555555555555"

const game: ArcadeBadge[] = [
  { title: "Arcade Base Camp", points: 15, dateEarned: "2026-09-29T08:00:00Z" },
  { title: "Arcade Adventure", points: 15, dateEarned: "2026-09-24T08:00:00Z" },
  { title: "Arcade Expedition", points: 20, dateEarned: "2026-09-18T08:00:00Z" },
]

const skill: ArcadeBadge[] = [
  { title: "Build Infrastructure with Terraform on Google Cloud", points: 12, dateEarned: "2026-09-27T08:00:00Z" },
  { title: "Implement Load Balancing on Compute Engine", points: 10, dateEarned: "2026-09-21T08:00:00Z" },
  { title: "Develop Serverless Apps with Firebase", points: 10, dateEarned: "2026-09-14T08:00:00Z" },
  { title: "Prompt Design in Vertex AI", points: 10, dateEarned: "2026-09-10T08:00:00Z" },
]

const trivia: ArcadeBadge[] = [
  { title: "Arcade Trivia September", points: 10, dateEarned: "2026-09-25T08:00:00Z" },
]

const special: ArcadeBadge[] = [
  { title: "Arcade Special Challenge", points: 10, dateEarned: "2026-09-16T08:00:00Z" },
]

export const PREVIEW_DEBUG_PROFILE_RESULT: ArcadeApiResponse = {
  success: true,
  userDetails: [{
    userName: "PR Preview Learner",
    memberSince: "Jan 2025",
    league: "Arcade Champion",
    points: "112",
  }],
  badges: [...game, ...skill, ...trivia, ...special],
  game,
  skill,
  trivia,
  special,
  completion: [],
  arcadePoints: {
    totalPoints: 112,
    gamePoints: 50,
    skillPoints: 42,
    triviaPoints: 10,
    specialPoints: 10,
    completionPoints: 0,
  },
  milestone: "Arcade Champion",
  faciCounts: {
    faciGame: 8,
    faciTrivia: 1,
    faciSkill: 34,
    faciCompletion: 0,
    bonusMilestonePoints: 0,
  },
  beta: {
    scoreComplete: true,
    unknownBadgeCount: 0,
    unknownBadges: [],
    profileBadgeCount: 9,
    eligibleBadgeCount: 9,
    tier: "Arcade Champion",
  },
}
