import type { NextFunction, Request, Response } from "express";
import express from "express";
import { createMessage, findAllMessagesByTicketId, findAllMessagesSorted } from '../controllers/message.contoller.js';
import { isAuthenticated } from '../middlewares/auth.middlewares.js';
import { validatePagination, validateTicketId } from '../middlewares/validate.middlewares.js';
import { canAccessMessage, canAccessTicket, canViewAllMessages } from '../utils/permissions.utils.js';
import { indexMessage } from '../services/semantic.service.js';
import { prisma } from '../utils/prisma.utils.js';

const router = express.Router();

/**
 * LIST ALL MESSAGES 
 * GET /api/v1/messages/all?orderBy=asc&orderType=createdAt&page=1&limit=10
 * 
 * Lists all messages with sorting and pagination
 * 
 * orderBy can be "asc" or "desc"
 * orderType can be "updatedAt" or "createdAt"
 * page defaults to 1, limit defaults to 10
 * 
 * Only accessible by SUPPORT_AGENT role
 */
router.get("/all/", isAuthenticated, validatePagination, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderBy, orderType } = req.query;
    const { role } = (req as any).payload;

    if (!(await canViewAllMessages(role))) {
      res.status(403);
      return next(new Error("Forbidden: You don't have permission to access this resource"));
    }

    const pagination = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      orderBy: (orderBy || "desc") as "asc" | "desc",
      orderType: (orderType || "createdAt") as "updatedAt" | "createdAt",
    };

    const tickets = await findAllMessagesSorted(pagination);
    res.status(200).json({ data: tickets, message: "Messages retrieved successfully" });
  }
  catch (error) {
    res.status(500);
    next(error);
  }
});

/**
 * LIST MESSAGES BY TICKET ID
 * GET /api/v1/messages/ticket/:ticketId?orderBy=asc&orderType=createdAt&page=1&limit=10
 * 
 * Lists all messages for a specific ticket with sorting and pagination
 * 
 * orderBy can be "asc" or "desc"
 * orderType can be "updatedAt" or "createdAt"
 * page defaults to 1, limit defaults to 10
 * 
 * Only accessible by SUPPORT_AGENT role
 */
router.get("/ticket/:ticketId", isAuthenticated, validateTicketId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketId } = req.params;
    const { orderBy, orderType } = req.query;
    const { userId, role } = (req as any).payload;

    const ticket = await prisma.tickets.findFirst({ where: { id: ticketId as string } });

    if (!ticket) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }
    if (!(await canAccessTicket(userId, role, ticket))) {
      res.status(403);
      return next(new Error("Forbidden: You don't have permission to access this resource"));
    }

    const pagination = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      orderBy: (orderBy || "desc") as "asc" | "desc",
      orderType: (orderType || "createdAt") as "updatedAt" | "createdAt",
    };

    const messages = await findAllMessagesByTicketId(ticketId as string, pagination);

    res.status(200).json({ data: messages, message: "Messages retrieved successfully" });
  }
  catch (error) {
    next(error);
  }
});

/**
 * CREATE MESSAGE
 * POST /api/v1/messages/create
 * 
 * request body = { content: string, ticketId: string }
 * 
 * Creates a new message for a specific ticket
 * 
 * Only accessible by USER and SUPPORT_AGENT roles, but users can only create messages for their own tickets
 */
router.post("/create/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, ticketId } = req.body;
    const { userId, role } = (req as any).payload;

    const ticket = await prisma.tickets.findFirst({ where: { id: ticketId } });

    if (!ticket) {
      res.status(404);
      return next(new Error("Parent ticket not found"));
    }
    if (!(await canAccessMessage(role, userId, ticket))) {
      res.status(403);
      return next(new Error("Forbidden: You don't have permission to access this resource"));
    }

    const message = await createMessage({
      _content: content,
      _senderType: role,
      _ticketId: ticketId,
    });

    // generate embedding 
    await indexMessage(message.id, content);

    res.status(201).json({ data: message, message: "Message created successfully" });
  }
  catch (error) {
    res.status(500);
    next(error);
  }
});

export default router;
