import type { NextFunction, Request, Response } from "express";
import express from "express";
import { deleteTicket, findAllTicketsByUser, findAllTicketsSorted, findTicketById, updateTicket } from "../controllers/ticket.controller";
import { isAuthenticated } from "../middlewares/auth.middlewares";
import { validatePagination, validateUserId } from "../middlewares/validate.middlewares";
import { canAccessTicket, canViewAllTickets, canViewUserTickets } from "../utils/permissions.utils";
import { prisma } from "../utils/prisma.utils";

const router = express.Router();

// GET ALL TICKETS BY USER ID
// orderBy => asc or desc
// orderType => updatedAt or createdAt
router.get("/user/:userId", isAuthenticated, validateUserId, validatePagination, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { orderBy, orderType, status } = req.query;
    const { userId: authUserId, role } = (req as any).payload;

    if (!(await canViewUserTickets(authUserId, userId as string, role))) {
      res.status(403);
      return next(new Error("Forbidden: You don't have permission to access this resource"));
    }

    const pagination = {
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      orderBy: (orderBy || "desc") as "asc" | "desc",
      orderType: (orderType || "createdAt") as "updatedAt" | "createdAt",
    };

    const { tickets, page, limit, count } = await findAllTicketsByUser(userId as string, status as string, pagination);

    return res.status(200).json({
      data: tickets,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
    });
  }
  catch (err) {
    res.status(500);
    next(err);
  }
});

// GET ALL TICKETS WITH SORTING
// orderBy => asc or desc
// orderType => updatedAt or createdAt
router.get("/all/", isAuthenticated, validatePagination, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderBy, orderType, status } = req.query;
    const { role } = (req as any).payload;

    if (!(await canViewAllTickets(role))) {
      res.status(403);
      return next(new Error("Forbidden: You don't have permission to access this resource"));
    }

    const pagination = {
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      orderBy: (orderBy as "asc" | "desc") || "desc",
      orderType: (orderType as "updatedAt" | "createdAt") || "createdAt",
    };

    const { tickets, page, limit, count } = await findAllTicketsSorted(status as string, pagination);

    return res.status(200).json({
      data: tickets,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
    });
  }
  catch (err) {
    res.status(500);
    next(err);
  }
});

// GET TICKET BY ID
router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const ticket = await findTicketById(id as string);
    const { userId, role } = (req as any).payload;

    if (!ticket) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }
    if (ticket.deletedAt !== null) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }
    if (!(await canAccessTicket(userId, role, ticket))) {
      res.status(403);
      return next(new Error("Forbidden: You don't have permission to access this resource"));
    }

    res.status(200).json(ticket);
  }
  catch (err) {
    res.status(500);
    next(err);
  }
});

// CREATE TICKET
router.post("/create", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, status } = req.body;
    const { userId } = (req as any).payload;

    if (!title) {
      res.status(400);
      return next(new Error("Title is required"));
    }
    if (!description) {
      res.status(400);
      return next(new Error("Description is required"));
    }

    const ticket = await prisma.tickets.create({
      data: {
        title,
        description,
        status,
        userId,
      },
    });
    res.status(201).json({ data: ticket, message: "Ticket created successfully" });
  }
  catch (err) {
    res.status(500);
    next(err);
  }
});

// UPDATE TICKET
router.put("/update", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, title, description, status } = req.body;
    const { userId, role } = (req as any).payload;

    const ticket = await prisma.tickets.findFirst({ where: { id } });

    if (!ticket) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }
    if (!(await canAccessTicket(userId, role, ticket))) {
      res.status(403);
      return next(new Error("Forbidden: You don't have permission to access this resource"));
    }

    const params = { title, description, status };
    const updatedTicket = await updateTicket(ticket, params);

    res.status(200).json({ data: updatedTicket, message: "Ticket updated successfully" });
  }
  catch (err) {
    res.status(500);
    next(err);
  }
});

// DELETE TICKET
router.put("/delete", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.body;
    const { userId, role } = (req as any).payload;

    const ticket = await prisma.tickets.findFirst({ where: { id } });

    if (!ticket) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }
    if (!(await canAccessTicket(userId, role, ticket))) {
      res.status(403);
      return next(new Error("Forbidden: You don't have permission to access this resource"));
    }

    await deleteTicket(id);

    res.status(200).json({ message: "Ticket deleted successfully" });
  }
  catch (err) {
    res.status(500);
    next(err);
  }
});

export default router;
