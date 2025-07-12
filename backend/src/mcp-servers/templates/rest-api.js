import fetch from 'node-fetch';

/**
 * REST API Service Template
 * Copy this file and customize for new REST API services
 *
 * Instructions:
 * 1. Copy this file to services/{service-name}.js
 * 2. Replace ALL_CAPS placeholders with actual values
 * 3. Update endpoints, tools, and handlers as needed
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
		baseURL: 'https://api.SERVICE_DOMAIN.com/API_VERSION', // Base API URL
		version: 'API_VERSION', // API version
		rateLimit: {
			requests: 1000, // Requests per period
			period: 'hour', // hour, minute, second
		},
		documentation: 'https://docs.SERVICE_DOMAIN.com/api', // API documentation URL
	},

	// Authentication configuration
	auth: {
		type: 'AUTH_TYPE', // api_key, bearer_token, oauth, basic_auth
		field: 'CREDENTIAL_FIELD_NAME', // Field name in credentials object
		header: 'HEADER_NAME', // HTTP header name (e.g., 'Authorization', 'X-API-Key')
		headerFormat: token => `Bearer ${token}`, // How to format the header value
		validation: {
			format: /^TOKEN_REGEX$/, // Regex to validate token format
			endpoint: '/VALIDATION_ENDPOINT', // Endpoint to test token validity
		},
	},

	// Standard endpoints - customize for your service
	endpoints: {
		me: '/me', // User info endpoint
		list: '/items', // List items endpoint
		details: id => `/items/${id}`, // Item details endpoint
		create: '/items', // Create item endpoint
		update: id => `/items/${id}`, // Update item endpoint
		delete: id => `/items/${id}`, // Delete item endpoint
	},

	// Custom handlers for complex operations
	customHandlers: {
		// Example: Enhanced list with pagination and filtering
		listItems: async (config, token, options = {}) => {
			try {
				const { limit = 50, offset = 0, filter = '' } = options;
				const url = `${config.api.baseURL}/items?limit=${limit}&offset=${offset}&filter=${filter}`;

				const response = await fetch(url, {
					headers: config.auth.headerFormat
						? { [config.auth.header]: config.auth.headerFormat(token) }
						: { [config.auth.header]: token },
				});

				if (response.ok) {
					const data = await response.json();
					return {
						items: data.items || data.results || data,
						total: data.total || data.count || (data.items ? data.items.length : 0),
						limit,
						offset,
						hasMore: data.hasMore || data.has_more || false,
					};
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to list items: ${error.message}`);
			}
		},

		// Example: Create new item
		createItem: async (config, token, itemData) => {
			try {
				const response = await fetch(`${config.api.baseURL}/items`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						...(config.auth.headerFormat
							? { [config.auth.header]: config.auth.headerFormat(token) }
							: { [config.auth.header]: token }),
					},
					body: JSON.stringify(itemData),
				});

				if (response.ok) {
					return await response.json();
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to create item: ${error.message}`);
			}
		},
	},

	// Available tools configuration
	tools: [
		{
			name: 'get_user_info',
			description: 'Get current user information',
			endpoint: 'me',
			parameters: {},
		},
		{
			name: 'list_items',
			description: 'List items with optional filtering',
			handler: 'listItems',
			parameters: {
				limit: {
					type: 'integer',
					description: 'Maximum number of items to return',
					required: false,
					default: 50,
				},
				offset: {
					type: 'integer',
					description: 'Number of items to skip',
					required: false,
					default: 0,
				},
				filter: {
					type: 'string',
					description: 'Filter criteria',
					required: false,
				},
			},
		},
		{
			name: 'create_item',
			description: 'Create a new item',
			handler: 'createItem',
			parameters: {
				itemData: {
					type: 'object',
					description: 'Item data to create',
					required: true,
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
			endpoint: 'me',
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

			// Test the token against the API
			try {
				const headers = config.auth.headerFormat
					? { [config.auth.header]: config.auth.headerFormat(credentials[requiredField]) }
					: { [config.auth.header]: credentials[requiredField] };

				const response = await fetch(`${config.api.baseURL}${config.auth.validation.endpoint}`, {
					headers,
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
				throw new Error(`Failed to validate credentials: ${error.message}`);
			}
		},
	},
};
