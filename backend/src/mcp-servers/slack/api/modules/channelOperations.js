/**
 * Slack channel operations
 * Handles channel listing, info, joining, and leaving
 */

const { makeSlackRequest  } = require('./requestHandler');
const { formatChannelResponse  } = require('../../utils/slackFormatting');

/**
 * @typedef {Object} ListChannelsArgs
 * @property {string} [types] - Channel types to include
 * @property {number} [limit] - Number of channels to return
 * @property {string} [cursor] - Pagination cursor
 */

/**
 * @typedef {Object} ChannelInfoArgs
 * @property {string} channel - Channel ID
 */

/**
 * @typedef {Object} JoinChannelArgs
 * @property {string} channel - Channel ID
 */

/**
 * @typedef {Object} LeaveChannelArgs
 * @property {string} channel - Channel ID
 */

/**
 * @typedef {import('../../middleware/types.js').SlackChannel} SlackChannel
 */

/**
 * @typedef {Object} SlackChannelsResponse
 * @property {boolean} ok - Success indicator
 * @property {SlackChannel[]} [channels] - Array of channels
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} SlackChannelResponse
 * @property {boolean} ok - Success indicator
 * @property {SlackChannel} [channel] - Channel object
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} FormattedChannel
 * @property {string} id - Channel ID
 * @property {string} name - Channel name
 * @property {boolean} is_channel - Whether this is a channel
 * @property {boolean} is_group - Whether this is a group
 * @property {boolean} is_im - Whether this is a direct message
 * @property {boolean} is_mpim - Whether this is a multi-party direct message
 * @property {boolean} is_private - Whether the channel is private
 * @property {number} created - Channel creation timestamp
 * @property {string} creator - User ID of channel creator
 * @property {boolean} is_archived - Whether the channel is archived
 * @property {boolean} is_general - Whether this is the general channel
 */

/**
 * @typedef {Object} ChannelsListResult
 * @property {boolean} ok - Success indicator
 * @property {(FormattedChannel|null)[]} channels - Array of formatted channels
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */

/**
 * List channels in the workspace
 * @param {ListChannelsArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ChannelsListResult>} Channels list result
 */
async function listChannels(args, bearerToken) {
	const { types = 'public_channel,private_channel', limit = 100, cursor } = args;

	const params = new URLSearchParams({
		types,
		limit: limit.toString(),
	});

	if (cursor) params.append('cursor', cursor);

	/** @type {SlackChannelsResponse} */
	const response = /** @type {SlackChannelsResponse} */ (await makeSlackRequest(`/conversations.list?${params}`, bearerToken));

	return {
		...response,
		channels: response.channels?.map(formatChannelResponse) || [],
		summary: `Retrieved ${response.channels?.length || 0} channels`,
	};
}

/**
 * @typedef {Object} ChannelInfoResult
 * @property {boolean} ok - Success indicator
 * @property {FormattedChannel|null} channel - Formatted channel object
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */

/**
 * Get information about a channel
 * @param {ChannelInfoArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ChannelInfoResult>} Channel info result
 */
async function getChannelInfo(args, bearerToken) {
	const { channel } = args;

	const params = new URLSearchParams({ channel });
	/** @type {SlackChannelResponse} */
	const response = /** @type {SlackChannelResponse} */ (await makeSlackRequest(`/conversations.info?${params}`, bearerToken));

	return {
		...response,
		channel: formatChannelResponse(response.channel || null),
		summary: `Retrieved info for channel: ${response.channel?.name || channel}`,
	};
}

/**
 * Join a channel
 * @param {JoinChannelArgs} args - Join arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ChannelInfoResult>} Join result
 */
async function joinChannel(args, bearerToken) {
	const { channel } = args;

	/** @type {SlackChannelResponse} */
	const response = /** @type {SlackChannelResponse} */ (await makeSlackRequest('/conversations.join', bearerToken, {
		method: 'POST',
		body: { channel },
	}));

	return {
		...response,
		channel: formatChannelResponse(response.channel || null),
		summary: `Joined channel: ${response.channel?.name || channel}`,
	};
}

/**
 * @typedef {Object} LeaveChannelResult  
 * @property {boolean} ok - Success indicator
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */

/**
 * Leave a channel
 * @param {LeaveChannelArgs} args - Leave arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<LeaveChannelResult>} Leave result
 */
async function leaveChannel(args, bearerToken) {
	const { channel } = args;

	/** @type {SlackChannelResponse} */
	const response = /** @type {SlackChannelResponse} */ (await makeSlackRequest('/conversations.leave', bearerToken, {
		method: 'POST',
		body: { channel },
	}));

	return {
		...response,
		summary: `Left channel: ${channel}`,
	};
}
module.exports = {
  listChannels,
  getChannelInfo,
  joinChannel,
  leaveChannel
};