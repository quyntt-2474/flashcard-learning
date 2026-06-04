import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker standalone deployment (frontend/Dockerfile Stage 3)
  output: "standalone",
};

export default nextConfig;
