export type CachedCredential = {
    /**
     * - OAuth Bearer token
     */
    bearerToken: string;
    /**
     * - OAuth refresh token
     */
    refreshToken: string;
    /**
     * - Token expiration timestamp
     */
    expiresAt: number;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - Last used timestamp
     */
    last_used?: string | undefined;
};
export type DatabaseInstance = {
    /**
     * - Instance UUID
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
     * - Instance expiration date
     */
    expires_at: string | null;
    /**
     * - Usage count
     */
    usage_count: number;
    /**
     * - Custom name
     */
    custom_name: string | null;
    /**
     * - Last used timestamp
     */
    last_used_at: string | null;
    /**
     * - Service name
     */
    mcp_service_name: string;
    /**
     * - Display name
     */
    display_name: string;
    /**
     * - Authentication type
     */
    auth_type: string;
    /**
     * - Service active status
     */
    service_active: boolean;
    /**
     * - Service port
     */
    port: number;
    /**
     * - API key
     */
    api_key: string | null;
    /**
     * - OAuth client ID
     */
    client_id: string | null;
    /**
     * - OAuth client secret
     */
    client_secret: string | null;
    /**
     * - OAuth access token
     */
    access_token: string | null;
    /**
     * - OAuth refresh token
     */
    refresh_token: string | null;
    /**
     * - Token expiration date
     */
    token_expires_at: string | null;
    /**
     * - OAuth completion date
     */
    oauth_completed_at: string | null;
};
export type TokenRefreshParams = {
    /**
     * - Refresh token
     */
    refreshToken: string;
    /**
     * - OAuth client ID
     */
    clientId: string;
    /**
     * - OAuth client secret
     */
    clientSecret: string;
};
export type NewTokens = {
    /**
     * - New access token
     */
    access_token: string;
    /**
     * - New refresh token (optional)
     */
    refresh_token: string | null;
    /**
     * - Token expiration in seconds
     */
    expires_in: number;
    /**
     * - Token scope
     */
    scope?: string | undefined;
};
export type OAuthStatusUpdate = {
    /**
     * - OAuth status
     */
    status: string;
    /**
     * - Access token
     */
    accessToken: string | null | undefined;
    /**
     * - Refresh token
     */
    refreshToken: string | null | undefined;
    /**
     * - Token expiration date
     */
    tokenExpiresAt: Date | null | undefined;
    /**
     * - Token scope
     */
    scope: string | null | undefined;
};
export type TokenAuditLogParams = {
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - Operation type
     */
    operation: string;
    /**
     * - Operation status
     */
    status: string;
    /**
     * - Method used
     */
    method: string;
    /**
     * - Error type
     */
    errorType?: string | undefined;
    /**
     * - Error message
     */
    errorMessage?: string | undefined;
    /**
     * - User ID
     */
    userId: string;
    /**
     * - Additional metadata
     */
    metadata?: Object | undefined;
};
export type TokenRefreshError = {
    /**
     * - Error message
     */
    message: string;
    /**
     * - Error type
     */
    errorType: string;
    /**
     * - Original error message
     */
    originalError: string;
};
export type TokenRefreshFailureResponse = {
    /**
     * - Whether re-authentication is required
     */
    requiresReauth: boolean;
    /**
     * - Error message
     */
    error: string;
    /**
     * - Error code
     */
    errorCode: string;
    /**
     * - Instance ID
     */
    instanceId: string;
};
/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createCredentialAuthMiddleware(): import("express").RequestHandler;
/**
 * Create lightweight authentication middleware for non-critical endpoints
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createLightweightAuthMiddleware(): import("express").RequestHandler;
/**
 * Create cache performance monitoring middleware for development
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createCachePerformanceMiddleware(): import("express").RequestHandler;
//# sourceMappingURL=credentialAuth.d.ts.map