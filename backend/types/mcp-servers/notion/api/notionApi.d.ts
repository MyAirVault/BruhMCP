import { makeNotionRequest } from "./modules/index";
import { getPage } from "./modules/index";
import { getPageBlocks } from "./modules/index";
import { createPage } from "./modules/index";
import { updatePage } from "./modules/index";
import { getDatabase } from "./modules/index";
import { queryDatabase } from "./modules/index";
import { createDatabase } from "./modules/index";
import { updateDatabase } from "./modules/index";
import { appendBlocks } from "./modules/index";
import { deleteBlock } from "./modules/index";
import { getCurrentUser } from "./modules/index";
import { listUsers } from "./modules/index";
import { searchNotion } from "./modules/index";
import { makeRawApiCall } from "./modules/index";
/**
 * NotionService class that wraps all Notion API functions
 */
export class NotionService {
    /**
     * @param {{bearerToken: string}} config - Service configuration
     */
    constructor(config: {
        bearerToken: string;
    });
    /** @type {string} */
    bearerToken: string;
    /**
     * Search across Notion workspace
     * @param {{query?: string, filter?: {value: string, property: string}, sort?: {direction: 'ascending' | 'descending', timestamp: 'last_edited_time'}}} args - Search arguments
     * @returns {Promise<Record<string, unknown>>} Search results
     */
    search(args: {
        query?: string;
        filter?: {
            value: string;
            property: string;
        };
        sort?: {
            direction: "ascending" | "descending";
            timestamp: "last_edited_time";
        };
    }): Promise<Record<string, unknown>>;
    /**
     * Get page content
     * @param {{pageId: string}} args - Page arguments
     * @returns {Promise<Record<string, unknown>>} Page data
     */
    getPage(args: {
        pageId: string;
    }): Promise<Record<string, unknown>>;
    /**
     * Get page blocks/content
     * @param {{pageId: string, start_cursor?: string, page_size?: number}} args - Page blocks arguments
     * @returns {Promise<Record<string, unknown>>} Page blocks
     */
    getPageBlocks(args: {
        pageId: string;
        start_cursor?: string;
        page_size?: number;
    }): Promise<Record<string, unknown>>;
    /**
     * Create a new page
     * @param {{parent: import('../utils/notionFormatting.js').NotionParent, properties: Record<string, import('../utils/notionFormatting.js').NotionProperty>, children?: import('../utils/notionFormatting.js').NotionBlock[]}} args - Page creation arguments
     * @returns {Promise<Record<string, unknown>>} Created page
     */
    createPage(args: {
        parent: import("../utils/notionFormatting.js").NotionParent;
        properties: Record<string, import("../utils/notionFormatting.js").NotionProperty>;
        children?: import("../utils/notionFormatting.js").NotionBlock[];
    }): Promise<Record<string, unknown>>;
    /**
     * Update page properties
     * @param {{pageId: string, properties?: Record<string, import('../utils/notionFormatting.js').NotionProperty>, archived?: boolean}} args - Page update arguments
     * @returns {Promise<Record<string, unknown>>} Updated page
     */
    updatePage(args: {
        pageId: string;
        properties?: Record<string, import("../utils/notionFormatting.js").NotionProperty>;
        archived?: boolean;
    }): Promise<Record<string, unknown>>;
    /**
     * Get database content
     * @param {{databaseId: string}} args - Database arguments
     * @returns {Promise<Record<string, unknown>>} Database data
     */
    getDatabase(args: {
        databaseId: string;
    }): Promise<Record<string, unknown>>;
    /**
     * Query database with filters and sorts
     * @param {{databaseId: string, filter?: import('../utils/notionFormatting.js').NotionFilter, sorts?: import('../utils/notionFormatting.js').NotionSort[], start_cursor?: string, page_size?: number}} args - Database query arguments
     * @returns {Promise<Record<string, unknown>>} Query results
     */
    queryDatabase(args: {
        databaseId: string;
        filter?: import("../utils/notionFormatting.js").NotionFilter;
        sorts?: import("../utils/notionFormatting.js").NotionSort[];
        start_cursor?: string;
        page_size?: number;
    }): Promise<Record<string, unknown>>;
    /**
     * Create a new database
     * @param {{parent: import('../utils/notionFormatting.js').NotionParent, title: import('../utils/notionFormatting.js').NotionRichText[], properties: Record<string, import('../utils/notionFormatting.js').NotionProperty>}} args - Database creation arguments
     * @returns {Promise<Record<string, unknown>>} Created database
     */
    createDatabase(args: {
        parent: import("../utils/notionFormatting.js").NotionParent;
        title: import("../utils/notionFormatting.js").NotionRichText[];
        properties: Record<string, import("../utils/notionFormatting.js").NotionProperty>;
    }): Promise<Record<string, unknown>>;
    /**
     * Update database properties
     * @param {{databaseId: string, title?: import('../utils/notionFormatting.js').NotionRichText[], properties?: Record<string, import('../utils/notionFormatting.js').NotionProperty>}} args - Database update arguments
     * @returns {Promise<Record<string, unknown>>} Updated database
     */
    updateDatabase(args: {
        databaseId: string;
        title?: import("../utils/notionFormatting.js").NotionRichText[];
        properties?: Record<string, import("../utils/notionFormatting.js").NotionProperty>;
    }): Promise<Record<string, unknown>>;
    /**
     * Append blocks to a page or block
     * @param {{blockId: string, children: import('../utils/notionFormatting.js').NotionBlock[]}} args - Block append arguments
     * @returns {Promise<Record<string, unknown>>} Append results
     */
    appendBlocks(args: {
        blockId: string;
        children: import("../utils/notionFormatting.js").NotionBlock[];
    }): Promise<Record<string, unknown>>;
    /**
     * Delete a block
     * @param {{blockId: string}} args - Block delete arguments
     * @returns {Promise<Record<string, unknown>>} Delete results
     */
    deleteBlock(args: {
        blockId: string;
    }): Promise<Record<string, unknown>>;
    /**
     * Get current user information
     * @param {Record<string, never>} args - User arguments (empty object)
     * @returns {Promise<Record<string, unknown>>} Current user data
     */
    getCurrentUser(args: Record<string, never>): Promise<Record<string, unknown>>;
    /**
     * List all users in workspace
     * @param {{start_cursor?: string, page_size?: number}} args - User list arguments
     * @returns {Promise<Record<string, unknown>>} Users list
     */
    listUsers(args: {
        start_cursor?: string;
        page_size?: number;
    }): Promise<Record<string, unknown>>;
    /**
     * Make raw API call to Notion
     * @param {{endpoint: string, method?: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: Record<string, unknown>}} args - Raw API call arguments
     * @returns {Promise<Record<string, unknown>>} API response
     */
    makeRawApiCall(args: {
        endpoint: string;
        method?: "GET" | "POST" | "PATCH" | "DELETE";
        body?: Record<string, unknown>;
    }): Promise<Record<string, unknown>>;
}
export { makeNotionRequest, getPage, getPageBlocks, createPage, updatePage, getDatabase, queryDatabase, createDatabase, updateDatabase, appendBlocks, deleteBlock, getCurrentUser, listUsers, searchNotion, makeRawApiCall };
//# sourceMappingURL=notionApi.d.ts.map