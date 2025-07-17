/**
 * Response Simplifier for Notion API responses
 * Converts Notion API responses into simplified, usable data
 */

import { Logger } from '../utils/logger.js';

/**
 * Parse Notion API response and simplify it
 * @param {any} data - Raw Notion API response
 * @returns {any} Simplified response object
 */
export function parseNotionResponse(data) {
	// Validate input data
	if (!data || typeof data !== 'object') {
		throw new Error('Invalid data provided to parseNotionResponse');
	}

	try {
		// For search results
		if (data.results && Array.isArray(data.results)) {
			return {
				results: data.results.map(item => simplifyNotionItem(item)),
				has_more: data.has_more || false,
				next_cursor: data.next_cursor || null,
			};
		}

		// For single items (page, database, etc.)
		if (data.object) {
			return simplifyNotionItem(data);
		}

		// For blocks
		if (data.type) {
			return simplifyNotionBlock(data);
		}

		// Return as-is if we can't simplify
		return data;
	} catch (error) {
		Logger.error('Error parsing Notion response:', error);
		return data;
	}
}

/**
 * Simplify a Notion item (page, database, etc.)
 * @param {Object} item - Notion item
 * @returns {Object} Simplified item
 */
function simplifyNotionItem(item) {
	if (!item || typeof item !== 'object') {
		return item;
	}

	const simplified = {
		id: item.id,
		object: item.object,
		created_time: item.created_time,
		last_edited_time: item.last_edited_time,
		created_by: item.created_by,
		last_edited_by: item.last_edited_by,
		cover: item.cover,
		icon: item.icon,
		parent: item.parent,
		archived: item.archived,
		url: item.url,
	};

	// Add title if available
	if (item.properties) {
		const title = extractTitle(item.properties);
		if (title) {
			simplified.title = title;
		}
		simplified.properties = item.properties;
	}

	// Add children if available
	if (item.children) {
		simplified.children = item.children.map(child => simplifyNotionBlock(child));
	}

	// Remove null/undefined values
	return removeEmptyKeys(simplified);
}

/**
 * Simplify a Notion block
 * @param {Object} block - Notion block
 * @returns {Object} Simplified block
 */
function simplifyNotionBlock(block) {
	if (!block || typeof block !== 'object') {
		return block;
	}

	const simplified = {
		id: block.id,
		type: block.type,
		created_time: block.created_time,
		last_edited_time: block.last_edited_time,
		created_by: block.created_by,
		last_edited_by: block.last_edited_by,
		has_children: block.has_children,
		archived: block.archived,
	};

	// Add type-specific content
	if (block.type && block[block.type]) {
		simplified.content = block[block.type];

		// Extract plain text if available
		if (block[block.type].rich_text && Array.isArray(block[block.type].rich_text)) {
			simplified.text = block[block.type].rich_text.map(text => text.plain_text || '').join('');
		}
	}

	// Add children if available
	if (block.children) {
		simplified.children = block.children.map(child => simplifyNotionBlock(child));
	}

	return removeEmptyKeys(simplified);
}

/**
 * Extract title from properties
 * @param {Object} properties - Notion properties
 * @returns {string|null} Title text
 */
function extractTitle(properties) {
	if (!properties || typeof properties !== 'object') {
		return null;
	}

	// Find title property
	const titleProperty = Object.values(properties).find(prop => prop.type === 'title');
	if (titleProperty && titleProperty.title && Array.isArray(titleProperty.title)) {
		return titleProperty.title.map(text => text.plain_text || '').join('');
	}

	return null;
}

/**
 * Remove empty keys from object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
function removeEmptyKeys(obj) {
	if (!obj || typeof obj !== 'object') {
		return obj;
	}

	const cleaned = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value !== null && value !== undefined && value !== '') {
			if (Array.isArray(value)) {
				if (value.length > 0) {
					cleaned[key] = value;
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

// For backward compatibility, export both function names
export const simplifyNotionResponse = parseNotionResponse;
