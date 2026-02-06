import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env.js";

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = jwt.verify(token as string, env.AUTH_SECRET as string);
    (req as any).payload = payload;
  }
  catch (err: any) {
    res.status(401);
    if (err.name === "TokenExpiredError") {
      throw new Error(err.name);
    }
    throw new Error("Unauthorized");
  }

  return next();
}

export { isAuthenticated };
