/**
 * Notion response formatting utilities
 * Formats Notion API responses for better readability and consistency
 */

/**
 * @typedef {Object} NotionRichText
 * @property {string} plain_text - Plain text content
 * @property {string} type - Text type
 */

/**
 * @typedef {Object} NotionUser
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} avatar_url - Avatar URL
 * @property {string} type - User type
 * @property {Object} [person] - Person details
 * @property {Object} [bot] - Bot details
 */

/**
 * @typedef {Object} NotionParent
 * @property {string} type - Parent type
 * @property {string} [database_id] - Database ID
 * @property {string} [page_id] - Page ID
 * @property {string} [workspace] - Workspace flag
 */

/**
 * @typedef {Object} NotionProperty
 * @property {string} type - Property type
 * @property {NotionRichText[]} [title] - Title content
 * @property {NotionRichText[]} [rich_text] - Rich text content
 * @property {number} [number] - Number value
 * @property {boolean} [checkbox] - Checkbox value
 * @property {Object} [select] - Select value
 * @property {Object[]} [multi_select] - Multi-select values
 * @property {Object} [date] - Date value
 * @property {NotionUser[]} [people] - People values
 * @property {Object[]} [files] - File values
 * @property {string} [url] - URL value
 * @property {string} [email] - Email value
 * @property {string} [phone_number] - Phone number value
 * @property {Object} [formula] - Formula value
 * @property {Object} [relation] - Relation value
 * @property {Object} [rollup] - Rollup value
 */

/**
 * @typedef {Object} NotionPage
 * @property {string} id - Page ID
 * @property {string} object - Object type
 * @property {string} url - Page URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {NotionUser} created_by - Creator user
 * @property {NotionUser} last_edited_by - Last editor user
 * @property {NotionParent} parent - Parent object
 * @property {Record<string, NotionProperty>} properties - Page properties
 * @property {boolean} archived - Archive status
 * @property {NotionRichText[]} [title] - Page title
 */

/**
 * @typedef {Object} NotionDatabase
 * @property {string} id - Database ID
 * @property {string} object - Object type
 * @property {string} url - Database URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {NotionUser} created_by - Creator user
 * @property {NotionUser} last_edited_by - Last editor user
 * @property {NotionParent} parent - Parent object
 * @property {Record<string, NotionProperty>} properties - Database properties
 * @property {boolean} archived - Archive status
 * @property {NotionRichText[]} [title] - Database title
 */

/**
 * @typedef {Object} NotionBlock
 * @property {string} id - Block ID
 * @property {string} object - Object type
 * @property {string} type - Block type
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {boolean} has_children - Has children flag
 * @property {Object} [paragraph] - Paragraph block data
 * @property {Object} [heading_1] - Heading 1 block data
 * @property {Object} [heading_2] - Heading 2 block data
 * @property {Object} [heading_3] - Heading 3 block data
 * @property {Object} [bulleted_list_item] - Bulleted list item data
 * @property {Object} [numbered_list_item] - Numbered list item data
 * @property {Object} [to_do] - To-do block data
 * @property {Object} [quote] - Quote block data
 * @property {Object} [callout] - Callout block data
 * @property {Object} [code] - Code block data
 * @property {Object} [image] - Image block data
 * @property {Object} [file] - File block data
 * @property {Object} [embed] - Embed block data
 */

/**
 * @typedef {Object} NotionSearchResponse
 * @property {(NotionPage|NotionDatabase)[]} results - Search results
 * @property {boolean} has_more - Has more results flag
 * @property {string} [next_cursor] - Next cursor for pagination
 */

/**
 * @typedef {Object} NotionBlocksResponse
 * @property {NotionBlock[]} results - Block results
 * @property {boolean} has_more - Has more results flag
 * @property {string} [next_cursor] - Next cursor for pagination
 */

/**
 * @typedef {Object} NotionQueryResponse
 * @property {NotionPage[]} results - Query results
 * @property {boolean} has_more - Has more results flag
 * @property {string} [next_cursor] - Next cursor for pagination
 */

/**
 * @typedef {Object} FormattedSearchResult
 * @property {string} id - Result ID
 * @property {string} type - Object type
 * @property {string} title - Extracted title
 * @property {string} url - Result URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {NotionParent} parent - Parent object
 */

/**
 * @typedef {Object} FormattedSearchResults
 * @property {FormattedSearchResult[]} results - Formatted results
 * @property {boolean} has_more - Has more results flag
 * @property {string} [next_cursor] - Next cursor for pagination
 */

/**
 * @typedef {Object} FormattedPageData
 * @property {string} id - Page ID
 * @property {string} title - Page title
 * @property {string} url - Page URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {NotionUser} created_by - Creator user
 * @property {NotionUser} last_edited_by - Last editor user
 * @property {NotionParent} parent - Parent object
 * @property {Record<string, NotionProperty>} properties - Page properties
 * @property {boolean} archived - Archive status
 */

/**
 * @typedef {Object} FormattedDatabaseData
 * @property {string} id - Database ID
 * @property {string} title - Database title
 * @property {string} url - Database URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {NotionUser} created_by - Creator user
 * @property {NotionUser} last_edited_by - Last editor user
 * @property {NotionParent} parent - Parent object
 * @property {Record<string, NotionProperty>} properties - Database properties
 * @property {boolean} archived - Archive status
 */

/**
 * @typedef {Object} FormattedBlock
 * @property {string} id - Block ID
 * @property {string} type - Block type
 * @property {string} content - Extracted content
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {boolean} has_children - Has children flag
 */

/**
 * @typedef {Object} FormattedBlocksData
 * @property {FormattedBlock[]} blocks - Formatted blocks
 * @property {boolean} has_more - Has more results flag
 * @property {string} [next_cursor] - Next cursor for pagination
 */

/**
 * @typedef {Object} FormattedQueryResult
 * @property {string} id - Result ID
 * @property {string} title - Result title
 * @property {string} url - Result URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {Record<string, NotionProperty>} properties - Result properties
 * @property {boolean} archived - Archive status
 */

/**
 * @typedef {Object} FormattedQueryResults
 * @property {FormattedQueryResult[]} results - Formatted results
 * @property {boolean} has_more - Has more results flag
 * @property {string} [next_cursor] - Next cursor for pagination
 */

/**
 * @typedef {Object} FormattedUserData
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} avatar_url - Avatar URL
 * @property {string} type - User type
 * @property {Object} [person] - Person details
 * @property {Object} [bot] - Bot details
 */

/**
 * @typedef {Object} NotionResponseData
 * @property {string} action - Action type
 * @property {string} [query] - Search query
 * @property {(NotionPage|NotionDatabase)[]} [results] - Results array
 * @property {NotionPage} [page] - Page object
 * @property {NotionDatabase} [database] - Database object
 * @property {NotionBlock[]} [blocks] - Blocks array
 * @property {string} [pageId] - Page ID
 * @property {string} [databaseId] - Database ID
 * @property {string} [blockId] - Block ID
 * @property {boolean} [deleted] - Deletion status
 * @property {NotionUser} [user] - User object
 * @property {NotionUser[]} [users] - Users array
 * @property {boolean} [hasMore] - Has more flag
 * @property {string} [method] - HTTP method
 * @property {string} [path] - API path
 * @property {unknown} [result] - Raw result
 */

/**
 * Format search results
 * @param {NotionSearchResponse} response - Notion search response
 * @returns {FormattedSearchResults} Formatted search results
 */
export function formatSearchResults(response) {
	if (!response || !response.results) {
		return { results: [], has_more: false };
	}

	const formattedResults = response.results.map(/** @param {NotionPage|NotionDatabase} item */ item => ({
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
 * @param {NotionPage} page - Notion page object
 * @returns {FormattedPageData|null} Formatted page data
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
 * @param {NotionDatabase} database - Notion database object
 * @returns {FormattedDatabaseData|null} Formatted database data
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
 * @param {NotionBlocksResponse} response - Notion blocks response
 * @returns {FormattedBlocksData} Formatted blocks data
 */
export function formatBlocksData(response) {
	if (!response || !response.results) {
		return { blocks: [], has_more: false };
	}

	const formattedBlocks = response.results.map(/** @param {NotionBlock} block */ block => ({
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
 * @param {NotionQueryResponse} response - Notion database query response
 * @returns {FormattedQueryResults} Formatted query results
 */
export function formatQueryResults(response) {
	if (!response || !response.results) {
		return { results: [], has_more: false };
	}

	const formattedResults = response.results.map(/** @param {NotionPage} item */ item => ({
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
 * @param {NotionPage|NotionDatabase} item - Notion page/database object
 * @returns {string} Extracted title
 */
function extractTitle(item) {
	if (!item) return '';

	// For pages and databases, title is in properties
	if (item.properties) {
		// Find title property
		const titleProperty = Object.values(item.properties).find(/** @param {NotionProperty} prop */ prop => prop.type === 'title');
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
 * @param {NotionBlock} block - Notion block object
 * @returns {string} Extracted content
 */
function extractBlockContent(block) {
	if (!block || !block.type) return '';

	const blockType = block.type;
	const blockData = /** @type {Record<string, unknown>} */ (block)[blockType];

	if (!blockData) return '';

	// Handle rich text content
	if (blockData && typeof blockData === 'object' && 'rich_text' in blockData && Array.isArray(blockData.rich_text)) {
		return (/** @type {NotionRichText[]} */ (blockData.rich_text)).map(/** @param {NotionRichText} text */ text => text.plain_text || '').join('');
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
			return (blockData && typeof blockData === 'object' && 'rich_text' in blockData && Array.isArray(blockData.rich_text)) ? 
				(/** @type {NotionRichText[]} */ (blockData.rich_text)).map(/** @param {NotionRichText} text */ text => text.plain_text || '').join('') : '';

		case 'code':
			return (blockData && typeof blockData === 'object' && 'rich_text' in blockData && Array.isArray(blockData.rich_text)) ? 
				(/** @type {NotionRichText[]} */ (blockData.rich_text)).map(/** @param {NotionRichText} text */ text => text.plain_text || '').join('') : '';

		case 'image':
			return (blockData && typeof blockData === 'object' && 'caption' in blockData && Array.isArray(blockData.caption)) ? 
				(/** @type {NotionRichText[]} */ (blockData.caption)).map(/** @param {NotionRichText} text */ text => text.plain_text || '').join('') : '[Image]';

		case 'file':
			return (blockData && typeof blockData === 'object' && 'caption' in blockData && Array.isArray(blockData.caption)) ? 
				(/** @type {NotionRichText[]} */ (blockData.caption)).map(/** @param {NotionRichText} text */ text => text.plain_text || '').join('') : '[File]';

		case 'embed':
			return (blockData && typeof blockData === 'object' && 'url' in blockData && typeof blockData.url === 'string') ? blockData.url : '[Embed]';

		default:
			return `[${blockType}]`;
	}
}

/**
 * Format user data
 * @param {NotionUser} user - Notion user object
 * @returns {FormattedUserData|null} Formatted user data
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
 * @returns {{error: boolean, message: string, timestamp: string}} Formatted error response
 */
export function formatErrorResponse(error) {
	return {
		error: true,
		message: error.message || 'An error occurred',
		timestamp: new Date().toISOString(),
	};
}

/**
 * Format Notion API response
 * @param {NotionResponseData} responseData - Response data with action and results
 * @returns {Record<string, unknown>} Formatted Notion response
 */
export function formatNotionResponse(responseData) {
	const { action, ...data } = responseData;
	
	const baseResponse = {
		action,
		timestamp: new Date().toISOString(),
		success: true,
	};

	// Format based on action type
	switch (action) {
		case 'search':
			return {
				...baseResponse,
				query: data.query,
				results: formatSearchResults({ results: data.results || [], has_more: false }),
			};

		case 'get_page':
			return {
				...baseResponse,
				page: formatPageData(/** @type {NotionPage} */ (data.page)),
			};

		case 'get_page_blocks':
			return {
				...baseResponse,
				pageId: data.pageId,
				blocks: formatBlocksData({ results: data.blocks || [], has_more: false }),
			};

		case 'create_page':
		case 'update_page':
			return {
				...baseResponse,
				page: formatPageData(/** @type {NotionPage} */ (data.page)),
			};

		case 'get_database':
			return {
				...baseResponse,
				database: formatDatabaseData(/** @type {NotionDatabase} */ (data.database)),
			};

		case 'query_database':
			return {
				...baseResponse,
				databaseId: data.databaseId,
				results: formatQueryResults({ results: /** @type {NotionPage[]} */ (data.results || []), has_more: false }),
			};

		case 'create_database':
		case 'update_database':
			return {
				...baseResponse,
				database: formatDatabaseData(/** @type {NotionDatabase} */ (data.database)),
			};

		case 'append_blocks':
			return {
				...baseResponse,
				pageId: data.pageId,
				blocks: formatBlocksData({ results: data.blocks || [], has_more: false }),
			};

		case 'delete_block':
			return {
				...baseResponse,
				blockId: data.blockId,
				deleted: data.deleted,
			};

		case 'get_current_user':
			return {
				...baseResponse,
				user: formatUserData(/** @type {NotionUser} */ (data.user)),
			};

		case 'list_users':
			return {
				...baseResponse,
				users: (data.users || []).map(/** @param {NotionUser} user */ user => formatUserData(user)),
				hasMore: data.hasMore,
			};

		case 'raw_api_call':
			return {
				...baseResponse,
				method: data.method,
				path: data.path,
				data: data.result,
			};

		default:
			return {
				...baseResponse,
				...data,
			};
	}
}
