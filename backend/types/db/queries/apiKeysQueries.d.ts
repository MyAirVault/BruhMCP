/**
 * Get all API keys for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of API key records
 */
export function getAllAPIKeys(userId: string): Promise<any[]>;
/**
 * Get all API keys for a user (alias for compatibility)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of API key records
 */
export function getAPIKeysByUserId(userId: string): Promise<any[]>;
/**
 * Store API key (create MCP instance)
 * @param {Object} apiKeyData - API key data
 * @returns {Promise<Object>} Created API key record
 */
export function storeAPIKey(apiKeyData: Object): Promise<Object>;
/**
 * Delete API key (delete MCP instance)
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
export function deleteAPIKey(instanceId: string, userId: string): Promise<boolean>;
/**
 * Validate API key credentials against external service
 * @param {Object} credentials - Credentials to validate
 * @returns {Promise<Object>} Validation result
 */
export function validateAPIKeyCredentials(credentials: Object): Promise<Object>;
//# sourceMappingURL=apiKeysQueries.d.ts.map