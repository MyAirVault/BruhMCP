/**
 * Notion API Page Operations
 * Operations for managing Notion pages
 */

const { makeNotionRequest  } = require('./requestHandler');
const { formatNotionResponse  } = require('../../utils/notionFormatting');

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
async function getPage(args, bearerToken) {
	const { pageId } = args;

	const result = /** @type {import('../../utils/notionFormatting.js').NotionPage} */ (await makeNotionRequest(`/pages/${pageId}`, bearerToken));

	return formatNotionResponse({
		action: 'get_page',
		page: result,
	});
}

/**
 * Get page blocks/content
 * @param {{pageId: string, start_cursor?: string, page_size?: number}} args - Page blocks arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Page blocks
 */
async function getPageBlocks(args, bearerToken) {
	const { pageId, start_cursor = null, page_size = 100 } = args;

	let endpoint = `/blocks/${pageId}/children`;
	const params = new URLSearchParams({
		page_size: Math.min(page_size, 100).toString(),
	});

	if (start_cursor) {
		params.append('start_cursor', start_cursor);
	}

	const result = /** @type {PageBlocksResult} */ (await makeNotionRequest(`${endpoint}?${params}`, bearerToken));

	return formatNotionResponse({
		action: 'get_page_blocks',
		pageId,
		blocks: result.results || [],
		hasMore: result.has_more || false,
	});
}

/**
 * Create a new page
 * @param {{parent: import('../../utils/notionFormatting.js').NotionParent, properties: Record<string, import('../../utils/notionFormatting.js').NotionProperty>, children?: import('../../utils/notionFormatting.js').NotionBlock[]}} args - Page creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Created page
 */
async function createPage(args, bearerToken) {
	const { parent, properties, children = [] } = args;

	const pageData = {
		parent,
		properties,
		...(children.length > 0 && { children }),
	};

	const result = /** @type {import('../../utils/notionFormatting.js').NotionPage} */ (await makeNotionRequest('/pages', bearerToken, {
		method: 'POST',
		body: pageData,
	}));

	return formatNotionResponse({
		action: 'create_page',
		page: result,
	});
}

/**
 * Update page properties
 * @param {{pageId: string, properties?: Record<string, import('../../utils/notionFormatting.js').NotionProperty>, archived?: boolean}} args - Page update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Updated page
 */
async function updatePage(args, bearerToken) {
	const { pageId, properties = {}, archived = false } = args;

	const updateData = {
		properties,
		archived,
	};

	const result = /** @type {import('../../utils/notionFormatting.js').NotionPage} */ (await makeNotionRequest(`/pages/${pageId}`, bearerToken, {
		method: 'PATCH',
		body: updateData,
	}));

	return formatNotionResponse({
		action: 'update_page',
		page: result,
	});
}
module.exports = {
  getPage,
  getPageBlocks,
  createPage,
  updatePage
};