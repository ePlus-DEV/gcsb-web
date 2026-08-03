import { ImageResponse } from "next/og"

export const SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const

export const ARCADE_SEASON = "2026"

const FONT_CDN = "https://cdn.jsdelivr.net/fontsource/fonts"

async function fetchFont(path: string): Promise<ArrayBuffer> {
  const response = await fetch(`${FONT_CDN}/${path}`)

  if (!response.ok) {
    throw new Error(`Unable to load social image font: ${path}`)
  }

  return response.arrayBuffer()
}

const socialFontData = Promise.all([
  fetchFont("inter@5.3.0/latin-400-normal.woff"),
  fetchFont("inter@5.3.0/latin-600-normal.woff"),
  fetchFont("inter@5.3.0/latin-700-normal.woff"),
  fetchFont("inter@5.3.0/latin-800-normal.woff"),
  fetchFont("press-start-2p@5.3.0/latin-400-normal.woff"),
])

function GamepadMark() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: 27,
        height: 19,
        border: "3px solid #ffd43b",
        borderRadius: 7,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 4,
          top: 5,
          display: "flex",
          width: 10,
          height: 3,
          backgroundColor: "#ffd43b",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 7,
          top: 2,
          display: "flex",
          width: 3,
          height: 10,
          backgroundColor: "#ffd43b",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 4,
          top: 4,
          display: "flex",
          width: 4,
          height: 4,
          borderRadius: 999,
          backgroundColor: "#22d3ee",
        }}
      />
    </div>
  )
}

function SearchMark() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: 18,
        height: 18,
        border: "3px solid #7f8da9",
        borderRadius: 999,
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -7,
          bottom: -5,
          display: "flex",
          width: 9,
          height: 3,
          borderRadius: 999,
          backgroundColor: "#7f8da9",
          transform: "rotate(45deg)",
        }}
      />
    </div>
  )
}

function SparkleMark({ size = 14 }: { size?: number }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: size,
        height: size,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: size / 2 - 1,
          top: 0,
          display: "flex",
          width: 2,
          height: size,
          borderRadius: 999,
          backgroundColor: "#7dd3fc",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: size / 2 - 1,
          display: "flex",
          width: size,
          height: 2,
          borderRadius: 999,
          backgroundColor: "#7dd3fc",
        }}
      />
    </div>
  )
}

function CheckMark() {
  return (
    <div
      style={{
        display: "flex",
        width: 13,
        height: 8,
        marginRight: 8,
        borderLeft: "3px solid #2fd17d",
        borderBottom: "3px solid #2fd17d",
        transform: "rotate(-45deg)",
      }}
    />
  )
}

function InfoMark() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 15,
        height: 15,
        marginRight: 6,
        border: "1px solid #8fa1bd",
        borderRadius: 999,
        color: "#8fa1bd",
        fontFamily: "Inter",
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      i
    </div>
  )
}

/** Creates a social preview that mirrors the current landing-page hero. */
export async function createSocialImage() {
  const [inter400, inter600, inter700, inter800, pressStart400] =
    await socialFontData

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: "#050918",
          color: "#f7f9ff",
          fontFamily: "Inter",
          fontWeight: 400,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -170,
            display: "flex",
            width: 470,
            height: 470,
            borderRadius: 999,
            backgroundColor: "#30206f",
            opacity: 0.46,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -180,
            bottom: -260,
            display: "flex",
            width: 610,
            height: 610,
            borderRadius: 999,
            backgroundColor: "#0c397b",
            opacity: 0.28,
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            height: 72,
            padding: "0 54px",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(148,163,184,0.16)",
            backgroundColor: "rgba(5,9,24,0.92)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                marginRight: 9,
                border: "1px solid rgba(255,212,59,0.32)",
                borderRadius: 9,
                backgroundColor: "#1b2050",
              }}
            >
              <GamepadMark />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontFamily: "Press Start 2P",
                fontSize: 12,
                fontWeight: 400,
                lineHeight: 1.25,
                letterSpacing: -0.5,
              }}
            >
              <span style={{ color: "#ffd43b" }}>ARCADE</span>
              <span style={{ color: "#ffffff" }}>POINTS</span>
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: 9,
                padding: "4px 7px",
                borderRadius: 5,
                backgroundColor: "#8b5cf6",
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              PRO
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#c1cbe0",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span style={{ color: "#ffffff" }}>Calculator</span>
            <span style={{ marginLeft: 28 }}>Tiers</span>
            <span style={{ marginLeft: 28 }}>Badges</span>
            <span style={{ marginLeft: 28 }}>Extension</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 13px",
                border: "1px solid rgba(148,163,184,0.17)",
                borderRadius: 9,
                backgroundColor: "#0b152a",
                color: "#dbe6fa",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Chrome
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: 10,
                padding: "10px 13px",
                border: "1px solid rgba(255,145,0,0.28)",
                borderRadius: 9,
                backgroundColor: "#26170c",
                color: "#f7e6d2",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Firefox
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flex: 1,
            alignItems: "center",
            padding: "42px 58px 38px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 470,
              marginRight: 52,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#7dd3fc",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              <SparkleMark size={14} />
              <span style={{ marginLeft: 8 }}>
                GOOGLE CLOUD SKILLS BOOST ARCADE {ARCADE_SEASON}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 20,
                fontFamily: "Press Start 2P",
                fontSize: 48,
                fontWeight: 400,
                lineHeight: 1.18,
                letterSpacing: -3.1,
              }}
            >
              <span>CHECK YOUR</span>
              <span style={{ marginTop: 8, color: "#a86cff" }}>
                ARCADE SCORE
              </span>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 22,
                color: "#a8b5cc",
                fontSize: 16,
                lineHeight: 1.7,
              }}
            >
              Analyze your public profile, inspect earned badges and check which {ARCADE_SEASON} reward tier your score qualifies for.
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 20,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 11px",
                  border: "1px solid rgba(47,209,125,0.2)",
                  borderRadius: 7,
                  backgroundColor: "#082329",
                  color: "#c7d4e8",
                  fontSize: 12,
                }}
              >
                <CheckMark />
                Public profile data only
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: 10,
                  padding: "8px 11px",
                  border: "1px solid rgba(47,209,125,0.2)",
                  borderRadius: 7,
                  backgroundColor: "#082329",
                  color: "#c7d4e8",
                  fontSize: 12,
                }}
              >
                <CheckMark />
                No Google sign-in required
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 560,
              padding: 23,
              border: "1px solid rgba(124,92,246,0.42)",
              borderRadius: 14,
              backgroundColor: "#0a1328",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#eef4ff",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.55,
                textTransform: "uppercase",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 23,
                  height: 23,
                  marginRight: 10,
                  border: "1px solid rgba(139,92,246,0.68)",
                  borderRadius: 999,
                  color: "#d8c9ff",
                  fontSize: 11,
                }}
              >
                1
              </div>
              PASTE YOUR PUBLIC PROFILE URL
            </div>

            <div style={{ display: "flex", marginTop: 15 }}>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  height: 54,
                  alignItems: "center",
                  padding: "0 13px",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: 9,
                  backgroundColor: "#040b1b",
                }}
              >
                <SearchMark />
                <div
                  style={{
                    display: "flex",
                    marginLeft: 14,
                    color: "#5e6c87",
                    fontSize: 13,
                  }}
                >
                  https://www.skills.google/public_profiles/...
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  height: 54,
                  marginLeft: 11,
                  padding: "0 21px",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(192,84,255,0.58)",
                  borderRadius: 9,
                  backgroundColor: "#713be0",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                ANALYZE PROFILE
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 12,
                color: "#8fa1bd",
                fontSize: 12,
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <InfoMark />
                How to find your public profile
              </span>
              <span>arcade.eplus.dev</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 25,
                padding: "14px 16px",
                border: "1px solid rgba(139,92,246,0.28)",
                borderRadius: 11,
                backgroundColor: "#0d1931",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38,
                  height: 38,
                  marginRight: 13,
                  borderRadius: 9,
                  backgroundColor: "#39236f",
                }}
              >
                <SparkleMark size={16} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    color: "#eef4ff",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Install the browser extension
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 4,
                    color: "#93a4bf",
                    fontSize: 12,
                  }}
                >
                  Get solution suggestions while completing labs.
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  marginLeft: "auto",
                  padding: "9px 12px",
                  border: "1px solid rgba(139,92,246,0.36)",
                  borderRadius: 8,
                  color: "#eee8ff",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                CHROME
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...SOCIAL_IMAGE_SIZE,
      fonts: [
        { name: "Inter", data: inter400, weight: 400, style: "normal" },
        { name: "Inter", data: inter600, weight: 600, style: "normal" },
        { name: "Inter", data: inter700, weight: 700, style: "normal" },
        { name: "Inter", data: inter800, weight: 800, style: "normal" },
        {
          name: "Press Start 2P",
          data: pressStart400,
          weight: 400,
          style: "normal",
        },
      ],
    },
  )
}
