/**
 * Slack API Integration - Main export file
 * Re-exports all API operations from specialized modules
 */

// Re-export all operations from modules
export {
	sendMessage,
	getMessages,
	getThreadMessages,
	deleteMessage,
	updateMessage,
	listChannels,
	getChannelInfo,
	joinChannel,
	leaveChannel,
	getUserInfo,
	listUsers,
	addReaction,
	removeReaction,
	getReactions,
	uploadFile,
	getFileInfo,
	createReminder,
	getTeamInfo,
	testAuth
} from './modules/index.js';

// Re-export the request handler for direct use if needed
export { makeSlackRequest } from './modules/requestHandler.js';