/**
 * Input validation utilities for Notion MCP service
 */
/**
 * Validate Notion page ID
 * @param {string} pageId - Page ID to validate
 * @returns {boolean} True if valid
 */
export function isValidPageId(pageId: string): boolean;
/**
 * Validate Notion database ID
 * @param {string} databaseId - Database ID to validate
 * @returns {boolean} True if valid
 */
export function isValidDatabaseId(databaseId: string): boolean;
/**
 * Validate Notion block ID
 * @param {string} blockId - Block ID to validate
 * @returns {boolean} True if valid
 */
export function isValidBlockId(blockId: string): boolean;
/**
 * Validate Notion user ID
 * @param {string} userId - User ID to validate
 * @returns {boolean} True if valid
 */
export function isValidUserId(userId: string): boolean;
/**
 * Validate search query
 * @param {string} query - Search query to validate
 * @returns {boolean} True if valid
 */
export function isValidSearchQuery(query: string): boolean;
/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid format
 */
export function isValidApiKey(apiKey: string): boolean;
/**
 * Validate page creation data
 * @param {Object} pageData - Page creation data
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validatePageCreationData(pageData: Object): {
    valid: boolean;
    errors: string[];
};
/**
 * Validate database creation data
 * @param {Object} databaseData - Database creation data
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validateDatabaseCreationData(databaseData: Object): {
    valid: boolean;
    errors: string[];
};
/**
 * Validate block data
 * @param {Object} blockData - Block data
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validateBlockData(blockData: Object): {
    valid: boolean;
    errors: string[];
};
/**
 * Validate pagination cursor
 * @param {string} cursor - Pagination cursor
 * @returns {boolean} True if valid
 */
export function isValidCursor(cursor: string): boolean;
/**
 * Sanitize search query
 * @param {string} query - Search query
 * @returns {string} Sanitized query
 */
export function sanitizeSearchQuery(query: string): string;
/**
 * Sanitize page ID
 * @param {string} pageId - Page ID
 * @returns {string} Sanitized page ID
 */
export function sanitizePageId(pageId: string): string;
//# sourceMappingURL=validation.d.ts.map