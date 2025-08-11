/**
 * OAuth error analysis result
 */
export type OAuthErrorAnalysis = {
    /**
     * - Error type from OAUTH_ERROR_TYPES
     */
    type: string;
    /**
     * - Whether user needs to re-authenticate
     */
    requiresReauth: boolean;
    /**
     * - User-friendly error message
     */
    userMessage: string;
    /**
     * - Whether operation should be retried
     */
    shouldRetry: boolean;
    /**
     * - Logging level (error, warn, log)
     */
    logLevel: string;
};
/**
 * OAuth status update parameters
 */
export type OAuthStatusUpdate = {
    /**
     * - OAuth status
     */
    status: string;
    /**
     * - Access token
     */
    accessToken?: string | undefined;
    /**
     * - Refresh token
     */
    refreshToken?: string | undefined;
    /**
     * - Token expiration date
     */
    tokenExpiresAt?: Date | undefined;
    /**
     * - OAuth scope
     */
    scope?: string | undefined;
};
/**
 * Token refresh failure response
 */
export type TokenRefreshFailureResponse = {
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - User-friendly error message
     */
    error: string;
    /**
     * - Error code from OAUTH_ERROR_TYPES
     */
    errorCode: string;
    /**
     * - Whether user needs to re-authenticate
     */
    requiresReauth: boolean;
    /**
     * - Whether operation should be retried
     */
    shouldRetry: boolean;
    /**
     * - Logging level
     */
    logLevel: string;
    /**
     * - Original error message
     */
    originalError: string;
};
/**
 * OAuth error response metadata
 */
export type OAuthErrorMetadata = {
    /**
     * - Original error message
     */
    originalError: string;
    /**
     * - Error type from OAUTH_ERROR_TYPES
     */
    errorType: string;
    /**
     * - Logging level
     */
    logLevel: string;
};
/**
 * Standardized OAuth error response
 */
export type OAuthErrorResponse = {
    /**
     * - Always false for error responses
     */
    success: boolean;
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - Error context
     */
    context: string;
    /**
     * - User-friendly error message
     */
    error: string;
    /**
     * - Error code from OAUTH_ERROR_TYPES
     */
    errorCode: string;
    /**
     * - Whether user needs to re-authenticate
     */
    requiresReauth: boolean;
    /**
     * - Whether operation should be retried
     */
    shouldRetry: boolean;
    /**
     * - ISO timestamp of error
     */
    timestamp: string;
    /**
     * - Additional error metadata
     */
    metadata: OAuthErrorMetadata;
};
/**
 * OAuth error types
 */
export type OAUTH_ERROR_TYPES = string;
export namespace OAUTH_ERROR_TYPES {
    let INVALID_REFRESH_TOKEN: string;
    let INVALID_CLIENT: string;
    let INVALID_REQUEST: string;
    let NETWORK_ERROR: string;
    let SERVICE_UNAVAILABLE: string;
    let UNKNOWN_ERROR: string;
}
/**
 * OAuth error analysis result
 * @typedef {Object} OAuthErrorAnalysis
 * @property {string} type - Error type from OAUTH_ERROR_TYPES
 * @property {boolean} requiresReauth - Whether user needs to re-authenticate
 * @property {string} userMessage - User-friendly error message
 * @property {boolean} shouldRetry - Whether operation should be retried
 * @property {string} logLevel - Logging level (error, warn, log)
 */
/**
 * Parse OAuth error and determine appropriate action
 * @param {Error & {code?: string, name?: string}} error - OAuth error with optional code and name properties
 * @returns {OAuthErrorAnalysis} Error analysis
 */
export function parseOAuthError(error: Error & {
    code?: string;
    name?: string;
}): OAuthErrorAnalysis;
/**
 * OAuth status update parameters
 * @typedef {Object} OAuthStatusUpdate
 * @property {string} status - OAuth status
 * @property {string} [accessToken] - Access token
 * @property {string} [refreshToken] - Refresh token
 * @property {Date} [tokenExpiresAt] - Token expiration date
 * @property {string} [scope] - OAuth scope
 */
/**
 * Token refresh failure response
 * @typedef {Object} TokenRefreshFailureResponse
 * @property {string} instanceId - Instance ID
 * @property {string} error - User-friendly error message
 * @property {string} errorCode - Error code from OAUTH_ERROR_TYPES
 * @property {boolean} requiresReauth - Whether user needs to re-authenticate
 * @property {boolean} shouldRetry - Whether operation should be retried
 * @property {string} logLevel - Logging level
 * @property {string} originalError - Original error message
 */
/**
 * Handle token refresh failure with appropriate response
 * @param {string} instanceId - Instance ID
 * @param {Error & {code?: string, name?: string}} error - Refresh error with optional code and name properties
 * @param {function(string, import('../../../db/queries/mcpInstances/types.js').OAuthUpdateData): Promise<import('../../../db/queries/mcpInstances/types.js').MCPInstanceRecord>} updateOAuthStatus - Database update function
 * @returns {Promise<TokenRefreshFailureResponse>} Error response details
 */
export function handleTokenRefreshFailure(instanceId: string, error: Error & {
    code?: string;
    name?: string;
}, updateOAuthStatus: (arg0: string, arg1: import("../../../db/queries/mcpInstances/types.js").OAuthUpdateData) => Promise<import("../../../db/queries/mcpInstances/types.js").MCPInstanceRecord>): Promise<TokenRefreshFailureResponse>;
/**
 * Determine if error should trigger retry logic
 * @param {Error & {code?: string, name?: string}} error - OAuth error with optional code and name properties
 * @param {number} attempt - Current attempt number
 * @param {number} maxAttempts - Maximum attempts allowed
 * @returns {boolean} Whether to retry
 */
export function shouldRetryOAuthError(error: Error & {
    code?: string;
    name?: string;
}, attempt: number, maxAttempts: number): boolean;
/**
 * Get appropriate delay for retry attempt
 * @param {number} attempt - Current attempt number
 * @param {Error & {code?: string, name?: string}} error - OAuth error with optional code and name properties
 * @returns {number} Delay in milliseconds
 */
export function getRetryDelay(attempt: number, error: Error & {
    code?: string;
    name?: string;
}): number;
/**
 * Log OAuth error with appropriate level
 * @param {Error & {code?: string, name?: string}} error - OAuth error with optional code and name properties
 * @param {string} context - Error context
 * @param {string} instanceId - Instance ID
 * @returns {void}
 */
export function logOAuthError(error: Error & {
    code?: string;
    name?: string;
}, context: string, instanceId: string): void;
/**
 * OAuth error response metadata
 * @typedef {Object} OAuthErrorMetadata
 * @property {string} originalError - Original error message
 * @property {string} errorType - Error type from OAUTH_ERROR_TYPES
 * @property {string} logLevel - Logging level
 */
/**
 * Standardized OAuth error response
 * @typedef {Object} OAuthErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {string} instanceId - Instance ID
 * @property {string} context - Error context
 * @property {string} error - User-friendly error message
 * @property {string} errorCode - Error code from OAUTH_ERROR_TYPES
 * @property {boolean} requiresReauth - Whether user needs to re-authenticate
 * @property {boolean} shouldRetry - Whether operation should be retried
 * @property {string} timestamp - ISO timestamp of error
 * @property {OAuthErrorMetadata} metadata - Additional error metadata
 */
/**
 * Create standardized error response for OAuth failures
 * @param {string} instanceId - Instance ID
 * @param {Error & {code?: string, name?: string}} error - OAuth error with optional code and name properties
 * @param {string} context - Error context
 * @returns {OAuthErrorResponse} Standardized error response
 */
export function createOAuthErrorResponse(instanceId: string, error: Error & {
    code?: string;
    name?: string;
}, context: string): OAuthErrorResponse;
//# sourceMappingURL=oauthErrorHandler.d.ts.map