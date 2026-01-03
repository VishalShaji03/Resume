import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // output: "export", // Disabled to allow API routes (Proxy)
  images: { unoptimized: true }
};

export default nextConfig;
