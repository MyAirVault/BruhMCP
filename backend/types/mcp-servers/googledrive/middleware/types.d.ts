export type OAuthTokens = {
    /**
     * - OAuth access token
     */
    access_token: string;
    /**
     * - OAuth refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration time in seconds
     */
    expires_in: number;
    /**
     * - OAuth scopes
     */
    scope?: string | undefined;
};
export type CachedCredential = {
    /**
     * - OAuth access token
     */
    bearerToken: string;
    /**
     * - OAuth refresh token
     */
    refreshToken?: string | undefined;
    /**
     * - Unix timestamp when token expires
     */
    expiresAt: number;
    /**
     * - UUID of the user
     */
    user_id: string;
    /**
     * - Unix timestamp of last use
     */
    last_used: number;
    /**
     * - Number of refresh attempts
     */
    refresh_attempts: number;
    /**
     * - Unix timestamp when cached
     */
    cached_at: number;
    /**
     * - Unix timestamp of last modification
     */
    last_modified: number;
    /**
     * - Instance status
     */
    status: string;
};
export type DatabaseInstance = {
    /**
     * - UUID of the instance
     */
    instance_id: string;
    /**
     * - UUID of the user
     */
    user_id: string;
    /**
     * - Service name (googledrive)
     */
    service_name: string;
    /**
     * - OAuth client ID
     */
    client_id: string;
    /**
     * - OAuth client secret
     */
    client_secret: string;
    /**
     * - OAuth access token
     */
    bearer_token?: string | undefined;
    /**
     * - OAuth refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Unix timestamp when bearer token expires
     */
    bearer_token_expires_at?: number | undefined;
    /**
     * - Instance status (active/inactive)
     */
    status: string;
    /**
     * - OAuth status (pending/completed)
     */
    oauth_status: string;
    /**
     * - Whether service is active
     */
    service_active: boolean;
    /**
     * - Instance display name
     */
    instance_name?: string | undefined;
    /**
     * - Last access timestamp
     */
    last_accessed: Date;
    /**
     * - Token expiration timestamp
     */
    expires_at?: number | undefined;
};
export type TokenRefreshResult = {
    /**
     * - Whether refresh was successful
     */
    success: boolean;
    /**
     * - New tokens if successful
     */
    tokens?: OAuthTokens | undefined;
    /**
     * - Error message if failed
     */
    error?: string | undefined;
    /**
     * - Whether re-authentication is required
     */
    requiresReauth?: boolean | undefined;
};
export type ValidationResult = {
    /**
     * - Whether validation passed
     */
    isValid: boolean;
    /**
     * - Error response if validation failed
     */
    errorResponse?: any;
};
export type ExpressRequest = import("express").Request & {
    instanceId?: string;
    userId?: string;
    bearerToken?: string;
    params: {
        instanceId: string;
    };
};
export type ExpressResponse = import("express").Response;
export type ExpressNext = import("express").NextFunction;
//# sourceMappingURL=types.d.ts.map