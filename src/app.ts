import type { Request, Response } from "express";
import { timeStamp } from "node:console";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import morgan from "morgan";

import api from "./api/index.js";
import * as middlewares from "./middlewares/error-handler.middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: `Hello world`,
  });
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
