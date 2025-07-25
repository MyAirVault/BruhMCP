/**
 * Analytics and data formatting utilities for Slack
 * Handles search results, analytics, and bulk operations
 */

/**
 * @typedef {import('../middleware/types.js').SlackMessage} SlackMessage
 * @typedef {import('../middleware/types.js').SlackUser} SlackUser
 * @typedef {import('../middleware/types.js').SlackChannel} SlackChannel
 * @typedef {import('../middleware/types.js').SlackTeam} SlackTeam
 */

/**
 * @typedef {Object} SlackSearchMatch
 * @property {string} type - Type of search match (message, file, etc.)
 * @property {string} text - Matched text content
 * @property {string} user - User ID who created the content
 * @property {string} username - Username of the content creator
 * @property {Object} channel - Channel information
 * @property {string} channel.id - Channel ID
 * @property {string} channel.name - Channel name
 * @property {string} ts - Timestamp of the match
 * @property {string} permalink - Permanent link to the content
 */

/**
 * @typedef {Object} SlackSearchResults
 * @property {SlackSearchMatch[]} matches - Array of search matches
 * @property {Object} pagination - Pagination information
 * @property {number} pagination.total_count - Total number of matches
 * @property {number} pagination.page - Current page number
 * @property {number} pagination.per_page - Items per page
 * @property {number} pagination.page_count - Total number of pages
 * @property {number} pagination.first - First item index
 * @property {number} pagination.last - Last item index
 */

/**
 * @typedef {Object} SlackConversationHistory
 * @property {boolean} ok - Success status
 * @property {SlackMessage[]} messages - Array of messages
 * @property {boolean} has_more - Whether more messages exist
 * @property {number} pin_count - Number of pinned messages
 * @property {Object} response_metadata - Response metadata
 * @property {string} response_metadata.next_cursor - Next page cursor
 */

/**
 * @typedef {Object} BulkOperationResult
 * @property {boolean} success - Whether operation succeeded
 * @property {string} [error] - Error message if failed
 * @property {Object} [data] - Result data if successful
 * @property {string} id - Item ID that was processed
 */

import { debug } from './logger.js';
import { formatSlackText, formatSlackTimestamp } from './textFormatting.js';
import { formatMessageResponse } from './messageFormatting.js';
import { formatChannelResponse, formatUserResponse, formatTeamResponse } from './entityFormatting.js';

/**
 * Format search results for better readability
 * @param {SlackSearchResults} results - Search results from Slack API
 * @param {string} query - Original search query
 * @returns {{query: string, total: number, pagination: Object, matches: Array<{type: string, text: string, user: string, username: string, channel: string, timestamp: string|null, permalink: string}>}|null} Formatted search results
 */
export function formatSearchResults(results, query) {
	if (!results || !results.matches) return null;
	
	debug('Formatting search results', { query, matchCount: results.matches.length });
	
	return {
		query,
		total: results.matches.length,
		pagination: results.pagination,
		matches: results.matches.map(match => ({
			type: match.type,
			text: formatSlackText(match.text),
			user: match.user,
			username: match.username,
			channel: typeof match.channel === 'string' ? match.channel : match.channel?.name || match.channel?.id || '',
			timestamp: formatSlackTimestamp(match.ts) || '',
			permalink: match.permalink
		}))
	};
}

/**
 * Format conversation history with enhanced metadata
 * @param {SlackConversationHistory} history - Conversation history from Slack API
 * @param {SlackUser[]} [users=[]] - User data for mention resolution
 * @returns {{ok: boolean, messages: Array<Object>, has_more: boolean, pin_count: number, response_metadata: Object}|null} Formatted conversation history
 */
export function formatConversationHistory(history, users = []) {
	if (!history || !history.messages) return null;
	
	debug('Formatting conversation history', { messageCount: history.messages.length });
	
	return {
		ok: history.ok,
		messages: history.messages.map(message => ({
			...formatMessageResponse(message),
			formatted_text: formatSlackText(message.text || '', users)
		})),
		has_more: history.has_more,
		pin_count: history.pin_count,
		response_metadata: history.response_metadata
	};
}

/**
 * Format bulk operation results
 * @param {BulkOperationResult[]} results - Array of operation results
 * @param {string} operation - Operation type
 * @returns {{operation: string, total: number, successes: number, failures: number, success_rate: string, results: Array<BulkOperationResult & {timestamp: string}>}|null} Formatted bulk operation results
 */
export function formatBulkOperationResults(results, operation) {
	if (!results || !Array.isArray(results)) return null;
	
	const successCount = results.filter(r => r.success).length;
	const failureCount = results.filter(r => !r.success).length;
	
	debug('Formatting bulk operation results', { 
		operation, 
		total: results.length, 
		successes: successCount, 
		failures: failureCount 
	});
	
	return {
		operation,
		total: results.length,
		successes: successCount,
		failures: failureCount,
		success_rate: `${((successCount / results.length) * 100).toFixed(1)}%`,
		results: results.map(result => ({
			...result,
			timestamp: new Date().toISOString()
		}))
	};
}

/**
 * Format channel analytics data
 * @param {{channel: SlackChannel, memberCount: number, recentActivity: {messageCount: number, lastMessage: string|null}}} analytics - Channel analytics data
 * @returns {{channel: ReturnType<typeof formatChannelResponse>, analytics: {member_count: number, recent_activity: {message_count: number, last_message: string|null}}, generated_at: string}|null} Formatted analytics
 */
export function formatChannelAnalytics(analytics) {
	if (!analytics) return null;
	
	debug('Formatting channel analytics', { channelId: analytics.channel?.id });
	
	return {
		channel: formatChannelResponse(analytics.channel),
		analytics: {
			member_count: analytics.memberCount,
			recent_activity: {
				message_count: analytics.recentActivity.messageCount,
				last_message: analytics.recentActivity.lastMessage ? 
					formatSlackTimestamp(analytics.recentActivity.lastMessage) : null
			}
		},
		generated_at: new Date().toISOString()
	};
}

/**
 * Format user activity summary
 * @param {{user: SlackUser, presence: string, lastActivity: string|number|null}} activity - User activity data
 * @returns {{user: ReturnType<typeof formatUserResponse>, activity: {presence: string, last_activity: string|null, is_online: boolean}, generated_at: string}|null} Formatted activity summary
 */
export function formatUserActivity(activity) {
	if (!activity) return null;
	
	debug('Formatting user activity', { userId: activity.user?.id });
	
	return {
		user: formatUserResponse(activity.user),
		activity: {
			presence: activity.presence,
			last_activity: activity.lastActivity ? 
				formatSlackTimestamp(activity.lastActivity.toString()) : null,
			is_online: activity.presence === 'active'
		},
		generated_at: new Date().toISOString()
	};
}

/**
 * Format workspace statistics
 * @param {{team: SlackTeam, stats: {totalChannels: number, publicChannels?: number, privateChannels?: number, totalUsers: number, activeUsers: number}}} stats - Workspace statistics
 * @returns {{team: ReturnType<typeof formatTeamResponse>, statistics: {channels: {total: number, public: number, private: number}, users: {total: number, active: number, bots: number}}, generated_at: string}|null} Formatted workspace stats
 */
export function formatWorkspaceStats(stats) {
	if (!stats) return null;
	
	debug('Formatting workspace stats', { 
		totalChannels: stats.stats?.totalChannels, 
		totalUsers: stats.stats?.totalUsers 
	});
	
	return {
		team: formatTeamResponse(stats.team),
		statistics: {
			channels: {
				total: stats.stats.totalChannels,
				public: stats.stats.publicChannels || 0,
				private: stats.stats.privateChannels || 0
			},
			users: {
				total: stats.stats.totalUsers,
				active: stats.stats.activeUsers,
				bots: stats.stats.totalUsers - stats.stats.activeUsers
			}
		},
		generated_at: new Date().toISOString()
	};
}