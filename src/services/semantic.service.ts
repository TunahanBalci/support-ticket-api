
import { semanticSearchQueue } from "../config/queue";

/**
 * @param ticketId - The ID of the ticket to index
 * @param title - The title of the ticket
 * @param description - The description of the ticket
 * 
 * @description Adds a job to the queue to generate embedding for a ticket
 */
export const indexTicket = async (ticketId: string, title: string, description: string) => {
  const text = `Title: ${title}. Content: ${description}`;
  await semanticSearchQueue.add("generate-embedding", {
    entityType: "ticket",
    entityId: ticketId,
    text,
  });
};

/**
 * @param messageId - The ID of the message to index
 * @param content - The content of the message to generate embedding for
 * 
 * @description Adds a job to the queue to generate embedding for a message
 */
export const indexMessage = async (messageId: string, content: string) => {
  await semanticSearchQueue.add("generate-embedding", {
    entityType: "message",
    entityId: messageId,
    text: content,
  });
};
