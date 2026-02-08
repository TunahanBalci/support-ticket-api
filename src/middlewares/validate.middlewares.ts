import type { NextFunction, Request, Response } from "express";
import { z } from "zod/v4";

/*
@param req - Express request object
@param res - Express response object
@param next - Express next function
@description - Middleware to validate email in the request body using Zod schema
*/
async function validateEmail(req: Request, res: Response, next: NextFunction) {
  const emailSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
  });

  try {
    emailSchema.parse({ email: req.body.email });
  }
  catch (err: any) {
    res.status(400);
    next(err);
  }
  return next();
}

/*
@param req - Express request object
@param res - Express response object
@param next - Express next function
@description - Middleware to validate password in the request body using Zod schema

Password schema:
length <= 128 AND length >= 8
must contain at least one uppercase letter
must contain at least one number
must not contain more than 4 consecutive identical patterns
*/
async function validatePassword(req: Request, res: Response, next: NextFunction) {
  const passwordSchema = z.object({
    password: z.string({ message: "Invalid password" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(128, { message: "Password must be at most 128 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/\d/, { message: "Password must contain at least one number" })
      .regex(/(.)\1{4}/, { message: "Password must not contain more than 4 consecutive identical characters" }),
  });

  try {
    passwordSchema.parse({ password: req.body.password });
  }
  catch (err: any) {
    res.status(400);
    next(err);
  }
  return next();
}

/*
@param req - Express request object
@param res - Express response object
@param next - Express next function
@description - Middleware to validate ticket data in the request body using Zod schema.
The title must be between 5 and 100 characters long, and the description must be between 10 and 2000 characters long.
*/
async function validateTicket(req: Request, res: Response, next: NextFunction) {
  const ticketSchema = z.object({
    title: z.string({ message: "Invalid title" })
      .min(5, { message: "Title must be at least 5 characters long" })
      .max(100, { message: "Title must be at most 100 characters long" }),
    description: z.string({ message: "Invalid description" })
      .min(10, { message: "Description must be at least 10 characters long" })
      .max(2000, { message: "Description must be at most 2000 characters long" }),
  });

  try {
    ticketSchema.parse({ title: req.body.title, description: req.body.description });
  }
  catch (err: any) {
    res.status(400);
    next(err);
  }
  return next();
}

/*
@param req - Express request object
@param res - Express response object
@param next - Express next function
@description - Middleware to validate message data in the request body using Zod schema.
The content must be between 1 and 1000 characters long.
*/
async function validateMessage(req: Request, res: Response, next: NextFunction) {
  const messageSchema = z.object({
    content: z.string({ message: "Invalid message content" })
      .min(1, { message: "Message content must be at least 1 character long" })
      .max(1000, { message: "Message content must be at most 1000 characters long" }),
  });

  try {
    messageSchema.parse({ content: req.body.content });
  }
  catch (err: any) {
    res.status(400);
    next(err);
  }
  return next();
}

/*
@param req - Express request object
@param res - Express response object
@param next - Express next function
@description - Middleware to validate user ID in the request body using Zod schema.
The user ID must be a valid UUID.
*/
async function validateUserId(req: Request, res: Response, next: NextFunction) {
  const userIdSchema = z.object({
    userId: z.uuid({ message: "Invalid user ID" }),
  });

  try {
    userIdSchema.parse({ userId: req.body.userId });
  }
  catch (err: any) {
    res.status(400);
    next(err);
  }
  return next();
}

/*
@param req - Express request object
@param res - Express response object
@param next - Express next function
@description - Middleware to validate ticket ID in the request body using Zod schema.
The ticket ID must be a valid UUID.
*/
async function validateTicketId(req: Request, res: Response, next: NextFunction) {
  const ticketIdSchema = z.object({
    ticketId: z.uuid({ message: "Invalid ticket ID" }),
  });

  try {
    ticketIdSchema.parse({ ticketId: req.body.ticketId });
  }
  catch (err: any) {
    res.status(400);
    next(err);
  }
  return next();
}

/*
@param req - Express request object
@param res - Express response object
@param next - Express next function
@description - Middleware to validate pagination parameters in the request query using Zod schema.
The page and limit parameters must be positive integers, and the orderBy parameter must be either "asc" or "desc".
The orderType parameter must be either "updatedAt" or "createdAt".
*/
async function validatePagination(req: Request, res: Response, next: NextFunction) {
  const page = Number.parseInt(req.query.page as string) || 1;
  const orderBy = req.query.orderBy as "asc" | "desc" || "desc";
  const orderType = req.query.orderType as "updatedAt" | "createdAt" || "createdAt";
  const limit = Number.parseInt(req.query.limit as string) || 10;

  if (page < 1 || Number.isNaN(page)) {
    res.status(400);
    next(new Error("Invalid page number"));
  }
  if (limit < 1 || Number.isNaN(limit)) {
    res.status(400);
    next(new Error("Invalid limit number"));
  }
  if (orderType && orderType !== "updatedAt" && orderType !== "createdAt") {
    res.status(400);
    next(new Error("Invalid orderType value. Must be 'updatedAt' or 'createdAt'"));
  }
  if (orderBy && orderBy !== "asc" && orderBy !== "desc") {
    res.status(400);
    next(new Error("Invalid orderBy value. Must be 'asc' or 'desc'"));
  }
  if (page < 1 || limit < 1 || Number.isNaN(page) || Number.isNaN(limit)) {
    res.status(400);
    next(new Error("Invalid pagination values. Page and limit must be >= 1"));
  }
}

export { validateEmail, validateMessage, validatePagination, validatePassword, validateTicket, validateTicketId, validateUserId };
