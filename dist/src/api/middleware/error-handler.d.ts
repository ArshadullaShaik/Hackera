import { Request, Response, NextFunction } from "express";
/**
 * Custom error class for API errors with status codes.
 */
export declare class ApiError extends Error {
    readonly statusCode: number;
    constructor(statusCode: number, message: string);
}
/**
 * Express error-handling middleware.
 * - 400 for validation errors (ApiError with 400)
 * - 404 for not-found (ApiError with 404)
 * - 500 catch-all: logs full error via pino, returns generic message (never leaks stack traces)
 */
export declare function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=error-handler.d.ts.map