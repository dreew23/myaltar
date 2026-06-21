import path from "path"
import { fileURLToPath } from "url"
import { withSentryConfig } from "@sentry/nextjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin tracing to this app (avoids wrong root when a parent folder has another lockfile)
  outputFileTracingRoot: path.join(__dirname),
  env: {
    NEXT_PUBLIC_APP_BUILD:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? process.env.APP_BUILD ?? "local",
  },
  async headers() {
    return [
      {
        source: "/app/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ]
  },
  images: {
    unoptimized: true,
  },
  // When a parent folder has another lockfile, webpack can resolve from the wrong tree and miss deps.
  webpack: (config) => {
    const projectNodeModules = path.resolve(__dirname, "node_modules")
    const mods = config.resolve.modules ?? []
    if (!mods.includes(projectNodeModules)) {
      config.resolve.modules = [projectNodeModules, ...mods]
    }
    return config
  },
  // Next 16: eslint config in next.config no longer supported; run `pnpm lint` separately
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
})