/**
 * Slack formatting utilities - Main export file
 * Re-exports all formatting functions from specialized modules
 */

// Message and file formatting
const { formatMessageResponse,
	formatAttachment,
	formatReaction,
	formatFile,
	formatFileUploadResult
 } = require('./messageFormatting');

module.exports = { formatMessageResponse,
	formatAttachment,
	formatReaction,
	formatFile,
	formatFileUploadResult
 };

// Entity formatting (channels, users, teams)
const { formatChannelResponse,
	formatUserResponse,
	formatTeamResponse
 } = require('./entityFormatting');

module.exports = { formatChannelResponse,
	formatUserResponse,
	formatTeamResponse
 };

// Text processing and formatting
const { formatSlackTimestamp,
	formatSlackText,
	sanitizeContent,
	truncateText
 } = require('./textFormatting');

module.exports = { formatSlackTimestamp,
	formatSlackText,
	sanitizeContent,
	truncateText
 };

// Response and MCP formatting
const { formatSlackResponse,
	createTextResponse,
	createFormattedResponse,
	formatErrorResponse,
	createRichTextResponse,
	createTableResponse
 } = require('./responseFormatting');

module.exports = { formatSlackResponse,
	createTextResponse,
	createFormattedResponse,
	formatErrorResponse,
	createRichTextResponse,
	createTableResponse
 };

// Analytics and bulk operations
const { formatSearchResults,
	formatConversationHistory,
	formatBulkOperationResults,
	formatChannelAnalytics,
	formatUserActivity,
	formatWorkspaceStats
 } = require('./analyticsFormatting');

module.exports = { formatSearchResults,
	formatConversationHistory,
	formatBulkOperationResults,
	formatChannelAnalytics,
	formatUserActivity,
	formatWorkspaceStats
 };