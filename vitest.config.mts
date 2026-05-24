import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

// We intentionally do NOT use vite-tsconfig-paths here: tsconfig.json
// excludes tests/** (and the config files themselves), which makes the
// plugin skip the `@/*` mapping for the very files that need it. Define
// the alias explicitly so the test suite is self-contained.
const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": projectRoot.replace(/\/$/, ""),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
  },
});
