import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: { message: `Route ${req.method} ${req.path} does not exist` },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: { message: err.message, details: err.details },
    });
    return;
  }

  console.error("Unexpected error:", err);
  res.status(500).json({
    error: { message: "Internal server error" },
  });
}
