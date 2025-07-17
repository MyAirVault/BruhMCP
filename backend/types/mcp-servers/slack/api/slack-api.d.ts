/**
 * Send a message to a channel
 * @param {Object} args - Message arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Send result
 */
export function sendMessage(args: Object, bearerToken: string): Object;
/**
 * Get messages from a channel
 * @param {Object} args - Channel arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Messages result
 */
export function getMessages(args: Object, bearerToken: string): Object;
/**
 * Get thread messages
 * @param {Object} args - Thread arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Thread messages result
 */
export function getThreadMessages(args: Object, bearerToken: string): Object;
/**
 * Delete a message
 * @param {Object} args - Delete arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Delete result
 */
export function deleteMessage(args: Object, bearerToken: string): Object;
/**
 * Update a message
 * @param {Object} args - Update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Update result
 */
export function updateMessage(args: Object, bearerToken: string): Object;
/**
 * List channels
 * @param {Object} args - List arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Channels result
 */
export function listChannels(args: Object, bearerToken: string): Object;
/**
 * Get channel info
 * @param {Object} args - Channel arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Channel info result
 */
export function getChannelInfo(args: Object, bearerToken: string): Object;
/**
 * Join a channel
 * @param {Object} args - Join arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Join result
 */
export function joinChannel(args: Object, bearerToken: string): Object;
/**
 * Leave a channel
 * @param {Object} args - Leave arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Leave result
 */
export function leaveChannel(args: Object, bearerToken: string): Object;
/**
 * Get user info
 * @param {Object} args - User arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} User info result
 */
export function getUserInfo(args: Object, bearerToken: string): Object;
/**
 * List users
 * @param {Object} args - List arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Users result
 */
export function listUsers(args: Object, bearerToken: string): Object;
/**
 * Add reaction to a message
 * @param {Object} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Reaction result
 */
export function addReaction(args: Object, bearerToken: string): Object;
/**
 * Remove reaction from a message
 * @param {Object} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Reaction result
 */
export function removeReaction(args: Object, bearerToken: string): Object;
/**
 * Get reactions for a message
 * @param {Object} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Reactions result
 */
export function getReactions(args: Object, bearerToken: string): Object;
/**
 * Upload a file
 * @param {Object} args - File arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} File upload result
 */
export function uploadFile(args: Object, bearerToken: string): Object;
/**
 * Get file info
 * @param {Object} args - File arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} File info result
 */
export function getFileInfo(args: Object, bearerToken: string): Object;
/**
 * Create a reminder
 * @param {Object} args - Reminder arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Reminder result
 */
export function createReminder(args: Object, bearerToken: string): Object;
/**
 * Get team info
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Team info result
 */
export function getTeamInfo(bearerToken: string): Object;
/**
 * Test authentication
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Auth test result
 */
export function testAuth(bearerToken: string): Object;
//# sourceMappingURL=slack-api.d.ts.map