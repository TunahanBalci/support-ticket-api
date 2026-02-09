
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["test/e2e/**/*.test.ts"],
    testTimeout: 60000,
    hookTimeout: 30000,
    globals: true,
    fileParallelism: false, // Run E2E sequentially usually
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
    setupFiles: ["test/e2e/setup.ts"],
  },
});
