export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  process.env.NEXT_PUBLIC_DEMO_MODE === "1";

export const SITE_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
