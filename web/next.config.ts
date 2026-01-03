import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "export", // Static export - API handled by Bun backend
  images: { unoptimized: true },
  trailingSlash: true, // Better compatibility with static serving
};

export default nextConfig;
