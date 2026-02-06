import type { Request, Response } from "express";
import express from "express";

import auth from "../routes/auth.routes.js";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/auth", auth);

export default router;
