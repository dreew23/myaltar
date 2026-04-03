import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin tracing to this app (avoids wrong root when a parent folder has another lockfile)
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    ignoreBuildErrors: true,
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

export default nextConfig