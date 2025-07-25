/**
 * Input validation utilities for Notion MCP service
 */

/**
 * @typedef {Object} NotionParent
 * @property {'page_id'|'database_id'|'workspace'} type - Parent type
 * @property {string} [page_id] - Page ID if type is 'page_id'
 * @property {string} [database_id] - Database ID if type is 'database_id'
 */

/**
 * @typedef {Object} NotionPageCreationData
 * @property {NotionParent} parent - Parent object
 * @property {Record<string, any>} [properties] - Page properties
 * @property {Array<any>} [children] - Child blocks
 */

/**
 * @typedef {Object} NotionDatabaseCreationData
 * @property {NotionParent} parent - Parent object
 * @property {Array<any>} title - Database title
 * @property {Record<string, any>} properties - Database properties
 */

/**
 * @typedef {Object} NotionBlockData
 * @property {string} type - Block type
 * @property {Record<string, any>} [properties] - Block properties
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string[]} errors - Array of error messages
 */

/**
 * @typedef {Record<string, any>} LogMetadata
 */

/**
 * Validate Notion page ID
 * @param {string} pageId - Page ID to validate
 * @returns {boolean} True if valid
 */
export function isValidPageId(pageId) {
	if (!pageId || typeof pageId !== 'string') {
		return false;
	}

	// Notion IDs are UUIDs with dashes removed, 32 characters long
	const cleanId = pageId.replace(/-/g, '');
	return /^[0-9a-f]{32}$/i.test(cleanId);
}

/**
 * Validate Notion database ID
 * @param {string} databaseId - Database ID to validate
 * @returns {boolean} True if valid
 */
export function isValidDatabaseId(databaseId) {
	return isValidPageId(databaseId); // Same format as page IDs
}

/**
 * Validate Notion block ID
 * @param {string} blockId - Block ID to validate
 * @returns {boolean} True if valid
 */
export function isValidBlockId(blockId) {
	return isValidPageId(blockId); // Same format as page IDs
}

/**
 * Validate Notion user ID
 * @param {string} userId - User ID to validate
 * @returns {boolean} True if valid
 */
export function isValidUserId(userId) {
	return isValidPageId(userId); // Same format as page IDs
}

/**
 * Validate search query
 * @param {string} query - Search query to validate
 * @returns {boolean} True if valid
 */
export function isValidSearchQuery(query) {
	if (!query || typeof query !== 'string') {
		return false;
	}

	// Basic validation - not empty and reasonable length
	return query.trim().length > 0 && query.length <= 1000;
}

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid format
 */
export function isValidApiKey(apiKey) {
	if (!apiKey || typeof apiKey !== 'string') {
		return false;
	}

	// Notion API keys start with "secret_" and contain alphanumeric characters
	return /^secret_[a-zA-Z0-9]+$/.test(apiKey);
}

/**
 * Validate page creation data
 * @param {NotionPageCreationData} pageData - Page creation data
 * @returns {ValidationResult} Validation result
 */
export function validatePageCreationData(pageData) {
	const errors = [];

	if (!pageData || typeof pageData !== 'object') {
		errors.push('Page data must be an object');
		return { valid: false, errors };
	}

	// Validate parent
	if (!pageData.parent || typeof pageData.parent !== 'object') {
		errors.push('Parent is required');
	} else {
		if (pageData.parent.type === 'page_id' && pageData.parent.page_id && !isValidPageId(pageData.parent.page_id)) {
			errors.push('Invalid parent page ID');
		}
		if (pageData.parent.type === 'database_id' && pageData.parent.database_id && !isValidDatabaseId(pageData.parent.database_id)) {
			errors.push('Invalid parent database ID');
		}
	}

	// Validate properties (if provided)
	if (pageData.properties && typeof pageData.properties !== 'object') {
		errors.push('Properties must be an object');
	}

	// Validate children (if provided)
	if (pageData.children && !Array.isArray(pageData.children)) {
		errors.push('Children must be an array');
	}

	return { valid: errors.length === 0, errors };
}

/**
 * Validate database creation data
 * @param {NotionDatabaseCreationData} databaseData - Database creation data
 * @returns {ValidationResult} Validation result
 */
export function validateDatabaseCreationData(databaseData) {
	const errors = [];

	if (!databaseData || typeof databaseData !== 'object') {
		errors.push('Database data must be an object');
		return { valid: false, errors };
	}

	// Validate parent
	if (!databaseData.parent || typeof databaseData.parent !== 'object') {
		errors.push('Parent is required');
	} else {
		if (databaseData.parent.type === 'page_id' && databaseData.parent.page_id && !isValidPageId(databaseData.parent.page_id)) {
			errors.push('Invalid parent page ID');
		}
	}

	// Validate title
	if (!databaseData.title || !Array.isArray(databaseData.title)) {
		errors.push('Title is required and must be an array');
	}

	// Validate properties
	if (!databaseData.properties || typeof databaseData.properties !== 'object') {
		errors.push('Properties are required and must be an object');
	}

	return { valid: errors.length === 0, errors };
}

/**
 * Validate block data
 * @param {NotionBlockData} blockData - Block data
 * @returns {ValidationResult} Validation result
 */
export function validateBlockData(blockData) {
	const errors = [];

	if (!blockData || typeof blockData !== 'object') {
		errors.push('Block data must be an object');
		return { valid: false, errors };
	}

	// Validate type
	if (!blockData.type || typeof blockData.type !== 'string') {
		errors.push('Block type is required');
	}

	// Validate that block has properties if needed
	if (blockData.type && blockData.properties && typeof blockData.properties !== 'object') {
		errors.push(`Block properties must be an object`);
	}

	return { valid: errors.length === 0, errors };
}

/**
 * Validate pagination cursor
 * @param {string} cursor - Pagination cursor
 * @returns {boolean} True if valid
 */
export function isValidCursor(cursor) {
	if (!cursor || typeof cursor !== 'string') {
		return false;
	}

	// Notion cursors are UUIDs with dashes removed
	const cleanCursor = cursor.replace(/-/g, '');
	return /^[0-9a-f]{32}$/i.test(cleanCursor);
}

/**
 * Sanitize search query
 * @param {string} query - Search query
 * @returns {string} Sanitized query
 */
export function sanitizeSearchQuery(query) {
	if (!query || typeof query !== 'string') {
		return '';
	}

	// Remove potentially problematic characters and limit length
	return query.trim().substring(0, 1000);
}

/**
 * Sanitize page ID
 * @param {string} pageId - Page ID
 * @returns {string} Sanitized page ID
 */
export function sanitizePageId(pageId) {
	if (!pageId || typeof pageId !== 'string') {
		return '';
	}

	// Remove non-alphanumeric characters except dashes
	return pageId.replace(/[^a-zA-Z0-9-]/g, '');
}

/**
 * Simple Logger utility for MCP service
 */
export const Logger = {
	/**
	 * Log info message
	 * @param {string} message - Log message
	 * @param {LogMetadata} [metadata] - Additional metadata
	 */
	info(message, metadata = {}) {
		console.log(`[INFO] ${message}`, metadata);
	},

	/**
	 * Log error message
	 * @param {string} message - Log message
	 * @param {Error|LogMetadata} [error] - Error object or metadata
	 */
	error(message, error = {}) {
		console.error(`[ERROR] ${message}`, error);
	},

	/**
	 * Log general message
	 * @param {string} message - Log message
	 * @param {LogMetadata} [metadata] - Additional metadata
	 */
	log(message, metadata = {}) {
		console.log(`[LOG] ${message}`, metadata);
	}
};
