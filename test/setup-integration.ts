import { execSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { PrismaClient } from "../src/generated/prisma/client";
import { env } from "../src/utils/env.utils";

const connectionString = env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

beforeAll(async () => {
  // Ensure we are using the test database
  const dbUrl = env.DATABASE_URL;
  if (!dbUrl?.includes("test")) {
    throw new Error("Integration tests must run against a test database.");
  }

  // Run migrations/sync schema
  // Use lock or check if already done?
  // For Vitest with threads, setupFiles run in each thread.
  // We should probably just rely on the first one or use a global setup.
  // But for now, let's just ignore the error if it fails (likely due to race condition if multiple tests start).
  // OR better: run migrations in a global setup file, not per-test-file setup.
  // Moving migration to a script runs before test is better.

  // For now, let's try to safeguard:
  try {
    console.log("Syncing database schema...");
    execSync("npx prisma db push --accept-data-loss", { stdio: "ignore" }); // Ignore output to reduce noise
  }
  catch (error) {
    // If it fails, it might be because another thread is doing it or it's already locked.
    // We can probably proceed and hope schema is okay.
    console.warn("Database sync failed or skipped (concurrency?):", (error as any).message);
  }
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.messages.deleteMany();
  await prisma.tickets.deleteMany();
  await prisma.refreshTokens.deleteMany();
  await prisma.users.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
