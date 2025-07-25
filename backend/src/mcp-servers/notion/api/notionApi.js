/**
 * Notion API Integration
 * Re-exports all Notion API operations from modular structure
 */

// Import and re-export all functions from modular structure
import {
	makeNotionRequest,
	getPage,
	getPageBlocks,
	createPage,
	updatePage,
	getDatabase,
	queryDatabase,
	createDatabase,
	updateDatabase,
	appendBlocks,
	deleteBlock,
	getCurrentUser,
	listUsers,
	searchNotion,
	makeRawApiCall
} from './modules/index.js';

// Re-export all functions
export {
	makeNotionRequest,
	getPage,
	getPageBlocks,
	createPage,
	updatePage,
	getDatabase,
	queryDatabase,
	createDatabase,
	updateDatabase,
	appendBlocks,
	deleteBlock,
	getCurrentUser,
	listUsers,
	searchNotion,
	makeRawApiCall
};

/**
 * NotionService class that wraps all Notion API functions
 */
export class NotionService {
	/**
	 * @param {Object} config - Service configuration
	 * @param {string} config.bearerToken - OAuth Bearer token
	 */
	constructor(config) {
		/** @type {string} */
		this.bearerToken = config.bearerToken;
	}

	/**
	 * Search across Notion workspace
	 * @param {{query?: string, filter?: {value: string, property: string}, sort?: {direction: 'ascending' | 'descending', timestamp: 'last_edited_time'}}} args - Search arguments
	 * @returns {Promise<Record<string, unknown>>} Search results
	 */
	async search(args) {
		return await searchNotion(args, this.bearerToken);
	}

	/**
	 * Get page content
	 * @param {{pageId: string}} args - Page arguments
	 * @returns {Promise<Record<string, unknown>>} Page data
	 */
	async getPage(args) {
		return await getPage(args, this.bearerToken);
	}

	/**
	 * Get page blocks/content
	 * @param {{pageId: string, start_cursor?: string, page_size?: number}} args - Page blocks arguments
	 * @returns {Promise<Record<string, unknown>>} Page blocks
	 */
	async getPageBlocks(args) {
		return await getPageBlocks(args, this.bearerToken);
	}

	/**
	 * Create a new page
	 * @param {{parent: import('../utils/notionFormatting.js').NotionParent, properties: Record<string, import('../utils/notionFormatting.js').NotionProperty>, children?: import('../utils/notionFormatting.js').NotionBlock[]}} args - Page creation arguments
	 * @returns {Promise<Record<string, unknown>>} Created page
	 */
	async createPage(args) {
		return await createPage(args, this.bearerToken);
	}

	/**
	 * Update page properties
	 * @param {{pageId: string, properties?: Record<string, import('../utils/notionFormatting.js').NotionProperty>, archived?: boolean}} args - Page update arguments
	 * @returns {Promise<Record<string, unknown>>} Updated page
	 */
	async updatePage(args) {
		return await updatePage(args, this.bearerToken);
	}

	/**
	 * Get database content
	 * @param {{databaseId: string}} args - Database arguments
	 * @returns {Promise<Record<string, unknown>>} Database data
	 */
	async getDatabase(args) {
		return await getDatabase(args, this.bearerToken);
	}

	/**
	 * Query database with filters and sorts
	 * @param {{databaseId: string, filter?: Object, sorts?: Object[], start_cursor?: string, page_size?: number}} args - Database query arguments
	 * @returns {Promise<Record<string, unknown>>} Query results
	 */
	async queryDatabase(args) {
		return await queryDatabase(args, this.bearerToken);
	}

	/**
	 * Create a new database
	 * @param {{parent: import('../utils/notionFormatting.js').NotionParent, title: import('../utils/notionFormatting.js').NotionRichText[], properties: Record<string, Object>}} args - Database creation arguments
	 * @returns {Promise<Record<string, unknown>>} Created database
	 */
	async createDatabase(args) {
		return await createDatabase(args, this.bearerToken);
	}

	/**
	 * Update database properties
	 * @param {{databaseId: string, title?: import('../utils/notionFormatting.js').NotionRichText[], properties?: Record<string, Object>}} args - Database update arguments
	 * @returns {Promise<Record<string, unknown>>} Updated database
	 */
	async updateDatabase(args) {
		return await updateDatabase(args, this.bearerToken);
	}

	/**
	 * Append blocks to a page or block
	 * @param {{blockId: string, children: import('../utils/notionFormatting.js').NotionBlock[]}} args - Block append arguments
	 * @returns {Promise<Record<string, unknown>>} Append results
	 */
	async appendBlocks(args) {
		return await appendBlocks(args, this.bearerToken);
	}

	/**
	 * Delete a block
	 * @param {{blockId: string}} args - Block delete arguments
	 * @returns {Promise<Record<string, unknown>>} Delete results
	 */
	async deleteBlock(args) {
		return await deleteBlock(args, this.bearerToken);
	}

	/**
	 * Get current user information
	 * @param {Record<string, never>} args - User arguments (empty object)
	 * @returns {Promise<Record<string, unknown>>} Current user data
	 */
	async getCurrentUser(args) {
		return await getCurrentUser(args, this.bearerToken);
	}

	/**
	 * List all users in workspace
	 * @param {{start_cursor?: string, page_size?: number}} args - User list arguments
	 * @returns {Promise<Record<string, unknown>>} Users list
	 */
	async listUsers(args) {
		return await listUsers(args, this.bearerToken);
	}

	/**
	 * Make raw API call to Notion
	 * @param {{endpoint: string, method?: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: Record<string, unknown>}} args - Raw API call arguments
	 * @returns {Promise<Record<string, unknown>>} API response
	 */
	async makeRawApiCall(args) {
		return await makeRawApiCall(args, this.bearerToken);
	}
}