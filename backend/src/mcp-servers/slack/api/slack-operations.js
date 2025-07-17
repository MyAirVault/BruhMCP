/**
 * Slack API Operations
 * Specialized operations that extend the core Slack API functionality
 */

import { logApiRequest, logApiResponse, createTimer } from '../utils/logger.js';
import { formatSlackResponse, formatMessageResponse, formatChannelResponse, formatUserResponse } from '../utils/slack-formatting.js';

const SLACK_API_BASE = 'https://slack.com/api';

/**
 * Make authenticated request to Slack API with logging
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {string} instanceId - Instance ID for logging
 * @param {Object} options - Request options
 * @returns {Object} API response
 */
async function makeSlackRequest(endpoint, bearerToken, instanceId, options = {}) {
	const url = `${SLACK_API_BASE}${endpoint}`;
	const timer = createTimer(`Slack API ${options.method || 'GET'} ${endpoint}`, instanceId);

	// Log request
	logApiRequest(options.method || 'GET', endpoint, instanceId, options.body);

	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json',
			...options.headers,
		},
		...options,
	};

	// Handle form data for certain endpoints
	if (options.formData) {
		delete requestOptions.headers['Content-Type'];
		requestOptions.body = options.formData;
	} else if (options.body && typeof options.body === 'object') {
		requestOptions.body = JSON.stringify(options.body);
	}

	try {
		const response = await fetch(url, requestOptions);
		const duration = timer.end(response.ok);

		if (!response.ok) {
			const errorText = await response.text();
			let errorMessage = `Slack API error: ${response.status} ${response.statusText}`;

			try {
				const errorData = JSON.parse(errorText);
				if (errorData.error) {
					errorMessage = `Slack API error: ${errorData.error}`;
				}
			} catch (parseError) {
				// Use the default error message if JSON parsing fails
			}

			logApiResponse(options.method || 'GET', endpoint, instanceId, false, duration, { error: errorMessage });
			throw new Error(errorMessage);
		}

		const data = await response.json();
		
		// Check for Slack-specific error in response
		if (data.ok === false) {
			logApiResponse(options.method || 'GET', endpoint, instanceId, false, duration, { error: data.error });
			throw new Error(`Slack API error: ${data.error}`);
		}

		logApiResponse(options.method || 'GET', endpoint, instanceId, true, duration);
		return data;
	} catch (error) {
		const duration = timer.end(false, { error: error.message });
		logApiResponse(options.method || 'GET', endpoint, instanceId, false, duration, { error: error.message });
		throw error;
	}
}

/**
 * Bulk message operations
 */
export class MessageOperations {
	constructor(bearerToken, instanceId) {
		this.bearerToken = bearerToken;
		this.instanceId = instanceId;
	}

	/**
	 * Send multiple messages to different channels
	 * @param {Array} messages - Array of message objects
	 * @returns {Array} Results for each message
	 */
	async sendBulkMessages(messages) {
		const results = [];
		
		for (const message of messages) {
			try {
				const result = await makeSlackRequest('/chat.postMessage', this.bearerToken, this.instanceId, {
					method: 'POST',
					body: message
				});
				results.push({ success: true, result: formatMessageResponse(result) });
			} catch (error) {
				results.push({ success: false, error: error.message });
			}
		}
		
		return results;
	}

	/**
	 * Update multiple messages
	 * @param {Array} updates - Array of message update objects
	 * @returns {Array} Results for each update
	 */
	async updateBulkMessages(updates) {
		const results = [];
		
		for (const update of updates) {
			try {
				const result = await makeSlackRequest('/chat.update', this.bearerToken, this.instanceId, {
					method: 'POST',
					body: update
				});
				results.push({ success: true, result: formatMessageResponse(result) });
			} catch (error) {
				results.push({ success: false, error: error.message });
			}
		}
		
		return results;
	}

	/**
	 * Delete multiple messages
	 * @param {Array} deletions - Array of message deletion objects
	 * @returns {Array} Results for each deletion
	 */
	async deleteBulkMessages(deletions) {
		const results = [];
		
		for (const deletion of deletions) {
			try {
				const result = await makeSlackRequest('/chat.delete', this.bearerToken, this.instanceId, {
					method: 'POST',
					body: deletion
				});
				results.push({ success: true, result });
			} catch (error) {
				results.push({ success: false, error: error.message });
			}
		}
		
		return results;
	}
}

/**
 * Channel management operations
 */
export class ChannelOperations {
	constructor(bearerToken, instanceId) {
		this.bearerToken = bearerToken;
		this.instanceId = instanceId;
	}

	/**
	 * Get detailed channel analytics
	 * @param {string} channelId - Channel ID
	 * @returns {Object} Channel analytics
	 */
	async getChannelAnalytics(channelId) {
		try {
			// Get channel info
			const channelInfo = await makeSlackRequest('/conversations.info', this.bearerToken, this.instanceId, {
				method: 'GET',
				body: { channel: channelId }
			});

			// Get channel members
			const members = await makeSlackRequest('/conversations.members', this.bearerToken, this.instanceId, {
				method: 'GET',
				body: { channel: channelId }
			});

			// Get recent messages for activity analysis
			const history = await makeSlackRequest('/conversations.history', this.bearerToken, this.instanceId, {
				method: 'GET',
				body: { channel: channelId, limit: 100 }
			});

			return {
				channel: formatChannelResponse(channelInfo.channel),
				memberCount: members.members?.length || 0,
				recentActivity: {
					messageCount: history.messages?.length || 0,
					lastMessage: history.messages?.[0]?.ts || null
				}
			};
		} catch (error) {
			throw new Error(`Failed to get channel analytics: ${error.message}`);
		}
	}

	/**
	 * Bulk channel operations
	 * @param {Array} channels - Array of channel IDs
	 * @param {string} operation - Operation to perform ('archive', 'unarchive', 'join', 'leave')
	 * @returns {Array} Results for each operation
	 */
	async bulkChannelOperations(channels, operation) {
		const results = [];
		const endpoints = {
			archive: '/conversations.archive',
			unarchive: '/conversations.unarchive',
			join: '/conversations.join',
			leave: '/conversations.leave'
		};

		const endpoint = endpoints[operation];
		if (!endpoint) {
			throw new Error(`Invalid operation: ${operation}`);
		}

		for (const channelId of channels) {
			try {
				const result = await makeSlackRequest(endpoint, this.bearerToken, this.instanceId, {
					method: 'POST',
					body: { channel: channelId }
				});
				results.push({ channelId, success: true, result });
			} catch (error) {
				results.push({ channelId, success: false, error: error.message });
			}
		}

		return results;
	}
}

/**
 * User management operations
 */
export class UserOperations {
	constructor(bearerToken, instanceId) {
		this.bearerToken = bearerToken;
		this.instanceId = instanceId;
	}

	/**
	 * Get user activity summary
	 * @param {string} userId - User ID
	 * @returns {Object} User activity summary
	 */
	async getUserActivity(userId) {
		try {
			// Get user info
			const userInfo = await makeSlackRequest('/users.info', this.bearerToken, this.instanceId, {
				method: 'GET',
				body: { user: userId }
			});

			// Get user's presence
			const presence = await makeSlackRequest('/users.getPresence', this.bearerToken, this.instanceId, {
				method: 'GET',
				body: { user: userId }
			});

			return {
				user: formatUserResponse(userInfo.user),
				presence: presence.presence,
				lastActivity: presence.last_activity || null
			};
		} catch (error) {
			throw new Error(`Failed to get user activity: ${error.message}`);
		}
	}

	/**
	 * Bulk user lookup
	 * @param {Array} userIds - Array of user IDs
	 * @returns {Array} User information for each ID
	 */
	async bulkUserLookup(userIds) {
		const results = [];
		
		for (const userId of userIds) {
			try {
				const result = await makeSlackRequest('/users.info', this.bearerToken, this.instanceId, {
					method: 'GET',
					body: { user: userId }
				});
				results.push({ userId, success: true, user: formatUserResponse(result.user) });
			} catch (error) {
				results.push({ userId, success: false, error: error.message });
			}
		}
		
		return results;
	}
}

/**
 * File operations
 */
export class FileOperations {
	constructor(bearerToken, instanceId) {
		this.bearerToken = bearerToken;
		this.instanceId = instanceId;
	}

	/**
	 * Upload file with progress tracking
	 * @param {Object} fileData - File data and metadata
	 * @returns {Object} Upload result
	 */
	async uploadFileWithProgress(fileData) {
		try {
			const formData = new FormData();
			formData.append('file', fileData.file);
			
			if (fileData.channels) {
				formData.append('channels', fileData.channels);
			}
			
			if (fileData.title) {
				formData.append('title', fileData.title);
			}
			
			if (fileData.initial_comment) {
				formData.append('initial_comment', fileData.initial_comment);
			}

			const result = await makeSlackRequest('/files.upload', this.bearerToken, this.instanceId, {
				method: 'POST',
				formData
			});

			return formatSlackResponse(result);
		} catch (error) {
			throw new Error(`Failed to upload file: ${error.message}`);
		}
	}

	/**
	 * Delete multiple files
	 * @param {Array} fileIds - Array of file IDs
	 * @returns {Array} Results for each deletion
	 */
	async bulkDeleteFiles(fileIds) {
		const results = [];
		
		for (const fileId of fileIds) {
			try {
				const result = await makeSlackRequest('/files.delete', this.bearerToken, this.instanceId, {
					method: 'POST',
					body: { file: fileId }
				});
				results.push({ fileId, success: true, result });
			} catch (error) {
				results.push({ fileId, success: false, error: error.message });
			}
		}
		
		return results;
	}
}

/**
 * Workspace operations
 */
export class WorkspaceOperations {
	constructor(bearerToken, instanceId) {
		this.bearerToken = bearerToken;
		this.instanceId = instanceId;
	}

	/**
	 * Get comprehensive workspace statistics
	 * @returns {Object} Workspace statistics
	 */
	async getWorkspaceStats() {
		try {
			// Get team info
			const teamInfo = await makeSlackRequest('/team.info', this.bearerToken, this.instanceId, {
				method: 'GET'
			});

			// Get channel list
			const channels = await makeSlackRequest('/conversations.list', this.bearerToken, this.instanceId, {
				method: 'GET',
				body: { types: 'public_channel,private_channel' }
			});

			// Get user list
			const users = await makeSlackRequest('/users.list', this.bearerToken, this.instanceId, {
				method: 'GET'
			});

			return {
				team: teamInfo.team,
				stats: {
					totalChannels: channels.channels?.length || 0,
					totalUsers: users.members?.length || 0,
					activeUsers: users.members?.filter(user => !user.deleted && !user.is_bot).length || 0
				}
			};
		} catch (error) {
			throw new Error(`Failed to get workspace stats: ${error.message}`);
		}
	}

	/**
	 * Search across multiple content types
	 * @param {string} query - Search query
	 * @param {Array} types - Content types to search ('messages', 'files')
	 * @returns {Object} Search results
	 */
	async comprehensiveSearch(query, types = ['messages', 'files']) {
		const results = {};
		
		for (const type of types) {
			try {
				const endpoint = type === 'messages' ? '/search.messages' : '/search.files';
				const result = await makeSlackRequest(endpoint, this.bearerToken, this.instanceId, {
					method: 'GET',
					body: { query }
				});
				results[type] = result;
			} catch (error) {
				results[type] = { error: error.message };
			}
		}
		
		return results;
	}
}

/**
 * Create operation instances
 */
export function createSlackOperations(bearerToken, instanceId) {
	return {
		messages: new MessageOperations(bearerToken, instanceId),
		channels: new ChannelOperations(bearerToken, instanceId),
		users: new UserOperations(bearerToken, instanceId),
		files: new FileOperations(bearerToken, instanceId),
		workspace: new WorkspaceOperations(bearerToken, instanceId)
	};
}