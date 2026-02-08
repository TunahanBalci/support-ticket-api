import type { NextFunction, Request, Response } from "express";
import { env } from "../utils/env.utils.js";

/*
@param req - Express request object
@param res - Express response object
@param next - Express next function
@description - Middleware to handle 404 errors in the application.
It sets the response status code to 404 and passes an error to the next middleware.
*/
function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
}

/*
@param err - Error object
@param req - Express request object
@param res - Express response object
@param next - Express next function
@description - Middleware to handle errors in the application.
It sets the response status code based on the error and returns a JSON response with the error message and stack trace
if mode = production
*/
function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}

export { errorHandler, notFound };
