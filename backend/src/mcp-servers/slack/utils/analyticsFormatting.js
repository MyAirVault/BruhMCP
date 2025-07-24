/**
 * Analytics and data formatting utilities for Slack
 * Handles search results, analytics, and bulk operations
 */

import { debug } from './logger.js';
import { formatSlackText, formatSlackTimestamp } from './textFormatting.js';
import { formatMessageResponse } from './messageFormatting.js';
import { formatChannelResponse, formatUserResponse, formatTeamResponse } from './entityFormatting.js';

/**
 * Format search results for better readability
 * @param {Object} results - Search results from Slack API
 * @param {string} query - Original search query
 * @returns {Object} Formatted search results
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
			channel: match.channel,
			timestamp: formatSlackTimestamp(match.ts),
			permalink: match.permalink
		}))
	};
}

/**
 * Format conversation history with enhanced metadata
 * @param {Object} history - Conversation history from Slack API
 * @param {Object[]} users - User data for mention resolution
 * @param {Object[]} channels - Channel data for mention resolution
 * @returns {Object} Formatted conversation history
 */
export function formatConversationHistory(history, users = [], channels = []) {
	if (!history || !history.messages) return null;
	
	debug('Formatting conversation history', { messageCount: history.messages.length });
	
	return {
		ok: history.ok,
		messages: history.messages.map(message => ({
			...formatMessageResponse(message),
			formatted_text: formatSlackText(message.text, users, channels)
		})),
		has_more: history.has_more,
		pin_count: history.pin_count,
		response_metadata: history.response_metadata
	};
}

/**
 * Format bulk operation results
 * @param {Object[]} results - Array of operation results
 * @param {string} operation - Operation type
 * @returns {Object} Formatted bulk operation results
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
 * @param {Object} analytics - Channel analytics data
 * @returns {Object} Formatted analytics
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
 * @param {Object} activity - User activity data
 * @returns {Object} Formatted activity summary
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
 * @param {Object} stats - Workspace statistics
 * @returns {Object} Formatted workspace stats
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