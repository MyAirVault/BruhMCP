/**
 * Notion API Database Operations
 * Operations for managing Notion databases
 */

const { makeNotionRequest  } = require('./requestHandler');
const { formatNotionResponse  } = require('../../utils/notionFormatting');

/**
 * @typedef {import('../../utils/notionFormatting.js').NotionRichText} NotionRichText
 * @typedef {import('../../utils/notionFormatting.js').NotionUser} NotionUser 
 * @typedef {import('../../utils/notionFormatting.js').NotionParent} NotionParent
 * @typedef {import('../../utils/notionFormatting.js').NotionDatabase} NotionDatabase
 * @typedef {import('../../utils/notionFormatting.js').NotionPage} NotionPage
 * @typedef {import('../../utils/notionFormatting.js').NotionQueryResponse} NotionQueryResponse
 * @typedef {import('../../utils/notionFormatting.js').NotionResponseData} NotionResponseData
 */


/**
 * @typedef {import('../../utils/notionFormatting.js').NotionFilter} NotionFilter
 * @typedef {import('../../utils/notionFormatting.js').NotionSort} NotionSort
 */

/**
 * @typedef {import('../../utils/notionFormatting.js').NotionProperty} NotionProperty
 */

/**
 * @typedef {Object} GetDatabaseArgs
 * @property {string} databaseId - The database ID to retrieve
 */

/**
 * @typedef {Object} QueryDatabaseArgs
 * @property {string} databaseId - The database ID to query
 * @property {NotionFilter} [filter] - Filter conditions for the query
 * @property {NotionSort[]} [sorts] - Sort conditions for the query
 * @property {number} [page_size] - Number of results per page (max 100)
 * @property {string} [start_cursor] - Pagination cursor
 */

/**
 * @typedef {Object} CreateDatabaseArgs
 * @property {NotionParent} parent - Parent page or workspace information
 * @property {NotionRichText[]} title - Database title as rich text array
 * @property {Record<string, NotionProperty>} properties - Database properties schema
 * @property {boolean} [is_inline] - Whether the database is inline
 */

/**
 * @typedef {Object} UpdateDatabaseArgs
 * @property {string} databaseId - The database ID to update
 * @property {NotionRichText[]} [title] - Updated title as rich text array
 * @property {Record<string, NotionProperty>} [properties] - Updated properties schema
 * @property {boolean} [is_inline] - Whether the database is inline
 */


/**
 * Get database
 * @param {GetDatabaseArgs} args - Database arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Database data
 */
async function getDatabase(args, bearerToken) {
	const { databaseId } = args;

	const result = await makeNotionRequest(`/databases/${databaseId}`, bearerToken);

	return formatNotionResponse({
		action: 'get_database',
		database: /** @type {NotionDatabase} */ (result),
	});
}

/**
 * Query database
 * @param {QueryDatabaseArgs} args - Database query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Query results
 */
async function queryDatabase(args, bearerToken) {
	const { databaseId, filter, sorts = [], page_size = 100, start_cursor } = args;

	/** @type {Record<string, unknown>} */
	const queryOptions = {
		page_size: Math.min(page_size, 100),
	};

	if (filter) {
		queryOptions.filter = filter;
	}

	if (sorts.length > 0) {
		queryOptions.sorts = sorts;
	}

	if (start_cursor) {
		queryOptions.start_cursor = start_cursor;
	}

	const result = await makeNotionRequest(`/databases/${databaseId}/query`, bearerToken, {
		method: 'POST',
		body: queryOptions,
	});

	return formatNotionResponse({
		action: 'query_database',
		databaseId,
		results: /** @type {NotionPage[]} */ (/** @type {NotionQueryResponse} */ (result).results || []),
	});
}

/**
 * Create database
 * @param {CreateDatabaseArgs} args - Database creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Created database
 */
async function createDatabase(args, bearerToken) {
	const { parent, title, properties, is_inline = false } = args;

	/** @type {Record<string, unknown>} */
	const databaseData = {
		parent,
		title,
		properties,
		is_inline,
	};

	const result = /** @type {NotionDatabase} */ (await makeNotionRequest('/databases', bearerToken, {
		method: 'POST',
		body: databaseData,
	}));

	return formatNotionResponse({
		action: 'create_database',
		database: result,
	});
}

/**
 * Update database
 * @param {UpdateDatabaseArgs} args - Database update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Updated database
 */
async function updateDatabase(args, bearerToken) {
	const { databaseId, title, properties, is_inline } = args;

	/** @type {Record<string, unknown>} */
	const updateData = {};

	if (title !== undefined) {
		updateData.title = title;
	}

	if (properties !== undefined) {
		updateData.properties = properties;
	}

	if (is_inline !== undefined) {
		updateData.is_inline = is_inline;
	}

	const result = /** @type {NotionDatabase} */ (await makeNotionRequest(`/databases/${databaseId}`, bearerToken, {
		method: 'PATCH',
		body: updateData,
	}));

	return formatNotionResponse({
		action: 'update_database',
		database: result,
	});
}
module.exports = {
  getDatabase,
  queryDatabase,
  createDatabase,
  updateDatabase
};