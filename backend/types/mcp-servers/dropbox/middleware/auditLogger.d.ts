export type AuditLogData = {
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - User ID
     */
    userId: string;
    /**
     * - Service name
     */
    service: string;
    /**
     * - Timestamp
     */
    timestamp: string;
    /**
     * - Event type
     */
    event: string;
    /**
     * - Success indicator
     */
    success: boolean;
    /**
     * - Method used
     */
    method?: string | undefined;
    /**
     * - Error message
     */
    error?: string | undefined;
};
/**
 * Audit logging utilities for Dropbox OAuth operations
 * Handles security event tracking and compliance logging
 */
/**
 * @typedef {Object} AuditLogData
 * @property {string} instanceId - Instance ID
 * @property {string} userId - User ID
 * @property {string} service - Service name
 * @property {string} timestamp - Timestamp
 * @property {string} event - Event type
 * @property {boolean} success - Success indicator
 * @property {string} [method] - Method used
 * @property {string} [error] - Error message
 */
/**
 * Log OAuth flow initiation
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {string} clientId - OAuth client ID
 * @returns {void}
 */
export function logOAuthInitiation(instanceId: string, userId: string, clientId: string): void;
/**
 * Log OAuth callback processing
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {boolean} success - Whether callback was successful
 * @param {string} [error] - Error message if failed
 * @returns {void}
 */
export function logOAuthCallback(instanceId: string, userId: string, success: boolean, error?: string | undefined): void;
/**
 * Log token refresh attempt
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {boolean} success - Whether refresh was successful
 * @param {string} method - Refresh method used
 * @param {string} [error] - Error message if failed
 * @returns {void}
 */
export function logTokenRefresh(instanceId: string, userId: string, success: boolean, method: string, error?: string | undefined): void;
/**
 * Log token validation attempt
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {boolean} success - Whether validation was successful
 * @param {string} [error] - Error message if failed
 * @returns {void}
 */
export function logTokenValidation(instanceId: string, userId: string, success: boolean, error?: string | undefined): void;
/**
 * Log instance revocation
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {boolean} success - Whether revocation was successful
 * @param {string} [error] - Error message if failed
 * @returns {void}
 */
export function logInstanceRevocation(instanceId: string, userId: string, success: boolean, error?: string | undefined): void;
/**
 * Log security event (failed authentication, suspicious activity, etc.)
 * @param {string} event - Event type
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {string} description - Event description
 * @param {Object} [metadata] - Additional metadata
 * @returns {void}
 */
export function logSecurityEvent(event: string, instanceId: string, userId: string, description: string, metadata?: Object | undefined): void;
/**
 * Log API request with authentication
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {string} endpoint - API endpoint accessed
 * @param {string} method - HTTP method
 * @param {number} statusCode - Response status code
 * @returns {void}
 */
export function logAPIRequest(instanceId: string, userId: string, endpoint: string, method: string, statusCode: number): void;
//# sourceMappingURL=auditLogger.d.ts.map