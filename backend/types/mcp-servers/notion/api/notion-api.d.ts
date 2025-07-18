/**
 * Search for pages and databases
 * @param {Object} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Search results
 */
export function searchNotion(args: Object, bearerToken: string): Object;
/**
 * Get page content
 * @param {Object} args - Page arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Page data
 */
export function getPage(args: Object, bearerToken: string): Object;
/**
 * Get page blocks/content
 * @param {Object} args - Page blocks arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Page blocks
 */
export function getPageBlocks(args: Object, bearerToken: string): Object;
/**
 * Create a new page
 * @param {Object} args - Page creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created page
 */
export function createPage(args: Object, bearerToken: string): Object;
/**
 * Update page properties
 * @param {Object} args - Page update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Updated page
 */
export function updatePage(args: Object, bearerToken: string): Object;
/**
 * Get database
 * @param {Object} args - Database arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Database data
 */
export function getDatabase(args: Object, bearerToken: string): Object;
/**
 * Query database
 * @param {Object} args - Database query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Query results
 */
export function queryDatabase(args: Object, bearerToken: string): Object;
/**
 * Create database
 * @param {Object} args - Database creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created database
 */
export function createDatabase(args: Object, bearerToken: string): Object;
/**
 * Update database
 * @param {Object} args - Database update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Updated database
 */
export function updateDatabase(args: Object, bearerToken: string): Object;
/**
 * Append blocks to a page
 * @param {Object} args - Append blocks arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Response
 */
export function appendBlocks(args: Object, bearerToken: string): Object;
/**
 * Delete block
 * @param {Object} args - Delete block arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Response
 */
export function deleteBlock(args: Object, bearerToken: string): Object;
/**
 * Get current user
 * @param {Object} args - User arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} User data
 */
export function getCurrentUser(args: Object, bearerToken: string): Object;
/**
 * List users
 * @param {Object} args - List users arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Users list
 */
export function listUsers(args: Object, bearerToken: string): Object;
/**
 * Make raw API call to Notion
 * @param {Object} args - Raw API call arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} API response
 */
export function makeRawApiCall(args: Object, bearerToken: string): Object;
/**
 * NotionService class that wraps all Notion API functions
 */
export class NotionService {
    /**
     * @param {Object} config - Service configuration
     * @param {string} config.bearerToken - OAuth Bearer token
     */
    constructor(config: {
        bearerToken: string;
    });
    bearerToken: string;
    search(args: any): Promise<Object>;
    getPage(args: any): Promise<Object>;
    getPageBlocks(args: any): Promise<Object>;
    createPage(args: any): Promise<Object>;
    updatePage(args: any): Promise<Object>;
    getDatabase(args: any): Promise<Object>;
    queryDatabase(args: any): Promise<Object>;
    createDatabase(args: any): Promise<Object>;
    updateDatabase(args: any): Promise<Object>;
    appendBlocks(args: any): Promise<Object>;
    deleteBlock(args: any): Promise<Object>;
    getCurrentUser(args: any): Promise<Object>;
    listUsers(args: any): Promise<Object>;
    makeRawApiCall(args: any): Promise<Object>;
}
//# sourceMappingURL=notion-api.d.ts.map