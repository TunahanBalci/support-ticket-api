import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../utils/env.utils.js";

/*
@param req - Express request object
@param res - Express response object
@param next - Express next function
@description - Middleware to authenticate requests using JWT tokens.
It checks for the presence of an Authorization header, verifies the token, and attaches the payload to the request object.
If the token is missing, invalid, or expired, it returns a 401 Unauthorized error.
*/

async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401);
    return next(new Error("Unauthorized: No token provided"));
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = jwt.verify(token as string, env.AUTH_SECRET as string);
    (req as any).payload = payload;
  }
  catch (err: any) {
    res.status(401);
    if (err.name === "TokenExpiredError") {
      return next(new Error(err.name));
    }
    return next (new Error("Unauthorized: Invalid token"));
  }

  return next();
}

export { isAuthenticated };
