import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep soft-navigations snappy between dashboard pages
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
