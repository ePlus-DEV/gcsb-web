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
        border: "3px solid #d5dceb",
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
          backgroundColor: "#d5dceb",
          transform: "rotate(45deg)",
        }}
      />
    </div>
  )
}

function SparkleMark({ color = "#7dd3fc" }: { color?: string }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: 15,
        height: 15,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 6,
          top: 0,
          display: "flex",
          width: 3,
          height: 15,
          borderRadius: 999,
          backgroundColor: color,
          transform: "rotate(45deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 6,
          top: 0,
          display: "flex",
          width: 3,
          height: 15,
          borderRadius: 999,
          backgroundColor: color,
          transform: "rotate(-45deg)",
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
        width: 12,
        height: 7,
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
        width: 14,
        height: 14,
        marginRight: 6,
        border: "1px solid #8fa1bd",
        borderRadius: 999,
        color: "#8fa1bd",
        fontSize: 9,
        fontWeight: 700,
      }}
    >
      ?
    </div>
  )
}

function TrophyMark() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: 16,
        height: 16,
        marginRight: 9,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 4,
          top: 1,
          display: "flex",
          width: 8,
          height: 8,
          border: "2px solid #ffffff",
          borderRadius: "2px 2px 5px 5px",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 7,
          top: 9,
          display: "flex",
          width: 2,
          height: 4,
          backgroundColor: "#ffffff",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 4,
          bottom: 0,
          display: "flex",
          width: 8,
          height: 2,
          borderRadius: 999,
          backgroundColor: "#ffffff",
        }}
      />
    </div>
  )
}

function StoreMark({ firefox = false }: { firefox?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 17,
        height: 17,
        marginRight: 7,
        border: `2px solid ${firefox ? "#ff9f1c" : "#d8c9ff"}`,
        borderRadius: 999,
        color: firefox ? "#ff9f1c" : "#d8c9ff",
        fontSize: 8,
        fontWeight: 800,
      }}
    >
      {firefox ? "F" : "C"}
    </div>
  )
}

function StarDot({ left, top, color = "#ffffff" }: { left: number; top: number; color?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        display: "flex",
        width: 3,
        height: 3,
        borderRadius: 999,
        backgroundColor: color,
        opacity: 0.75,
      }}
    />
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
            right: -130,
            top: 25,
            display: "flex",
            width: 430,
            height: 430,
            borderRadius: 999,
            backgroundColor: "#211951",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -185,
            bottom: -240,
            display: "flex",
            width: 570,
            height: 570,
            borderRadius: 999,
            backgroundColor: "#0b2d61",
            opacity: 0.7,
          }}
        />
        <StarDot left={54} top={206} />
        <StarDot left={266} top={188} color="#22d3ee" />
        <StarDot left={458} top={222} />
        <StarDot left={640} top={196} color="#22d3ee" />
        <StarDot left={878} top={216} />
        <StarDot left={1080} top={187} color="#c054ff" />
        <StarDot left={76} top={404} color="#22d3ee" />
        <StarDot left={470} top={430} color="#c054ff" />
        <StarDot left={922} top={416} color="#22d3ee" />

        <div
          style={{
            position: "relative",
            display: "flex",
            height: 72,
            padding: "0 48px",
            alignItems: "center",
            borderBottom: "1px solid rgba(148,163,184,0.14)",
            backgroundColor: "rgba(5,9,24,0.95)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", width: 190 }}>
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
                fontSize: 11,
                fontWeight: 400,
                lineHeight: 1.25,
                letterSpacing: -0.45,
              }}
            >
              <span style={{ color: "#ffd43b" }}>ARCADE</span>
              <span>POINTS</span>
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: 8,
                padding: "4px 7px",
                borderRadius: 5,
                backgroundColor: "#8b5cf6",
                fontSize: 9,
                fontWeight: 800,
              }}
            >
              PRO
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              color: "#c1cbe0",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <span style={{ color: "#ffffff" }}>Calculator</span>
            <span style={{ marginLeft: 19 }}>Tiers</span>
            <span style={{ marginLeft: 19 }}>Badges</span>
            <span style={{ marginLeft: 19 }}>Extension</span>
            <span style={{ marginLeft: 19 }}>About</span>
            <span style={{ marginLeft: 19 }}>Guide</span>
            <span style={{ marginLeft: 19 }}>Privacy</span>
            <span style={{ marginLeft: 19 }}>Terms</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: 285 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "9px 11px",
                border: "1px solid rgba(148,163,184,0.17)",
                borderRadius: 9,
                backgroundColor: "#0b152a",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              EN - English
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: 8,
                padding: "9px 11px",
                border: "1px solid rgba(148,163,184,0.17)",
                borderRadius: 9,
                backgroundColor: "#0b152a",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Chrome
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: 8,
                padding: "9px 11px",
                border: "1px solid rgba(255,145,0,0.28)",
                borderRadius: 9,
                backgroundColor: "#26170c",
                fontSize: 11,
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
            padding: "38px 54px 22px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 470,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#7dd3fc",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.6,
              }}
            >
              <SparkleMark />
              <span style={{ marginLeft: 8 }}>
                GOOGLE CLOUD SKILLS BOOST ARCADE {ARCADE_SEASON}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 18,
                fontFamily: "Press Start 2P",
                fontSize: 46,
                fontWeight: 400,
                lineHeight: 1.08,
                letterSpacing: -2.9,
              }}
            >
              <span>CHECK</span>
              <span style={{ marginTop: 4 }}>YOUR</span>
              <span style={{ marginTop: 4, color: "#8b5cf6" }}>ARCADE</span>
              <span style={{ marginTop: 4, color: "#2f80ff" }}>SCORE</span>
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
              Analyze your public profile, inspect earned badges and check which {ARCADE_SEASON} reward tier your score qualifies for.
            </div>

            <div style={{ display: "flex", marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 10px",
                  border: "1px solid rgba(47,209,125,0.22)",
                  borderRadius: 7,
                  backgroundColor: "#082329",
                  color: "#c7d4e8",
                  fontSize: 11,
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
                  padding: "7px 10px",
                  border: "1px solid rgba(47,209,125,0.22)",
                  borderRadius: 7,
                  backgroundColor: "#082329",
                  color: "#c7d4e8",
                  fontSize: 11,
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
              alignItems: "center",
              width: 570,
              marginLeft: 52,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                padding: 23,
                border: "1px solid rgba(124,92,246,0.42)",
                borderRadius: 14,
                backgroundColor: "#09152d",
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
                    padding: "0 14px",
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
                    https://www.skills.google/my_account/profile/...
                  </div>
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
                    backgroundColor: "#7c3aed",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  <TrophyMark />
                  Analyze profile
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 12,
                  color: "#8fa1bd",
                  fontSize: 11,
                }}
              >
                <InfoMark />
                How to find your public profile
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            height: 64,
            margin: "0 54px 24px",
            padding: "0 16px",
            alignItems: "center",
            border: "1px solid rgba(124,92,246,0.34)",
            borderRadius: 12,
            backgroundColor: "#0a1328",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              marginRight: 14,
              border: "1px solid rgba(139,92,246,0.38)",
              borderRadius: 10,
              backgroundColor: "#39236f",
            }}
          >
            <SparkleMark color="#d8c9ff" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              Install the extension for your browser
            </span>
            <span style={{ marginTop: 3, color: "#93a4bf", fontSize: 11 }}>
              Automatic Arcade point tracking on Chrome and Firefox
            </span>
          </div>
          <div style={{ display: "flex", marginLeft: "auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "9px 12px",
                border: "1px solid rgba(139,92,246,0.36)",
                borderRadius: 8,
                color: "#eee8ff",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <StoreMark />
              Chrome
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: 9,
                padding: "9px 12px",
                border: "1px solid rgba(255,145,0,0.34)",
                borderRadius: 8,
                color: "#f7e6d2",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <StoreMark firefox />
              Firefox
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
