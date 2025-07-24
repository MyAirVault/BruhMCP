/**
 * Notion API Page Operations
 * Operations for managing Notion pages
 */

import { makeNotionRequest } from './requestHandler.js';
import { formatNotionResponse } from '../../utils/notionFormatting.js';

/**
 * Get page content
 * @param {Object} args - Page arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Page data
 */
export async function getPage(args, bearerToken) {
	const { pageId } = args;

	const result = await makeNotionRequest(`/pages/${pageId}`, bearerToken);

	return formatNotionResponse({
		action: 'get_page',
		page: result,
	});
}

/**
 * Get page blocks/content
 * @param {Object} args - Page blocks arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Page blocks
 */
export async function getPageBlocks(args, bearerToken) {
	const { pageId, start_cursor = null, page_size = 100 } = args;

	let endpoint = `/blocks/${pageId}/children`;
	const params = new URLSearchParams({
		page_size: Math.min(page_size, 100).toString(),
	});

	if (start_cursor) {
		params.append('start_cursor', start_cursor);
	}

	const result = await makeNotionRequest(`${endpoint}?${params}`, bearerToken);

	return formatNotionResponse({
		action: 'get_page_blocks',
		pageId,
		blocks: result.results || [],
		hasMore: result.has_more || false,
		nextCursor: result.next_cursor || null,
	});
}

/**
 * Create a new page
 * @param {Object} args - Page creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created page
 */
export async function createPage(args, bearerToken) {
	const { parent, properties, children = [] } = args;

	const pageData = {
		parent,
		properties,
		...(children.length > 0 && { children }),
	};

	const result = await makeNotionRequest('/pages', bearerToken, {
		method: 'POST',
		body: pageData,
	});

	return formatNotionResponse({
		action: 'create_page',
		page: result,
	});
}

/**
 * Update page properties
 * @param {Object} args - Page update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Updated page
 */
export async function updatePage(args, bearerToken) {
	const { pageId, properties = {}, archived = false } = args;

	const updateData = {
		properties,
		archived,
	};

	const result = await makeNotionRequest(`/pages/${pageId}`, bearerToken, {
		method: 'PATCH',
		body: updateData,
	});

	return formatNotionResponse({
		action: 'update_page',
		page: result,
	});
}