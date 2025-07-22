/**
 * @typedef {Object} MCPInstanceFilters
 * @property {string} [status] - Filter by instance status
 * @property {boolean} [isActive] - Filter by active status
 * @property {string} [mcp_type] - Filter by MCP service type
 * @property {string} [expiration_option] - Filter by expiration option
 * @property {number} [limit] - Limit number of results
 * @property {number} [offset] - Offset for pagination
 */
/**
 * @typedef {Object} MCPInstanceRecord
 * @property {string} instance_id - Unique instance identifier
 * @property {string} user_id - User ID who owns the instance
 * @property {string} custom_name - Custom name for the instance
 * @property {number} [instance_number] - Instance number
 * @property {string} [expiration_option] - Expiration option
 * @property {string} status - Instance status (active, inactive, expired)
 * @property {string} oauth_status - OAuth status (pending, completed, failed, expired)
 * @property {Date|null} expires_at - Expiration timestamp
 * @property {Date|null} last_used_at - Last usage timestamp
 * @property {number} usage_count - Usage count
 * @property {number} renewed_count - Renewal count
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 * @property {string} mcp_service_name - MCP service name
 * @property {string} display_name - Service display name
 * @property {string} type - Service type
 * @property {number} port - Service port
 * @property {string} icon_url_path - Icon URL path
 * @property {Date|null} oauth_completed_at - OAuth completion timestamp
 * @property {Date|null} token_expires_at - Token expiration timestamp
 * @property {string} [api_key] - API key (only in detailed views)
 * @property {string} [client_id] - OAuth client ID (only in detailed views)
 * @property {string} [client_secret] - OAuth client secret (only in detailed views)
 * @property {string} [access_token] - OAuth access token (only in detailed views)
 * @property {string} [refresh_token] - OAuth refresh token (only in detailed views)
 */
/**
 * @typedef {Object} MCPInstanceUpdateData
 * @property {string} [custom_name] - Custom name for the instance
 * @property {string} [status] - Instance status
 * @property {Date} [expires_at] - Expiration timestamp
 * @property {string} [api_key] - API key
 * @property {string} [client_id] - OAuth client ID
 * @property {string} [client_secret] - OAuth client secret
 */
/**
 * @typedef {Object} MCPInstanceCreateData
 * @property {string} userId - User ID
 * @property {string} mcpServiceId - MCP service ID
 * @property {string} customName - Custom name for the instance
 * @property {string} [apiKey] - API key for api_key type services
 * @property {string} [clientId] - Client ID for oauth type services
 * @property {string} [clientSecret] - Client secret for oauth type services
 * @property {Date} [expiresAt] - Expiration date
 * @property {string} serviceType - Service type ('api_key' or 'oauth')
 */
/**
 * @typedef {Object} OAuthUpdateData
 * @property {string} status - OAuth status ('completed', 'failed', 'expired')
 * @property {string} [accessToken] - Access token
 * @property {string} [refreshToken] - Refresh token
 * @property {Date} [tokenExpiresAt] - Token expiration date
 * @property {string} [scope] - OAuth scope
 * @property {number} [expectedVersion] - Expected version for optimistic locking
 */
/**
 * @typedef {Object} MCPServiceStatsUpdate
 * @property {number} [activeInstancesIncrement] - Increment active instances by this amount
 */
/**
 * @typedef {Object} TokenAuditData
 * @property {string} instanceId - Instance ID
 * @property {string} operation - Operation type (refresh, revoke, validate, etc.)
 * @property {string} status - Operation status (success, failure, pending)
 * @property {string} [method] - Method used (oauth_service, direct_oauth)
 * @property {string} [errorType] - Error type if failed
 * @property {string} [errorMessage] - Error message if failed
 * @property {Object} [metadata] - Additional metadata
 * @property {string} [userId] - User ID (optional)
 */
/**
 * @typedef {Object} AuditLogOptions
 * @property {number} [limit] - Limit number of results (default: 50)
 * @property {number} [offset] - Offset for pagination (default: 0)
 * @property {string} [operation] - Filter by operation type
 * @property {string} [status] - Filter by status
 * @property {Date} [since] - Get logs since this date
 */
/**
 * @typedef {Object} AuditLogRecord
 * @property {string} audit_id - Audit log ID
 * @property {string} instance_id - Instance ID
 * @property {string} user_id - User ID
 * @property {string} operation - Operation type
 * @property {string} status - Operation status
 * @property {string} method - Method used
 * @property {string} error_type - Error type
 * @property {string} error_message - Error message
 * @property {Object|null} metadata - Additional metadata
 * @property {Date} created_at - Creation timestamp
 */
/**
 * @typedef {Object} InstanceStatusRecord
 * @property {string} instance_id - Instance ID
 * @property {string} user_id - User ID
 * @property {string} status - Instance status
 * @property {Date|null} expires_at - Expiration timestamp
 * @property {Date} updated_at - Last update timestamp
 * @property {string} mcp_service_name - MCP service name
 */
/**
 * @typedef {Object} CreateInstanceResult
 * @property {boolean} success - Whether creation was successful
 * @property {string} [reason] - Reason for failure
 * @property {string} [message] - Human readable message
 * @property {MCPInstanceRecord} [instance] - Created instance (on success)
 * @property {number} [currentCount] - Current active instance count
 * @property {number} [maxInstances] - Maximum allowed instances
 * @property {string} [error] - Error message (on failure)
 */
/**
 * @typedef {Object} AuditStats
 * @property {number} totalOperations - Total number of operations
 * @property {Object<string, number>} operationsByType - Operations grouped by type
 * @property {Object<string, number>} operationsByStatus - Operations grouped by status
 * @property {Object<string, number>} operationsByMethod - Operations grouped by method
 * @property {Object<string, number>} errorsByType - Errors grouped by type
 * @property {Object<string, {total: number, success: number, failure: number}>} dailyBreakdown - Daily statistics
 */
/**
 * Get all MCP instances for a user
 * @param {string} userId - User ID
 * @param {MCPInstanceFilters} [filters={}] - Optional filters
 * @returns {Promise<MCPInstanceRecord[]>} Array of MCP instance records
 */
export function getAllMCPInstances(userId: string, filters?: MCPInstanceFilters): Promise<MCPInstanceRecord[]>;
/**
 * Get single MCP instance by ID
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<MCPInstanceRecord|null>} MCP instance record or null
 */
export function getMCPInstanceById(instanceId: string, userId: string): Promise<MCPInstanceRecord | null>;
/**
 * Update MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {MCPInstanceUpdateData} updateData - Data to update
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
export function updateMCPInstance(instanceId: string, userId: string, updateData: MCPInstanceUpdateData): Promise<MCPInstanceRecord | null>;
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
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
export function toggleMCPInstance(instanceId: string, userId: string, isActive: boolean): Promise<MCPInstanceRecord | null>;
/**
 * Renew MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {Date} newExpirationDate - New expiration date
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
export function renewMCPInstance(instanceId: string, userId: string, newExpirationDate: Date): Promise<MCPInstanceRecord | null>;
/**
 * Update instance status only
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} status - New status (active, inactive, expired)
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
export function updateInstanceStatus(instanceId: string, userId: string, status: string): Promise<MCPInstanceRecord | null>;
/**
 * Update instance expiration and activate
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} newExpirationDate - New expiration date
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
export function renewInstanceExpiration(instanceId: string, userId: string, newExpirationDate: string): Promise<MCPInstanceRecord | null>;
/**
 * Get instances by status (for background maintenance)
 * @param {string} status - Status to filter by
 * @returns {Promise<InstanceStatusRecord[]>} Array of instances with the specified status
 */
export function getInstancesByStatus(status: string): Promise<InstanceStatusRecord[]>;
/**
 * Get expired instances (for background cleanup)
 * @returns {Promise<InstanceStatusRecord[]>} Array of expired instances
 */
export function getExpiredInstances(): Promise<InstanceStatusRecord[]>;
/**
 * Get failed OAuth instances (for background cleanup)
 * @returns {Promise<InstanceStatusRecord[]>} Array of instances with failed OAuth status
 */
export function getFailedOAuthInstances(): Promise<InstanceStatusRecord[]>;
/**
 * Get pending OAuth instances older than specified minutes (for background cleanup)
 * @param {number} [minutesOld=5] - Minutes threshold (default: 5)
 * @returns {Promise<InstanceStatusRecord[]>} Array of instances with pending OAuth status older than threshold
 */
export function getPendingOAuthInstances(minutesOld?: number): Promise<InstanceStatusRecord[]>;
/**
 * Bulk update expired instances to expired status
 * @param {string[]} instanceIds - Array of instance IDs to mark as expired
 * @returns {Promise<number>} Number of instances updated
 */
export function bulkMarkInstancesExpired(instanceIds: string[]): Promise<number>;
/**
 * Get user instance count by status (only counts completed OAuth instances)
 * @param {string} userId - User ID
 * @param {string|null} [status=null] - Optional status filter (if not provided, counts active instances only)
 * @returns {Promise<number>} Number of instances with completed OAuth
 */
export function getUserInstanceCount(userId: string, status?: string | null): Promise<number>;
/**
 * Create new MCP instance with transaction support
 * @param {MCPInstanceCreateData} instanceData - Instance data
 * @returns {Promise<MCPInstanceRecord>} Created instance record
 */
export function createMCPInstance(instanceData: MCPInstanceCreateData): Promise<MCPInstanceRecord>;
/**
 * Create MCP instance with atomic plan limit checking
 * @param {MCPInstanceCreateData} instanceData - Instance data
 * @param {number|null} maxInstances - Maximum allowed active instances (null = unlimited)
 * @returns {Promise<CreateInstanceResult>} Created instance record or error
 */
export function createMCPInstanceWithLimitCheck(instanceData: MCPInstanceCreateData, maxInstances: number | null): Promise<CreateInstanceResult>;
/**
 * Update OAuth status and tokens for an instance
 * @param {string} instanceId - Instance ID
 * @param {OAuthUpdateData} oauthData - OAuth data
 * @returns {Promise<MCPInstanceRecord>} Updated instance record
 */
export function updateOAuthStatus(instanceId: string, oauthData: OAuthUpdateData): Promise<MCPInstanceRecord>;
/**
 * Update OAuth status and tokens with optimistic locking
 * @param {string} instanceId - Instance ID
 * @param {OAuthUpdateData} oauthData - OAuth data
 * @param {number} [maxRetries=3] - Maximum retry attempts (default: 3)
 * @returns {Promise<MCPInstanceRecord>} Updated instance record
 */
export function updateOAuthStatusWithLocking(instanceId: string, oauthData: OAuthUpdateData, maxRetries?: number): Promise<MCPInstanceRecord>;
/**
 * Update MCP service statistics (increment counters)
 * @param {string} serviceId - Service ID
 * @param {MCPServiceStatsUpdate} updates - Statistics updates
 * @returns {Promise<MCPInstanceRecord|null>} Updated service record
 */
export function updateMCPServiceStats(serviceId: string, updates: MCPServiceStatsUpdate): Promise<MCPInstanceRecord | null>;
/**
 * Create audit log entry for token operations
 * @param {TokenAuditData} auditData - Audit data
 * @returns {Promise<AuditLogRecord|null>} Created audit log entry
 */
export function createTokenAuditLog(auditData: TokenAuditData): Promise<AuditLogRecord | null>;
/**
 * Get audit logs for an instance
 * @param {string} instanceId - Instance ID
 * @param {AuditLogOptions} [options={}] - Query options
 * @returns {Promise<AuditLogRecord[]>} Array of audit log entries
 */
export function getTokenAuditLogs(instanceId: string, options?: AuditLogOptions): Promise<AuditLogRecord[]>;
/**
 * Get audit log statistics
 * @param {string|undefined} [instanceId] - Instance ID (optional, for all instances if not provided)
 * @param {number} [days=30] - Number of days to include (default: 30)
 * @returns {Promise<AuditStats>} Audit statistics
 */
export function getTokenAuditStats(instanceId?: string | undefined, days?: number): Promise<AuditStats>;
/**
 * Clean up old audit logs
 * @param {number} [daysToKeep=90] - Number of days to keep (default: 90)
 * @returns {Promise<number>} Number of deleted records
 */
export function cleanupTokenAuditLogs(daysToKeep?: number): Promise<number>;
export type MCPInstanceFilters = {
    /**
     * - Filter by instance status
     */
    status?: string | undefined;
    /**
     * - Filter by active status
     */
    isActive?: boolean | undefined;
    /**
     * - Filter by MCP service type
     */
    mcp_type?: string | undefined;
    /**
     * - Filter by expiration option
     */
    expiration_option?: string | undefined;
    /**
     * - Limit number of results
     */
    limit?: number | undefined;
    /**
     * - Offset for pagination
     */
    offset?: number | undefined;
};
export type MCPInstanceRecord = {
    /**
     * - Unique instance identifier
     */
    instance_id: string;
    /**
     * - User ID who owns the instance
     */
    user_id: string;
    /**
     * - Custom name for the instance
     */
    custom_name: string;
    /**
     * - Instance number
     */
    instance_number?: number | undefined;
    /**
     * - Expiration option
     */
    expiration_option?: string | undefined;
    /**
     * - Instance status (active, inactive, expired)
     */
    status: string;
    /**
     * - OAuth status (pending, completed, failed, expired)
     */
    oauth_status: string;
    /**
     * - Expiration timestamp
     */
    expires_at: Date | null;
    /**
     * - Last usage timestamp
     */
    last_used_at: Date | null;
    /**
     * - Usage count
     */
    usage_count: number;
    /**
     * - Renewal count
     */
    renewed_count: number;
    /**
     * - Creation timestamp
     */
    created_at: Date;
    /**
     * - Last update timestamp
     */
    updated_at: Date;
    /**
     * - MCP service name
     */
    mcp_service_name: string;
    /**
     * - Service display name
     */
    display_name: string;
    /**
     * - Service type
     */
    type: string;
    /**
     * - Service port
     */
    port: number;
    /**
     * - Icon URL path
     */
    icon_url_path: string;
    /**
     * - OAuth completion timestamp
     */
    oauth_completed_at: Date | null;
    /**
     * - Token expiration timestamp
     */
    token_expires_at: Date | null;
    /**
     * - API key (only in detailed views)
     */
    api_key?: string | undefined;
    /**
     * - OAuth client ID (only in detailed views)
     */
    client_id?: string | undefined;
    /**
     * - OAuth client secret (only in detailed views)
     */
    client_secret?: string | undefined;
    /**
     * - OAuth access token (only in detailed views)
     */
    access_token?: string | undefined;
    /**
     * - OAuth refresh token (only in detailed views)
     */
    refresh_token?: string | undefined;
};
export type MCPInstanceUpdateData = {
    /**
     * - Custom name for the instance
     */
    custom_name?: string | undefined;
    /**
     * - Instance status
     */
    status?: string | undefined;
    /**
     * - Expiration timestamp
     */
    expires_at?: Date | undefined;
    /**
     * - API key
     */
    api_key?: string | undefined;
    /**
     * - OAuth client ID
     */
    client_id?: string | undefined;
    /**
     * - OAuth client secret
     */
    client_secret?: string | undefined;
};
export type MCPInstanceCreateData = {
    /**
     * - User ID
     */
    userId: string;
    /**
     * - MCP service ID
     */
    mcpServiceId: string;
    /**
     * - Custom name for the instance
     */
    customName: string;
    /**
     * - API key for api_key type services
     */
    apiKey?: string | undefined;
    /**
     * - Client ID for oauth type services
     */
    clientId?: string | undefined;
    /**
     * - Client secret for oauth type services
     */
    clientSecret?: string | undefined;
    /**
     * - Expiration date
     */
    expiresAt?: Date | undefined;
    /**
     * - Service type ('api_key' or 'oauth')
     */
    serviceType: string;
};
export type OAuthUpdateData = {
    /**
     * - OAuth status ('completed', 'failed', 'expired')
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
    /**
     * - Expected version for optimistic locking
     */
    expectedVersion?: number | undefined;
};
export type MCPServiceStatsUpdate = {
    /**
     * - Increment active instances by this amount
     */
    activeInstancesIncrement?: number | undefined;
};
export type TokenAuditData = {
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - Operation type (refresh, revoke, validate, etc.)
     */
    operation: string;
    /**
     * - Operation status (success, failure, pending)
     */
    status: string;
    /**
     * - Method used (oauth_service, direct_oauth)
     */
    method?: string | undefined;
    /**
     * - Error type if failed
     */
    errorType?: string | undefined;
    /**
     * - Error message if failed
     */
    errorMessage?: string | undefined;
    /**
     * - Additional metadata
     */
    metadata?: Object | undefined;
    /**
     * - User ID (optional)
     */
    userId?: string | undefined;
};
export type AuditLogOptions = {
    /**
     * - Limit number of results (default: 50)
     */
    limit?: number | undefined;
    /**
     * - Offset for pagination (default: 0)
     */
    offset?: number | undefined;
    /**
     * - Filter by operation type
     */
    operation?: string | undefined;
    /**
     * - Filter by status
     */
    status?: string | undefined;
    /**
     * - Get logs since this date
     */
    since?: Date | undefined;
};
export type AuditLogRecord = {
    /**
     * - Audit log ID
     */
    audit_id: string;
    /**
     * - Instance ID
     */
    instance_id: string;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - Operation type
     */
    operation: string;
    /**
     * - Operation status
     */
    status: string;
    /**
     * - Method used
     */
    method: string;
    /**
     * - Error type
     */
    error_type: string;
    /**
     * - Error message
     */
    error_message: string;
    /**
     * - Additional metadata
     */
    metadata: Object | null;
    /**
     * - Creation timestamp
     */
    created_at: Date;
};
export type InstanceStatusRecord = {
    /**
     * - Instance ID
     */
    instance_id: string;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - Instance status
     */
    status: string;
    /**
     * - Expiration timestamp
     */
    expires_at: Date | null;
    /**
     * - Last update timestamp
     */
    updated_at: Date;
    /**
     * - MCP service name
     */
    mcp_service_name: string;
};
export type CreateInstanceResult = {
    /**
     * - Whether creation was successful
     */
    success: boolean;
    /**
     * - Reason for failure
     */
    reason?: string | undefined;
    /**
     * - Human readable message
     */
    message?: string | undefined;
    /**
     * - Created instance (on success)
     */
    instance?: MCPInstanceRecord | undefined;
    /**
     * - Current active instance count
     */
    currentCount?: number | undefined;
    /**
     * - Maximum allowed instances
     */
    maxInstances?: number | undefined;
    /**
     * - Error message (on failure)
     */
    error?: string | undefined;
};
export type AuditStats = {
    /**
     * - Total number of operations
     */
    totalOperations: number;
    /**
     * - Operations grouped by type
     */
    operationsByType: {
        [x: string]: number;
    };
    /**
     * - Operations grouped by status
     */
    operationsByStatus: {
        [x: string]: number;
    };
    /**
     * - Operations grouped by method
     */
    operationsByMethod: {
        [x: string]: number;
    };
    /**
     * - Errors grouped by type
     */
    errorsByType: {
        [x: string]: number;
    };
    /**
     * - Daily statistics
     */
    dailyBreakdown: {
        [x: string]: {
            total: number;
            success: number;
            failure: number;
        };
    };
};
//# sourceMappingURL=mcpInstancesQueries.d.ts.map