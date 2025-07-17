/**
 * Notion response formatting utilities
 * Formats Notion API responses for better readability and consistency
 */

/**
 * Format search results
 * @param {Object} response - Notion search response
 * @returns {Object} Formatted search results
 */
export function formatSearchResults(response) {
	if (!response || !response.results) {
		return { results: [], has_more: false };
	}

	const formattedResults = response.results.map(item => ({
		id: item.id,
		type: item.object,
		title: extractTitle(item),
		url: item.url,
		created_time: item.created_time,
		last_edited_time: item.last_edited_time,
		parent: item.parent,
	}));

	return {
		results: formattedResults,
		has_more: response.has_more,
		next_cursor: response.next_cursor,
	};
}

/**
 * Format page data
 * @param {Object} page - Notion page object
 * @returns {Object} Formatted page data
 */
export function formatPageData(page) {
	if (!page) return null;

	return {
		id: page.id,
		title: extractTitle(page),
		url: page.url,
		created_time: page.created_time,
		last_edited_time: page.last_edited_time,
		created_by: page.created_by,
		last_edited_by: page.last_edited_by,
		parent: page.parent,
		properties: page.properties,
		archived: page.archived,
	};
}

/**
 * Format database data
 * @param {Object} database - Notion database object
 * @returns {Object} Formatted database data
 */
export function formatDatabaseData(database) {
	if (!database) return null;

	return {
		id: database.id,
		title: extractTitle(database),
		url: database.url,
		created_time: database.created_time,
		last_edited_time: database.last_edited_time,
		created_by: database.created_by,
		last_edited_by: database.last_edited_by,
		parent: database.parent,
		properties: database.properties,
		archived: database.archived,
	};
}

/**
 * Format blocks data
 * @param {Object} response - Notion blocks response
 * @returns {Object} Formatted blocks data
 */
export function formatBlocksData(response) {
	if (!response || !response.results) {
		return { blocks: [], has_more: false };
	}

	const formattedBlocks = response.results.map(block => ({
		id: block.id,
		type: block.type,
		content: extractBlockContent(block),
		created_time: block.created_time,
		last_edited_time: block.last_edited_time,
		has_children: block.has_children,
	}));

	return {
		blocks: formattedBlocks,
		has_more: response.has_more,
		next_cursor: response.next_cursor,
	};
}

/**
 * Format database query results
 * @param {Object} response - Notion database query response
 * @returns {Object} Formatted query results
 */
export function formatQueryResults(response) {
	if (!response || !response.results) {
		return { results: [], has_more: false };
	}

	const formattedResults = response.results.map(item => ({
		id: item.id,
		title: extractTitle(item),
		url: item.url,
		created_time: item.created_time,
		last_edited_time: item.last_edited_time,
		properties: item.properties,
		archived: item.archived,
	}));

	return {
		results: formattedResults,
		has_more: response.has_more,
		next_cursor: response.next_cursor,
	};
}

/**
 * Extract title from Notion object
 * @param {Object} item - Notion page/database object
 * @returns {string} Extracted title
 */
function extractTitle(item) {
	if (!item) return '';

	// For pages and databases, title is in properties
	if (item.properties) {
		// Find title property
		const titleProperty = Object.values(item.properties).find(prop => prop.type === 'title');
		if (titleProperty && titleProperty.title && titleProperty.title.length > 0) {
			return titleProperty.title[0].plain_text || '';
		}
	}

	// For search results, title might be in different format
	if (item.title && Array.isArray(item.title) && item.title.length > 0) {
		return item.title[0].plain_text || '';
	}

	return 'Untitled';
}

/**
 * Extract content from block
 * @param {Object} block - Notion block object
 * @returns {string} Extracted content
 */
function extractBlockContent(block) {
	if (!block || !block.type) return '';

	const blockType = block.type;
	const blockData = block[blockType];

	if (!blockData) return '';

	// Handle rich text content
	if (blockData.rich_text && Array.isArray(blockData.rich_text)) {
		return blockData.rich_text.map(text => text.plain_text || '').join('');
	}

	// Handle specific block types
	switch (blockType) {
		case 'heading_1':
		case 'heading_2':
		case 'heading_3':
		case 'paragraph':
		case 'bulleted_list_item':
		case 'numbered_list_item':
		case 'to_do':
		case 'quote':
		case 'callout':
			return blockData.rich_text ? blockData.rich_text.map(text => text.plain_text || '').join('') : '';

		case 'code':
			return blockData.rich_text ? blockData.rich_text.map(text => text.plain_text || '').join('') : '';

		case 'image':
			return blockData.caption ? blockData.caption.map(text => text.plain_text || '').join('') : '[Image]';

		case 'file':
			return blockData.caption ? blockData.caption.map(text => text.plain_text || '').join('') : '[File]';

		case 'embed':
			return blockData.url || '[Embed]';

		default:
			return `[${blockType}]`;
	}
}

/**
 * Format user data
 * @param {Object} user - Notion user object
 * @returns {Object} Formatted user data
 */
export function formatUserData(user) {
	if (!user) return null;

	return {
		id: user.id,
		name: user.name,
		avatar_url: user.avatar_url,
		type: user.type,
		person: user.person,
		bot: user.bot,
	};
}

/**
 * Format error response
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(error) {
	return {
		error: true,
		message: error.message || 'An error occurred',
		timestamp: new Date().toISOString(),
	};
}
