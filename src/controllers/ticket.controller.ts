import type { Status } from "../generated/prisma/browser";
import type { Tickets } from "../generated/prisma/client";
import { env } from "../utils/env.utils";
import { buildPagination } from "../utils/pagination.utils";
import { prisma } from "../utils/prisma.utils";

/*
PARAMS
@param _userId - string
@param _status? - "OPEN" | "PENDING" | "RESOLVED"
@param pagination? - { page: number; limit: number, orderBy: "asc" | "desc" }

Finds all tickets for a user, optionally filtered by status, and paginated.
If no pagination is provided, defaults to page 1 and limit 10.
*/
async function findAllTicketsByUser(_userId: string, _status?: string, pagination?: { page: number; limit: number; orderBy?: "asc" | "desc"; orderType?: "updatedAt" | "createdAt" }) {
  const { page, limit, orderBy, orderType } = await buildPagination(pagination || {});

  if (limit > env.PAGINATION_LIMIT_TICKET_BY_USER) {
    throw new Error("Limit must be <= "
      .concat(String(env.PAGINATION_LIMIT_TICKET_BY_USER)));
  }

  if (!_status) {
    const tickets = await prisma.tickets.findMany({
      where: {
        userId: _userId,
      },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      orderBy: { [orderType]: orderBy as "asc" | "desc" },
    });
    const count = await prisma.tickets.count({
      where: {
        userId: _userId,
      },
    });
    return { tickets, page, limit, count };
  }

  const tickets = await prisma.tickets.findMany({
    where: {
      userId: _userId,
      status: _status as Status,
    },
    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
    orderBy: { [orderType]: orderBy as "asc" | "desc" },
  });

  const count = await prisma.tickets.count({
    where: {
      userId: _userId,
      status: _status as Status,
    },
  });

  return { tickets, page, limit, count };
}

/*
PARAMS
@param orderBy - "asc" or "desc"
@param orderType - "updatedAt" or "createdAt"
@param pagination? - { page: number; limit: number }

Finds all tickets sorted by columns updatedAt or createdAt in ascending or descending order.
If no order is provided, defaults to sorting by createdAt in descending order (newest first).
Uses pagination with default values of page 1 and limit 10 if no pagination is provided.
*/
async function findAllTicketsSorted(status?: string, pagination?: { page: number; limit: number; orderBy?: "asc" | "desc"; orderType?: "updatedAt" | "createdAt" }) {
  const { page, limit, orderBy, orderType } = await buildPagination(pagination || {});

  if (orderType && orderType !== "updatedAt" && orderType !== "createdAt") {
    throw new Error("Invalid orderType value. Must be 'updatedAt' or 'createdAt'");
  }
  if (orderBy && orderBy !== "asc" && orderBy !== "desc") {
    throw new Error("Invalid orderBy value. Must be 'asc' or 'desc'");
  }
  if (page < 1 || limit < 1 || Number.isNaN(page) || Number.isNaN(limit)) {
    throw new Error("Invalid pagination values. Page and limit must be >= 1");
  }
  if (limit > env.PAGINATION_LIMIT_TICKET_ALL) {
    throw new Error("Limit must be <= "
      .concat(String(env.PAGINATION_LIMIT_TICKET_ALL)));
  }

  if (!status) {
    const tickets = await prisma.tickets.findMany({
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      orderBy: { [orderType]: orderBy },
      // orderBy: { updatedAt: orderBy } OR orderBy: { createdAt: orderBy }
      // orderBy => asc or desc
    });
    const count = await prisma.tickets.count();
    return { tickets, page, limit, count };
  }

  const tickets = await prisma.tickets.findMany({
    where: {
      status: status as Status,
    },
    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
    orderBy: { [orderType]: orderBy },
  });

  const count = await prisma.tickets.count({
    where: {
      status: status as Status,
    },
  });

  return { tickets, page, limit, count };
}

/*
PARAMS
@param _userId - string
@param _title - string
@param _description - string

Creates a new ticket for the user with the given userId.
*/
async function createTicket(_userId: string, _title: string, _description: string) {
  return prisma.tickets.create({
    data: {
      userId: _userId,
      title: _title,
      description: _description,
    },
  });
}

/*
PARAMS
@param _id - string

Finds a ticket by its id.
*/
async function findTicketById(_id: string) {
  return prisma.tickets.findFirst({
    where: {
      id: _id,
    },
  });
}

/*
PARAMS
@param ticket - Tickets
@param params - { title?: string; description?: string; status?: string }

Updates a ticket with the given parameters.
*/
async function updateTicket(ticket: Tickets, params: { title?: string; description?: string; status?: string }) {
  return prisma.tickets.update({
    where: {
      id: ticket.id,
    },
    data: {
      title: params.title ?? ticket.title,
      description: params.description ?? ticket.description,
      status: params.status as Status ?? ticket.status,
      updatedAt: new Date(),
    },
  });
}

/*
PARAMS
@param ticket - Tickets
@param params - { title?: string; description?: string; status?: string }

Deletes a ticket by its id. Soft delete.
*/
async function deleteTicket(_id: string) {
  return prisma.tickets.update({
    where: {
      id: _id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}
export { createTicket, deleteTicket, findAllTicketsByUser, findAllTicketsSorted, findTicketById, updateTicket };
