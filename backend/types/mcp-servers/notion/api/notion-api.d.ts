/**
 * @typedef {Object} NotionAuthOptions
 * @property {string} bearerToken - OAuth Bearer token
 */
export class NotionService {
    /**
     * @param {NotionAuthOptions} authOptions
     */
    constructor(authOptions: NotionAuthOptions);
    apiKey: string;
    /**
     * Make authenticated request to Notion API
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<any>}
     */
    request(endpoint: string, options?: Object): Promise<any>;
    /**
     * Search for pages and databases
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<any>} Search results
     */
    search(query: string, options?: Object): Promise<any>;
    /**
     * Get page content
     * @param {string} pageId - Page ID
     * @returns {Promise<any>} Page data
     */
    getPage(pageId: string): Promise<any>;
    /**
     * Get page blocks/content
     * @param {string} pageId - Page ID
     * @param {string} startCursor - Pagination cursor
     * @returns {Promise<any>} Page blocks
     */
    getPageBlocks(pageId: string, startCursor?: string): Promise<any>;
    /**
     * Create a new page
     * @param {Object} pageData - Page creation data
     * @returns {Promise<any>} Created page
     */
    createPage(pageData: Object): Promise<any>;
    /**
     * Update page properties
     * @param {string} pageId - Page ID
     * @param {Object} updateData - Update data
     * @returns {Promise<any>} Updated page
     */
    updatePage(pageId: string, updateData: Object): Promise<any>;
    /**
     * Get database
     * @param {string} databaseId - Database ID
     * @returns {Promise<any>} Database data
     */
    getDatabase(databaseId: string): Promise<any>;
    /**
     * Query database
     * @param {string} databaseId - Database ID
     * @param {Object} queryOptions - Query options
     * @returns {Promise<any>} Query results
     */
    queryDatabase(databaseId: string, queryOptions?: Object): Promise<any>;
    /**
     * Create database
     * @param {Object} databaseData - Database creation data
     * @returns {Promise<any>} Created database
     */
    createDatabase(databaseData: Object): Promise<any>;
    /**
     * Update database
     * @param {string} databaseId - Database ID
     * @param {Object} updateData - Update data
     * @returns {Promise<any>} Updated database
     */
    updateDatabase(databaseId: string, updateData: Object): Promise<any>;
    /**
     * Append blocks to a page
     * @param {string} pageId - Page ID
     * @param {Array} blocks - Blocks to append
     * @returns {Promise<any>} Response
     */
    appendBlocks(pageId: string, blocks: any[]): Promise<any>;
    /**
     * Delete block
     * @param {string} blockId - Block ID
     * @returns {Promise<any>} Response
     */
    deleteBlock(blockId: string): Promise<any>;
    /**
     * Get current user
     * @returns {Promise<any>} User data
     */
    getCurrentUser(): Promise<any>;
    /**
     * List users
     * @param {string} startCursor - Pagination cursor
     * @returns {Promise<any>} Users list
     */
    listUsers(startCursor?: string): Promise<any>;
    /**
     * Make raw API call to Notion
     * @param {string} method - HTTP method
     * @param {string} path - API path
     * @param {Object} params - Request parameters
     * @returns {Promise<any>} API response
     */
    makeRawApiCall(method: string, path: string, params?: Object): Promise<any>;
}
export type NotionAuthOptions = {
    /**
     * - OAuth Bearer token
     */
    bearerToken: string;
};
//# sourceMappingURL=notion-api.d.ts.map