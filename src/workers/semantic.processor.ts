
import type { Job } from "bullmq";
import { prisma } from "../utils/prisma.utils";
import { generateEmbedding } from "../utils/embedding.utils";

export interface SemanticJobData {
  entityType: "ticket" | "message";
  entityId: string;
  text: string;
}

export const semanticJobProcessor = async (job: Job<SemanticJobData>) => {
  const { entityType, entityId, text } = job.data;
  console.log(`[SemanticService] Generating embedding for ${entityType} ${entityId}...`);

  try {
    const embedding = await generateEmbedding(text);
    const vectorString = `[${embedding.join(",")}]`;

    if (entityType === "ticket") {
      await prisma.$executeRaw`
        UPDATE "Tickets" 
        SET embedding = ${vectorString}::vector 
        WHERE id = ${entityId}
      `;
    } else if (entityType === "message") {
      await prisma.$executeRaw`
        UPDATE "Messages" 
        SET embedding = ${vectorString}::vector 
        WHERE id = ${entityId}
      `;
    }

    console.log(`[SemanticService] Embedding updated for ${entityType} ${entityId}.`);
  } catch (error) {
    console.error(`[SemanticJobError] ${entityType} ${entityId}:`, error);
    throw error;
  }
};
