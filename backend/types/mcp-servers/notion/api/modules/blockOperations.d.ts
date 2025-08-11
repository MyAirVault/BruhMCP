/**
 * Append blocks to a page
 * @param {{pageId: string, children: import('../../utils/notionFormatting.js').NotionBlock[]}} args - Append blocks arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Response
 */
export function appendBlocks(args: {
    pageId: string;
    children: import("../../utils/notionFormatting.js").NotionBlock[];
}, bearerToken: string): Promise<Record<string, unknown>>;
/**
 * Delete block
 * @param {{blockId: string}} args - Delete block arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Response
 */
export function deleteBlock(args: {
    blockId: string;
}, bearerToken: string): Promise<Record<string, unknown>>;
//# sourceMappingURL=blockOperations.d.ts.map