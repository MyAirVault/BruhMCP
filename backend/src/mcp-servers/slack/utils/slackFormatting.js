/**
 * Slack formatting utilities - Main export file
 * Re-exports all formatting functions from specialized modules
 */

// Message and file formatting
export {
	formatMessageResponse,
	formatAttachment,
	formatReaction,
	formatFile,
	formatFileUploadResult
} from './messageFormatting.js';

// Entity formatting (channels, users, teams)
export {
	formatChannelResponse,
	formatUserResponse,
	formatTeamResponse
} from './entityFormatting.js';

// Text processing and formatting
export {
	formatSlackTimestamp,
	formatSlackText,
	sanitizeContent,
	truncateText
} from './textFormatting.js';

// Response and MCP formatting
export {
	formatSlackResponse,
	createTextResponse,
	createFormattedResponse,
	formatErrorResponse,
	createRichTextResponse,
	createTableResponse
} from './responseFormatting.js';

// Analytics and bulk operations
export {
	formatSearchResults,
	formatConversationHistory,
	formatBulkOperationResults,
	formatChannelAnalytics,
	formatUserActivity,
	formatWorkspaceStats
} from './analyticsFormatting.js';