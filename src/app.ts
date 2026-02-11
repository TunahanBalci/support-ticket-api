import cors from "cors";
import express from "express";
import helmet from "helmet";

import morgan from "morgan";

import api from './api/v1/index.js';
import { errorHandler, notFound } from './middlewares/error-handler.middlewares.js';

const app = express();

app.use(morgan("dev"));
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/v1/api-docs")) {
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })(req, res, next);
  } else {
    helmet()(req, res, next);
  }
});
app.use(cors());
app.use(express.json());

app.use("/api/v1", api);

// MIDDLEWARES
app.use(notFound);
app.use(errorHandler);

export default app;
