import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
  trailingSlash: true,
  // For Tauri, we build as SPA with fallback
  distDir: "out",
};

export default nextConfig;
