/**
 * Get API keys for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of API keys
 */
export function getAPIKeysByUserId(userId: string): Promise<any[]>;
/**
 * Store API key for a user
 * @param {string} userId - User ID
 * @param {string} mcpTypeId - MCP type ID
 * @param {Object} credentials - Credentials object
 * @returns {Promise<Object>} Created API key
 */
export function storeAPIKey(userId: string, mcpTypeId: string, credentials: Object): Promise<Object>;
/**
 * Get API key by ID for a user
 * @param {string} apiKeyId - API key ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} API key or null if not found
 */
export function getAPIKeyById(apiKeyId: string, userId: string): Promise<Object | null>;
/**
 * Delete API key by ID for a user
 * @param {string} apiKeyId - API key ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export function deleteAPIKey(apiKeyId: string, userId: string): Promise<boolean>;
/**
 * Get API key by user ID and MCP type ID
 * @param {string} userId - User ID
 * @param {string} mcpTypeId - MCP type ID
 * @returns {Promise<Object|null>} API key or null if not found
 */
export function getAPIKeyByUserAndType(userId: string, mcpTypeId: string): Promise<Object | null>;
/**
 * Update API key credentials
 * @param {string} apiKeyId - API key ID
 * @param {Object} credentials - New credentials object
 * @returns {Promise<Object>} Updated API key
 */
export function updateAPIKeyCredentials(apiKeyId: string, credentials: Object): Promise<Object>;
//# sourceMappingURL=apiKeysQueries.d.ts.map