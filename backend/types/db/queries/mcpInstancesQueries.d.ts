/**
 * Get all MCP instances for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 */
export function getAllMCPInstances(userId: string, filters?: Object): Promise<any[]>;
/**
 * Get single MCP instance by ID
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} MCP instance record or null
 */
export function getMCPInstanceById(instanceId: string, userId: string): Promise<Object | null>;
/**
 * Update MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export function updateMCPInstance(instanceId: string, userId: string, updateData: Object): Promise<Object | null>;
/**
 * Delete MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
export function deleteMCPInstance(instanceId: string, userId: string): Promise<boolean>;
/**
 * Toggle MCP instance status
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {boolean} isActive - New active status
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export function toggleMCPInstance(instanceId: string, userId: string, isActive: boolean): Promise<Object | null>;
/**
 * Renew MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {Date} newExpirationDate - New expiration date
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export function renewMCPInstance(instanceId: string, userId: string, newExpirationDate: Date): Promise<Object | null>;
/**
 * Update instance status only
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} status - New status (active, inactive, expired)
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export function updateInstanceStatus(instanceId: string, userId: string, status: string): Promise<Object | null>;
/**
 * Update instance expiration and activate
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} newExpirationDate - New expiration date
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export function renewInstanceExpiration(instanceId: string, userId: string, newExpirationDate: string): Promise<Object | null>;
/**
 * Get instances by status (for background maintenance)
 * @param {string} status - Status to filter by
 * @returns {Promise<Array>} Array of instances with the specified status
 */
export function getInstancesByStatus(status: string): Promise<any[]>;
/**
 * Get expired instances (for background cleanup)
 * @returns {Promise<Array>} Array of expired instances
 */
export function getExpiredInstances(): Promise<any[]>;
/**
 * Get failed OAuth instances (for background cleanup)
 * @returns {Promise<Array>} Array of instances with failed OAuth status
 */
export function getFailedOAuthInstances(): Promise<any[]>;
/**
 * Get pending OAuth instances older than specified minutes (for background cleanup)
 * @param {number} minutesOld - Minutes threshold (default: 5)
 * @returns {Promise<Array>} Array of instances with pending OAuth status older than threshold
 */
export function getPendingOAuthInstances(minutesOld?: number): Promise<any[]>;
/**
 * Bulk update expired instances to expired status
 * @param {Array<string>} instanceIds - Array of instance IDs to mark as expired
 * @returns {Promise<number>} Number of instances updated
 */
export function bulkMarkInstancesExpired(instanceIds: Array<string>): Promise<number>;
/**
 * Get user instance count by status (only counts completed OAuth instances)
 * @param {string} userId - User ID
 * @param {string} [status] - Optional status filter (if not provided, counts active instances only)
 * @returns {Promise<number>} Number of instances with completed OAuth
 */
export function getUserInstanceCount(userId: string, status?: string): Promise<number>;
/**
 * Create new MCP instance with transaction support
 * @param {Object} instanceData - Instance data
 * @param {string} instanceData.userId - User ID
 * @param {string} instanceData.mcpServiceId - MCP service ID
 * @param {string} instanceData.customName - Custom instance name
 * @param {string} [instanceData.apiKey] - API key for api_key type services
 * @param {string} [instanceData.clientId] - Client ID for oauth type services
 * @param {string} [instanceData.clientSecret] - Client secret for oauth type services
 * @param {Date} [instanceData.expiresAt] - Expiration date
 * @returns {Promise<Object>} Created instance record
 */
export function createMCPInstance(instanceData: {
    userId: string;
    mcpServiceId: string;
    customName: string;
    apiKey?: string | undefined;
    clientId?: string | undefined;
    clientSecret?: string | undefined;
    expiresAt?: Date | undefined;
}): Promise<Object>;
/**
 * Create MCP instance with atomic plan limit checking
 * @param {Object} instanceData - Instance data
 * @param {string} instanceData.userId - User ID
 * @param {string} instanceData.mcpServiceId - MCP service ID
 * @param {string} instanceData.customName - Custom instance name
 * @param {string} [instanceData.apiKey] - API key for api_key type services
 * @param {string} [instanceData.clientId] - Client ID for oauth type services
 * @param {string} [instanceData.clientSecret] - Client secret for oauth type services
 * @param {Date} [instanceData.expiresAt] - Expiration date
 * @param {string} instanceData.serviceType - Service type ('api_key' or 'oauth')
 * @param {number|null} maxInstances - Maximum allowed active instances (null = unlimited)
 * @returns {Promise<Object>} Created instance record or error
 */
export function createMCPInstanceWithLimitCheck(instanceData: {
    userId: string;
    mcpServiceId: string;
    customName: string;
    apiKey?: string | undefined;
    clientId?: string | undefined;
    clientSecret?: string | undefined;
    expiresAt?: Date | undefined;
    serviceType: string;
}, maxInstances: number | null): Promise<Object>;
/**
 * Update OAuth status and tokens for an instance
 * @param {string} instanceId - Instance ID
 * @param {Object} oauthData - OAuth data
 * @param {string} oauthData.status - OAuth status ('completed', 'failed', 'expired')
 * @param {string} [oauthData.accessToken] - Access token
 * @param {string} [oauthData.refreshToken] - Refresh token
 * @param {Date} [oauthData.tokenExpiresAt] - Token expiration date
 * @param {string} [oauthData.scope] - OAuth scope
 * @returns {Promise<Object>} Updated instance record
 */
export function updateOAuthStatus(instanceId: string, oauthData: {
    status: string;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    tokenExpiresAt?: Date | undefined;
    scope?: string | undefined;
}): Promise<Object>;
/**
 * Update OAuth status and tokens with optimistic locking
 * @param {string} instanceId - Instance ID
 * @param {Object} oauthData - OAuth data
 * @param {string} oauthData.status - OAuth status ('completed', 'failed', 'expired')
 * @param {string} [oauthData.accessToken] - Access token
 * @param {string} [oauthData.refreshToken] - Refresh token
 * @param {Date} [oauthData.tokenExpiresAt] - Token expiration date
 * @param {string} [oauthData.scope] - OAuth scope
 * @param {number} [oauthData.expectedVersion] - Expected version for optimistic locking
 * @param {number} [maxRetries] - Maximum retry attempts (default: 3)
 * @returns {Promise<Object>} Updated instance record
 */
export function updateOAuthStatusWithLocking(instanceId: string, oauthData: {
    status: string;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    tokenExpiresAt?: Date | undefined;
    scope?: string | undefined;
    expectedVersion?: number | undefined;
}, maxRetries?: number): Promise<Object>;
/**
 * Update MCP service statistics (increment counters)
 * @param {string} serviceId - Service ID
 * @param {Object} updates - Statistics updates
 * @param {number} [updates.activeInstancesIncrement] - Increment active instances by this amount
 * @returns {Promise<Object|null>} Updated service record
 */
export function updateMCPServiceStats(serviceId: string, updates: {
    activeInstancesIncrement?: number | undefined;
}): Promise<Object | null>;
/**
 * Create audit log entry for token operations
 * @param {Object} auditData - Audit data
 * @param {string} auditData.instanceId - Instance ID
 * @param {string} auditData.operation - Operation type (refresh, revoke, validate, etc.)
 * @param {string} auditData.status - Operation status (success, failure, pending)
 * @param {string} [auditData.method] - Method used (oauth_service, direct_oauth)
 * @param {string} [auditData.errorType] - Error type if failed
 * @param {string} [auditData.errorMessage] - Error message if failed
 * @param {Object} [auditData.metadata] - Additional metadata
 * @param {string} [auditData.userId] - User ID (optional)
 * @returns {Promise<Object>} Created audit log entry
 */
export function createTokenAuditLog(auditData: {
    instanceId: string;
    operation: string;
    status: string;
    method?: string | undefined;
    errorType?: string | undefined;
    errorMessage?: string | undefined;
    metadata?: Object | undefined;
    userId?: string | undefined;
}): Promise<Object>;
/**
 * Get audit logs for an instance
 * @param {string} instanceId - Instance ID
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Limit number of results (default: 50)
 * @param {number} [options.offset] - Offset for pagination (default: 0)
 * @param {string} [options.operation] - Filter by operation type
 * @param {string} [options.status] - Filter by status
 * @param {Date} [options.since] - Get logs since this date
 * @returns {Promise<Array>} Array of audit log entries
 */
export function getTokenAuditLogs(instanceId: string, options?: {
    limit?: number | undefined;
    offset?: number | undefined;
    operation?: string | undefined;
    status?: string | undefined;
    since?: Date | undefined;
}): Promise<any[]>;
/**
 * Get audit log statistics
 * @param {string} [instanceId] - Instance ID (optional, for all instances if not provided)
 * @param {number} [days] - Number of days to include (default: 30)
 * @returns {Promise<Object>} Audit statistics
 */
export function getTokenAuditStats(instanceId?: string, days?: number): Promise<Object>;
/**
 * Clean up old audit logs
 * @param {number} daysToKeep - Number of days to keep (default: 90)
 * @returns {Promise<number>} Number of deleted records
 */
export function cleanupTokenAuditLogs(daysToKeep?: number): Promise<number>;
//# sourceMappingURL=mcpInstancesQueries.d.ts.map