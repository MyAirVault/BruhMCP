/**
 * Admin authorization middleware
 * Ensures user has administrative privileges
 */
/**
 * Require admin privileges
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Next middleware function
 */
export function requireAdmin(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): import("express").Response<any, Record<string, any>> | undefined;
/**
 * Optional admin check (doesn't block non-admin users)
 * Adds admin status to request object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Next middleware function
 */
export function checkAdmin(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
//# sourceMappingURL=adminMiddleware.d.ts.map