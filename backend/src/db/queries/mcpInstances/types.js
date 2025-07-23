/**
 * TypeScript/JSDoc type definitions for MCP instances operations
 * @fileoverview Contains all type definitions used across MCP instance modules
 */

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

// Export empty object to make this a module (types are available via import)
export {};