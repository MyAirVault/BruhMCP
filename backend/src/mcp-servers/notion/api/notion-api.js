/**
 * Notion API Integration Layer
 * Handles authentication, API calls, and data processing for Notion
 */

import { fetchWithRetry } from '../utils/fetch-with-retry.js';
import { Logger } from '../utils/logger.js';

const NOTION_BASE_URL = 'https://api.notion.com/v1';
const NOTION_API_VERSION = '2022-06-28';

/**
 * @typedef {Object} NotionAuthOptions
 * @property {string} bearerToken - OAuth Bearer token
 */

export class NotionService {
	/**
	 * @param {NotionAuthOptions} authOptions
	 */
	constructor(authOptions) {
		// Use OAuth Bearer token
		this.apiKey = authOptions.bearerToken || '';
	}

	/**
	 * Make authenticated request to Notion API
	 * @param {string} endpoint - API endpoint
	 * @param {Object} options - Request options
	 * @returns {Promise<any>}
	 */
	async request(endpoint, options = {}) {
		try {
			Logger.log(`Calling ${NOTION_BASE_URL}${endpoint}`);

			const headers = {
				Authorization: `Bearer ${this.apiKey}`,
				'Notion-Version': NOTION_API_VERSION,
				'Content-Type': 'application/json',
				...options.headers,
			};

			const requestOptions = {
				...options,
				headers,
			};

			const data = await fetchWithRetry(`${NOTION_BASE_URL}${endpoint}`, requestOptions);
			return data;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to make request to Notion API: ${error.message}`);
			}
			throw new Error(`Failed to make request to Notion API: ${error}`);
		}
	}

	/**
	 * Search for pages and databases
	 * @param {string} query - Search query
	 * @param {Object} options - Search options
	 * @returns {Promise<any>} Search results
	 */
	async search(query, options = {}) {
		try {
			Logger.log(`Searching Notion: ${query}`);

			const requestBody = {
				query,
				...options,
			};

			const response = await this.request('/search', {
				method: 'POST',
				body: JSON.stringify(requestBody),
			});

			return response;
		} catch (error) {
			Logger.error('Failed to search:', error);
			throw error;
		}
	}

	/**
	 * Get page content
	 * @param {string} pageId - Page ID
	 * @returns {Promise<any>} Page data
	 */
	async getPage(pageId) {
		try {
			Logger.log(`Retrieving Notion page: ${pageId}`);

			const response = await this.request(`/pages/${pageId}`);
			return response;
		} catch (error) {
			Logger.error('Failed to get page:', error);
			throw error;
		}
	}

	/**
	 * Get page blocks/content
	 * @param {string} pageId - Page ID
	 * @param {string} startCursor - Pagination cursor
	 * @returns {Promise<any>} Page blocks
	 */
	async getPageBlocks(pageId, startCursor = null) {
		try {
			Logger.log(`Retrieving blocks for page: ${pageId}`);

			let endpoint = `/blocks/${pageId}/children`;
			if (startCursor) {
				endpoint += `?start_cursor=${startCursor}`;
			}

			const response = await this.request(endpoint);
			return response;
		} catch (error) {
			Logger.error('Failed to get page blocks:', error);
			throw error;
		}
	}

	/**
	 * Create a new page
	 * @param {Object} pageData - Page creation data
	 * @returns {Promise<any>} Created page
	 */
	async createPage(pageData) {
		try {
			Logger.log('Creating new Notion page');

			const response = await this.request('/pages', {
				method: 'POST',
				body: JSON.stringify(pageData),
			});

			return response;
		} catch (error) {
			Logger.error('Failed to create page:', error);
			throw error;
		}
	}

	/**
	 * Update page properties
	 * @param {string} pageId - Page ID
	 * @param {Object} updateData - Update data
	 * @returns {Promise<any>} Updated page
	 */
	async updatePage(pageId, updateData) {
		try {
			Logger.log(`Updating Notion page: ${pageId}`);

			const response = await this.request(`/pages/${pageId}`, {
				method: 'PATCH',
				body: JSON.stringify(updateData),
			});

			return response;
		} catch (error) {
			Logger.error('Failed to update page:', error);
			throw error;
		}
	}

	/**
	 * Get database
	 * @param {string} databaseId - Database ID
	 * @returns {Promise<any>} Database data
	 */
	async getDatabase(databaseId) {
		try {
			Logger.log(`Retrieving Notion database: ${databaseId}`);

			const response = await this.request(`/databases/${databaseId}`);
			return response;
		} catch (error) {
			Logger.error('Failed to get database:', error);
			throw error;
		}
	}

	/**
	 * Query database
	 * @param {string} databaseId - Database ID
	 * @param {Object} queryOptions - Query options
	 * @returns {Promise<any>} Query results
	 */
	async queryDatabase(databaseId, queryOptions = {}) {
		try {
			Logger.log(`Querying Notion database: ${databaseId}`);

			const response = await this.request(`/databases/${databaseId}/query`, {
				method: 'POST',
				body: JSON.stringify(queryOptions),
			});

			return response;
		} catch (error) {
			Logger.error('Failed to query database:', error);
			throw error;
		}
	}

	/**
	 * Create database
	 * @param {Object} databaseData - Database creation data
	 * @returns {Promise<any>} Created database
	 */
	async createDatabase(databaseData) {
		try {
			Logger.log('Creating new Notion database');

			const response = await this.request('/databases', {
				method: 'POST',
				body: JSON.stringify(databaseData),
			});

			return response;
		} catch (error) {
			Logger.error('Failed to create database:', error);
			throw error;
		}
	}

	/**
	 * Update database
	 * @param {string} databaseId - Database ID
	 * @param {Object} updateData - Update data
	 * @returns {Promise<any>} Updated database
	 */
	async updateDatabase(databaseId, updateData) {
		try {
			Logger.log(`Updating Notion database: ${databaseId}`);

			const response = await this.request(`/databases/${databaseId}`, {
				method: 'PATCH',
				body: JSON.stringify(updateData),
			});

			return response;
		} catch (error) {
			Logger.error('Failed to update database:', error);
			throw error;
		}
	}

	/**
	 * Append blocks to a page
	 * @param {string} pageId - Page ID
	 * @param {Array} blocks - Blocks to append
	 * @returns {Promise<any>} Response
	 */
	async appendBlocks(pageId, blocks) {
		try {
			Logger.log(`Appending blocks to page: ${pageId}`);

			const response = await this.request(`/blocks/${pageId}/children`, {
				method: 'PATCH',
				body: JSON.stringify({ children: blocks }),
			});

			return response;
		} catch (error) {
			Logger.error('Failed to append blocks:', error);
			throw error;
		}
	}

	/**
	 * Delete block
	 * @param {string} blockId - Block ID
	 * @returns {Promise<any>} Response
	 */
	async deleteBlock(blockId) {
		try {
			Logger.log(`Deleting block: ${blockId}`);

			const response = await this.request(`/blocks/${blockId}`, {
				method: 'DELETE',
			});

			return response;
		} catch (error) {
			Logger.error('Failed to delete block:', error);
			throw error;
		}
	}

	/**
	 * Get current user
	 * @returns {Promise<any>} User data
	 */
	async getCurrentUser() {
		try {
			Logger.log('Getting current user');

			const response = await this.request('/users/me');
			return response;
		} catch (error) {
			Logger.error('Failed to get current user:', error);
			throw error;
		}
	}

	/**
	 * List users
	 * @param {string} startCursor - Pagination cursor
	 * @returns {Promise<any>} Users list
	 */
	async listUsers(startCursor = null) {
		try {
			Logger.log('Listing users');

			let endpoint = '/users';
			if (startCursor) {
				endpoint += `?start_cursor=${startCursor}`;
			}

			const response = await this.request(endpoint);
			return response;
		} catch (error) {
			Logger.error('Failed to list users:', error);
			throw error;
		}
	}

	/**
	 * Make raw API call to Notion
	 * @param {string} method - HTTP method
	 * @param {string} path - API path
	 * @param {Object} params - Request parameters
	 * @returns {Promise<any>} API response
	 */
	async makeRawApiCall(method, path, params = {}) {
		try {
			Logger.log(`Making raw API call: ${method} ${path}`);

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
				options.body = JSON.stringify(params);
			}

			const response = await this.request(path, options);
			return response;
		} catch (error) {
			Logger.error(`Failed to make raw API call: ${method} ${path}`, error);
			throw error;
		}
	}
}
