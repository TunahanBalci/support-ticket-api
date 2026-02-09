import path from "node:path";
import { defineConfig } from "vitest/config";

const rootDir = path.resolve(import.meta.dirname, "..");

export default defineConfig({
  test: {
    root: rootDir,
    include: ["test/**/*.test.ts"],
    exclude: ["test/integration/**/*.test.ts", "**/node_modules/**"],
    setupFiles: ["test/setup-unit.ts"],
    env: {
      NODE_ENV: "test",
      APP_HOST: "localhost",
      APP_PORT: "3000",
      DATABASE_URL: "postgresql://user:password@localhost:5432/testdb",
      AUTH_SECRET: "super-secret-test-key",
      AUTH_ACCESS_TOKEN_EXPIRES_IN: "1d",
      AUTH_REFRESH_TOKEN_EXPIRES_IN: "24h",
      PAGINATION_LIMIT_MESSAGE_BY_TICKET: "190",
      PAGINATION_LIMIT_MESSAGE_ALL: "190",
      PAGINATION_LIMIT_TICKET_BY_USER: "190",
      PAGINATION_LIMIT_TICKET_ALL: "190",
      SLACK_WEBHOOK_URL: "https://example.com/webhook",
      REDIS_HOST: "localhost",
      REDIS_PORT: "6379",
    },
  },
});
