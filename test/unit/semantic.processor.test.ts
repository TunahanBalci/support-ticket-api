
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { semanticJobProcessor, type SemanticJobData } from "../../src/workers/semantic.processor";
import { prismaMock } from "../helpers/prisma-mock";
import { Job } from "bullmq";

const mockGenerateEmbedding = vi.fn();
vi.mock("../../src/utils/embedding.utils", () => ({
  generateEmbedding: (...args: any[]) => mockGenerateEmbedding(...args),
}));

describe("Semantic Job Processor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
  @description Generates embedding for ticket content and updates database
  @expected Database updated with embedding vector
  */
  it("should generate embedding and update ticket", async () => {
    const jobData: SemanticJobData = {
      entityType: "ticket",
      entityId: "ticket-123",
      text: "Test Ticket Content",
    };

    const mockJob = {
      data: jobData,
    } as unknown as Job<SemanticJobData>;

    const mockEmbedding = [0.1, 0.2, 0.3];
    mockGenerateEmbedding.mockResolvedValue(mockEmbedding);
    
    prismaMock.$executeRaw.mockResolvedValue(1);

    await semanticJobProcessor(mockJob);

    expect(mockGenerateEmbedding).toHaveBeenCalledWith("Test Ticket Content");
    expect(prismaMock.$executeRaw).toHaveBeenCalled();
  });

  /**
  @description Generates embedding for message content and updates database
  @expected Database updated with embedding vector
  */
  it("should generate embedding and update message", async () => {
    const jobData: SemanticJobData = {
      entityType: "message",
      entityId: "message-123",
      text: "Test Message Content",
    };

    const mockJob = {
      data: jobData,
    } as unknown as Job<SemanticJobData>;

    const mockEmbedding = [0.5, 0.6, 0.7];
    mockGenerateEmbedding.mockResolvedValue(mockEmbedding);
    
    prismaMock.$executeRaw.mockResolvedValue(1);

    await semanticJobProcessor(mockJob);

    expect(mockGenerateEmbedding).toHaveBeenCalledWith("Test Message Content");
    expect(prismaMock.$executeRaw).toHaveBeenCalled();
  });
});
