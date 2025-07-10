/**
 * Authentication middleware that validates JWT tokens from cookies
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function authenticate(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): Promise<import("express").Response<any, Record<string, any>> | undefined>;
/**
 * Optional authentication middleware - doesn't fail if no token
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export function optionalAuthenticate(req: import("express").Request, _res: import("express").Response, next: import("express").NextFunction): Promise<void>;
/**
 * Get current user from request
 * @param {import('express').Request} req
 */
export function getCurrentUser(req: import("express").Request): any;
/**
 * Check if user is authenticated
 * @param {import('express').Request} req
 */
export function isAuthenticated(req: import("express").Request): boolean;
/**
 * Authentication middleware that validates JWT tokens from cookies
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requireAuth(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): Promise<import("express").Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authMiddleware.d.ts.map