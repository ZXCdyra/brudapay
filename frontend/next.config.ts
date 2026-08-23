// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Standalone output для деплоя
  output: 'standalone',
  // API proxy (если нужно)
  async rewrites() {
    return [];
  },
};

export default nextConfig;
