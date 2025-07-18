/**
 * Notion API Integration
 * Core Notion API operations using OAuth Bearer tokens
 */

import { formatNotionResponse } from '../utils/notion-formatting.js';

const NOTION_BASE_URL = 'https://api.notion.com/v1';
const NOTION_API_VERSION = '2022-06-28';

/**
 * Make authenticated request to Notion API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {Object} options - Request options
 * @returns {Object} API response
 */
async function makeNotionRequest(endpoint, bearerToken, options = {}) {
	const url = `${NOTION_BASE_URL}${endpoint}`;

	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Notion-Version': NOTION_API_VERSION,
			'Content-Type': 'application/json',
			...options.headers,
		},
		...options,
	};

	if (options.body && typeof options.body === 'object') {
		requestOptions.body = JSON.stringify(options.body);
	}

	console.log(`📡 Notion API Request: ${requestOptions.method} ${url}`);

	const response = await fetch(url, requestOptions);

	if (!response.ok) {
		const errorText = await response.text();
		let errorMessage = `Notion API error: ${response.status} ${response.statusText}`;

		try {
			const errorData = JSON.parse(errorText);
			if (errorData.message) {
				errorMessage = `Notion API error: ${errorData.message}`;
			}
			if (errorData.code) {
				errorMessage += ` (${errorData.code})`;
			}
			console.error(`❌ Notion API Error Response:`, {
				status: response.status,
				statusText: response.statusText,
				errorData,
				endpoint,
				hasToken: !!bearerToken
			});
		} catch (parseError) {
			console.error(`❌ Notion API Error (non-JSON):`, {
				status: response.status,
				statusText: response.statusText,
				errorText,
				endpoint
			});
			// Use the default error message if JSON parsing fails
		}

		throw new Error(errorMessage);
	}

	const data = await response.json();
	console.log(`✅ Notion API Response: ${response.status}`);

	return data;
}

/**
 * Search for pages and databases
 * @param {Object} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Search results
 */
export async function searchNotion(args, bearerToken) {
	const { query, filter = {}, sort = {}, page_size = 100, start_cursor = null } = args;

	const requestBody = {
		query,
		filter,
		sort,
		page_size: Math.min(page_size, 100),
		...(start_cursor && { start_cursor }),
	};

	const result = await makeNotionRequest('/search', bearerToken, {
		method: 'POST',
		body: requestBody,
	});

	return formatNotionResponse({
		action: 'search',
		query,
		results: result.results || [],
		hasMore: result.has_more || false,
		nextCursor: result.next_cursor || null,
	});
}

/**
 * Get page content
 * @param {Object} args - Page arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Page data
 */
export async function getPage(args, bearerToken) {
	const { pageId } = args;

	const result = await makeNotionRequest(`/pages/${pageId}`, bearerToken);

	return formatNotionResponse({
		action: 'get_page',
		page: result,
	});
}

/**
 * Get page blocks/content
 * @param {Object} args - Page blocks arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Page blocks
 */
export async function getPageBlocks(args, bearerToken) {
	const { pageId, start_cursor = null, page_size = 100 } = args;

	let endpoint = `/blocks/${pageId}/children`;
	const params = new URLSearchParams({
		page_size: Math.min(page_size, 100).toString(),
	});

	if (start_cursor) {
		params.append('start_cursor', start_cursor);
	}

	const result = await makeNotionRequest(`${endpoint}?${params}`, bearerToken);

	return formatNotionResponse({
		action: 'get_page_blocks',
		pageId,
		blocks: result.results || [],
		hasMore: result.has_more || false,
		nextCursor: result.next_cursor || null,
	});
}

/**
 * Create a new page
 * @param {Object} args - Page creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created page
 */
export async function createPage(args, bearerToken) {
	const { parent, properties, children = [] } = args;

	const pageData = {
		parent,
		properties,
		...(children.length > 0 && { children }),
	};

	const result = await makeNotionRequest('/pages', bearerToken, {
		method: 'POST',
		body: pageData,
	});

	return formatNotionResponse({
		action: 'create_page',
		page: result,
	});
}

/**
 * Update page properties
 * @param {Object} args - Page update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Updated page
 */
export async function updatePage(args, bearerToken) {
	const { pageId, properties = {}, archived = false } = args;

	const updateData = {
		properties,
		archived,
	};

	const result = await makeNotionRequest(`/pages/${pageId}`, bearerToken, {
		method: 'PATCH',
		body: updateData,
	});

	return formatNotionResponse({
		action: 'update_page',
		page: result,
	});
}

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

/**
 * Append blocks to a page
 * @param {Object} args - Append blocks arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Response
 */
export async function appendBlocks(args, bearerToken) {
	const { pageId, children } = args;

	const result = await makeNotionRequest(`/blocks/${pageId}/children`, bearerToken, {
		method: 'PATCH',
		body: { children },
	});

	return formatNotionResponse({
		action: 'append_blocks',
		pageId,
		blocks: result.results || [],
	});
}

/**
 * Delete block
 * @param {Object} args - Delete block arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Response
 */
export async function deleteBlock(args, bearerToken) {
	const { blockId } = args;

	const result = await makeNotionRequest(`/blocks/${blockId}`, bearerToken, {
		method: 'DELETE',
	});

	return formatNotionResponse({
		action: 'delete_block',
		blockId,
		deleted: result.archived || false,
	});
}

/**
 * Get current user
 * @param {Object} args - User arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} User data
 */
export async function getCurrentUser(args, bearerToken) {
	const result = await makeNotionRequest('/users/me', bearerToken);

	return formatNotionResponse({
		action: 'get_current_user',
		user: result,
	});
}

/**
 * List users
 * @param {Object} args - List users arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Users list
 */
export async function listUsers(args, bearerToken) {
	const { start_cursor = null, page_size = 100 } = args;

	let endpoint = '/users';
	const params = new URLSearchParams({
		page_size: Math.min(page_size, 100).toString(),
	});

	if (start_cursor) {
		params.append('start_cursor', start_cursor);
	}

	const result = await makeNotionRequest(`${endpoint}?${params}`, bearerToken);

	return formatNotionResponse({
		action: 'list_users',
		users: result.results || [],
		hasMore: result.has_more || false,
		nextCursor: result.next_cursor || null,
	});
}

/**
 * Make raw API call to Notion
 * @param {Object} args - Raw API call arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} API response
 */
export async function makeRawApiCall(args, bearerToken) {
	const { method, path, params = {} } = args;

	const options = {
		method: method.toUpperCase(),
	};

	if (method.toUpperCase() === 'GET') {
		// For GET requests, add params as query parameters
		if (Object.keys(params).length > 0) {
			const queryString = new URLSearchParams(params).toString();
			path += `?${queryString}`;
		}
	} else {
		// For other methods, add params as request body
		options.body = params;
	}

	const result = await makeNotionRequest(path, bearerToken, options);

	return formatNotionResponse({
		action: 'raw_api_call',
		method,
		path,
		result,
	});
}

/**
 * NotionService class that wraps all Notion API functions
 */
export class NotionService {
	/**
	 * @param {Object} config - Service configuration
	 * @param {string} config.bearerToken - OAuth Bearer token
	 */
	constructor(config) {
		this.bearerToken = config.bearerToken;
	}

	async search(args) {
		return await searchNotion(args, this.bearerToken);
	}

	async getPage(args) {
		return await getPage(args, this.bearerToken);
	}

	async getPageBlocks(args) {
		return await getPageBlocks(args, this.bearerToken);
	}

	async createPage(args) {
		return await createPage(args, this.bearerToken);
	}

	async updatePage(args) {
		return await updatePage(args, this.bearerToken);
	}

	async getDatabase(args) {
		return await getDatabase(args, this.bearerToken);
	}

	async queryDatabase(args) {
		return await queryDatabase(args, this.bearerToken);
	}

	async createDatabase(args) {
		return await createDatabase(args, this.bearerToken);
	}

	async updateDatabase(args) {
		return await updateDatabase(args, this.bearerToken);
	}

	async appendBlocks(args) {
		return await appendBlocks(args, this.bearerToken);
	}

	async deleteBlock(args) {
		return await deleteBlock(args, this.bearerToken);
	}

	async getCurrentUser(args) {
		return await getCurrentUser(args, this.bearerToken);
	}

	async listUsers(args) {
		return await listUsers(args, this.bearerToken);
	}

	async makeRawApiCall(args) {
		return await makeRawApiCall(args, this.bearerToken);
	}
}