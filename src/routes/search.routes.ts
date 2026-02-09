import type { NextFunction, Request, Response } from "express";
import express from "express";
import { searchMessages, searchTickets } from "../controllers/search.controller";
import { isAuthenticated } from "../middlewares/auth.middlewares";
import { generateEmbedding } from "../utils/embedding.utils";

const router = express.Router();

/**
 * SEMANTIC SEARCH
 * GET /api/v1/search?query=<search_text>&limit=<number>
 *
 * Searches both tickets and messages using semantic similarity.
 * Returns results ranked by cosine similarity to the query.
 */
router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, limit } = req.query;

    if (!query || typeof query !== "string") {
      res.status(400);
      return next(new Error("Query parameter is required"));
    }
    if (query.trim().length === 0) {
      res.status(400);
      return next(new Error("Query cannot be empty"));
    }

    // default to 5, max 20
    const searchLimit = Math.min(Number(limit) || 5, 20);
    const queryVector = await generateEmbedding(query);

    const [tickets, messages] = await Promise.all([
      searchTickets(queryVector, searchLimit),
      searchMessages(queryVector, searchLimit),
    ]);

    res.status(200).json({
      query,
      tickets,
      messages,
    });
  }
  catch (err) {
    res.status(500);
    next(err);
  }
});

export default router;
