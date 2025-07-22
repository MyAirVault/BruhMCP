/**
 * @typedef {Object} AuthenticatedUser
 * @property {string|number} id - User ID
 * @property {string|number} userId - User ID (duplicate for compatibility)
 * @property {string} email - User email address
 * @property {Date} sessionCreatedAt - Session creation timestamp
 * @property {Date} sessionExpiresAt - Session expiration timestamp
 */
/**
 * @typedef {import('express').Request & {user?: AuthenticatedUser | null}} AuthenticatedRequest
 */
/**
 * Authentication middleware that validates JWT tokens from cookies
 * @param {AuthenticatedRequest} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function authenticate(req: AuthenticatedRequest, res: import("express").Response, next: import("express").NextFunction): Promise<void>;
/**
 * Optional authentication middleware - doesn't fail if no token
 * @param {AuthenticatedRequest} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export function optionalAuthenticate(req: AuthenticatedRequest, _res: import("express").Response, next: import("express").NextFunction): Promise<void>;
/**
 * Get current user from request
 * @param {AuthenticatedRequest} req
 */
export function getCurrentUser(req: AuthenticatedRequest): ({
    id: string;
    userId: string;
    email: string;
    sessionCreatedAt: Date;
    sessionExpiresAt: Date;
} & AuthenticatedUser) | null;
/**
 * Check if user is authenticated
 * @param {AuthenticatedRequest} req
 */
export function isAuthenticated(req: AuthenticatedRequest): boolean;
/**
 * @typedef {Object} AuthenticatedUser
 * @property {string|number} id - User ID
 * @property {string|number} userId - User ID (duplicate for compatibility)
 * @property {string} email - User email address
 * @property {Date} sessionCreatedAt - Session creation timestamp
 * @property {Date} sessionExpiresAt - Session expiration timestamp
 */
/**
 * @typedef {import('express').Request & {user?: AuthenticatedUser | null}} AuthenticatedRequest
 */
/**
 * Authentication middleware that validates JWT tokens from cookies
 * @param {AuthenticatedRequest} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requireAuth(req: AuthenticatedRequest, res: import("express").Response, next: import("express").NextFunction): Promise<void>;
export type AuthenticatedUser = {
    /**
     * - User ID
     */
    id: string | number;
    /**
     * - User ID (duplicate for compatibility)
     */
    userId: string | number;
    /**
     * - User email address
     */
    email: string;
    /**
     * - Session creation timestamp
     */
    sessionCreatedAt: Date;
    /**
     * - Session expiration timestamp
     */
    sessionExpiresAt: Date;
};
export type AuthenticatedRequest = import("express").Request & {
    user?: AuthenticatedUser | null;
};
//# sourceMappingURL=authMiddleware.d.ts.map