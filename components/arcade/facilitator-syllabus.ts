import type { ArcadeBadge } from "./model"

export type FacilitatorTrack = "beginner" | "intermediate" | "advanced"

export type FacilitatorSyllabusBadge = {
  courseTemplateId: string
  title: string
  url: string
  labs: number
  credits: number
  track: FacilitatorTrack
  aliases?: readonly string[]
}

export type FacilitatorBadgeStatus = FacilitatorSyllabusBadge & {
  completed: boolean
  earnedBadge?: ArcadeBadge
  matchReason?: "course-id" | "title"
}

export const FACILITATOR_TRACKS: ReadonlyArray<{
  id: FacilitatorTrack
  label: string
  description: string
}> = [
  { id: "beginner", label: "Beginner", description: "Get Started with Google Cloud & AI" },
  { id: "intermediate", label: "Intermediate", description: "Dive Deeper into Google Cloud & AI" },
  { id: "advanced", label: "Advanced", description: "Take Your Google Cloud & AI Skills to the Next Level" },
]

export const FACILITATOR_SYLLABUS_2026: readonly FacilitatorSyllabusBadge[] = [
  { courseTemplateId: "1586", title: "Create Your First Gemini Enterprise Application", url: "https://www.skills.google/paths/3546/course_templates/1586", labs: 1, credits: 0, track: "beginner" },
  { courseTemplateId: "1426", title: "Develop AI-Powered Prototypes in Google AI Studio", url: "https://www.skills.google/course_templates/1426", labs: 4, credits: 0, track: "beginner", aliases: ["Develop AI-Powered Prototypes with Google AI Studio"] },
  { courseTemplateId: "754", title: "The Basics of Google Cloud Compute", url: "https://www.skills.google/course_templates/754", labs: 4, credits: 4, track: "beginner" },
  { courseTemplateId: "728", title: "Implement Event-Driven Messaging and Automation Workflows", url: "https://www.skills.google/course_templates/728", labs: 3, credits: 2, track: "beginner" },
  { courseTemplateId: "725", title: "Implement Cloud Storage and Data Protection Solutions", url: "https://www.skills.google/course_templates/725", labs: 4, credits: 4, track: "beginner" },
  { courseTemplateId: "705", title: "Create a Streaming Data Lake on Cloud Storage", url: "https://www.skills.google/course_templates/705", labs: 4, credits: 3, track: "beginner" },
  { courseTemplateId: "671", title: "Deploy and Manage Applications on Google App Engine", url: "https://www.skills.google/course_templates/671", labs: 4, credits: 4, track: "beginner" },
  { courseTemplateId: "700", title: "Implement Speech and Language Solutions with Pre-trained APIs", url: "https://www.skills.google/course_templates/700", labs: 4, credits: 4, track: "beginner" },
  { courseTemplateId: "756", title: "Using the Google Cloud Speech API", url: "https://www.skills.google/course_templates/756", labs: 4, credits: 4, track: "beginner" },
  { courseTemplateId: "634", title: "Analyze Speech and Language with Google APIs", url: "https://www.skills.google/course_templates/634", labs: 4, credits: 8, track: "beginner" },
  { courseTemplateId: "658", title: "Store, Process, and Manage Data on Google Cloud - Console", url: "https://www.skills.google/course_templates/658", labs: 4, credits: 3, track: "beginner" },
  { courseTemplateId: "659", title: "Store, Process, and Manage Data on Google Cloud - Command Line", url: "https://www.skills.google/course_templates/659", labs: 4, credits: 3, track: "beginner" },
  { courseTemplateId: "629", title: "Migrate MySQL Data to Cloud SQL Using Database Migration Service", url: "https://www.skills.google/course_templates/629", labs: 5, credits: 5, track: "beginner" },
  { courseTemplateId: "750", title: "Get Started with Sensitive Data Protection", url: "https://www.skills.google/course_templates/750", labs: 4, credits: 4, track: "beginner" },
  { courseTemplateId: "633", title: "Analyze Images with the Cloud Vision API", url: "https://www.skills.google/course_templates/633", labs: 4, credits: 12, track: "beginner" },
  { courseTemplateId: "727", title: "Build Event-Driven Applications with Eventarc", url: "https://www.skills.google/course_templates/727", labs: 4, credits: 3, track: "beginner" },
  { courseTemplateId: "702", title: "Configure Service Accounts and IAM Roles for Google Cloud", url: "https://www.skills.google/course_templates/702", labs: 4, credits: 4, track: "beginner" },
  { courseTemplateId: "1596", title: "Engineer AI Agents with Agent Development Kit (ADK)", url: "https://www.skills.google/course_templates/1596", labs: 1, credits: 5, track: "intermediate" },
  { courseTemplateId: "1076", title: "Build Real World AI Applications with Gemini and Imagen", url: "https://www.skills.google/course_templates/1076", labs: 4, credits: 0, track: "intermediate", aliases: ["Build Real-World AI Applications with Gemini and Imagen"] },
  { courseTemplateId: "1459", title: "Build a Smart Cloud Application with Vibe Coding and MCP", url: "https://www.skills.google/course_templates/1459", labs: 4, credits: 4, track: "intermediate" },
  { courseTemplateId: "676", title: "Implement Cloud Collaboration and Productivity Workflows", url: "https://www.skills.google/course_templates/676", labs: 7, credits: 0, track: "intermediate" },
  { courseTemplateId: "632", title: "Analyze BigQuery Data in Connected Sheets", url: "https://www.skills.google/course_templates/632", labs: 4, credits: 0, track: "intermediate" },
  { courseTemplateId: "752", title: "Streaming Analytics into BigQuery", url: "https://www.skills.google/course_templates/752", labs: 4, credits: 2, track: "intermediate" },
  { courseTemplateId: "704", title: "Create a Secure Data Lake on Cloud Storage", url: "https://www.skills.google/course_templates/704", labs: 4, credits: 4, track: "intermediate" },
  { courseTemplateId: "751", title: "Secure Lakehouse Data", url: "https://www.skills.google/course_templates/751", labs: 4, credits: 4, track: "intermediate" },
  { courseTemplateId: "753", title: "Enrich Metadata and Discovery of Lakehouse Data", url: "https://www.skills.google/course_templates/753", labs: 4, credits: 3, track: "intermediate" },
  { courseTemplateId: "653", title: "Monitor and Manage Google Cloud Resources", url: "https://www.skills.google/course_templates/653", labs: 4, credits: 4, track: "intermediate" },
  { courseTemplateId: "749", title: "Monitor and Log with Google Cloud Observability", url: "https://www.skills.google/course_templates/749", labs: 5, credits: 9, track: "intermediate" },
  { courseTemplateId: "641", title: "Set Up a Google Cloud Network", url: "https://www.skills.google/course_templates/641", labs: 4, credits: 8, track: "intermediate" },
  { courseTemplateId: "737", title: "Integrate BigQuery Data and Google Workspace using Apps Script", url: "https://www.skills.google/course_templates/737", labs: 4, credits: 2, track: "intermediate" },
  { courseTemplateId: "627", title: "Engineer Data for Predictive Modeling with BigQuery ML", url: "https://www.skills.google/course_templates/627", labs: 4, credits: 15, track: "intermediate" },
  { courseTemplateId: "716", title: "Implement DevOps Workflows in Google Cloud", url: "https://www.skills.google/course_templates/716", labs: 4, credits: 16, track: "intermediate" },
  { courseTemplateId: "626", title: "Create ML Models with BigQuery ML", url: "https://www.skills.google/course_templates/626", labs: 5, credits: 11, track: "intermediate" },
  { courseTemplateId: "638", title: "Build a Website on Google Cloud", url: "https://www.skills.google/course_templates/638", labs: 5, credits: 13, track: "intermediate" },
  { courseTemplateId: "959", title: "Explore Generative AI in Agent Platform", url: "https://www.skills.google/course_templates/959", labs: 4, credits: 16, track: "advanced", aliases: ["Explore Generative AI with the Vertex AI Agent Builder", "Explore Generative AI in Vertex AI"] },
  { courseTemplateId: "648", title: "Implementing Cloud Load Balancing for Compute Engine", url: "https://www.skills.google/course_templates/648", labs: 4, credits: 4, track: "advanced", aliases: ["Implement Cloud Load Balancing for Compute Engine", "Implementing Cloud Load Balancing on Compute Engine"] },
  { courseTemplateId: "976", title: "Prompt Design in Agent Platform", url: "https://www.skills.google/course_templates/976", labs: 4, credits: 4, track: "advanced", aliases: ["Prompt Design in Vertex AI"] },
  { courseTemplateId: "981", title: "Inspect Rich Documents with Gemini Multimodality and Multimodal RAG", url: "https://www.skills.google/course_templates/981", labs: 4, credits: 20, track: "advanced", aliases: ["Inspect Rich Documents with Gemini Multimodality and RAG"] },
  { courseTemplateId: "978", title: "Develop GenAI Apps with Gemini and Streamlit", url: "https://www.skills.google/course_templates/978", labs: 5, credits: 20, track: "advanced", aliases: ["Develop Generative AI Apps with Gemini and Streamlit"] },
  { courseTemplateId: "637", title: "Set Up an App Dev Environment on Google Cloud", url: "https://www.skills.google/course_templates/637", labs: 10, credits: 8, track: "advanced" },
  { courseTemplateId: "625", title: "Develop Your Google Cloud Network", url: "https://www.skills.google/course_templates/625", labs: 6, credits: 18, track: "advanced" },
  { courseTemplateId: "654", title: "Build a Secure Google Cloud Network", url: "https://www.skills.google/course_templates/654", labs: 6, credits: 30, track: "advanced" },
  { courseTemplateId: "663", title: "Deploy Kubernetes Applications on Google Cloud", url: "https://www.skills.google/course_templates/663", labs: 4, credits: 12, track: "advanced" },
  { courseTemplateId: "623", title: "Derive Insights from BigQuery Data", url: "https://www.skills.google/course_templates/623", labs: 7, credits: 6, track: "advanced" },
  { courseTemplateId: "639", title: "Build LookML Objects in Looker", url: "https://www.skills.google/course_templates/639", labs: 5, credits: 0, track: "advanced" },
  { courseTemplateId: "651", title: "Manage Data Models in Looker", url: "https://www.skills.google/course_templates/651", labs: 6, credits: 0, track: "advanced" },
  { courseTemplateId: "628", title: "Prepare Data for Looker Dashboards and Reports", url: "https://www.skills.google/course_templates/628", labs: 5, credits: 0, track: "advanced" },
  { courseTemplateId: "649", title: "Develop Serverless Apps with Firebase", url: "https://www.skills.google/course_templates/649", labs: 4, credits: 16, track: "advanced" },
  { courseTemplateId: "640", title: "Cloud Architecture: Design, Implement, and Manage", url: "https://www.skills.google/course_templates/640", labs: 6, credits: 32, track: "advanced" },
  { courseTemplateId: "1558", title: "Build Global and Regional Load Balancing Solutions", url: "https://www.skills.google/course_templates/1558", labs: 4, credits: 20, track: "advanced" },
  { courseTemplateId: "1453", title: "Google DeepMind: Train A Small Language Model", url: "https://www.skills.google/course_templates/1453", labs: 1, credits: 5, track: "advanced", aliases: ["Google DeepMind: Train a Small Language Model"] },
]

/** Normalize course names so punctuation and harmless title formatting do not affect matching. */
export function normalizeFacilitatorBadgeTitle(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

/** Extract a Google Skills course template identifier from a catalog-style URL. */
export function getCourseTemplateId(value?: string): string | null {
  if (!value) return null
  return value.match(/\/course_templates\/(\d+)/i)?.[1] ?? null
}

/**
 * Compare earned public-profile badges with the 51-badge Facilitator syllabus.
 * Course template IDs win when available; exact normalized titles and explicit
 * rename aliases are used as the safe fallback.
 */
export function evaluateFacilitatorSyllabus(
  earnedBadges: readonly ArcadeBadge[] = [],
): FacilitatorBadgeStatus[] {
  const earned = earnedBadges.filter(
    (badge): badge is ArcadeBadge => Boolean(badge?.title?.trim()),
  )
  const usedEarnedIndexes = new Set<number>()

  return FACILITATOR_SYLLABUS_2026.map((syllabusBadge) => {
    const courseMatchIndex = earned.findIndex((badge, index) => {
      if (usedEarnedIndexes.has(index)) return false
      return getCourseTemplateId(badge.badgeURL) === syllabusBadge.courseTemplateId
    })

    const acceptedTitles = new Set(
      [syllabusBadge.title, ...(syllabusBadge.aliases ?? [])].map(
        normalizeFacilitatorBadgeTitle,
      ),
    )
    const titleMatchIndex = earned.findIndex((badge, index) => {
      if (usedEarnedIndexes.has(index)) return false
      return acceptedTitles.has(normalizeFacilitatorBadgeTitle(badge.title))
    })

    const matchIndex = courseMatchIndex >= 0 ? courseMatchIndex : titleMatchIndex
    if (matchIndex < 0) {
      return { ...syllabusBadge, completed: false }
    }

    usedEarnedIndexes.add(matchIndex)
    return {
      ...syllabusBadge,
      completed: true,
      earnedBadge: earned[matchIndex],
      matchReason: courseMatchIndex >= 0 ? "course-id" : "title",
    }
  })
}
