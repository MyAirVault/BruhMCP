import fetch from 'node-fetch';

/**
 * Slack Service Configuration
 * Complete configuration for Slack API integration
 */
export default {
	// Basic service information
	name: 'Slack',
	displayName: 'Slack',
	description: 'Business communication platform with channels and messaging',
	category: 'communication',
	iconUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/slack.svg',
	
	// API configuration
	api: {
		baseURL: 'https://slack.com/api',
		version: 'v1',
		rateLimit: {
			requests: 100,
			period: 'minute'
		},
		documentation: 'https://api.slack.com/'
	},

	// Authentication configuration
	auth: {
		type: 'bearer_token',
		field: 'bot_token',
		header: 'Authorization',
		headerFormat: token => `Bearer ${token}`,
		validation: {
			format: /^xoxb-[A-Za-z0-9-]+$/,
			endpoint: '/auth.test'
		}
	},

	// Standard endpoints
	endpoints: {
		me: '/auth.test',
		channels: '/conversations.list',
		users: '/users.list',
		messages: '/conversations.history',
		profile: '/users.profile.get',
		presence: '/users.getPresence',
		sendMessage: '/chat.postMessage',
		channelInfo: channelId => `/conversations.info?channel=${channelId}`,
		userInfo: userId => `/users.info?user=${userId}`,
		channelMembers: channelId => `/conversations.members?channel=${channelId}`
	},

	// Custom handlers for complex operations
	customHandlers: {
		// Get workspace info and channels
		workspaceInfo: async (config, token) => {
			const results = {
				auth_info: null,
				channels: [],
				users: [],
				available_endpoints: [],
				errors: [],
			};

			// Get auth test (workspace info)
			try {
				const authResponse = await fetch(`${config.api.baseURL}/auth.test`, {
					headers: { 'Authorization': `Bearer ${token}` },
				});
				if (authResponse.ok) {
					results.auth_info = await authResponse.json();
					results.available_endpoints.push('/auth.test - ✅ Available');
				} else {
					results.available_endpoints.push(`/auth.test - ❌ ${authResponse.status}`);
				}
			} catch (error) {
				results.errors.push('Failed to get auth info: ' + error.message);
			}

			// Get channels list
			try {
				const channelsResponse = await fetch(`${config.api.baseURL}/conversations.list?types=public_channel,private_channel`, {
					headers: { 'Authorization': `Bearer ${token}` },
				});
				if (channelsResponse.ok) {
					const channelsData = await channelsResponse.json();
					if (channelsData.ok) {
						results.channels = channelsData.channels;
						results.available_endpoints.push('/conversations.list - ✅ Available');
					}
				} else {
					results.available_endpoints.push(`/conversations.list - ❌ ${channelsResponse.status}`);
				}
			} catch (error) {
				results.errors.push('Failed to get channels: ' + error.message);
			}

			return {
				...results,
				totalChannels: results.channels.length,
				workspace: results.auth_info?.team || 'Unknown',
				bot_user: results.auth_info?.user || 'Unknown'
			};
		},

		// Send message to channel
		sendMessage: async (config, token, channel, text, options = {}) => {
			try {
				const payload = {
					channel,
					text,
					...options
				};

				const response = await fetch(`${config.api.baseURL}/chat.postMessage`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				});
				
				if (response.ok) {
					return await response.json();
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to send message: ${error.message}`);
			}
		},

		// Get channel messages
		channelHistory: async (config, token, channel, limit = 50) => {
			try {
				const response = await fetch(`${config.api.baseURL}/conversations.history?channel=${channel}&limit=${limit}`, {
					headers: { 'Authorization': `Bearer ${token}` },
				});
				
				if (response.ok) {
					const data = await response.json();
					if (data.ok) {
						return {
							messages: data.messages.map(msg => ({
								type: msg.type,
								user: msg.user,
								text: msg.text,
								timestamp: msg.ts,
								thread_ts: msg.thread_ts,
								reactions: msg.reactions
							})),
							total: data.messages.length,
							channel
						};
					} else {
						throw new Error(`Slack API error: ${data.error}`);
					}
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to get channel history: ${error.message}`);
			}
		}
	},

	// Available tools configuration
	tools: [
		{
			name: 'get_workspace_info',
			description: 'Get workspace information and authentication details',
			endpoint: 'me',
			parameters: {}
		},
		{
			name: 'list_channels',
			description: 'List workspace channels and basic info',
			handler: 'workspaceInfo',
			parameters: {}
		},
		{
			name: 'send_message',
			description: 'Send a message to a Slack channel',
			handler: 'sendMessage',
			parameters: {
				channel: {
					type: 'string',
					description: 'Channel ID or name to send message to',
					required: true
				},
				text: {
					type: 'string',
					description: 'Message text to send',
					required: true
				},
				thread_ts: {
					type: 'string',
					description: 'Reply to thread timestamp (optional)',
					required: false
				}
			}
		},
		{
			name: 'get_channel_history',
			description: 'Get recent messages from a channel',
			handler: 'channelHistory',
			parameters: {
				channel: {
					type: 'string',
					description: 'Channel ID to get history from',
					required: true
				},
				limit: {
					type: 'integer',
					description: 'Number of messages to retrieve (max 1000)',
					required: false,
					default: 50
				}
			}
		}
	],

	// Available resources configuration
	resources: [
		{
			name: 'workspace_info',
			uri: 'workspace/info',
			description: 'Slack workspace information and bot details',
			handler: 'workspaceInfo'
		},
		{
			name: 'auth_info',
			uri: 'auth/info',
			description: 'Authentication and bot information',
			endpoint: 'me'
		}
	],

	// Validation rules
	validation: {
		credentials: async (config, credentials) => {
			if (!credentials.bot_token) {
				throw new Error('Bot token is required');
			}
			
			if (!config.auth.validation.format.test(credentials.bot_token)) {
				throw new Error('Invalid Slack bot token format. Should start with "xoxb-"');
			}

			// Test the token
			try {
				const response = await fetch(`${config.api.baseURL}${config.auth.validation.endpoint}`, {
					headers: { 'Authorization': `Bearer ${credentials.bot_token}` },
				});

				if (!response.ok) {
					throw new Error(`API validation failed: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				if (!data.ok) {
					throw new Error(`Slack API error: ${data.error}`);
				}

				return {
					valid: true,
					workspace: data.team,
					user: data.user,
					bot_id: data.bot_id
				};
			} catch (error) {
				throw new Error(`Failed to validate token: ${error.message}`);
			}
		}
	}
};