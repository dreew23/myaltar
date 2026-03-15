/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Next 16: eslint config in next.config no longer supported; run `pnpm lint` separately
}

export default nextConfig