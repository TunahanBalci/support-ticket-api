import type { Request, Response } from "express";
import express from "express";

import swaggerUi from "swagger-ui-express";

import swaggerDocument from "../../config/swagger.json" assert { type: "json" };
import auth from "../../routes/auth.routes.js";
import message from "../../routes/message.routes.js";
import search from "../../routes/search.routes.js";
import ticket from "../../routes/ticket.routes.js";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "🟢 API OPERATIONAL",
  });
});

router.use("/auth", auth);
router.use("/ticket", ticket);
router.use("/message", message);
router.use("/search", search);

router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(swaggerDocument));

export default router;

