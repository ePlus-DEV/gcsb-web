import path from "node:path"

/** @type {import('next').NextConfig} */
// Keep static export paths configurable for production and per-PR previews.
const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true"
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

const publicRuntimeEnvKeys = [
  "WXT_FIREBASE_API_KEY",
  "WXT_FIREBASE_AUTH_DOMAIN",
  "WXT_FIREBASE_PROJECT_ID",
  "WXT_FIREBASE_STORAGE_BUCKET",
  "WXT_FIREBASE_MESSAGING_SENDER_ID",
  "WXT_FIREBASE_APP_ID",
  "WXT_FIREBASE_FETCH_INTERVAL_MS",
  "WXT_FIREBASE_FETCH_TIMEOUT_MS",
  "WXT_COUNTDOWN_DEADLINE_FACILITATOR",
  "WXT_COUNTDOWN_ENABLED_FACILITATOR",
  "WXT_COUNTDOWN_DEADLINE_ARCADE",
  "WXT_COUNTDOWN_ENABLED_ARCADE",
  "WXT_FORCE_REMOTE_CONFIG",
]

const publicRuntimeEnv = Object.fromEntries(
  publicRuntimeEnvKeys.map((key) => [key, process.env[key] ?? ""]),
)

const nextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        basePath,
      }
    : {}),
  env: publicRuntimeEnv,
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  webpack(config) {
    config.resolve.alias["lucide-react"] = path.resolve(
      process.cwd(),
      "components/fontawesome-icon-adapter.tsx",
    )

    return config
  },
}

export default nextConfig
