export type Request = import('express').Request;
export type Response = import('express').Response;
export type NextFunction = import('express').NextFunction;
export type CachedCredential = {
    /**
     * - API key
     */
    api_key: string;
    /**
     * - Expiration timestamp
     */
    expires_at: string;
    /**
     * - User ID
     */
    user_id: string;
};
export type InstanceData = {
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - Expiration timestamp
     */
    expires_at?: string | undefined;
    /**
     * - API key
     */
    api_key?: string | undefined;
    /**
     * - Instance status
     */
    status: string;
    /**
     * - Client ID for OAuth
     */
    client_id?: string | undefined;
    /**
     * - Client secret for OAuth
     */
    client_secret?: string | undefined;
};
export type ValidationResult = {
    /**
     * - Whether validation passed
     */
    isValid: boolean;
    /**
     * - Error message if validation failed
     */
    error?: string | undefined;
    /**
     * - HTTP status code for error
     */
    statusCode?: number | undefined;
};
export type AuthenticatedRequest = Request & {
    airtableApiKey?: string;
    instanceId?: string;
    userId?: string;
    instance?: InstanceData;
    cacheHit?: boolean;
};
export type RequestWithHeaders = import('http').IncomingMessage & {
    headers: Record<string, string | undefined>;
};
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */
/**
 * @typedef {Object} CachedCredential
 * @property {string} api_key - API key
 * @property {string} expires_at - Expiration timestamp
 * @property {string} user_id - User ID
 */
/**
 * @typedef {Object} InstanceData
 * @property {string} user_id - User ID
 * @property {string} [expires_at] - Expiration timestamp
 * @property {string} [api_key] - API key
 * @property {string} status - Instance status
 * @property {string} [client_id] - Client ID for OAuth
 * @property {string} [client_secret] - Client secret for OAuth
 */
/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 * @property {number} [statusCode] - HTTP status code for error
 */
/**
 * @typedef {Request & {airtableApiKey?: string, instanceId?: string, userId?: string, instance?: InstanceData, cacheHit?: boolean}} AuthenticatedRequest
 */
/**
 * @typedef {import('http').IncomingMessage & {headers: Record<string, string | undefined>}} RequestWithHeaders
 */
/**
 * Create credential authentication middleware with caching
 * This is the new primary middleware that replaces instance-auth for better performance
 * @returns {(req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response>} Express middleware function
 */
export function createCredentialAuthMiddleware(): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response>;
/**
 * Create middleware for endpoints that require instance validation but not credential caching
 * Used for health checks and discovery endpoints that don't need API keys
 * @returns {(req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response>} Express middleware function
 */
export function createLightweightAuthMiddleware(): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response>;
/**
 * Create debugging middleware that logs cache performance
 * @returns {(req: AuthenticatedRequest, res: Response, next: NextFunction) => void} Express middleware function
 */
export function createCachePerformanceMiddleware(): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=credentialAuth.d.ts.map