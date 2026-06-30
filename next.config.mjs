/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  eslint: {
    // Allow production builds to complete even if lint warnings exist.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
