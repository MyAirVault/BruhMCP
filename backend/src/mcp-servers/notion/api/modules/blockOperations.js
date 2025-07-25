/**
 * Notion API Block Operations
 * Operations for managing Notion blocks (content elements)
 */

import { makeNotionRequest } from './requestHandler.js';
import { formatNotionResponse } from '../../utils/notionFormatting.js';

/**
 * Append blocks to a page
 * @param {{pageId: string, children: import('../../utils/notionFormatting.js').NotionBlock[]}} args - Append blocks arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Response
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
		blocks: /** @type {import('../../utils/notionFormatting.js').NotionBlock[]} */ (result.results || []),
	});
}

/**
 * Delete block
 * @param {{blockId: string}} args - Delete block arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Response
 */
export async function deleteBlock(args, bearerToken) {
	const { blockId } = args;

	const result = await makeNotionRequest(`/blocks/${blockId}`, bearerToken, {
		method: 'DELETE',
	});

	return formatNotionResponse({
		action: 'delete_block',
		blockId,
		deleted: /** @type {boolean} */ (result.archived || false),
	});
}