import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import logger from "./utils/logger";
import routes from "./routes";

import { errorHandler } from "./middlewares/errorHandler";
import { rateLimiter } from "./middlewares/rateLimiter";

const app: Application = express();

// CORS Configuration - Must be before other middleware
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://nebula-fe.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
      ];

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin"
    ],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Explicitly handle OPTIONS requests
app.options('*', cors());

app.use(helmet());

app.use(rateLimiter);
app.use(
  morgan(":method :url :status - :response-time ms", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

app.get("/", (req: Request, res: Response) => {
  logger.info("Root endpoint was called 🌐");
  res.send("API is up and running!!!");
});

app.get("/health", (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;

  // MongoDB connection states
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  logger.info("Health check endpoint was called !!!");
  res.status(200).json({
    status: "ok",
    server: "running",
    database: states[dbState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

app.get("/favicon.ico", (req: Request, res: Response) => res.status(204).end());
app.use("/v1", routes);

// Global Error Handler
app.use(errorHandler);

export default app;
