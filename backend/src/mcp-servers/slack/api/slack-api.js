/**
 * Slack API Integration
 * Core Slack API operations using OAuth Bearer tokens
 */

import { formatSlackResponse, formatMessageResponse, formatChannelResponse, formatUserResponse } from '../utils/slack-formatting.js';

const SLACK_API_BASE = 'https://slack.com/api';

/**
 * Make authenticated request to Slack API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {Object} options - Request options
 * @returns {Object} API response
 */
async function makeSlackRequest(endpoint, bearerToken, options = {}) {
	const url = `${SLACK_API_BASE}${endpoint}`;

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

	console.log(`📡 Slack API Request: ${requestOptions.method} ${url}`);

	const response = await fetch(url, requestOptions);

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

		throw new Error(errorMessage);
	}

	const data = await response.json();
	console.log(`✅ Slack API Response: ${response.status}`);

	// Check for Slack-specific error in response
	if (data.ok === false) {
		throw new Error(`Slack API error: ${data.error}`);
	}

	return data;
}

/**
 * Send a message to a channel
 * @param {Object} args - Message arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Send result
 */
export async function sendMessage(args, bearerToken) {
	const { channel, text, blocks, attachments, thread_ts, reply_broadcast = false } = args;

	const body = {
		channel,
		text,
		reply_broadcast
	};

	if (blocks) {
		body.blocks = blocks;
	}

	if (attachments) {
		body.attachments = attachments;
	}

	if (thread_ts) {
		body.thread_ts = thread_ts;
	}

	const result = await makeSlackRequest('/chat.postMessage', bearerToken, {
		method: 'POST',
		body
	});

	return formatMessageResponse(result);
}

/**
 * Get messages from a channel
 * @param {Object} args - Channel arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Messages result
 */
export async function getMessages(args, bearerToken) {
	const { channel, count = 100, latest, oldest, inclusive = false } = args;

	const params = new URLSearchParams({
		channel,
		count: count.toString(),
		inclusive: inclusive.toString()
	});

	if (latest) {
		params.append('latest', latest);
	}

	if (oldest) {
		params.append('oldest', oldest);
	}

	const result = await makeSlackRequest(`/conversations.history?${params}`, bearerToken);

	return {
		messages: result.messages.map(formatMessageResponse),
		has_more: result.has_more,
		response_metadata: result.response_metadata
	};
}

/**
 * Get thread messages
 * @param {Object} args - Thread arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Thread messages result
 */
export async function getThreadMessages(args, bearerToken) {
	const { channel, ts, limit = 200, cursor } = args;

	const params = new URLSearchParams({
		channel,
		ts,
		limit: limit.toString()
	});

	if (cursor) {
		params.append('cursor', cursor);
	}

	const result = await makeSlackRequest(`/conversations.replies?${params}`, bearerToken);

	return {
		messages: result.messages.map(formatMessageResponse),
		has_more: result.has_more,
		response_metadata: result.response_metadata
	};
}

/**
 * Delete a message
 * @param {Object} args - Delete arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Delete result
 */
export async function deleteMessage(args, bearerToken) {
	const { channel, ts } = args;

	const result = await makeSlackRequest('/chat.delete', bearerToken, {
		method: 'POST',
		body: {
			channel,
			ts
		}
	});

	return {
		success: result.ok,
		channel: result.channel,
		ts: result.ts
	};
}

/**
 * Update a message
 * @param {Object} args - Update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Update result
 */
export async function updateMessage(args, bearerToken) {
	const { channel, ts, text, blocks, attachments } = args;

	const body = {
		channel,
		ts,
		text
	};

	if (blocks) {
		body.blocks = blocks;
	}

	if (attachments) {
		body.attachments = attachments;
	}

	const result = await makeSlackRequest('/chat.update', bearerToken, {
		method: 'POST',
		body
	});

	return formatMessageResponse(result);
}

/**
 * List channels
 * @param {Object} args - List arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Channels result
 */
export async function listChannels(args, bearerToken) {
	const { types = 'public_channel,private_channel', limit = 100, cursor } = args;

	const params = new URLSearchParams({
		types,
		limit: limit.toString(),
		exclude_archived: 'true'
	});

	if (cursor) {
		params.append('cursor', cursor);
	}

	const result = await makeSlackRequest(`/conversations.list?${params}`, bearerToken);

	return {
		channels: result.channels.map(formatChannelResponse),
		response_metadata: result.response_metadata
	};
}

/**
 * Get channel info
 * @param {Object} args - Channel arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Channel info result
 */
export async function getChannelInfo(args, bearerToken) {
	const { channel } = args;

	const params = new URLSearchParams({
		channel
	});

	const result = await makeSlackRequest(`/conversations.info?${params}`, bearerToken);

	return formatChannelResponse(result.channel);
}

/**
 * Join a channel
 * @param {Object} args - Join arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Join result
 */
export async function joinChannel(args, bearerToken) {
	const { channel } = args;

	const result = await makeSlackRequest('/conversations.join', bearerToken, {
		method: 'POST',
		body: {
			channel
		}
	});

	return formatChannelResponse(result.channel);
}

/**
 * Leave a channel
 * @param {Object} args - Leave arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Leave result
 */
export async function leaveChannel(args, bearerToken) {
	const { channel } = args;

	const result = await makeSlackRequest('/conversations.leave', bearerToken, {
		method: 'POST',
		body: {
			channel
		}
	});

	return {
		success: result.ok
	};
}

/**
 * Get user info
 * @param {Object} args - User arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} User info result
 */
export async function getUserInfo(args, bearerToken) {
	const { user } = args;

	const params = new URLSearchParams({
		user
	});

	const result = await makeSlackRequest(`/users.info?${params}`, bearerToken);

	return formatUserResponse(result.user);
}

/**
 * List users
 * @param {Object} args - List arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Users result
 */
export async function listUsers(args, bearerToken) {
	const { limit = 100, cursor } = args;

	const params = new URLSearchParams({
		limit: limit.toString()
	});

	if (cursor) {
		params.append('cursor', cursor);
	}

	const result = await makeSlackRequest(`/users.list?${params}`, bearerToken);

	return {
		users: result.members.map(formatUserResponse),
		response_metadata: result.response_metadata
	};
}

/**
 * Add reaction to a message
 * @param {Object} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Reaction result
 */
export async function addReaction(args, bearerToken) {
	const { channel, timestamp, name } = args;

	const result = await makeSlackRequest('/reactions.add', bearerToken, {
		method: 'POST',
		body: {
			channel,
			timestamp,
			name
		}
	});

	return {
		success: result.ok
	};
}

/**
 * Remove reaction from a message
 * @param {Object} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Reaction result
 */
export async function removeReaction(args, bearerToken) {
	const { channel, timestamp, name } = args;

	const result = await makeSlackRequest('/reactions.remove', bearerToken, {
		method: 'POST',
		body: {
			channel,
			timestamp,
			name
		}
	});

	return {
		success: result.ok
	};
}

/**
 * Get reactions for a message
 * @param {Object} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Reactions result
 */
export async function getReactions(args, bearerToken) {
	const { channel, timestamp } = args;

	const params = new URLSearchParams({
		channel,
		timestamp
	});

	const result = await makeSlackRequest(`/reactions.get?${params}`, bearerToken);

	return {
		message: formatMessageResponse(result.message),
		reactions: result.message.reactions || []
	};
}

/**
 * Upload a file
 * @param {Object} args - File arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} File upload result
 */
export async function uploadFile(args, bearerToken) {
	const { channels, content, filename, title, filetype, initial_comment } = args;

	const formData = new FormData();
	formData.append('channels', channels);
	formData.append('content', content);
	formData.append('filename', filename);
	
	if (title) {
		formData.append('title', title);
	}
	
	if (filetype) {
		formData.append('filetype', filetype);
	}
	
	if (initial_comment) {
		formData.append('initial_comment', initial_comment);
	}

	const result = await makeSlackRequest('/files.upload', bearerToken, {
		method: 'POST',
		formData
	});

	return {
		success: result.ok,
		file: result.file
	};
}

/**
 * Get file info
 * @param {Object} args - File arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} File info result
 */
export async function getFileInfo(args, bearerToken) {
	const { file } = args;

	const params = new URLSearchParams({
		file
	});

	const result = await makeSlackRequest(`/files.info?${params}`, bearerToken);

	return {
		file: result.file
	};
}

/**
 * Create a reminder
 * @param {Object} args - Reminder arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Reminder result
 */
export async function createReminder(args, bearerToken) {
	const { text, time, user } = args;

	const body = {
		text,
		time
	};

	if (user) {
		body.user = user;
	}

	const result = await makeSlackRequest('/reminders.add', bearerToken, {
		method: 'POST',
		body
	});

	return {
		success: result.ok,
		reminder: result.reminder
	};
}

/**
 * Get team info
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Team info result
 */
export async function getTeamInfo(bearerToken) {
	const result = await makeSlackRequest('/team.info', bearerToken);

	return {
		team: result.team
	};
}

/**
 * Test authentication
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Auth test result
 */
export async function testAuth(bearerToken) {
	const result = await makeSlackRequest('/auth.test', bearerToken, {
		method: 'POST'
	});

	return {
		success: result.ok,
		url: result.url,
		team: result.team,
		user: result.user,
		team_id: result.team_id,
		user_id: result.user_id,
		bot_id: result.bot_id
	};
}