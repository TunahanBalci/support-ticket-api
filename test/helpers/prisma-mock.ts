import type { DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "../../src/generated/prisma/client";

// Get the mock from globalThis set up in setup-unit.ts
export const prismaMock = (globalThis as any).__prismaMock__ as DeepMockProxy<PrismaClient>;
