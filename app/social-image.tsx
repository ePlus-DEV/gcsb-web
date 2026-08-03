import { ImageResponse } from "next/og"

export const socialImageAlt =
  "Arcade Points — Google Cloud Arcade score calculator, badge tracker and reward tier dashboard"

export const socialImageSize = {
  width: 1200,
  height: 630,
}

export const socialImageContentType = "image/png"

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
          background:
            "radial-gradient(circle at 82% 16%, rgba(139,92,246,0.34), transparent 34%), radial-gradient(circle at 12% 78%, rgba(47,128,255,0.22), transparent 36%), #050918",
          color: "#f7f9ff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: 0.18,
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.22) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 48,
            left: 54,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 58,
              height: 58,
              marginRight: 16,
              border: "1px solid rgba(255,212,59,0.42)",
              borderRadius: 14,
              background: "linear-gradient(145deg, #152653, #281557)",
              boxShadow: "0 0 28px rgba(139,92,246,0.34)",
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
                  background: "#ffd43b",
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
                  background: "#ffd43b",
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
                  background: "#22d3ee",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 22,
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
                fontSize: 14,
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
              background: "#8b5cf6",
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
            left: 58,
            top: 164,
            display: "flex",
            flexDirection: "column",
            width: 690,
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#7dd3fc",
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: 2.2,
              textTransform: "uppercase",
            }}
          >
            GOOGLE CLOUD SKILLS BOOST ARCADE
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 25,
              fontSize: 66,
              fontWeight: 900,
              lineHeight: 1.03,
              letterSpacing: -3,
            }}
          >
            CHECK YOUR
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 2,
              color: "#a86cff",
              fontSize: 70,
              fontWeight: 900,
              lineHeight: 1.03,
              letterSpacing: -3.5,
              textShadow: "0 0 28px rgba(139,92,246,0.45)",
            }}
          >
            ARCADE SCORE
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              color: "#a8b5cc",
              fontSize: 22,
              lineHeight: 1.45,
            }}
          >
            Calculate points, review earned badges and estimate your reward tier from a public Google Skills profile.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 62,
            top: 132,
            display: "flex",
            flexDirection: "column",
            width: 330,
            padding: 26,
            border: "1px solid rgba(139,92,246,0.44)",
            borderRadius: 22,
            background: "linear-gradient(145deg, rgba(12,23,48,0.96), rgba(7,14,31,0.98))",
            boxShadow: "0 30px 80px rgba(0,0,0,0.36)",
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
                background: "#2fd17d",
                boxShadow: "0 0 16px rgba(47,209,125,0.8)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              marginTop: 27,
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
              marginTop: 17,
              width: "100%",
              height: 10,
              overflow: "hidden",
              borderRadius: 999,
              background: "#16213b",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "76%",
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #8b5cf6, #22d3ee)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 22,
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
                  width: 82,
                  padding: "13px 8px",
                  border: "1px solid rgba(148,163,184,0.16)",
                  borderRadius: 12,
                  background: "rgba(13,25,49,0.86)",
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
              marginTop: 22,
              padding: "12px 16px",
              borderRadius: 11,
              background: "linear-gradient(135deg, #6337e5, #9333ea)",
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
            left: 58,
            bottom: 42,
            display: "flex",
            alignItems: "center",
            color: "#93a4bf",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <span style={{ color: "#2fd17d", marginRight: 9 }}>●</span>
          Public profile data only · No Google sign-in required
        </div>
      </div>
    ),
    socialImageSize,
  )
}
