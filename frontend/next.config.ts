import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Не standalone - Render не корректно обрабатывает standalone server
  output: undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
