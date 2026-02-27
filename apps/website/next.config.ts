import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  reactCompiler: true,
  devIndicators: false,
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/fmdnjd8n/**",
      },
    ],
    qualities: [80, 100],
  },
  redirects: async () => {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "sanity.pensatori-irrazionali.com",
          },
        ],
        destination: "https://dev.pensatori-irrazionali.com/sanity/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
