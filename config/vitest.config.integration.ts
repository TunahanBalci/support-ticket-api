import path from "node:path";
import { defineConfig } from "vitest/config";

const rootDir = path.resolve(import.meta.dirname, "..");

export default defineConfig({
  test: {
    root: rootDir,
    include: ["test/integration/**/*.test.ts"],
    exclude: ["**/node_modules/**"],
    setupFiles: ["test/setup-integration.ts"],
    env: {
      NODE_ENV: "test",
      APP_HOST: "localhost",
      APP_PORT: "3000",
      DATABASE_URL: "postgresql://user:password@127.0.0.1:5433/support_ticket_test_db",
      AUTH_SECRET: "super-secret-test-key",
      AUTH_ACCESS_TOKEN_EXPIRES_IN: "1d",
      AUTH_REFRESH_TOKEN_EXPIRES_IN: "24h",
      PAGINATION_LIMIT_MESSAGE_BY_TICKET: "190",
      PAGINATION_LIMIT_MESSAGE_ALL: "190",
      PAGINATION_LIMIT_TICKET_BY_USER: "190",
      PAGINATION_LIMIT_TICKET_ALL: "190",
    },

    testTimeout: 10000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
