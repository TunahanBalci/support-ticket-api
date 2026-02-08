import type { Request, Response } from "express";
import { timeStamp } from "node:console";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import morgan from "morgan";

import api from "./api/index.js";
import { isAuthenticated } from "./middlewares/auth.middlewares";
import { errorHandler, notFound } from "./middlewares/error-handler.middlewares";
import { validateEmail, validateMessage, validatePagination, validatePassword, validateTicket, validateTicketId, validateUserId } from "./middlewares/validate.middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/v1", api);

// MIDDLEWARES

// auth.middlewares
app.use(isAuthenticated);

// error-handler.middlewares
app.use(notFound);
app.use(errorHandler);

// validate.middlewares
app.use(validatePassword);
app.use(validateEmail);
app.use(validateUserId);
app.use(validateTicketId);
app.use(validateTicket);
app.use(validateMessage);
app.use(validatePagination);

export default app;
