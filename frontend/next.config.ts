import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.bing.net',
      },
    ],
    unoptimized: true, // For development - remove in production
  },
};

export default nextConfig;
