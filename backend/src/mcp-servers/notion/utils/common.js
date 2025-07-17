/**
 * Common utilities for Notion MCP service
 */

import { Logger } from './logger.js';

/**
 * Check if a value exists and is not null/undefined
 * @param {string} key - Property key
 * @param {Object} obj - Object to check
 * @param {Function} validator - Optional validator function
 * @returns {boolean} True if value exists and is valid
 */
export function hasValue(key, obj, validator = null) {
	if (!obj || typeof obj !== 'object') {
		return false;
	}

	const value = obj[key];
	if (value === null || value === undefined) {
		return false;
	}

	if (validator && typeof validator === 'function') {
		return validator(value);
	}

	return true;
}

/**
 * Generate a unique variable ID
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export function generateVarId(prefix = 'var') {
	const timestamp = Date.now().toString(36);
	const random = Math.random().toString(36).substr(2, 5);
	return `${prefix}_${timestamp}_${random}`;
}

/**
 * Download image from URL (placeholder for Notion images)
 * @param {string} fileName - File name
 * @param {string} localPath - Local path to save
 * @param {string} imageUrl - Image URL
 * @returns {Promise<string>} Downloaded file path
 */
export async function downloadNotionImage(fileName, localPath, imageUrl) {
	try {
		Logger.log(`Downloading image: ${fileName} from ${imageUrl}`);

		// For now, just return the URL as Notion handles image hosting
		// In a full implementation, you could download and save locally
		return imageUrl;
	} catch (error) {
		Logger.error('Error downloading image:', error);
		throw error;
	}
}

/**
 * Parse Notion rich text to extract plain text
 * @param {Array} richText - Notion rich text array
 * @returns {string} Plain text
 */
export function parseRichText(richText) {
	if (!richText || !Array.isArray(richText)) {
		return '';
	}

	return richText.map(text => text.plain_text || '').join('');
}

/**
 * Check if a Notion object is visible (not archived)
 * @param {Object} obj - Notion object
 * @returns {boolean} True if visible
 */
export function isVisible(obj) {
	if (!obj || typeof obj !== 'object') {
		return false;
	}

	// Check if archived
	if (obj.archived === true) {
		return false;
	}

	return true;
}

/**
 * Remove empty keys from an object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
export function removeEmptyKeys(obj) {
	if (!obj || typeof obj !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.filter(item => item !== null && item !== undefined);
	}

	const cleaned = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value !== null && value !== undefined && value !== '') {
			if (Array.isArray(value)) {
				const cleanedArray = removeEmptyKeys(value);
				if (cleanedArray.length > 0) {
					cleaned[key] = cleanedArray;
				}
			} else if (typeof value === 'object') {
				const cleanedValue = removeEmptyKeys(value);
				if (Object.keys(cleanedValue).length > 0) {
					cleaned[key] = cleanedValue;
				}
			} else {
				cleaned[key] = value;
			}
		}
	}

	return cleaned;
}

/**
 * Format date to ISO string
 * @param {Date|string} date - Date to format
 * @returns {string} ISO formatted date
 */
export function formatDate(date) {
	if (!date) return '';

	if (typeof date === 'string') {
		return date;
	}

	if (date instanceof Date) {
		return date.toISOString();
	}

	return '';
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
	if (!text || typeof text !== 'string') {
		return '';
	}

	if (text.length <= maxLength) {
		return text;
	}

	return text.substring(0, maxLength - 3) + '...';
}

/**
 * Extract ID from Notion URL
 * @param {string} url - Notion URL
 * @returns {string|null} Extracted ID
 */
export function extractIdFromUrl(url) {
	if (!url || typeof url !== 'string') {
		return null;
	}

	// Extract ID from Notion URL patterns
	const patterns = [
		/\/([a-f0-9]{32})/i,
		/\/([a-f0-9-]{36})/i,
		/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match && match[1]) {
			return match[1];
		}
	}

	return null;
}

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID
 */
export function isValidUUID(uuid) {
	if (!uuid || typeof uuid !== 'string') {
		return false;
	}

	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(uuid);
}

/**
 * Convert Notion ID to UUID format
 * @param {string} id - Notion ID
 * @returns {string} UUID formatted ID
 */
export function formatNotionId(id) {
	if (!id || typeof id !== 'string') {
		return '';
	}

	// Remove dashes and convert to lowercase
	const cleanId = id.replace(/-/g, '').toLowerCase();

	// If it's already 32 characters, format as UUID
	if (cleanId.length === 32) {
		return `${cleanId.slice(0, 8)}-${cleanId.slice(8, 12)}-${cleanId.slice(12, 16)}-${cleanId.slice(16, 20)}-${cleanId.slice(20)}`;
	}

	return id;
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime());
	}

	if (Array.isArray(obj)) {
		return obj.map(item => deepClone(item));
	}

	const cloned = {};
	for (const [key, value] of Object.entries(obj)) {
		cloned[key] = deepClone(value);
	}

	return cloned;
}

/**
 * Sanitize text to remove sensitive information like bearer tokens
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeForLog(text) {
	if (!text || typeof text !== 'string') {
		return text;
	}

	// Remove bearer tokens and other sensitive data
	return text
		.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
		.replace(/bearer_token['":\s]*[A-Za-z0-9._-]+/gi, 'bearer_token: [REDACTED]')
		.replace(/bearerToken['":\s]*[A-Za-z0-9._-]+/gi, 'bearerToken: [REDACTED]')
		.replace(/access_token['":\s]*[A-Za-z0-9._-]+/gi, 'access_token: [REDACTED]')
		.replace(/refresh_token['":\s]*[A-Za-z0-9._-]+/gi, 'refresh_token: [REDACTED]')
		.replace(/refreshToken['":\s]*[A-Za-z0-9._-]+/gi, 'refreshToken: [REDACTED]')
		.replace(/client_secret['":\s]*[A-Za-z0-9._-]+/gi, 'client_secret: [REDACTED]')
		.replace(/clientSecret['":\s]*[A-Za-z0-9._-]+/gi, 'clientSecret: [REDACTED]')
		.replace(/Authorization['":\s]*Bearer\s+[A-Za-z0-9._-]+/gi, 'Authorization: Bearer [REDACTED]')
		.replace(/token['":\s]*[A-Za-z0-9._-]{20,}/gi, 'token: [REDACTED]')
		.replace(/secret['":\s]*[A-Za-z0-9._-]{20,}/gi, 'secret: [REDACTED]');
}
