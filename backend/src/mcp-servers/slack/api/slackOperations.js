/**
 * Slack API Operations
 * Specialized operations that extend the core Slack API functionality
 */

import { logApiRequest, logApiResponse, createTimer } from '../utils/logger.js';
import { formatSlackResponse, formatMessageResponse, formatChannelResponse, formatUserResponse } from '../utils/slackFormatting.js';

const SLACK_API_BASE = 'https://slack.com/api';

/**
 * Request options for Slack API calls
 * @typedef {Object} SlackRequestOptions
 * @property {string} [method] - HTTP method
 * @property {Record<string, string>} [headers] - Additional headers
 * @property {Record<string, unknown>|string} [body] - Request body
 * @property {FormData} [formData] - Form data for file uploads
 */

/**
 * Make authenticated request to Slack API with logging
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {string} instanceId - Instance ID for logging
 * @param {SlackRequestOptions} options - Request options
 * @returns {Promise<Object>} API response
 */
async function makeSlackRequest(endpoint, bearerToken, instanceId, options = {}) {
	const url = `${SLACK_API_BASE}${endpoint}`;
	const timer = createTimer(`Slack API ${options.method || 'GET'} ${endpoint}`, instanceId);

	// Log request
	logApiRequest(options.method || 'GET', endpoint, instanceId, options.body);

	const baseHeaders = {
		Authorization: `Bearer ${bearerToken}`,
		'Content-Type': 'application/json',
		...(options.headers || {}),
	};

	let requestOptions;

	// Handle form data for certain endpoints
	if (options.formData) {
		// Remove Content-Type to let browser set boundary for form data
		const { 'Content-Type': _, ...headersWithoutContentType } = baseHeaders;
		requestOptions = {
			method: options.method || 'GET',
			headers: headersWithoutContentType,
			body: options.formData
		};
	} else if (options.body && typeof options.body === 'object') {
		requestOptions = {
			method: options.method || 'GET',
			headers: baseHeaders,
			body: JSON.stringify(options.body)
		};
	} else if (options.body && typeof options.body === 'string') {
		requestOptions = {
			method: options.method || 'GET',
			headers: baseHeaders,
			body: options.body
		};
	} else {
		requestOptions = {
			method: options.method || 'GET',
			headers: baseHeaders
		};
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
		if (typeof data === 'object' && data !== null && 'ok' in data && data.ok === false) {
			const errorMsg = typeof data === 'object' && data !== null && 'error' in data ? String(data.error) : 'Unknown error';
			logApiResponse(options.method || 'GET', endpoint, instanceId, false, duration, { error: errorMsg });
			throw new Error(`Slack API error: ${errorMsg}`);
		}

		logApiResponse(options.method || 'GET', endpoint, instanceId, true, duration);
		return data;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		const duration = timer.end(false, { error: errorMessage });
		logApiResponse(options.method || 'GET', endpoint, instanceId, false, duration, { error: errorMessage });
		throw error;
	}
}

/**
 * Message send/update/delete object
 * @typedef {Object} MessageOperation
 * @property {string} channel - Channel ID
 * @property {string} [text] - Message text
 * @property {string} [ts] - Message timestamp (for updates/deletes)
 * @property {Object[]} [attachments] - Message attachments
 * @property {Object[]} [blocks] - Message blocks
 */

/**
 * Operation result object
 * @typedef {Object} OperationResult
 * @property {boolean} success - Whether operation succeeded
 * @property {*} [result] - Result data if successful
 * @property {string} [error] - Error message if failed
 */

/**
 * Bulk message operations
 */
export class MessageOperations {
	/**
	 * @param {string} bearerToken - OAuth Bearer token
	 * @param {string} instanceId - Instance ID for logging
	 */
	constructor(bearerToken, instanceId) {
		this.bearerToken = bearerToken;
		this.instanceId = instanceId;
	}

	/**
	 * Send multiple messages to different channels
	 * @param {MessageOperation[]} messages - Array of message objects
	 * @returns {Promise<OperationResult[]>} Results for each message
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
				const errorMessage = error instanceof Error ? error.message : String(error);
				results.push({ success: false, error: errorMessage });
			}
		}
		
		return results;
	}

	/**
	 * Update multiple messages
	 * @param {MessageOperation[]} updates - Array of message update objects
	 * @returns {Promise<OperationResult[]>} Results for each update
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
				const errorMessage = error instanceof Error ? error.message : String(error);
				results.push({ success: false, error: errorMessage });
			}
		}
		
		return results;
	}

	/**
	 * Delete multiple messages
	 * @param {MessageOperation[]} deletions - Array of message deletion objects
	 * @returns {Promise<OperationResult[]>} Results for each deletion
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
				const errorMessage = error instanceof Error ? error.message : String(error);
				results.push({ success: false, error: errorMessage });
			}
		}
		
		return results;
	}
}

/**
 * Channel analytics result
 * @typedef {Object} ChannelAnalytics
 * @property {Object|null} channel - Channel information
 * @property {number} memberCount - Number of members
 * @property {Object} recentActivity - Recent activity data
 * @property {number} recentActivity.messageCount - Number of recent messages
 * @property {string|null} recentActivity.lastMessage - Last message timestamp
 */

/**
 * Channel operation result
 * @typedef {Object} ChannelOperationResult
 * @property {string} channelId - Channel ID
 * @property {boolean} success - Whether operation succeeded
 * @property {Object} [result] - Result data if successful
 * @property {string} [error] - Error message if failed
 */

/**
 * Channel management operations
 */
export class ChannelOperations {
	/**
	 * @param {string} bearerToken - OAuth Bearer token
	 * @param {string} instanceId - Instance ID for logging
	 */
	constructor(bearerToken, instanceId) {
		this.bearerToken = bearerToken;
		this.instanceId = instanceId;
	}

	/**
	 * Get detailed channel analytics
	 * @param {string} channelId - Channel ID
	 * @returns {Promise<ChannelAnalytics>} Channel analytics
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

			const channelData = (typeof channelInfo === 'object' && channelInfo !== null && 'channel' in channelInfo) ? channelInfo.channel : null;
			const memberData = (typeof members === 'object' && members !== null && 'members' in members && Array.isArray(members.members)) ? members.members : [];
			const messageData = (typeof history === 'object' && history !== null && 'messages' in history && Array.isArray(history.messages)) ? history.messages : [];
			
			return {
				channel: formatChannelResponse(channelData),
				memberCount: memberData.length,
				recentActivity: {
					messageCount: messageData.length,
					lastMessage: messageData.length > 0 && typeof messageData[0] === 'object' && messageData[0] !== null && 'ts' in messageData[0] ? String(messageData[0].ts) : null
				}
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to get channel analytics: ${errorMessage}`);
		}
	}

	/**
	 * Bulk channel operations
	 * @param {string[]} channels - Array of channel IDs
	 * @param {'archive'|'unarchive'|'join'|'leave'} operation - Operation to perform
	 * @returns {Promise<ChannelOperationResult[]>} Results for each operation
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
				const errorMessage = error instanceof Error ? error.message : String(error);
				results.push({ channelId, success: false, error: errorMessage });
			}
		}

		return results;
	}
}

/**
 * User activity summary
 * @typedef {Object} UserActivity
 * @property {Object|null} user - User information
 * @property {string} presence - User presence status
 * @property {number|null} lastActivity - Last activity timestamp
 */

/**
 * User lookup result
 * @typedef {Object} UserLookupResult
 * @property {string} userId - User ID
 * @property {boolean} success - Whether lookup succeeded
 * @property {Object|null} [user] - User data if successful
 * @property {string} [error] - Error message if failed
 */

/**
 * User management operations
 */
export class UserOperations {
	/**
	 * @param {string} bearerToken - OAuth Bearer token
	 * @param {string} instanceId - Instance ID for logging
	 */
	constructor(bearerToken, instanceId) {
		this.bearerToken = bearerToken;
		this.instanceId = instanceId;
	}

	/**
	 * Get user activity summary
	 * @param {string} userId - User ID
	 * @returns {Promise<UserActivity>} User activity summary
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

			const userData = (typeof userInfo === 'object' && userInfo !== null && 'user' in userInfo) ? userInfo.user : null;
			const presenceStatus = (typeof presence === 'object' && presence !== null && 'presence' in presence) ? String(presence.presence) : 'unknown';
			const lastActivity = (typeof presence === 'object' && presence !== null && 'last_activity' in presence && typeof presence.last_activity === 'number') ? presence.last_activity : null;
			
			return {
				user: formatUserResponse(userData),
				presence: presenceStatus,
				lastActivity: lastActivity
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to get user activity: ${errorMessage}`);
		}
	}

	/**
	 * Bulk user lookup
	 * @param {string[]} userIds - Array of user IDs
	 * @returns {Promise<UserLookupResult[]>} User information for each ID
	 */
	async bulkUserLookup(userIds) {
		const results = [];
		
		for (const userId of userIds) {
			try {
				const result = await makeSlackRequest('/users.info', this.bearerToken, this.instanceId, {
					method: 'GET',
					body: { user: userId }
				});
				const userData = (typeof result === 'object' && result !== null && 'user' in result) ? result.user : null;
				results.push({ userId, success: true, user: formatUserResponse(userData) });
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				results.push({ userId, success: false, error: errorMessage });
			}
		}
		
		return results;
	}
}

/**
 * File upload data
 * @typedef {Object} FileUploadData
 * @property {File|Blob} file - File to upload
 * @property {string} [channels] - Comma-separated channel IDs
 * @property {string} [title] - File title
 * @property {string} [initial_comment] - Initial comment
 */

/**
 * File operation result
 * @typedef {Object} FileOperationResult
 * @property {string} fileId - File ID
 * @property {boolean} success - Whether operation succeeded
 * @property {Object} [result] - Result data if successful
 * @property {string} [error] - Error message if failed
 */

/**
 * File operations
 */
export class FileOperations {
	/**
	 * @param {string} bearerToken - OAuth Bearer token
	 * @param {string} instanceId - Instance ID for logging
	 */
	constructor(bearerToken, instanceId) {
		this.bearerToken = bearerToken;
		this.instanceId = instanceId;
	}

	/**
	 * Upload file with progress tracking
	 * @param {FileUploadData} fileData - File data and metadata
	 * @returns {Promise<Object>} Upload result
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
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to upload file: ${errorMessage}`);
		}
	}

	/**
	 * Delete multiple files
	 * @param {string[]} fileIds - Array of file IDs
	 * @returns {Promise<FileOperationResult[]>} Results for each deletion
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
				const errorMessage = error instanceof Error ? error.message : String(error);
				results.push({ fileId, success: false, error: errorMessage });
			}
		}
		
		return results;
	}
}

/**
 * Workspace statistics
 * @typedef {Object} WorkspaceStats
 * @property {Object} team - Team information
 * @property {Object} stats - Statistics
 * @property {number} stats.totalChannels - Total number of channels
 * @property {number} stats.totalUsers - Total number of users
 * @property {number} stats.activeUsers - Number of active users
 */

/**
 * Search results by content type
 * @typedef {Record<string, Object>} SearchResults
 */

/**
 * Workspace operations
 */
export class WorkspaceOperations {
	/**
	 * @param {string} bearerToken - OAuth Bearer token
	 * @param {string} instanceId - Instance ID for logging
	 */
	constructor(bearerToken, instanceId) {
		this.bearerToken = bearerToken;
		this.instanceId = instanceId;
	}

	/**
	 * Get comprehensive workspace statistics
	 * @returns {Promise<WorkspaceStats>} Workspace statistics
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

			const teamData = (typeof teamInfo === 'object' && teamInfo !== null && 'team' in teamInfo) ? teamInfo.team : {};
			const channelData = (typeof channels === 'object' && channels !== null && 'channels' in channels && Array.isArray(channels.channels)) ? channels.channels : [];
			const userData = (typeof users === 'object' && users !== null && 'members' in users && Array.isArray(users.members)) ? users.members : [];
			
			return {
				team: teamData,
				stats: {
					totalChannels: channelData.length,
					totalUsers: userData.length,
					activeUsers: userData.filter((user) => 
						typeof user === 'object' && user !== null && 
						!('deleted' in user && user.deleted) && 
						!('is_bot' in user && user.is_bot)
					).length
				}
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to get workspace stats: ${errorMessage}`);
		}
	}

	/**
	 * Search across multiple content types
	 * @param {string} query - Search query
	 * @param {('messages'|'files')[]} types - Content types to search
	 * @returns {Promise<SearchResults>} Search results
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
				const errorMessage = error instanceof Error ? error.message : String(error);
				results[type] = { error: errorMessage };
			}
		}
		
		return results;
	}
}

/**
 * Slack operations collection
 * @typedef {Object} SlackOperations
 * @property {MessageOperations} messages - Message operations
 * @property {ChannelOperations} channels - Channel operations
 * @property {UserOperations} users - User operations
 * @property {FileOperations} files - File operations
 * @property {WorkspaceOperations} workspace - Workspace operations
 */

/**
 * Create operation instances
 * @param {string} bearerToken - OAuth Bearer token
 * @param {string} instanceId - Instance ID for logging
 * @returns {SlackOperations} Collection of operation instances
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