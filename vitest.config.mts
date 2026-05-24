import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// tsconfig.test.json gives the IDE + tsc visibility into tests.
// The explicit resolve.alias is a belt-and-suspenders: vite-tsconfig-paths
// only applies path mapping to files included in the listed tsconfigs, and
// tsconfig.test.json scopes to tests/** only — so without the alias, source
// files imported FROM tests (e.g. components/classmap/ClassMapForm.tsx →
// "@/lib/types") fail to resolve. See ISS-03.
const projectRoot = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.test.json"] }),
    react(),
  ],
  resolve: {
    alias: { "@": projectRoot },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
  },
});
