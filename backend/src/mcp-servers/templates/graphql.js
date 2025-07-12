import fetch from 'node-fetch';

/**
 * GraphQL API Service Template
 * Copy this file and customize for new GraphQL API services
 *
 * Instructions:
 * 1. Copy this file to services/{service-name}.js
 * 2. Replace ALL_CAPS placeholders with actual values
 * 3. Update queries, mutations, and handlers as needed
 * 4. Test with your API credentials
 */
export default {
	// Basic service information
	name: 'SERVICE_NAME', // Technical name (lowercase, no spaces)
	displayName: 'SERVICE_DISPLAY_NAME', // Human-readable name
	description: 'SERVICE_DESCRIPTION', // Brief description of the service
	category: 'SERVICE_CATEGORY', // Category: communication, productivity, development, design, etc.
	iconUrl: 'SERVICE_ICON_URL', // URL to service icon/logo

	// API configuration
	api: {
		baseURL: 'https://api.SERVICE_DOMAIN.com/graphql', // GraphQL endpoint
		version: 'API_VERSION', // API version
		type: 'graphql', // Indicates GraphQL API
		rateLimit: {
			requests: 1000, // Requests per period
			period: 'hour', // hour, minute, second
		},
		documentation: 'https://docs.SERVICE_DOMAIN.com/graphql', // API documentation URL
	},

	// Authentication configuration
	auth: {
		type: 'AUTH_TYPE', // bearer_token, api_key, oauth
		field: 'CREDENTIAL_FIELD_NAME', // Field name in credentials object
		header: 'Authorization', // Usually Authorization for GraphQL
		headerFormat: token => `Bearer ${token}`, // How to format the header value
		validation: {
			format: /^TOKEN_REGEX$/, // Regex to validate token format
			query: 'query { viewer { id } }', // GraphQL query to test token
		},
	},

	// GraphQL queries and mutations
	queries: {
		// User information query
		me: `
			query GetCurrentUser {
				viewer {
					id
					name
					email
					avatar
				}
			}
		`,

		// List items query with variables
		listItems: `
			query ListItems($first: Int, $after: String, $filter: String) {
				items(first: $first, after: $after, filter: $filter) {
					edges {
						node {
							id
							title
							description
							createdAt
							updatedAt
						}
					}
					pageInfo {
						hasNextPage
						hasPreviousPage
						startCursor
						endCursor
					}
					totalCount
				}
			}
		`,

		// Get item details
		itemDetails: `
			query GetItemDetails($id: ID!) {
				item(id: $id) {
					id
					title
					description
					content
					tags
					createdAt
					updatedAt
					author {
						id
						name
					}
				}
			}
		`,
	},

	mutations: {
		// Create new item
		createItem: `
			mutation CreateItem($input: CreateItemInput!) {
				createItem(input: $input) {
					item {
						id
						title
						description
						createdAt
					}
					errors {
						field
						message
					}
				}
			}
		`,

		// Update existing item
		updateItem: `
			mutation UpdateItem($id: ID!, $input: UpdateItemInput!) {
				updateItem(id: $id, input: $input) {
					item {
						id
						title
						description
						updatedAt
					}
					errors {
						field
						message
					}
				}
			}
		`,
	},

	// Standard endpoints (mapped to GraphQL operations)
	endpoints: {
		me: 'me', // Maps to queries.me
		list: 'listItems', // Maps to queries.listItems
		details: 'itemDetails', // Maps to queries.itemDetails
		create: 'createItem', // Maps to mutations.createItem
		update: 'updateItem', // Maps to mutations.updateItem
	},

	// Custom handlers for complex operations
	customHandlers: {
		// Execute GraphQL query helper
		executeQuery: async (config, token, query, variables = {}) => {
			try {
				const response = await fetch(config.api.baseURL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						...(config.auth.headerFormat
							? { [config.auth.header]: config.auth.headerFormat(token) }
							: { [config.auth.header]: token }),
					},
					body: JSON.stringify({
						query,
						variables,
					}),
				});

				if (response.ok) {
					const result = await response.json();
					if (result.errors) {
						throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
					}
					return result.data;
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`GraphQL query failed: ${error.message}`);
			}
		},

		// Enhanced list with pagination
		listItems: async (config, token, options = {}) => {
			const { first = 50, after = null, filter = '' } = options;
			const data = await config.customHandlers.executeQuery(config, token, config.queries.listItems, {
				first,
				after,
				filter,
			});

			return {
				items: data.items.edges.map(edge => edge.node),
				pageInfo: data.items.pageInfo,
				totalCount: data.items.totalCount,
			};
		},

		// Get item details
		getItemDetails: async (config, token, id) => {
			const data = await config.customHandlers.executeQuery(config, token, config.queries.itemDetails, { id });
			return data.item;
		},

		// Create new item
		createItem: async (config, token, input) => {
			const data = await config.customHandlers.executeQuery(config, token, config.mutations.createItem, {
				input,
			});

			if (data.createItem.errors && data.createItem.errors.length > 0) {
				throw new Error(`Validation errors: ${data.createItem.errors.map(e => e.message).join(', ')}`);
			}

			return data.createItem.item;
		},
	},

	// Available tools configuration
	tools: [
		{
			name: 'get_user_info',
			description: 'Get current user information',
			handler: 'executeQuery',
			parameters: {},
		},
		{
			name: 'list_items',
			description: 'List items with pagination and filtering',
			handler: 'listItems',
			parameters: {
				first: {
					type: 'integer',
					description: 'Number of items to fetch',
					required: false,
					default: 50,
				},
				after: {
					type: 'string',
					description: 'Cursor for pagination',
					required: false,
				},
				filter: {
					type: 'string',
					description: 'Filter criteria',
					required: false,
				},
			},
		},
		{
			name: 'get_item_details',
			description: 'Get detailed information about a specific item',
			handler: 'getItemDetails',
			parameters: {
				id: {
					type: 'string',
					description: 'Item ID',
					required: true,
				},
			},
		},
		{
			name: 'create_item',
			description: 'Create a new item',
			handler: 'createItem',
			parameters: {
				input: {
					type: 'object',
					description: 'Item creation input',
					required: true,
					properties: {
						title: { type: 'string', required: true },
						description: { type: 'string', required: false },
						content: { type: 'string', required: false },
					},
				},
			},
		},
	],

	// Available resources configuration
	resources: [
		{
			name: 'user_info',
			uri: 'user/info',
			description: 'Current user information',
			query: 'me',
		},
		{
			name: 'items_list',
			uri: 'items/list',
			description: 'List of items',
			handler: 'listItems',
		},
	],

	// Validation rules
	validation: {
		credentials: async (config, credentials) => {
			const requiredField = config.auth.field;
			if (!credentials[requiredField]) {
				throw new Error(`${requiredField} is required`);
			}

			// Validate token format if regex provided
			if (config.auth.validation.format && !config.auth.validation.format.test(credentials[requiredField])) {
				throw new Error(`Invalid ${requiredField} format`);
			}

			// Test the token with a simple GraphQL query
			try {
				const result = await config.customHandlers.executeQuery(
					config,
					credentials[requiredField],
					config.auth.validation.query
				);

				return {
					valid: true,
					user: result.viewer || result,
				};
			} catch (error) {
				throw new Error(`Failed to validate credentials: ${error.message}`);
			}
		},
	},
};
