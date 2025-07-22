/**
 * @typedef {Object} APIKeyRecord
 * @property {string} instance_id - Unique instance identifier
 * @property {string} user_id - User ID who owns the API key
 * @property {string} mcp_service_id - MCP service identifier
 * @property {string} custom_name - Custom name for the API key
 * @property {string} status - Status of the API key
 * @property {Date|null} expires_at - Expiration date
 * @property {Date|null} last_used_at - Last usage timestamp
 * @property {number} usage_count - Number of times used
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether credentials are valid
 * @property {string} message - Validation message
 */
/**
 * Get all API keys for a user
 * @param {string} userId - User ID
 * @returns {Promise<APIKeyRecord[]>} Array of API key records
 */
export function getAllAPIKeys(userId: string): Promise<APIKeyRecord[]>;
/**
 * Get all API keys for a user (alias for compatibility)
 * @param {string} userId - User ID
 * @returns {Promise<APIKeyRecord[]>} Array of API key records
 */
export function getAPIKeysByUserId(userId: string): Promise<APIKeyRecord[]>;
/**
 * Store API key (create MCP instance)
 * @param {Object} _apiKeyData - API key data (unused)
 * @returns {Promise<never>} Throws error - use createMCP endpoint instead
 */
export function storeAPIKey(_apiKeyData: Object): Promise<never>;
/**
 * Delete API key (delete MCP instance)
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
export function deleteAPIKey(instanceId: string, userId: string): Promise<boolean>;
/**
 * Validate API key credentials against external service
 * @param {Object} _credentials - Credentials to validate (unused)
 * @returns {Promise<ValidationResult>} Validation result
 */
export function validateAPIKeyCredentials(_credentials: Object): Promise<ValidationResult>;
export type APIKeyRecord = {
    /**
     * - Unique instance identifier
     */
    instance_id: string;
    /**
     * - User ID who owns the API key
     */
    user_id: string;
    /**
     * - MCP service identifier
     */
    mcp_service_id: string;
    /**
     * - Custom name for the API key
     */
    custom_name: string;
    /**
     * - Status of the API key
     */
    status: string;
    /**
     * - Expiration date
     */
    expires_at: Date | null;
    /**
     * - Last usage timestamp
     */
    last_used_at: Date | null;
    /**
     * - Number of times used
     */
    usage_count: number;
    /**
     * - Creation timestamp
     */
    created_at: Date;
    /**
     * - Last update timestamp
     */
    updated_at: Date;
};
export type ValidationResult = {
    /**
     * - Whether credentials are valid
     */
    valid: boolean;
    /**
     * - Validation message
     */
    message: string;
};
//# sourceMappingURL=apiKeysQueries.d.ts.map