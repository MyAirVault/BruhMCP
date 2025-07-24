/**
 * Slack API modules index
 * Re-exports all API operations from specialized modules
 */

// Message operations
export {
	sendMessage,
	getMessages,
	getThreadMessages,
	deleteMessage,
	updateMessage
} from './messageOperations.js';

// Channel operations
export {
	listChannels,
	getChannelInfo,
	joinChannel,
	leaveChannel
} from './channelOperations.js';

// User operations
export {
	getUserInfo,
	listUsers
} from './userOperations.js';

// Reaction operations
export {
	addReaction,
	removeReaction,
	getReactions
} from './reactionOperations.js';

// File operations
export {
	uploadFile,
	getFileInfo
} from './fileOperations.js';

// Miscellaneous operations
export {
	createReminder,
	getTeamInfo,
	testAuth
} from './miscOperations.js';