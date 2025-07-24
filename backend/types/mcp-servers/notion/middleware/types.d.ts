/**
 * Cached credential object stored in memory
 */
export type CachedCredential = {
    /**
     * - The access token
     */
    bearerToken: string;
    /**
     * - The refresh token
     */
    refreshToken: string;
    /**
     * - Token expiration timestamp
     */
    expiresAt: number;
    /**
     * - Associated user ID
     */
    user_id: string;
};
/**
 * Database instance object from lookupInstanceCredentials
 */
export type DatabaseInstance = {
    /**
     * - The instance ID
     */
    instanceId: string;
    /**
     * - Whether the service is active
     */
    service_active: boolean;
    /**
     * - Instance status
     */
    status: "active" | "inactive" | "expired";
    /**
     * - Instance expiration timestamp
     */
    expires_at?: string | undefined;
    /**
     * - Authentication type
     */
    auth_type: "oauth";
    /**
     * - OAuth client ID
     */
    client_id: string;
    /**
     * - OAuth client secret
     */
    client_secret: string;
    /**
     * - Associated user ID
     */
    user_id: string;
    /**
     * - Database stored access token
     */
    access_token?: string | undefined;
    /**
     * - Database stored refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Database token expiration timestamp
     */
    token_expires_at?: string | undefined;
    /**
     * - When credentials were last updated
     */
    credentials_updated_at?: string | undefined;
    /**
     * - Service name
     */
    mcp_service_name: string;
};
/**
 * Extended cached credential object with additional properties
 */
export type ExtendedCachedCredential = CachedCredential & {
    cached_at?: string;
    refresh_attempts?: number;
    scope?: string;
    last_used?: string;
};
/**
 * Service configuration object
 */
export type ServiceConfig = {
    /**
     * - Service name
     */
    name: string;
    /**
     * - Display name
     */
    displayName: string;
    /**
     * - Service version
     */
    version: string;
    /**
     * - Service port
     */
    port?: number | undefined;
    /**
     * - Authentication type
     */
    authType?: string | undefined;
    /**
     * - Service description
     */
    description?: string | undefined;
    /**
     * - OAuth scopes
     */
    scopes?: string[] | undefined;
};
/**
 * Token refresh error object
 */
export type TokenRefreshError = {
    /**
     * - Error message
     */
    message: string;
    /**
     * - Error type classification
     */
    errorType: string;
    /**
     * - Original error message
     */
    originalError: string;
    /**
     * - Error name
     */
    name: string;
};
/**
 * Token refresh result object
 */
export type TokenRefreshResult = {
    /**
     * - Whether refresh was successful
     */
    success: boolean;
    /**
     * - Success metadata
     */
    metadata?: {
        /**
         * - Method used for refresh
         */
        method?: string | undefined;
        /**
         * - Time taken in ms
         */
        duration?: number | undefined;
    } | undefined;
    /**
     * - Error information
     */
    error?: TokenRefreshError | undefined;
    /**
     * - Additional error context
     */
    errorInfo?: {
        /**
         * - Method that failed
         */
        method?: string | undefined;
    } | undefined;
};
/**
 * Express request with authentication data
 */
export type ExpressRequest = import("express").Request & {
    instanceId?: string;
    bearerToken?: string;
    userId?: string;
    params: {
        instanceId: string;
    };
};
/**
 * Express response object
 */
export type ExpressResponse = import("express").Response;
/**
 * Express next function
 */
export type ExpressNext = import("express").NextFunction;
/**
 * Instance validation result
 */
export type InstanceValidationResult = {
    /**
     * - Whether validation passed
     */
    isValid: boolean;
    /**
     * - Error response if validation failed
     */
    errorResponse?: any;
};
/**
 * New tokens from refresh operation
 */
export type NewTokens = {
    /**
     * - New access token
     */
    access_token: string;
    /**
     * - New refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration in seconds
     */
    expires_in: number;
};
/**
 * Error handling result
 */
export type ErrorHandlingResult = {
    /**
     * - Whether re-authentication is required
     */
    requiresReauth: boolean;
    /**
     * - Error message
     */
    message: string;
    /**
     * - OAuth redirect URL if re-auth needed
     */
    redirectUrl?: string | undefined;
};
//# sourceMappingURL=types.d.ts.map