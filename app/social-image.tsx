import { ImageResponse } from "next/og"

export const SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const

/** Arcade runs as an annual season, so static builds use the build year's season. */
export const ARCADE_SEASON = String(new Date().getUTCFullYear())

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
        width: 28,
        height: 20,
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
          width: 8,
          height: 3,
          borderRadius: 999,
          backgroundColor: "#7f8da9",
          transform: "rotate(45deg)",
        }}
      />
    </div>
  )
}

/** Creates a social preview that mirrors the current landing-page hero. */
export async function createSocialImage() {
  const [inter400, inter600, inter700, inter800, pressStart] = await socialFontData

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
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -130,
            top: -180,
            display: "flex",
            width: 500,
            height: 500,
            borderRadius: 999,
            backgroundColor: "#30206f",
            opacity: 0.46,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -190,
            bottom: -270,
            display: "flex",
            width: 620,
            height: 620,
            borderRadius: 999,
            backgroundColor: "#0c397b",
            opacity: 0.27,
          }}
        />

        <header
          style={{
            position: "relative",
            display: "flex",
            height: 72,
            padding: "0 48px",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(148,163,184,0.14)",
            backgroundColor: "rgba(5,9,24,0.94)",
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
                backgroundColor: "#1c2354",
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
                lineHeight: 1.25,
                letterSpacing: -0.5,
              }}
            >
              <span style={{ color: "#ffd43b" }}>ARCADE</span>
              <span>POINTS</span>
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

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              color: "#c1cbe0",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span style={{ color: "#ffffff" }}>Calculator</span>
            <span style={{ marginLeft: 27 }}>Tiers</span>
            <span style={{ marginLeft: 27 }}>Badges</span>
            <span style={{ marginLeft: 27 }}>Extension</span>
          </nav>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                padding: "10px 13px",
                border: "1px solid rgba(148,163,184,0.18)",
                borderRadius: 9,
                backgroundColor: "#0b152a",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Chrome
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: 9,
                padding: "10px 13px",
                border: "1px solid rgba(255,145,0,0.28)",
                borderRadius: 9,
                backgroundColor: "#26170c",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Firefox
            </div>
          </div>
        </header>

        <main
          style={{
            position: "relative",
            display: "flex",
            flex: 1,
            padding: "38px 50px 24px",
          }}
        >
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              width: 440,
              marginRight: 50,
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#7dd3fc",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.8,
                textTransform: "uppercase",
              }}
            >
              GOOGLE CLOUD SKILLS BOOST ARCADE {ARCADE_SEASON}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 21,
                fontFamily: "Press Start 2P",
                fontSize: 41,
                lineHeight: 1.22,
                letterSpacing: -2.4,
              }}
            >
              <span>CHECK</span>
              <span>YOUR</span>
              <span style={{ color: "#a86cff" }}>ARCADE</span>
              <span style={{ color: "#7c5cff" }}>SCORE</span>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 20,
                color: "#a8b5cc",
                fontSize: 15,
                lineHeight: 1.65,
              }}
            >
              Analyze your public profile, inspect earned badges and check which reward tier your score qualifies for.
            </div>
            <div style={{ display: "flex", marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  padding: "8px 10px",
                  border: "1px solid rgba(47,209,125,0.2)",
                  borderRadius: 7,
                  backgroundColor: "#082329",
                  color: "#c7d4e8",
                  fontSize: 11,
                }}
              >
                Public profile data only
              </div>
              <div
                style={{
                  display: "flex",
                  marginLeft: 9,
                  padding: "8px 10px",
                  border: "1px solid rgba(47,209,125,0.2)",
                  borderRadius: 7,
                  backgroundColor: "#082329",
                  color: "#c7d4e8",
                  fontSize: 11,
                }}
              >
                No Google sign-in required
              </div>
            </div>
          </section>

          <section
            style={{
              display: "flex",
              flexDirection: "column",
              width: 610,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 24,
                border: "1px solid rgba(124,92,246,0.36)",
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
                  letterSpacing: 0.6,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    marginRight: 10,
                    border: "1px solid rgba(139,92,246,0.68)",
                    borderRadius: 999,
                    color: "#d8c9ff",
                  }}
                >
                  1
                </span>
                PASTE YOUR PUBLIC PROFILE URL
              </div>

              <div style={{ display: "flex", marginTop: 16 }}>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    height: 54,
                    alignItems: "center",
                    padding: "0 14px",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: 9,
                    backgroundColor: "#040b1b",
                  }}
                >
                  <SearchMark />
                  <span
                    style={{
                      display: "flex",
                      marginLeft: 14,
                      color: "#5e6c87",
                      fontSize: 13,
                    }}
                  >
                    https://www.skills.google/public_profiles/...
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    height: 54,
                    marginLeft: 11,
                    padding: "0 20px",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(192,84,255,0.58)",
                    borderRadius: 9,
                    backgroundColor: "#713be0",
                    fontSize: 12,
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
                  fontSize: 11,
                }}
              >
                <span>How to find your public profile</span>
                <span>arcade.eplus.dev</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 17,
                padding: "13px 16px",
                border: "1px solid rgba(124,92,246,0.3)",
                borderRadius: 12,
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
                  borderRadius: 10,
                  backgroundColor: "#39236f",
                  fontSize: 18,
                }}
              >
                +
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <strong style={{ display: "flex", fontSize: 13 }}>
                  Install the browser extension
                </strong>
                <span
                  style={{
                    display: "flex",
                    marginTop: 4,
                    color: "#93a4bf",
                    fontSize: 11,
                  }}
                >
                  Get solution suggestions while completing labs.
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  marginLeft: "auto",
                  padding: "9px 12px",
                  border: "1px solid rgba(139,92,246,0.36)",
                  borderRadius: 8,
                  color: "#eee8ff",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                CHROME
              </div>
            </div>
          </section>
        </main>
      </div>
    ),
    {
      ...SOCIAL_IMAGE_SIZE,
      fonts: [
        { name: "Inter", data: inter400, weight: 400 },
        { name: "Inter", data: inter600, weight: 600 },
        { name: "Inter", data: inter700, weight: 700 },
        { name: "Inter", data: inter800, weight: 800 },
        { name: "Press Start 2P", data: pressStart, weight: 400 },
      ],
    },
  )
}
