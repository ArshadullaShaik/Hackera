import { Request, Response, NextFunction } from "express";
import { logger } from "../../core/logger.js";

/**
 * Custom error class for API errors with status codes.
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Express error-handling middleware.
 * - 400 for validation errors (ApiError with 400)
 * - 404 for not-found (ApiError with 404)
 * - 500 catch-all: logs full error via pino, returns generic message (never leaks stack traces)
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: {
        status: err.statusCode,
        message: err.message,
      },
    });
    return;
  }

  // Unexpected error — log full details, return generic message
  logger.error(
    {
      error: err.message,
      stack: err.stack,
    },
    "Unhandled server error"
  );

  res.status(500).json({
    error: {
      status: 500,
      message: "Internal server error",
    },
  });
}
