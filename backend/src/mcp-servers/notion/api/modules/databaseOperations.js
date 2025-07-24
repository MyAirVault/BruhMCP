/**
 * Notion API Database Operations
 * Operations for managing Notion databases
 */

import { makeNotionRequest } from './requestHandler.js';
import { formatNotionResponse } from '../../utils/notionFormatting.js';

/**
 * Get database
 * @param {Object} args - Database arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Database data
 */
export async function getDatabase(args, bearerToken) {
	const { databaseId } = args;

	const result = await makeNotionRequest(`/databases/${databaseId}`, bearerToken);

	return formatNotionResponse({
		action: 'get_database',
		database: result,
	});
}

/**
 * Query database
 * @param {Object} args - Database query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Query results
 */
export async function queryDatabase(args, bearerToken) {
	const { databaseId, filter = {}, sorts = [], page_size = 100, start_cursor = null } = args;

	const queryOptions = {
		filter,
		sorts,
		page_size: Math.min(page_size, 100),
		...(start_cursor && { start_cursor }),
	};

	const result = await makeNotionRequest(`/databases/${databaseId}/query`, bearerToken, {
		method: 'POST',
		body: queryOptions,
	});

	return formatNotionResponse({
		action: 'query_database',
		databaseId,
		results: result.results || [],
		hasMore: result.has_more || false,
		nextCursor: result.next_cursor || null,
	});
}

/**
 * Create database
 * @param {Object} args - Database creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created database
 */
export async function createDatabase(args, bearerToken) {
	const { parent, title, properties, is_inline = false } = args;

	const databaseData = {
		parent,
		title,
		properties,
		is_inline,
	};

	const result = await makeNotionRequest('/databases', bearerToken, {
		method: 'POST',
		body: databaseData,
	});

	return formatNotionResponse({
		action: 'create_database',
		database: result,
	});
}

/**
 * Update database
 * @param {Object} args - Database update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Updated database
 */
export async function updateDatabase(args, bearerToken) {
	const { databaseId, title = [], properties = {}, is_inline = false } = args;

	const updateData = {
		title,
		properties,
		is_inline,
	};

	const result = await makeNotionRequest(`/databases/${databaseId}`, bearerToken, {
		method: 'PATCH',
		body: updateData,
	});

	return formatNotionResponse({
		action: 'update_database',
		database: result,
	});
}