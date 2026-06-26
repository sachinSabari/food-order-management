import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError.js";

/**
 * Validates req.body against the given Zod schema. On success, replaces
 * req.body with the parsed (and type-coerced) value. On failure, forwards a
 * 400 ApiError with field-level details to the error handler.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      next(ApiError.badRequest("Validation failed", details));
      return;
    }
    req.body = result.data;
    next();
  };
}
