/**
 * Check if a value exists and is not null/undefined
 * @param {string} key - Property key
 * @param {Object} obj - Object to check
 * @param {Function} validator - Optional validator function
 * @returns {boolean} True if value exists and is valid
 */
export function hasValue(key: string, obj: Object, validator?: Function): boolean;
/**
 * Generate a unique variable ID
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export function generateVarId(prefix?: string): string;
/**
 * Download image from URL (placeholder for Notion images)
 * @param {string} fileName - File name
 * @param {string} localPath - Local path to save
 * @param {string} imageUrl - Image URL
 * @returns {Promise<string>} Downloaded file path
 */
export function downloadNotionImage(fileName: string, localPath: string, imageUrl: string): Promise<string>;
/**
 * Parse Notion rich text to extract plain text
 * @param {Array} richText - Notion rich text array
 * @returns {string} Plain text
 */
export function parseRichText(richText: any[]): string;
/**
 * Check if a Notion object is visible (not archived)
 * @param {Object} obj - Notion object
 * @returns {boolean} True if visible
 */
export function isVisible(obj: Object): boolean;
/**
 * Remove empty keys from an object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
export function removeEmptyKeys(obj: Object): Object;
/**
 * Format date to ISO string
 * @param {Date|string} date - Date to format
 * @returns {string} ISO formatted date
 */
export function formatDate(date: Date | string): string;
/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text: string, maxLength?: number): string;
/**
 * Extract ID from Notion URL
 * @param {string} url - Notion URL
 * @returns {string|null} Extracted ID
 */
export function extractIdFromUrl(url: string): string | null;
/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID
 */
export function isValidUUID(uuid: string): boolean;
/**
 * Convert Notion ID to UUID format
 * @param {string} id - Notion ID
 * @returns {string} UUID formatted ID
 */
export function formatNotionId(id: string): string;
/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj: any): any;
/**
 * Sanitize text to remove sensitive information like bearer tokens
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeForLog(text: string): string;
//# sourceMappingURL=common.d.ts.map