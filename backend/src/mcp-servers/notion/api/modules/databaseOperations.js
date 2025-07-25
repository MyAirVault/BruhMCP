/**
 * Notion API Database Operations
 * Operations for managing Notion databases
 */

import { makeNotionRequest } from './requestHandler.js';
import { formatNotionResponse } from '../../utils/notionFormatting.js';

/**
 * @typedef {Object} GetDatabaseArgs
 * @property {string} databaseId - The database ID to retrieve
 */

/**
 * @typedef {Object} QueryDatabaseArgs
 * @property {string} databaseId - The database ID to query
 * @property {Object} [filter] - Filter conditions for the query
 * @property {Array<Object>} [sorts] - Sort conditions for the query
 * @property {number} [page_size] - Number of results per page (max 100)
 * @property {string|null} [start_cursor] - Pagination cursor
 */

/**
 * @typedef {Object} CreateDatabaseArgs
 * @property {Object} parent - Parent page or workspace information
 * @property {Array<Object>} title - Database title as rich text array
 * @property {Record<string, Object>} properties - Database properties schema
 * @property {boolean} [is_inline] - Whether the database is inline
 */

/**
 * @typedef {Object} UpdateDatabaseArgs
 * @property {string} databaseId - The database ID to update
 * @property {Array<Object>} [title] - Updated title as rich text array
 * @property {Record<string, Object>} [properties] - Updated properties schema
 * @property {boolean} [is_inline] - Whether the database is inline
 */

/**
 * @typedef {Object} NotionApiResponse
 * @property {Object} parent - Parent information
 * @property {string} id - Object ID
 * @property {string} object - Object type
 * @property {string} url - Object URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {Object} created_by - Creator information
 * @property {Object} last_edited_by - Last editor information
 * @property {Object} properties - Object properties
 * @property {boolean} archived - Archive status
 * @property {Array<Object>} [title] - Title rich text array
 */

/**
 * @typedef {Object} NotionQueryApiResponse
 * @property {Array<NotionApiResponse>} results - Query results
 * @property {boolean} has_more - Whether there are more results
 * @property {string} [next_cursor] - Next pagination cursor
 */

/**
 * @typedef {Object} FormattedResponse
 * @property {string} action - The action performed
 * @property {string} timestamp - Response timestamp
 * @property {boolean} success - Success status
 */

/**
 * @typedef {FormattedResponse} DatabaseResponse
 * @property {Object} database - Formatted database data
 */

/**
 * @typedef {FormattedResponse} QueryResponse
 * @property {string} databaseId - The queried database ID
 * @property {Object} results - Formatted query results
 */

/**
 * Get database
 * @param {GetDatabaseArgs} args - Database arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<DatabaseResponse>} Database data
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
 * @param {QueryDatabaseArgs} args - Database query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<QueryResponse>} Query results
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
	});
}

/**
 * Create database
 * @param {CreateDatabaseArgs} args - Database creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<DatabaseResponse>} Created database
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
 * @param {UpdateDatabaseArgs} args - Database update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<DatabaseResponse>} Updated database
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