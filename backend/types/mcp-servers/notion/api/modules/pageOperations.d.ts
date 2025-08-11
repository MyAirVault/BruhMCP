export type PageBlocksResult = {
    /**
     * - Array of blocks
     */
    results: import("../../utils/notionFormatting.js").NotionBlock[];
    /**
     * - Whether there are more blocks
     */
    has_more: boolean;
    /**
     * - Cursor for next page
     */
    next_cursor?: string | undefined;
};
/**
 * @typedef {Object} PageBlocksResult
 * @property {import('../../utils/notionFormatting.js').NotionBlock[]} results - Array of blocks
 * @property {boolean} has_more - Whether there are more blocks
 * @property {string} [next_cursor] - Cursor for next page
 */
/**
 * Get page content
 * @param {{pageId: string}} args - Page arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Page data
 */
export function getPage(args: {
    pageId: string;
}, bearerToken: string): Promise<Record<string, unknown>>;
/**
 * Get page blocks/content
 * @param {{pageId: string, start_cursor?: string, page_size?: number}} args - Page blocks arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Page blocks
 */
export function getPageBlocks(args: {
    pageId: string;
    start_cursor?: string;
    page_size?: number;
}, bearerToken: string): Promise<Record<string, unknown>>;
/**
 * Create a new page
 * @param {{parent: import('../../utils/notionFormatting.js').NotionParent, properties: Record<string, import('../../utils/notionFormatting.js').NotionProperty>, children?: import('../../utils/notionFormatting.js').NotionBlock[]}} args - Page creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Created page
 */
export function createPage(args: {
    parent: import("../../utils/notionFormatting.js").NotionParent;
    properties: Record<string, import("../../utils/notionFormatting.js").NotionProperty>;
    children?: import("../../utils/notionFormatting.js").NotionBlock[];
}, bearerToken: string): Promise<Record<string, unknown>>;
/**
 * Update page properties
 * @param {{pageId: string, properties?: Record<string, import('../../utils/notionFormatting.js').NotionProperty>, archived?: boolean}} args - Page update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Updated page
 */
export function updatePage(args: {
    pageId: string;
    properties?: Record<string, import("../../utils/notionFormatting.js").NotionProperty>;
    archived?: boolean;
}, bearerToken: string): Promise<Record<string, unknown>>;
//# sourceMappingURL=pageOperations.d.ts.map