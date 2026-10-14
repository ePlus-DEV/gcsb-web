export const steps = [
  {
    number: "01",
    title: "Open your Google Skills profile",
    description:
      "Sign in to Google Skills, open your profile page, and locate the public profile or sharing settings.",
    detail:
      "Your public URL normally contains skills.google/public_profiles/ followed by your profile identifier.",
  },
  {
    number: "02",
    title: "Make the profile public",
    description:
      "Enable public profile visibility so your badge list can be viewed without signing in.",
    detail:
      "Open the copied URL in a private or incognito window to confirm the profile and badges are publicly visible.",
  },
  {
    number: "03",
    title: "Copy the complete profile URL",
    description:
      "Copy the public profile URL directly from the browser address bar.",
    detail:
      "Avoid dashboard URLs, course URLs, badge URLs, shortened links, or pages that still require sign-in.",
  },
  {
    number: "04",
    title: "Analyze the profile",
    description:
      "Paste the public profile URL into Arcade Points and select Analyze profile.",
    detail:
      "The calculator reads public badge information and maps recognized badges to supported Arcade points.",
  },
  {
    number: "05",
    title: "Read your score",
    description:
      "Review your total points, badge breakdown, unknown badges, tier progress, and Facilitator information.",
    detail:
      "Unknown badges remain visible so a new or renamed badge is not silently excluded from your review.",
  },
  {
    number: "06",
    title: "Check reward availability",
    description:
      "Compare your point tier with the current prize-slot information and reward pages.",
    detail:
      "Reaching a threshold does not guarantee a reward. Official program rules, verification, region, timing, and availability still apply.",
  },
]

export const resultItems = [
  ["Total points", "Estimated sum of recognized Arcade badge categories."],
  ["Point breakdown", "Contribution from game, skill, trivia, completion, and special badges."],
  ["Unknown badges", "Visible badges that do not yet have a verified point mapping."],
  ["Tier progress", "Your current qualifying threshold and progress toward the next tier."],
  ["Facilitator", "Separate milestone and bonus information when the program is enabled."],
]

export const errors = [
  {
    title: "Profile URL is rejected",
    body: "Confirm that you copied a public profile URL rather than a badge, course, or signed-in dashboard URL.",
  },
  {
    title: "No badges are found",
    body: "Open the same profile in an incognito window. If it is hidden or requires sign-in, update its public visibility first.",
  },
  {
    title: "Score looks incomplete",
    body: "Review the unknown-badge section. New or renamed badges may need verification before they receive a point mapping.",
  },
  {
    title: "Request times out",
    body: "Wait briefly and retry. Temporary network, upstream profile, or service availability issues can interrupt analysis.",
  },
]

