/**
 * Instance credentials with service information from database query
 */
export type InstanceCredentials = {
    /**
     * - Unique instance identifier
     */
    instance_id: string;
    /**
     * - User ID who owns the instance
     */
    user_id: string;
    /**
     * - OAuth status (pending, completed, failed, expired)
     */
    oauth_status: string;
    /**
     * - Instance status (active, inactive, expired)
     */
    status: string;
    /**
     * - Expiration timestamp
     */
    expires_at: string | null;
    /**
     * - Usage count
     */
    usage_count: number;
    /**
     * - Custom name for the instance
     */
    custom_name: string | null;
    /**
     * - Last usage timestamp
     */
    last_used_at: string | null;
    /**
     * - MCP service name
     */
    mcp_service_name: string;
    /**
     * - Service display name
     */
    display_name: string;
    /**
     * - Service type ('api_key' or 'oauth')
     */
    auth_type: string;
    /**
     * - Whether the service is active
     */
    service_active: boolean;
    /**
     * - Service port
     */
    port: number;
    /**
     * - API key (only for api_key type services)
     */
    api_key: string | null;
    /**
     * - OAuth client ID
     */
    client_id: string | null;
    /**
     * - OAuth client secret
     */
    client_secret: string | null;
    /**
     * - OAuth access token
     */
    access_token: string | null;
    /**
     * - OAuth refresh token
     */
    refresh_token: string | null;
    /**
     * - Token expiration timestamp
     */
    token_expires_at: string | null;
    /**
     * - OAuth completion timestamp
     */
    oauth_completed_at: string | null;
};
/**
 * Instance statistics from database query
 */
export type InstanceStatistics = {
    /**
     * - Unique instance identifier
     */
    instance_id: string;
    /**
     * - User ID who owns the instance
     */
    user_id: string;
    /**
     * - Instance status (active, inactive, expired)
     */
    status: string;
    /**
     * - Usage count
     */
    usage_count: number;
    /**
     * - Last usage timestamp
     */
    last_used_at: string | null;
    /**
     * - Creation timestamp
     */
    created_at: string;
    /**
     * - Expiration timestamp
     */
    expires_at: string | null;
    /**
     * - Custom name for the instance
     */
    custom_name: string | null;
    /**
     * - MCP service name
     */
    mcp_service_name: string;
    /**
     * - Service display name
     */
    display_name: string;
};
/**
 * Active Dropbox instance record from database query
 */
export type ActiveDropboxInstance = {
    /**
     * - Unique instance identifier
     */
    instance_id: string;
    /**
     * - User ID who owns the instance
     */
    user_id: string;
    /**
     * - Usage count
     */
    usage_count: number;
    /**
     * - Last usage timestamp
     */
    last_used_at: string | null;
    /**
     * - Creation timestamp
     */
    created_at: string;
    /**
     * - Custom name for the instance
     */
    custom_name: string | null;
};
/**
 * Instance credentials with service information from database query
 * @typedef {Object} InstanceCredentials
 * @property {string} instance_id - Unique instance identifier
 * @property {string} user_id - User ID who owns the instance
 * @property {string} oauth_status - OAuth status (pending, completed, failed, expired)
 * @property {string} status - Instance status (active, inactive, expired)
 * @property {string|null} expires_at - Expiration timestamp
 * @property {number} usage_count - Usage count
 * @property {string|null} custom_name - Custom name for the instance
 * @property {string|null} last_used_at - Last usage timestamp
 * @property {string} mcp_service_name - MCP service name
 * @property {string} display_name - Service display name
 * @property {string} auth_type - Service type ('api_key' or 'oauth')
 * @property {boolean} service_active - Whether the service is active
 * @property {number} port - Service port
 * @property {string|null} api_key - API key (only for api_key type services)
 * @property {string|null} client_id - OAuth client ID
 * @property {string|null} client_secret - OAuth client secret
 * @property {string|null} access_token - OAuth access token
 * @property {string|null} refresh_token - OAuth refresh token
 * @property {string|null} token_expires_at - Token expiration timestamp
 * @property {string|null} oauth_completed_at - OAuth completion timestamp
 */
/**
 * Lookup instance credentials from database
 * @param {string} instanceId - UUID of the service instance
 * @param {string} serviceName - Name of the MCP service (dropbox)
 * @returns {Promise<InstanceCredentials|null>} Instance credentials or null if not found
 */
export function lookupInstanceCredentials(instanceId: string, serviceName: string): Promise<InstanceCredentials | null>;
/**
 * Update instance usage tracking
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<boolean>} True if update was successful
 */
export function updateInstanceUsage(instanceId: string): Promise<boolean>;
/**
 * Instance statistics from database query
 * @typedef {Object} InstanceStatistics
 * @property {string} instance_id - Unique instance identifier
 * @property {string} user_id - User ID who owns the instance
 * @property {string} status - Instance status (active, inactive, expired)
 * @property {number} usage_count - Usage count
 * @property {string|null} last_used_at - Last usage timestamp
 * @property {string} created_at - Creation timestamp
 * @property {string|null} expires_at - Expiration timestamp
 * @property {string|null} custom_name - Custom name for the instance
 * @property {string} mcp_service_name - MCP service name
 * @property {string} display_name - Service display name
 */
/**
 * Get instance statistics
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<InstanceStatistics|null>} Instance statistics or null if not found
 */
export function getInstanceStatistics(instanceId: string): Promise<InstanceStatistics | null>;
/**
 * Update instance status
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newStatus - New status (active, inactive, expired)
 * @returns {Promise<boolean>} True if update was successful
 */
export function updateInstanceStatus(instanceId: string, newStatus: string): Promise<boolean>;
/**
 * Active Dropbox instance record from database query
 * @typedef {Object} ActiveDropboxInstance
 * @property {string} instance_id - Unique instance identifier
 * @property {string} user_id - User ID who owns the instance
 * @property {number} usage_count - Usage count
 * @property {string|null} last_used_at - Last usage timestamp
 * @property {string} created_at - Creation timestamp
 * @property {string|null} custom_name - Custom name for the instance
 */
/**
 * Get all active instances for Dropbox service
 * @returns {Promise<ActiveDropboxInstance[]>} Array of active instance records
 */
export function getActiveDropboxInstances(): Promise<ActiveDropboxInstance[]>;
/**
 * Validate instance exists and is accessible
 * @param {string} instanceId - UUID of the service instance
 * @param {string} userId - UUID of the user (for additional security)
 * @returns {Promise<boolean>} True if instance is valid and accessible
 */
export function validateInstanceAccess(instanceId: string, userId: string): Promise<boolean>;
/**
 * Clean up expired instances
 * @returns {Promise<number>} Number of instances marked as expired
 */
export function cleanupExpiredInstances(): Promise<number>;
//# sourceMappingURL=database.d.ts.map