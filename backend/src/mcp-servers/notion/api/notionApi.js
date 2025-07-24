/**
 * Notion API Integration
 * Re-exports all Notion API operations from modular structure
 */

// Re-export all functions from modular structure
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
} from './modules/index.js';

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