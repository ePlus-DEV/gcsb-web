/**
 * Community-submitted photos of delivered Arcade rewards, separate from
 * official Google product artwork. Keep attribution and the original post
 * together. External images are not copied into this repository, since the
 * photography belongs to the original contributors.
 */
export type RealWorldArcadeSwagPhoto = {
  id: string
  season: 1 | 2
  tier: "novice" | "trooper" | "ranger" | "champion" | "legend"
  title: string
  author: string
  description: string
  imageUrl: string
  sourceUrl: string
  sourcePlatform: "LinkedIn" | "Google Developer Forum" | "Reddit"
}

export const REAL_WORLD_2025_SWAG_PHOTOS: readonly RealWorldArcadeSwagPhoto[] = [
  {
    id: "s1-legend-prerana",
    season: 1,
    tier: "legend",
    title: "Legend package unboxed",
    author: "Prerana Kailash Pattnaik",
    description: "Actual Legend collection with polo shirt, desk lamp, compact vacuum, mini printer and accessories.",
    imageUrl: "https://media.licdn.com/dms/image/v2/D5622AQGzXc6XQL-OzA/feedshare-shrink_800/B56ZoKY_UZHAAg-/0/1761110915146?e=2147483647&t=pIk_0-2c3ff0eyqwARx5-4mZF1tqWIh2rMo0Hbt3CAQ&v=beta",
    sourceUrl: "https://www.linkedin.com/posts/prerana-pattnaik_googlecloudarcade-arcadelegend-diamondleague-activity-7386634567102816256-6Vsj",
    sourcePlatform: "LinkedIn",
  },
  {
    id: "s1-trooper-aman",
    season: 1,
    tier: "trooper",
    title: "Trooper rewards at home",
    author: "Aman Patel",
    description: "Real desk photo showing the Trooper shirt, Fold & Glow lamp, badges and stickers.",
    imageUrl: "https://media.licdn.com/dms/image/v2/D4E22AQG5NN9lGBg69A/feedshare-shrink_800/B4EZkuyvkpIwAk-/0/1757426681517?e=2147483647&t=Y-eLEVOu3LxH7KO4EQaYZQwmikqw33JZPlne8uEi7WI&v=beta",
    sourceUrl: "https://www.linkedin.com/posts/ubaman34_googlecloud-googlearcade-premiumswag-activity-7371181769120960512-TUAx",
    sourcePlatform: "LinkedIn",
  },
  {
    id: "s1-novice-tanisha",
    season: 1,
    tier: "novice",
    title: "Novice rewards photographed",
    author: "Tanisha Verma",
    description: "Real-world arrangement of Novice T-shirt, mug, laptop stand and badges.",
    imageUrl: "https://media.licdn.com/dms/image/v2/D5622AQGP-AtKDm_CQg/feedshare-shrink_800/B56ZoQCstCH8Ag-/0/1761205741540?e=2147483647&t=bxb0R8LFlyNdFqSIErpI7S8B8POi0__J_0kpPnQAktw&v=beta",
    sourceUrl: "https://www.linkedin.com/posts/tanisha-verma08_googlecloud-arcade-cloudcomputing-activity-7387032307418894336-6KYE",
    sourcePlatform: "LinkedIn",
  },
  {
    id: "s1-legend-premal",
    season: 1,
    tier: "legend",
    title: "Legend delivery: incomplete package",
    author: "Premal_Bhagat",
    description: "Community delivery evidence showing what actually arrived, not the complete advertised package.",
    imageUrl: "https://d2yds90mtvelsl.cloudfront.net/original/3X/5/9/597d96aa9455deebe4f8b38da4fb9fae14d61111.jpeg",
    sourceUrl: "https://discuss.google.dev/t/swag-drop-the-arcade-pen-duo/274906?page=2#post_28",
    sourcePlatform: "Google Developer Forum",
  },
  {
    id: "s2-legend-reddit",
    season: 2,
    tier: "legend",
    title: "Season 2 reward delivery",
    author: "u/CivilUnit5867",
    description: "Recipient photo of the delivered 2025 Cohort 2 reward collection, shared on Reddit in 2026.",
    imageUrl: "https://preview.redd.it/got-my-gc-cohort-2-25-goodies-v0-39eg451yjavg1.jpeg?auto=webp&crop=smart&s=a138158ef2b431cf00f6b26d3a4527084a18b55b&width=640",
    sourceUrl: "https://www.reddit.com/r/googlecloud/comments/1slx32t/got_my_gc_cohort_2_25_goodies/",
    sourcePlatform: "Reddit",
  },
]
