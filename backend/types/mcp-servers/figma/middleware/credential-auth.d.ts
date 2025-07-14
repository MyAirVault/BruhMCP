/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */
/**
 * Create credential authentication middleware with caching
 * This is the new primary middleware that replaces instance-auth for better performance
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>} Express middleware function
 */
export function createCredentialAuthMiddleware(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create middleware for endpoints that require instance validation but not credential caching
 * Used for health checks and discovery endpoints that don't need API keys
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>} Express middleware function
 */
export function createLightweightAuthMiddleware(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create debugging middleware that logs cache performance
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express middleware function
 */
export function createCachePerformanceMiddleware(): (req: Request, res: Response, next: NextFunction) => void;
export type Request = import("express").Request;
export type Response = import("express").Response;
export type NextFunction = import("express").NextFunction;
//# sourceMappingURL=credential-auth.d.ts.map