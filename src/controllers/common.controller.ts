import { buildPagination } from "../utils/pagination.utils";
import { prisma } from "../utils/prisma.utils";

/*
ç@param _orderBy: "asc" | "desc"
@param pagination? - { page: number; limit: number; orderBy?: "asc" | "desc"; orderType?: "updatedAt" | "createdAt" }
@description Finds all messages and tickets sorted by createdAt, paginated.
If no pagination is provided, defaults to page 1 and limit 10.
*/
async function findAllMessagesAndTicketsSorted(pagination?: { page: number; limit: number; orderBy?: "asc" | "desc"; orderType?: "updatedAt" | "createdAt" }) {
  const { page, limit, orderBy, orderType } = await buildPagination(pagination || {});

  const tickets = await prisma.tickets.findMany({
    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
    orderBy: { [orderType]: orderBy as "asc" | "desc" },
  });

  const messages = await prisma.messages.findMany({
    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
    orderBy: { [orderType]: orderBy as "asc" | "desc" },
  });

  const count = await prisma.tickets.count();
  const countMessages = await prisma.messages.count();

  const allData = [...tickets, ...messages];
  allData.sort((a, b) => {
    const dateA = new Date((a as any)[orderType]).getTime();
    const dateB = new Date((b as any)[orderType]).getTime();
    return orderBy === "asc" ? dateA - dateB : dateB - dateA;
  });

  return { page, limit, allData, count, countMessages };
}

export { findAllMessagesAndTicketsSorted };
