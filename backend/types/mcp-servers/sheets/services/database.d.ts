export type InstanceCredentials = {
    /**
     * - UUID of the service instance
     */
    instance_id: string;
    /**
     * - UUID of the user
     */
    user_id: string;
    /**
     * - OAuth completion status
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
     * - Number of times instance has been used
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
     * - Last credential update timestamp
     */
    credentials_updated_at: string | null;
    /**
     * - Name of the MCP service
     */
    mcp_service_name: string;
    /**
     * - Display name for the service
     */
    display_name: string;
    /**
     * - Authentication type
     */
    auth_type: string;
    /**
     * - Whether the service is active
     */
    service_active: boolean;
    /**
     * - Service port
     */
    port: number | null;
    /**
     * - API key credential
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
export type InstanceStatistics = {
    /**
     * - UUID of the service instance
     */
    instance_id: string;
    /**
     * - UUID of the user
     */
    user_id: string;
    /**
     * - Instance status
     */
    status: string;
    /**
     * - Number of times instance has been used
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
     * - Name of the MCP service
     */
    mcp_service_name: string;
    /**
     * - Display name for the service
     */
    display_name: string;
};
export type ActiveInstance = {
    /**
     * - UUID of the service instance
     */
    instance_id: string;
    /**
     * - UUID of the user
     */
    user_id: string;
    /**
     * - Number of times instance has been used
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
 * @typedef {Object} InstanceCredentials
 * @property {string} instance_id - UUID of the service instance
 * @property {string} user_id - UUID of the user
 * @property {string} oauth_status - OAuth completion status
 * @property {string} status - Instance status (active, inactive, expired)
 * @property {string|null} expires_at - Expiration timestamp
 * @property {number} usage_count - Number of times instance has been used
 * @property {string|null} custom_name - Custom name for the instance
 * @property {string|null} last_used_at - Last usage timestamp
 * @property {string|null} credentials_updated_at - Last credential update timestamp
 * @property {string} mcp_service_name - Name of the MCP service
 * @property {string} display_name - Display name for the service
 * @property {string} auth_type - Authentication type
 * @property {boolean} service_active - Whether the service is active
 * @property {number|null} port - Service port
 * @property {string|null} api_key - API key credential
 * @property {string|null} client_id - OAuth client ID
 * @property {string|null} client_secret - OAuth client secret
 * @property {string|null} access_token - OAuth access token
 * @property {string|null} refresh_token - OAuth refresh token
 * @property {string|null} token_expires_at - Token expiration timestamp
 * @property {string|null} oauth_completed_at - OAuth completion timestamp
 */
/**
 * @typedef {Object} InstanceStatistics
 * @property {string} instance_id - UUID of the service instance
 * @property {string} user_id - UUID of the user
 * @property {string} status - Instance status
 * @property {number} usage_count - Number of times instance has been used
 * @property {string|null} last_used_at - Last usage timestamp
 * @property {string} created_at - Creation timestamp
 * @property {string|null} expires_at - Expiration timestamp
 * @property {string|null} custom_name - Custom name for the instance
 * @property {string} mcp_service_name - Name of the MCP service
 * @property {string} display_name - Display name for the service
 */
/**
 * @typedef {Object} ActiveInstance
 * @property {string} instance_id - UUID of the service instance
 * @property {string} user_id - UUID of the user
 * @property {number} usage_count - Number of times instance has been used
 * @property {string|null} last_used_at - Last usage timestamp
 * @property {string} created_at - Creation timestamp
 * @property {string|null} custom_name - Custom name for the instance
 */
/**
 * Lookup instance credentials from database
 * @param {string} instanceId - UUID of the service instance
 * @param {string} serviceName - Name of the MCP service (sheets)
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
 * Get all active instances for Google Sheets service
 * @returns {Promise<ActiveInstance[]>} Array of active instance records
 */
export function getActiveSheetsInstances(): Promise<ActiveInstance[]>;
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