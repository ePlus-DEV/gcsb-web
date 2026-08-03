import { ImageResponse } from "next/og"

const imageSize = {
  width: 1200,
  height: 630,
}

/** Creates the shared Open Graph and X/Twitter social preview image. */
export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
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
            right: -110,
            top: -130,
            display: "flex",
            width: 430,
            height: 430,
            borderRadius: 999,
            backgroundColor: "#432a89",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -140,
            bottom: -220,
            display: "flex",
            width: 520,
            height: 520,
            borderRadius: 999,
            backgroundColor: "#123d82",
            opacity: 0.32,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 32,
            right: 32,
            top: 32,
            bottom: 32,
            display: "flex",
            border: "1px solid rgba(139,92,246,0.28)",
            borderRadius: 26,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 62,
            top: 52,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              width: 58,
              height: 58,
              marginRight: 16,
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,212,59,0.46)",
              borderRadius: 14,
              backgroundColor: "#1c2354",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                width: 32,
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
                  top: 5,
                  display: "flex",
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: "#22d3ee",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 23,
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              <span style={{ color: "#ffd43b" }}>ARCADE</span>
              <span style={{ marginLeft: 8 }}>POINTS</span>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 4,
                color: "#93a4bf",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.6,
              }}
            >
              BY ePlus.DEV
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginLeft: 18,
              padding: "7px 11px",
              borderRadius: 8,
              backgroundColor: "#8b5cf6",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            2026
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 64,
            top: 163,
            display: "flex",
            flexDirection: "column",
            width: 660,
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#7dd3fc",
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: 2.1,
            }}
          >
            GOOGLE CLOUD SKILLS BOOST ARCADE
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 25,
              fontSize: 65,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: -3,
            }}
          >
            CHECK YOUR
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 5,
              color: "#a86cff",
              fontSize: 68,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: -3.5,
            }}
          >
            ARCADE SCORE
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 25,
              color: "#a8b5cc",
              fontSize: 21,
              lineHeight: 1.45,
            }}
          >
            Calculate points, review badges and estimate your reward tier from a public Google Skills profile.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 24,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 11,
                height: 11,
                marginRight: 9,
                borderRadius: 999,
                backgroundColor: "#2fd17d",
              }}
            />
            <div
              style={{
                display: "flex",
                color: "#c7d4e8",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Public profile only | No Google sign-in required
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 66,
            top: 126,
            display: "flex",
            flexDirection: "column",
            width: 340,
            padding: 27,
            border: "1px solid rgba(139,92,246,0.48)",
            borderRadius: 22,
            backgroundColor: "#0a1328",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#93a4bf",
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: 1.4,
              }}
            >
              ARCADE DASHBOARD
            </div>
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                borderRadius: 999,
                backgroundColor: "#2fd17d",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              marginTop: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 72,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              175
            </div>
            <div
              style={{
                display: "flex",
                marginBottom: 9,
                marginLeft: 10,
                color: "#7dd3fc",
                fontSize: 17,
                fontWeight: 800,
              }}
            >
              PTS
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 18,
              width: "100%",
              height: 10,
              overflow: "hidden",
              borderRadius: 999,
              backgroundColor: "#16213b",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "76%",
                height: "100%",
                borderRadius: 999,
                backgroundColor: "#8b5cf6",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 23,
            }}
          >
            {[
              ["GAME", "60", "#c054ff"],
              ["SKILL", "95", "#2f80ff"],
              ["BONUS", "20", "#ff9f1c"],
            ].map(([label, value, color]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: 86,
                  padding: "13px 8px",
                  border: "1px solid rgba(148,163,184,0.18)",
                  borderRadius: 12,
                  backgroundColor: "#0d1931",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    color,
                    fontSize: 24,
                    fontWeight: 900,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 5,
                    color: "#93a4bf",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 24,
              padding: "13px 16px",
              borderRadius: 11,
              backgroundColor: "#713be0",
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: 0.8,
            }}
          >
            TRACK BADGES & REWARDS
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 64,
            bottom: 48,
            display: "flex",
            color: "#7f91ae",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          arcade.eplus.dev
        </div>
      </div>
    ),
    imageSize,
  )
}
