/**
 * Log successful token refresh event
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh
 * @param {string} userId - User ID
 * @param {Object} metadata - Additional metadata
 * @param {number} [metadata.duration] - Refresh duration in ms
 * @param {number} [metadata.expiresIn] - Token expiration time in seconds
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export function logSuccessfulTokenRefresh(instanceId: string, method: string, userId: string, metadata?: {
    duration?: number | undefined;
    expiresIn?: number | undefined;
}): Promise<void>;
/**
 * Log failed token refresh event
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh
 * @param {string} userId - User ID
 * @param {string} errorType - Type of error that occurred
 * @param {string} errorMessage - Error message
 * @param {Object} errorInfo - Additional error information
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export function logFailedTokenRefresh(instanceId: string, method: string, userId: string, errorType: string, errorMessage: string, errorInfo?: Object): Promise<void>;
/**
 * Log re-authentication required event
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {boolean} hadRefreshToken - Whether a refresh token was available
 * @param {boolean} hadAccessToken - Whether an access token was available
 * @param {boolean | string} tokenExpired - Whether the token was expired
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export function logReauthenticationRequired(instanceId: string, userId: string, hadRefreshToken: boolean, hadAccessToken: boolean, tokenExpired: boolean | string): Promise<void>;
/**
 * Log token validation success
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {string} source - Source of the token (cache, database)
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export function logTokenValidationSuccess(instanceId: string, userId: string, source: string): Promise<void>;
/**
 * Log OAuth flow initiation
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {string[]} scopes - OAuth scopes requested
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export function logOAuthFlowInitiation(instanceId: string, userId: string, scopes: string[]): Promise<void>;
/**
 * Log OAuth callback completion
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {boolean} success - Whether callback was successful
 * @param {string} [errorMessage] - Error message if callback failed
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export function logOAuthCallbackCompletion(instanceId: string, userId: string, success: boolean, errorMessage?: string): Promise<void>;
/**
 * Create general audit log entry
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {string} action - Action performed
 * @param {string} method - Method used
 * @param {boolean} success - Whether action was successful
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export function createAuditLogEntry(instanceId: string, userId: string, action: string, method: string, success: boolean, metadata?: Object): Promise<void>;
declare namespace _default {
    export { logSuccessfulTokenRefresh };
    export { logFailedTokenRefresh };
    export { logReauthenticationRequired };
    export { logTokenValidationSuccess };
    export { logOAuthFlowInitiation };
    export { logOAuthCallbackCompletion };
    export { createAuditLogEntry };
}
export default _default;
//# sourceMappingURL=auditLogger.d.ts.map