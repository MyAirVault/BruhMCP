/**
 * Middleware to verify JWT access token
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
export function authenticateToken(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
/**
 * Middleware to verify user exists and is active
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export function verifyUserExists(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): Promise<void>;
/**
 * Middleware to require verified email
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
export function requireVerifiedEmail(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
/**
 * Optional authentication middleware (doesn't fail if no token)
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
export function optionalAuth(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
/**
 * Combined authentication middleware (token + user verification)
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
export function authenticate(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
/**
 * Full authentication with email verification requirement
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
export function authenticateVerified(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
//# sourceMappingURL=auth.d.ts.map