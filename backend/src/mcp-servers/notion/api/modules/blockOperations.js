/**
 * Notion API Block Operations
 * Operations for managing Notion blocks (content elements)
 */

import { makeNotionRequest } from './requestHandler.js';
import { formatNotionResponse } from '../../utils/notionFormatting.js';

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