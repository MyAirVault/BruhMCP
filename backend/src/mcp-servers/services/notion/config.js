import fetch from 'node-fetch';

/**
 * Notion Service Configuration
 * Complete configuration for Notion API integration
 */
export default {
	// Basic service information
	name: 'Notion',
	displayName: 'Notion',
	description: 'All-in-one workspace for notes, docs, and collaboration',
	category: 'productivity',
	iconUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/notion.svg',

	// API configuration
	api: {
		baseURL: 'https://api.notion.com/v1',
		version: 'v1',
		notionVersion: '2022-06-28',
		rateLimit: {
			requests: 3,
			period: 'second',
		},
		documentation: 'https://developers.notion.com/reference',
	},

	// Authentication configuration
	auth: {
		type: 'bearer_token',
		field: 'integration_token',
		header: 'Authorization',
		headerFormat: token => `Bearer ${token}`,
		validation: {
			format: /^secret_[A-Za-z0-9]+$/,
			endpoint: '/users/me',
		},
	},

	// Standard endpoints
	endpoints: {
		me: '/users/me',
		users: '/users',
		databases: '/databases',
		pages: '/pages',
		blocks: '/blocks',
		search: '/search',
		databaseQuery: databaseId => `/databases/${databaseId}/query`,
		pageBlocks: pageId => `/blocks/${pageId}/children`,
		pageProperties: pageId => `/pages/${pageId}`,
		createPage: '/pages',
		updatePage: pageId => `/pages/${pageId}`,
	},

	// Custom handlers for complex operations
	customHandlers: {
		// Search all accessible content
		searchContent: async (config, token, query = '', filter = {}) => {
			try {
				const payload = {
					query,
					...filter,
					page_size: 100,
				};

				const response = await fetch(`${config.api.baseURL}/search`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
						'Notion-Version': config.api.notionVersion,
					},
					body: JSON.stringify(payload),
				});

				if (response.ok) {
					const data = await response.json();
					return {
						results: data.results.map(item => ({
							id: item.id,
							object: item.object,
							type: item.type || (item.object === 'database' ? 'database' : 'page'),
							title: item.title || item.properties?.title?.title || 'Untitled',
							url: item.url,
							created_time: item.created_time,
							last_edited_time: item.last_edited_time,
							parent: item.parent,
						})),
						total: data.results.length,
						has_more: data.has_more,
						next_cursor: data.next_cursor,
					};
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to search content: ${error.message}`);
			}
		},

		// Get database entries
		queryDatabase: async (config, token, databaseId, filter = {}, sorts = []) => {
			try {
				const payload = {
					filter,
					sorts,
					page_size: 100,
				};

				const response = await fetch(`${config.api.baseURL}/databases/${databaseId}/query`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
						'Notion-Version': config.api.notionVersion,
					},
					body: JSON.stringify(payload),
				});

				if (response.ok) {
					const data = await response.json();
					return {
						results: data.results.map(page => ({
							id: page.id,
							created_time: page.created_time,
							last_edited_time: page.last_edited_time,
							properties: page.properties,
							url: page.url,
						})),
						total: data.results.length,
						has_more: data.has_more,
						next_cursor: data.next_cursor,
					};
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to query database: ${error.message}`);
			}
		},

		// Get page content with blocks
		getPageContent: async (config, token, pageId) => {
			try {
				// Get page properties
				const pageResponse = await fetch(`${config.api.baseURL}/pages/${pageId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
						'Notion-Version': config.api.notionVersion,
					},
				});

				// Get page blocks
				const blocksResponse = await fetch(`${config.api.baseURL}/blocks/${pageId}/children`, {
					headers: {
						Authorization: `Bearer ${token}`,
						'Notion-Version': config.api.notionVersion,
					},
				});

				if (pageResponse.ok && blocksResponse.ok) {
					const pageData = await pageResponse.json();
					const blocksData = await blocksResponse.json();

					return {
						page: {
							id: pageData.id,
							created_time: pageData.created_time,
							last_edited_time: pageData.last_edited_time,
							properties: pageData.properties,
							url: pageData.url,
							parent: pageData.parent,
						},
						blocks: blocksData.results.map(block => ({
							id: block.id,
							type: block.type,
							content: block[block.type],
							has_children: block.has_children,
						})),
						total_blocks: blocksData.results.length,
					};
				} else {
					throw new Error(`Failed to fetch page data`);
				}
			} catch (error) {
				throw new Error(`Failed to get page content: ${error.message}`);
			}
		},

		// Create a new page
		createPage: async (config, token, parent, properties, children = []) => {
			try {
				const payload = {
					parent,
					properties,
					children,
				};

				const response = await fetch(`${config.api.baseURL}/pages`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
						'Notion-Version': config.api.notionVersion,
					},
					body: JSON.stringify(payload),
				});

				if (response.ok) {
					return await response.json();
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to create page: ${error.message}`);
			}
		},
	},

	// Available tools configuration
	tools: [
		{
			name: 'get_user_info',
			description: 'Get current integration user information',
			endpoint: 'me',
			parameters: {},
		},
		{
			name: 'search_content',
			description: 'Search all accessible Notion content (pages and databases)',
			handler: 'searchContent',
			parameters: {
				query: {
					type: 'string',
					description: 'Search query text',
					required: false,
					default: '',
				},
				filter: {
					type: 'object',
					description: 'Filter options (object_type: page/database)',
					required: false,
					default: {},
				},
			},
		},
		{
			name: 'query_database',
			description: 'Query entries from a specific database',
			handler: 'queryDatabase',
			parameters: {
				databaseId: {
					type: 'string',
					description: 'Database ID to query',
					required: true,
				},
				filter: {
					type: 'object',
					description: 'Filter conditions',
					required: false,
					default: {},
				},
				sorts: {
					type: 'array',
					description: 'Sort conditions',
					required: false,
					default: [],
				},
			},
		},
		{
			name: 'get_page_content',
			description: 'Get page properties and content blocks',
			handler: 'getPageContent',
			parameters: {
				pageId: {
					type: 'string',
					description: 'Page ID to retrieve',
					required: true,
				},
			},
		},
		{
			name: 'create_page',
			description: 'Create a new page in Notion',
			handler: 'createPage',
			parameters: {
				parent: {
					type: 'object',
					description: 'Parent page or database reference',
					required: true,
				},
				properties: {
					type: 'object',
					description: 'Page properties',
					required: true,
				},
				children: {
					type: 'array',
					description: 'Initial content blocks',
					required: false,
					default: [],
				},
			},
		},
	],

	// Available resources configuration
	resources: [
		{
			name: 'user_info',
			uri: 'user/info',
			description: 'Integration user information',
			endpoint: 'me',
		},
		{
			name: 'search_results',
			uri: 'search/all',
			description: 'Search results for all accessible content',
			handler: 'searchContent',
		},
	],

	// Validation rules
	validation: {
		credentials: async (config, credentials) => {
			if (!credentials.integration_token) {
				throw new Error('Integration token is required');
			}

			if (!config.auth.validation.format.test(credentials.integration_token)) {
				throw new Error('Invalid Notion integration token format. Should start with "secret_"');
			}

			// Test the token
			try {
				const response = await fetch(`${config.api.baseURL}${config.auth.validation.endpoint}`, {
					headers: {
						Authorization: `Bearer ${credentials.integration_token}`,
						'Notion-Version': config.api.notionVersion,
					},
				});

				if (!response.ok) {
					throw new Error(`API validation failed: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				return {
					valid: true,
					user: data,
				};
			} catch (error) {
				throw new Error(`Failed to validate token: ${error.message}`);
			}
		},
	},
};
