/**
 * List channels in the workspace
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Channels list result
 */
export function listChannels(args: Object, bearerToken: string): Promise<Object>;
/**
 * Get information about a channel
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Channel info result
 */
export function getChannelInfo(args: Object, bearerToken: string): Promise<Object>;
/**
 * Join a channel
 * @param {Object} args - Join arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Join result
 */
export function joinChannel(args: Object, bearerToken: string): Promise<Object>;
/**
 * Leave a channel
 * @param {Object} args - Leave arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Leave result
 */
export function leaveChannel(args: Object, bearerToken: string): Promise<Object>;
//# sourceMappingURL=channelOperations.d.ts.map