/**
 * Create audit log for successful token refresh
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh (oauth_service or direct_oauth)
 * @param {string} userId - The user ID
 * @param {import('./types.js').TokenRefreshMetadata} metadata - Additional metadata
 * @returns {Promise<void>} Promise that resolves when audit log is created
 */
export function logSuccessfulTokenRefresh(instanceId: string, method: string, userId: string, metadata: import('./types.js').TokenRefreshMetadata): Promise<void>;
/**
 * Create audit log for failed token refresh
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh (oauth_service or direct_oauth)
 * @param {string} userId - The user ID
 * @param {string} errorType - Error type classification
 * @param {string} errorMessage - Error message
 * @param {import('./types.js').TokenRefreshErrorInfo} metadata - Additional metadata
 * @returns {Promise<void>} Promise that resolves when audit log is created
 */
export function logFailedTokenRefresh(instanceId: string, method: string, userId: string, errorType: string, errorMessage: string, metadata: import('./types.js').TokenRefreshErrorInfo): Promise<void>;
/**
 * Create audit log for re-authentication requirement
 * @param {string} instanceId - The instance ID
 * @param {string} userId - The user ID
 * @param {boolean} hasRefreshToken - Whether refresh token was available
 * @param {boolean} hasAccessToken - Whether access token was available
 * @param {boolean|string} tokenExpired - Whether token was expired
 * @returns {Promise<void>} Promise that resolves when audit log is created
 */
export function logReauthenticationRequired(instanceId: string, userId: string, hasRefreshToken: boolean, hasAccessToken: boolean, tokenExpired: boolean | string): Promise<void>;
/**
 * Create comprehensive audit log entry with error handling
 * @param {import('./types.js').TokenAuditLogEntry} logEntry - The audit log entry object
 * @returns {Promise<void>} Promise that resolves when audit log is created
 */
export function createAuditLogEntry(logEntry: import('./types.js').TokenAuditLogEntry): Promise<void>;
/**
 * Create audit log for token validation success
 * @param {string} instanceId - The instance ID
 * @param {string} userId - The user ID
 * @param {string} source - Source of the token (cache, database)
 * @returns {Promise<void>} Promise that resolves when audit log is created
 */
export function logTokenValidationSuccess(instanceId: string, userId: string, source: string): Promise<void>;
//# sourceMappingURL=auditLogger.d.ts.map