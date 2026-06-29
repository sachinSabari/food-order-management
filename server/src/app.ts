import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { menuRouter } from "./routes/menuRoutes.js";
import { orderRouter } from "./routes/orderRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp(): Express {
  const app = express();

  const allowedOrigin = process.env.CLIENT_ORIGIN ?? "https://food-order-management-bne9.vercel.app";

  app.use(helmet());
  app.use(cors({ origin: allowedOrigin }));
  app.use(express.json({ limit: "100kb" }));

  // Basic abuse protection on the write endpoint. Generous enough for normal
  // checkout flows but enough to blunt naive scripted abuse.
  const orderWriteLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/orders", orderWriteLimiter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/menu", menuRouter);
  app.use("/api/orders", orderRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
