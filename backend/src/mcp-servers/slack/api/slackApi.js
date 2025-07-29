/**
 * Slack API Integration - Main export file
 * Re-exports all API operations from specialized modules
 */

// Re-export all operations from modules
const { sendMessage,
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
 } = require('./modules/index');

module.exports = { sendMessage,
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
 };

// Re-export the request handler for direct use if needed
const { makeSlackRequest  } = require('./modules/requestHandler');

module.exports = { makeSlackRequest  };