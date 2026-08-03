import { ImageResponse } from "next/og"

export const SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const

export const ARCADE_SEASON = "2026"

function GamepadMark() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: 31,
        height: 22,
        border: "4px solid #ffd43b",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 5,
          top: 5,
          display: "flex",
          width: 12,
          height: 4,
          backgroundColor: "#ffd43b",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 9,
          top: 1,
          display: "flex",
          width: 4,
          height: 12,
          backgroundColor: "#ffd43b",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 5,
          top: 4,
          display: "flex",
          width: 5,
          height: 5,
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
        width: 20,
        height: 20,
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

/** Creates a social preview that mirrors the current landing-page hero. */
export function createSocialImage() {
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
          fontFamily: "Arial, Helvetica, sans-serif",
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
            height: 82,
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
                width: 45,
                height: 45,
                marginRight: 11,
                border: "1px solid rgba(255,212,59,0.34)",
                borderRadius: 10,
                backgroundColor: "#1c2354",
              }}
            >
              <GamepadMark />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 14,
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: 0.5,
              }}
            >
              <span style={{ color: "#ffd43b" }}>ARCADE</span>
              <span>POINTS</span>
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: 10,
                padding: "5px 8px",
                borderRadius: 6,
                backgroundColor: "#8b5cf6",
                fontSize: 10,
                fontWeight: 900,
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
              fontSize: 15,
              fontWeight: 700,
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
                padding: "10px 14px",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: 9,
                backgroundColor: "#0b152a",
                color: "#dbe6fa",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Chrome
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: 9,
                padding: "10px 14px",
                border: "1px solid rgba(255,145,0,0.28)",
                borderRadius: 9,
                backgroundColor: "#26170c",
                color: "#f7e6d2",
                fontSize: 13,
                fontWeight: 700,
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
            padding: "38px 58px 42px",
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
                color: "#7dd3fc",
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: 1.2,
              }}
            >
              ✦ GOOGLE CLOUD SKILLS BOOST ARCADE {ARCADE_SEASON}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 55,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: -2.5,
              }}
            >
              CHECK YOUR
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 4,
                color: "#a86cff",
                fontSize: 57,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: -2.8,
              }}
            >
              ARCADE SCORE
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 22,
                color: "#a8b5cc",
                fontSize: 18,
                lineHeight: 1.5,
              }}
            >
              {`Analyze your public profile, inspect earned badges and check which ${ARCADE_SEASON} reward tier your score qualifies for.`}
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
                  padding: "8px 11px",
                  border: "1px solid rgba(47,209,125,0.23)",
                  borderRadius: 7,
                  backgroundColor: "#082329",
                  color: "#c7d4e8",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ✓ Public profile data only
              </div>
              <div
                style={{
                  display: "flex",
                  marginLeft: 9,
                  padding: "8px 11px",
                  border: "1px solid rgba(47,209,125,0.23)",
                  borderRadius: 7,
                  backgroundColor: "#082329",
                  color: "#c7d4e8",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ✓ No Google sign-in required
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 560,
              padding: 25,
              border: "1px solid rgba(124,92,246,0.42)",
              borderRadius: 15,
              backgroundColor: "#0a1328",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#eef4ff",
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: 0.7,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 27,
                  height: 27,
                  marginRight: 11,
                  border: "1px solid rgba(139,92,246,0.72)",
                  borderRadius: 999,
                  color: "#d8c9ff",
                  fontSize: 12,
                }}
              >
                1
              </div>
              PASTE YOUR PUBLIC PROFILE URL
            </div>

            <div style={{ display: "flex", marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  height: 58,
                  alignItems: "center",
                  padding: "0 16px",
                  border: "1px solid rgba(148,163,184,0.23)",
                  borderRadius: 9,
                  backgroundColor: "#040b1b",
                }}
              >
                <SearchMark />
                <div
                  style={{
                    display: "flex",
                    marginLeft: 15,
                    color: "#5e6c87",
                    fontSize: 14,
                  }}
                >
                  https://www.skills.google/my_account/profile/...
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  height: 58,
                  marginLeft: 11,
                  padding: "0 22px",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(192,84,255,0.58)",
                  borderRadius: 9,
                  backgroundColor: "#713be0",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                ANALYZE PROFILE
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 14,
                color: "#8fa1bd",
                fontSize: 12,
              }}
            >
              <span>ⓘ How to find your public profile</span>
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
                  fontSize: 19,
                }}
              >
                ✦
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    color: "#eef4ff",
                    fontSize: 14,
                    fontWeight: 800,
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
                  fontWeight: 800,
                }}
              >
                CHROME
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    SOCIAL_IMAGE_SIZE,
  )
}
