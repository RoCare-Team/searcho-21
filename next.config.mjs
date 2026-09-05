/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the tracing root: an unrelated lockfile sits in the parent directory.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "www.searcho21.com" },
      { protocol: "https", hostname: "searcho21.com" },
    ],
  },
};

export default nextConfig;
