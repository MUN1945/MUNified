import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    ".space.chatglm.site",
    ".space-z.ai",
    ".vercel.app",
  ],
  images: {
    domains: [],
  },
};

export default nextConfig;
