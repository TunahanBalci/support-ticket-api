import type { PrismaClient } from "../src/generated/prisma/client";
import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

// Create the mock and assign to globalThis
const prismaMock = mockDeep<PrismaClient>();
(globalThis as any).__prismaMock__ = prismaMock;

// Mock the module
vi.mock("../src/utils/prisma.utils", () => ({
  prisma: (globalThis as any).__prismaMock__,
}));

// Reset mocks between tests
beforeEach(() => {
  mockReset((globalThis as any).__prismaMock__);
});
