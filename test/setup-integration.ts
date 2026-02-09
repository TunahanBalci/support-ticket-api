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
  const dbUrl = env.DATABASE_URL;
  if (!dbUrl?.includes("test")) {
    throw new Error("Integration tests must run against a test database.");
  }

  try {
    console.log("Syncing database schema...");
    execSync("npx prisma db push --accept-data-loss", { stdio: "ignore" }); // ignore output to reduce noise
  }
  catch (error) {
    console.warn("Database sync failed or skipped (concurrency?):", (error as any).message);
  }
});

beforeEach(async () => {
  // clean db before each test
  await prisma.messages.deleteMany();
  await prisma.tickets.deleteMany();
  await prisma.refreshTokens.deleteMany();
  await prisma.users.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
