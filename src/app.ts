import cors from "cors";
import express from "express";
import helmet from "helmet";

import morgan from "morgan";

import api from "./api/index.js";
import { errorHandler, notFound } from "./middlewares/error-handler.middlewares";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/", api);

// MIDDLEWARES
app.use(notFound);
app.use(errorHandler);

export default app;
