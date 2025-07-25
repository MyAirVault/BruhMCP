/**
 * OAuth Error Handler for Notion MCP Service
 * Handles OAuth-specific error scenarios and token refresh failures
 */
/**
 * @typedef {Error & {
 *   errorType?: string,
 *   statusCode?: number,
 *   originalError?: Error,
 *   response?: {
 *     status: number,
 *     data?: { message?: string }
 *   },
 *   code?: string
 * }} ExtendedError
 */
/**
 * @typedef {Object} OAuthStatusUpdate
 * @property {string} status
 * @property {string|null} accessToken
 * @property {string|null} refreshToken
 * @property {Date|null} tokenExpiresAt
 * @property {string|null} scope
 */
/**
 * @typedef {Object} TokenRefreshResponse
 * @property {string} instanceId
 * @property {string} error
 * @property {string} errorCode
 * @property {boolean} requiresReauth
 */
/**
 * @typedef {Object} ErrorResponse
 * @property {string} message
 * @property {number} code
 * @property {number} statusCode
 * @property {string} details
 */
/**
 * @typedef {Object} OAuthErrorObject
 * @property {string} errorType
 * @property {string} message
 * @property {number} statusCode
 * @property {Error} [originalError]
 * @property {string} timestamp
 */
/**
 * Handle token refresh failures with appropriate error mapping
 * @param {string} instanceId - The instance ID
 * @param {ExtendedError} error - The refresh error
 * @param {function(string, OAuthStatusUpdate): Promise<void>} updateOAuthStatus - Function to update OAuth status
 * @returns {Promise<TokenRefreshResponse>} Error response object
 */
export function handleTokenRefreshFailure(instanceId: string, error: ExtendedError, updateOAuthStatus: (arg0: string, arg1: OAuthStatusUpdate) => Promise<void>): Promise<TokenRefreshResponse>;
/**
 * Log OAuth errors with appropriate context
 * @param {ExtendedError} error - The OAuth error
 * @param {string} operation - The operation that failed
 * @param {string} instanceId - The instance ID
 * @returns {void}
 */
export function logOAuthError(error: ExtendedError, operation: string, instanceId: string): void;
/**
 * Create standardized OAuth error response
 * @param {string} errorType - The error type
 * @param {string} message - Error message
 * @param {{originalError?: Error} & Object} [metadata={}] - Additional error metadata
 * @returns {OAuthErrorObject} Standardized error object
 */
export function createOAuthError(errorType: string, message: string, metadata?: {
    originalError?: Error;
} & Object): OAuthErrorObject;
/**
 * Handle Notion-specific API errors and OAuth errors
 * @param {ExtendedError} error - The error to handle
 * @returns {ErrorResponse} Formatted error response
 */
export function handleNotionError(error: ExtendedError): ErrorResponse;
export type ExtendedError = Error & {
    errorType?: string;
    statusCode?: number;
    originalError?: Error;
    response?: {
        status: number;
        data?: {
            message?: string;
        };
    };
    code?: string;
};
export type OAuthStatusUpdate = {
    status: string;
    accessToken: string | null;
    refreshToken: string | null;
    tokenExpiresAt: Date | null;
    scope: string | null;
};
export type TokenRefreshResponse = {
    instanceId: string;
    error: string;
    errorCode: string;
    requiresReauth: boolean;
};
export type ErrorResponse = {
    message: string;
    code: number;
    statusCode: number;
    details: string;
};
export type OAuthErrorObject = {
    errorType: string;
    message: string;
    statusCode: number;
    originalError?: Error | undefined;
    timestamp: string;
};
//# sourceMappingURL=oauthErrorHandler.d.ts.map