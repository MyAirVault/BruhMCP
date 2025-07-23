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
//# sourceMappingURL=types.d.ts.map