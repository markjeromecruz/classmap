import type { NextConfig } from "next";

const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  process.env.NEXT_PUBLIC_DEMO_MODE === "1";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(isDemoMode
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
        basePath,
      }
    : {}),
};

export default nextConfig;
