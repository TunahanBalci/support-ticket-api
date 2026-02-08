import type { SenderType } from "../generated/prisma/enums";
import { validatePagination } from "../middlewares/validate.middlewares";
import { env } from "../utils/env.utils";
import { buildPagination } from "../utils/pagination.utils";
import { prisma } from "../utils/prisma.utils";

/*
@param pagination? - { page: number; limit: number, orderBy: "asc" | "desc", orderType: "updatedAt" | "createdAt" }
@description Finds all messages sorted by createdAt, paginated.
If no pagination is provided, defaults to page 1 and limit 10.
*/
async function findAllMessagesSorted(pagination?: { page: number; limit: number; orderBy?: "asc" | "desc"; orderType?: "updatedAt" | "createdAt" }) {
  const { page, limit, orderBy, orderType } = await buildPagination(pagination || {});

  if (limit > env.PAGINATION_LIMIT_MESSAGE_ALL) {
    throw new Error("Limit must be <= "
      .concat(String(env.PAGINATION_LIMIT_MESSAGE_ALL)));
  }

  const messages = await prisma.messages.findMany({
    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
    orderBy: { [orderType]: orderBy },
  });
  const count = await prisma.messages.count();
  return { page, limit, messages, count };
}

/*
@param ticketId - string
@param pagination? - { page: number; limit: number, orderBy: "asc" | "desc", orderType: "updatedAt" | "createdAt" }
@description Finds all messages for a given ticket ID, sorted by createdAt, paginated.
If no pagination is provided, defaults to page 1 and limit 10.
*/
async function findAllMessagesByTicketId(ticketId: string, pagination?: { page: number; limit: number; orderBy?: "asc" | "desc"; orderType?: "updatedAt" | "createdAt" }) {
  const { page, limit, orderBy, orderType } = await buildPagination(pagination || {});

  if (limit > env.PAGINATION_LIMIT_MESSAGE_BY_TICKET) {
    throw new Error("Limit must be <= "
      .concat(String(env.PAGINATION_LIMIT_MESSAGE_BY_TICKET)));
  }

  const messages = await prisma.messages.findMany({
    where: {
      ticketId,
    },
    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
    orderBy: { [orderType]: orderBy },
  });
  const count = await prisma.messages.count({
    where: {
      ticketId,
    },
  });
  return { messages, page, limit, count };
}

/*
@param message: Object containing ticketId, senderType, and content
@description Creates a new message with the given ticketId, senderType, and content.
The senderType must be either "USER" or "SUPPORT_AGENT"
*/
async function createMessage(message: { _ticketId: string; _senderType: string; _content: string }) {
  const newMessage = await prisma.messages.create({
    data: {
      ticketId: message._ticketId,
      senderType: message._senderType as SenderType,
      content: message._content,
    },
  });
  return newMessage;
}

export { createMessage, findAllMessagesByTicketId, findAllMessagesSorted };
