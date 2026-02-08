import type { NextFunction, Request, Response } from "express";
import express from "express";
import { createMessage, findAllMessagesByTicketId, findAllMessagesSorted } from "../controllers/message.contoller";
import { isAuthenticated } from "../middlewares/auth.middlewares";
import { validatePagination, validateTicketId } from "../middlewares/validate.middlewares";
import { canAccessMessage, canAccessTicket, canViewAllMessages } from "../utils/permissions.utils";
import { prisma } from "../utils/prisma.utils";

const router = express.Router();

// GET ALL MESSAGES WITH SORTING
// orderBy => asc or desc
// orderType => updatedAt or createdAt
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

// GET ALL MESSAGES BY TICKET ID
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

// CREATE NEW MESSAGE
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

    res.status(201).json({ data: message, message: "Message created successfully" });
  }
  catch (error) {
    res.status(500);
    next(error);
  }
});

export default router;
