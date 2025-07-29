/**
 * Logs successful token refresh
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export function logSuccessfulTokenRefresh(instanceId: string, userId: string): Promise<void>;
/**
 * Logs failed token refresh
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @param {string} error - Error message
 * @returns {Promise<void>}
 */
export function logFailedTokenRefresh(instanceId: string, userId: string, error: string): Promise<void>;
/**
 * Logs re-authentication required event
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export function logReauthenticationRequired(instanceId: string, userId: string): Promise<void>;
/**
 * Logs OAuth initiation
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export function logOAuthInitiation(instanceId: string, userId: string): Promise<void>;
/**
 * Logs OAuth callback
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @param {boolean} success - Whether callback was successful
 * @returns {Promise<void>}
 */
export function logOAuthCallback(instanceId: string, userId: string, success: boolean): Promise<void>;
/**
 * Logs instance revocation
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export function logInstanceRevocation(instanceId: string, userId: string): Promise<void>;
//# sourceMappingURL=auditLogger.d.ts.map