/**
 * Parse OAuth error and determine appropriate action
 * @param {Error} error - OAuth error
 * @returns {OAuthErrorAnalysis} Error analysis
 */
export function parseOAuthError(error: Error): OAuthErrorAnalysis;
/**
 * Handle token refresh failure with appropriate response
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Refresh error
 * @param {(instanceId: string, update: OAuthStatusUpdate) => Promise<void>} updateOAuthStatus - Database update function
 * @returns {Promise<TokenRefreshFailureResponse>} Error response details
 */
export function handleTokenRefreshFailure(instanceId: string, error: Error, updateOAuthStatus: (instanceId: string, update: OAuthStatusUpdate) => Promise<void>): Promise<TokenRefreshFailureResponse>;
/**
 * Determine if error should trigger retry logic
 * @param {Error} error - OAuth error
 * @param {number} attempt - Current attempt number
 * @param {number} maxAttempts - Maximum attempts allowed
 * @returns {boolean} Whether to retry
 */
export function shouldRetryOAuthError(error: Error, attempt: number, maxAttempts: number): boolean;
/**
 * Get appropriate delay for retry attempt
 * @param {number} attempt - Current attempt number
 * @param {Error} error - OAuth error
 * @returns {number} Delay in milliseconds
 */
export function getRetryDelay(attempt: number, error: Error): number;
/**
 * Log OAuth error with appropriate level
 * @param {Error} error - OAuth error
 * @param {string} context - Error context
 * @param {string} instanceId - Instance ID
 */
export function logOAuthError(error: Error, context: string, instanceId: string): void;
/**
 * Create standardized error response for OAuth failures
 * @param {string} instanceId - Instance ID
 * @param {Error} error - OAuth error
 * @param {string} context - Error context
 * @returns {OAuthErrorResponse} Standardized error response
 */
export function createOAuthErrorResponse(instanceId: string, error: Error, context: string): OAuthErrorResponse;
/**
 * OAuth error handling utilities for Google Drive service
 * Provides centralized error classification and handling logic
 */
/**
 * @typedef {'INVALID_REFRESH_TOKEN' | 'INVALID_CLIENT' | 'INVALID_REQUEST' | 'NETWORK_ERROR' | 'SERVICE_UNAVAILABLE' | 'UNKNOWN_ERROR'} OAuthErrorType
 */
/**
 * @typedef {'error' | 'warn' | 'info'} LogLevel
 */
/**
 * @typedef {Object} OAuthErrorAnalysis
 * @property {OAuthErrorType} type
 * @property {boolean} requiresReauth
 * @property {string} userMessage
 * @property {boolean} shouldRetry
 * @property {LogLevel} logLevel
 */
/**
 * @typedef {Object} TokenRefreshFailureResponse
 * @property {string} instanceId
 * @property {string} error
 * @property {OAuthErrorType} errorCode
 * @property {boolean} requiresReauth
 * @property {boolean} shouldRetry
 * @property {LogLevel} logLevel
 * @property {string} originalError
 */
/**
 * @typedef {Object} OAuthErrorResponse
 * @property {boolean} success
 * @property {string} instanceId
 * @property {string} context
 * @property {string} error
 * @property {OAuthErrorType} errorCode
 * @property {boolean} requiresReauth
 * @property {boolean} shouldRetry
 * @property {string} timestamp
 * @property {Object} metadata
 * @property {string} metadata.originalError
 * @property {OAuthErrorType} metadata.errorType
 * @property {LogLevel} metadata.logLevel
 */
/**
 * @typedef {Object} OAuthStatusUpdate
 * @property {'failed'} status
 * @property {null} accessToken
 * @property {null} refreshToken
 * @property {null} tokenExpiresAt
 * @property {null} scope
 */
/**
 * OAuth error types
 * @type {Record<string, OAuthErrorType>}
 */
export const OAUTH_ERROR_TYPES: Record<string, OAuthErrorType>;
export type OAuthErrorType = "INVALID_REFRESH_TOKEN" | "INVALID_CLIENT" | "INVALID_REQUEST" | "NETWORK_ERROR" | "SERVICE_UNAVAILABLE" | "UNKNOWN_ERROR";
export type LogLevel = "error" | "warn" | "info";
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
    status: "failed";
    accessToken: null;
    refreshToken: null;
    tokenExpiresAt: null;
    scope: null;
};
//# sourceMappingURL=oauthErrorHandler.d.ts.map