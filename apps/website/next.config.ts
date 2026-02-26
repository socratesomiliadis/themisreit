import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  reactCompiler: true,
  devIndicators: false,
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
            value: "sanity.themisreit.com",
          },
        ],
        destination: "https://alpha.themisreit.com/sanity/:path*",
        permanent: false,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "sanity.localhost",
          },
        ],
        destination: "http://localhost:3000/sanity/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
