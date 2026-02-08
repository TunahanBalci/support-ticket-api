import { prisma } from "../utils/prisma.utils";

interface TicketSearchResult {
  id: string;
  title: string;
  description: string;
  similarity: number;
}

interface MessageSearchResult {
  id: string;
  content: string;
  ticketId: string;
  similarity: number;
}

/**
 * Search tickets using vector similarity (cosine distance)
 * @param queryVector - 384-dimensional embedding of the search query
 * @param limit - Maximum number of results to return
 * @returns Array of tickets ranked by semantic similarity
 */
async function searchTickets(queryVector: number[], limit = 5): Promise<TicketSearchResult[]> {
  // Convert array to PostgreSQL vector string format: '[x,y,z,...]'
  const vectorString = `[${queryVector.join(",")}]`;
  const results = await prisma.$queryRaw<TicketSearchResult[]>`
    SELECT 
      id, 
      title, 
      description,
      1 - (embedding <=> ${vectorString}::vector) as similarity
    FROM "Tickets"
    WHERE embedding IS NOT NULL AND "deletedAt" IS NULL
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;
  return results;
}

/**
 * Search messages using vector similarity (cosine distance)
 * @param queryVector - 384-dimensional embedding of the search query
 * @param limit - Maximum number of results to return
 * @returns Array of messages ranked by semantic similarity
 */
async function searchMessages(queryVector: number[], limit = 5): Promise<MessageSearchResult[]> {
  // Convert array to PostgreSQL vector string format: '[x,y,z,...]'
  const vectorString = `[${queryVector.join(",")}]`;
  const results = await prisma.$queryRaw<MessageSearchResult[]>`
    SELECT 
      id, 
      content, 
      "ticketId",
      1 - (embedding <=> ${vectorString}::vector) as similarity
    FROM "Messages"
    WHERE embedding IS NOT NULL
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;
  return results;
}

export { searchMessages, searchTickets };
export type { MessageSearchResult, TicketSearchResult };

