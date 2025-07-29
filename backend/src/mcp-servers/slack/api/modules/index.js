/**
 * Slack API modules index
 * Re-exports all API operations from specialized modules
 */

// Message operations
const { sendMessage,
	getMessages,
	getThreadMessages,
	deleteMessage,
	updateMessage
 } = require('./messageOperations');

module.exports = { sendMessage,
	getMessages,
	getThreadMessages,
	deleteMessage,
	updateMessage
 };

// Channel operations
const { listChannels,
	getChannelInfo,
	joinChannel,
	leaveChannel
 } = require('./channelOperations');

module.exports = { listChannels,
	getChannelInfo,
	joinChannel,
	leaveChannel
 };

// User operations
const { getUserInfo,
	listUsers
 } = require('./userOperations');

module.exports = { getUserInfo,
	listUsers
 };

// Reaction operations
const { addReaction,
	removeReaction,
	getReactions
 } = require('./reactionOperations');

module.exports = { addReaction,
	removeReaction,
	getReactions
 };

// File operations
const { uploadFile,
	getFileInfo
 } = require('./fileOperations');

module.exports = { uploadFile,
	getFileInfo
 };

// Miscellaneous operations
const { createReminder,
	getTeamInfo,
	testAuth
 } = require('./miscOperations');

module.exports = { createReminder,
	getTeamInfo,
	testAuth
 };