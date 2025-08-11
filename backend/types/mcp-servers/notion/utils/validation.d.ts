export type NotionParent = {
    /**
     * - Parent type
     */
    type: "page_id" | "database_id" | "workspace";
    /**
     * - Page ID if type is 'page_id'
     */
    page_id?: string | undefined;
    /**
     * - Database ID if type is 'database_id'
     */
    database_id?: string | undefined;
};
export type NotionPageCreationData = {
    /**
     * - Parent object
     */
    parent: NotionParent;
    /**
     * - Page properties
     */
    properties?: Record<string, any> | undefined;
    /**
     * - Child blocks
     */
    children?: any[] | undefined;
};
export type NotionDatabaseCreationData = {
    /**
     * - Parent object
     */
    parent: NotionParent;
    /**
     * - Database title
     */
    title: Array<any>;
    /**
     * - Database properties
     */
    properties: Record<string, any>;
};
export type NotionBlockData = {
    /**
     * - Block type
     */
    type: string;
    /**
     * - Block properties
     */
    properties?: Record<string, any> | undefined;
};
export type ValidationResult = {
    /**
     * - Whether validation passed
     */
    valid: boolean;
    /**
     * - Array of error messages
     */
    errors: string[];
};
export type LogMetadata = Record<string, any>;
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
 * @param {NotionPageCreationData} pageData - Page creation data
 * @returns {ValidationResult} Validation result
 */
export function validatePageCreationData(pageData: NotionPageCreationData): ValidationResult;
/**
 * Validate database creation data
 * @param {NotionDatabaseCreationData} databaseData - Database creation data
 * @returns {ValidationResult} Validation result
 */
export function validateDatabaseCreationData(databaseData: NotionDatabaseCreationData): ValidationResult;
/**
 * Validate block data
 * @param {NotionBlockData} blockData - Block data
 * @returns {ValidationResult} Validation result
 */
export function validateBlockData(blockData: NotionBlockData): ValidationResult;
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
export namespace Logger {
    /**
     * Log info message
     * @param {string} message - Log message
     * @param {LogMetadata} [metadata] - Additional metadata
     */
    function info(message: string, metadata?: LogMetadata): void;
    /**
     * Log error message
     * @param {string} message - Log message
     * @param {Error|LogMetadata} [error] - Error object or metadata
     */
    function error(message: string, error?: Error | LogMetadata): void;
    /**
     * Log general message
     * @param {string} message - Log message
     * @param {LogMetadata} [metadata] - Additional metadata
     */
    function log(message: string, metadata?: LogMetadata): void;
}
//# sourceMappingURL=validation.d.ts.map