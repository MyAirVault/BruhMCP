export type OAuthErrorType = 'INVALID_REFRESH_TOKEN' | 'INVALID_CLIENT' | 'INVALID_REQUEST' | 'NETWORK_ERROR' | 'SERVICE_UNAVAILABLE' | 'UNKNOWN_ERROR';
export type LogLevel = 'error' | 'warn' | 'info';
export type OAuthErrorAnalysis = {
    type: OAuthErrorType;
    requiresReauth: boolean;
    userMessage: string;
    shouldRetry: boolean;
    logLevel: LogLevel;
};
export type TokenRefreshFailureResponse = {
    instanceId: string;
    error: string;
    errorCode: OAuthErrorType;
    requiresReauth: boolean;
    shouldRetry: boolean;
    logLevel: LogLevel;
    originalError: string;
};
export type OAuthErrorResponse = {
    success: boolean;
    instanceId: string;
    context: string;
    error: string;
    errorCode: OAuthErrorType;
    requiresReauth: boolean;
    shouldRetry: boolean;
    timestamp: string;
    metadata: {
        originalError: string;
        errorType: OAuthErrorType;
        logLevel: LogLevel;
    };
};
export type OAuthStatusUpdate = {
    status: 'failed';
    accessToken: null;
    refreshToken: null;
    tokenExpiresAt: null;
    scope: null;
};
/**
 * Handle token refresh failure with appropriate response
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Refresh error
 * @param {(instanceId: string, update: OAuthStatusUpdate) => Promise<void>} updateOAuthStatus - Database update function
 * @returns {Promise<TokenRefreshFailureResponse>} Error response details
 */
export function handleTokenRefreshFailure(instanceId: string, error: Error, updateOAuthStatus: (instanceId: string, update: OAuthStatusUpdate) => Promise<void>): Promise<TokenRefreshFailureResponse>;
//# sourceMappingURL=oauthErrorHandler.d.ts.map