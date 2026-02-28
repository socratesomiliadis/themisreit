import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@workspace/ui"],
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
