export type ExpressRequest = import("express").Request;
export type ExpressResponse = import("express").Response;
export type ExpressNext = import("express").NextFunction;
export type DatabaseInstance = {
    /**
     * - Instance UUID
     */
    instance_id: string;
    /**
     * - User UUID
     */
    user_id: string;
    /**
     * - Service name
     */
    mcp_service_name: string;
    /**
     * - Authentication type (oauth)
     */
    auth_type: string;
    /**
     * - OAuth client ID
     */
    client_id?: string | undefined;
    /**
     * - OAuth client secret
     */
    client_secret?: string | undefined;
    /**
     * - OAuth access token
     */
    access_token?: string | undefined;
    /**
     * - OAuth refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration date
     */
    token_expires_at?: string | Date | null | undefined;
    /**
     * - OAuth status (pending, completed, failed)
     */
    oauth_status: string;
    /**
     * - Instance status (active, inactive, expired)
     */
    status: string;
    /**
     * - Instance expiration date
     */
    expires_at?: string | Date | null | undefined;
    /**
     * - Whether service is active
     */
    service_active: boolean;
    /**
     * - OAuth scopes
     */
    scope?: string | undefined;
    /**
     * - Creation timestamp
     */
    created_at: Date;
    /**
     * - Update timestamp
     */
    updated_at: Date;
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
     * - Token expiration timestamp
     */
    expiresAt: number;
    /**
     * - User UUID
     */
    user_id: string;
    /**
     * - Last used timestamp
     */
    last_used?: Date | undefined;
    /**
     * - Number of refresh attempts
     */
    refresh_attempts?: number | undefined;
    /**
     * - Cache creation timestamp
     */
    cached_at?: Date | undefined;
    /**
     * - Last modification timestamp
     */
    last_modified?: Date | undefined;
    /**
     * - Instance status
     */
    status?: string | undefined;
};
export type TokenInfo = {
    /**
     * - Refresh token
     */
    refreshToken: string | undefined;
    /**
     * - Access token
     */
    accessToken: string | undefined;
    /**
     * - Token expiration timestamp
     */
    tokenExpiresAt: number | null;
};
export type RefreshResult = {
    /**
     * - Whether refresh was successful
     */
    success: boolean;
    /**
     * - Method used (oauth_service or direct_oauth)
     */
    method?: string | undefined;
    /**
     * - Error details if failed
     */
    error?: Object | undefined;
};
export type ValidationResult = {
    /**
     * - Whether validation passed
     */
    isValid: boolean;
    /**
     * - Error response if validation failed
     */
    errorResponse?: import("../types/index.js").ErrorResponse | undefined;
};
export type OAuthTokens = {
    /**
     * - New access token
     */
    access_token: string;
    /**
     * - New refresh token (optional)
     */
    refresh_token?: string | undefined;
    /**
     * - Token lifetime in seconds
     */
    expires_in: number;
    /**
     * - Token scopes
     */
    scope?: string | undefined;
};
//# sourceMappingURL=types.d.ts.map