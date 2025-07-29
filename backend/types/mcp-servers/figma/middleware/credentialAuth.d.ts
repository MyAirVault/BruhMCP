export type Request = import('express').Request;
export type Response = import('express').Response;
export type NextFunction = import('express').NextFunction;
export type CachedCredential = {
    /**
     * - The Figma Personal Access Token
     */
    credential: string;
    /**
     * - Instance expiration timestamp
     */
    expires_at: string;
    /**
     * - User ID who owns this instance
     */
    user_id: string;
    /**
     * - Last usage timestamp
     */
    last_used: string;
    /**
     * - Number of refresh attempts
     */
    refresh_attempts: number;
    /**
     * - When it was cached
     */
    cached_at: string;
    /**
     * - Optional instance status
     */
    status?: string | undefined;
    /**
     * - Optional last modified timestamp
     */
    last_modified?: string | undefined;
};
export type InstanceCredentials = {
    /**
     * - Instance ID
     */
    instance_id: string;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - OAuth status
     */
    oauth_status: string;
    /**
     * - Instance status
     */
    status: string;
    /**
     * - Expiration timestamp
     */
    expires_at: string;
    /**
     * - Last used timestamp
     */
    last_used_at: string;
    /**
     * - Usage count
     */
    usage_count: number;
    /**
     * - Custom name
     */
    custom_name: string;
    /**
     * - Service name
     */
    mcp_service_name: string;
    /**
     * - Display name
     */
    display_name: string;
    /**
     * - Auth type ('api_key' or 'oauth')
     */
    auth_type: string;
    /**
     * - Service active status
     */
    service_active: boolean;
    /**
     * - API key
     */
    api_key?: string | undefined;
    /**
     * - Client ID
     */
    client_id?: string | undefined;
    /**
     * - Client secret
     */
    client_secret?: string | undefined;
    /**
     * - Access token
     */
    access_token?: string | undefined;
    /**
     * - Refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration
     */
    token_expires_at?: string | undefined;
    /**
     * - OAuth completion time
     */
    oauth_completed_at?: string | undefined;
};
export type ValidationResult = {
    /**
     * - Whether the instance is valid
     */
    isValid: boolean;
    /**
     * - Error message if invalid
     */
    error?: string | undefined;
    /**
     * - HTTP status code if invalid
     */
    statusCode?: number | undefined;
};
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */
/**
 * @typedef {Object} CachedCredential
 * @property {string} credential - The Figma Personal Access Token
 * @property {string} expires_at - Instance expiration timestamp
 * @property {string} user_id - User ID who owns this instance
 * @property {string} last_used - Last usage timestamp
 * @property {number} refresh_attempts - Number of refresh attempts
 * @property {string} cached_at - When it was cached
 * @property {string} [status] - Optional instance status
 * @property {string} [last_modified] - Optional last modified timestamp
 */
/**
 * @typedef {Object} InstanceCredentials
 * @property {string} instance_id - Instance ID
 * @property {string} user_id - User ID
 * @property {string} oauth_status - OAuth status
 * @property {string} status - Instance status
 * @property {string} expires_at - Expiration timestamp
 * @property {string} last_used_at - Last used timestamp
 * @property {number} usage_count - Usage count
 * @property {string} custom_name - Custom name
 * @property {string} mcp_service_name - Service name
 * @property {string} display_name - Display name
 * @property {string} auth_type - Auth type ('api_key' or 'oauth')
 * @property {boolean} service_active - Service active status
 * @property {string} [api_key] - API key
 * @property {string} [client_id] - Client ID
 * @property {string} [client_secret] - Client secret
 * @property {string} [access_token] - Access token
 * @property {string} [refresh_token] - Refresh token
 * @property {string} [token_expires_at] - Token expiration
 * @property {string} [oauth_completed_at] - OAuth completion time
 */
/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the instance is valid
 * @property {string} [error] - Error message if invalid
 * @property {number} [statusCode] - HTTP status code if invalid
 */
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
//# sourceMappingURL=credentialAuth.d.ts.map