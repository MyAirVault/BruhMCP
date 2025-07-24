/**
 * @fileoverview Audit logging utilities for Google Sheets middleware
 * Handles security and operational logging for OAuth operations
 */
/**
 * Log successful token refresh
 * @param {string} instanceId - Instance ID
 * @param {string} method - Refresh method used
 * @param {number} duration - Operation duration in ms
 * @param {Object} metadata - Additional metadata
 */
export function logSuccessfulTokenRefresh(instanceId: string, method: string, duration: number, metadata?: Object): void;
/**
 * Log failed token refresh
 * @param {string} instanceId - Instance ID
 * @param {string} method - Refresh method attempted
 * @param {Error} error - Error object
 * @param {number} duration - Operation duration in ms
 */
export function logFailedTokenRefresh(instanceId: string, method: string, error: Error, duration: number): void;
/**
 * Log re-authentication required
 * @param {string} instanceId - Instance ID
 * @param {Object} details - Additional details
 */
export function logReauthenticationRequired(instanceId: string, details?: Object): void;
//# sourceMappingURL=auditLogger.d.ts.map