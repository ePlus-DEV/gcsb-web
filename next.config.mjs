import path from "node:path"

/** @type {import('next').NextConfig} */
// Keep static export paths configurable for production and per-PR previews.
const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true"
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

const nextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        basePath,
      }
    : {}),
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
