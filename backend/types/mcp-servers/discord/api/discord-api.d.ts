/**
 * Get current user information
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} User information
 */
export function getCurrentUser(bearerToken: string): Object;
/**
 * Get user's guilds (servers)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} User's guilds
 */
export function getUserGuilds(bearerToken: string): Object;
/**
 * Get user's connections (linked accounts)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} User's connections
 */
export function getUserConnections(bearerToken: string): Object;
/**
 * Get guild information
 * @param {string} guildId - Guild ID
 * @param {string} token - Bearer token
 * @returns {Object} Guild information
 */
export function getGuild(guildId: string, token: string): Object;
/**
 * Get guild member information
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID (use '@me' for current user)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Guild member information
 */
export function getGuildMember(guildId: string, userId: string, bearerToken: string): Object;
/**
 * Get guild channels
 * @param {string} guildId - Guild ID
 * @param {string} token - Bearer token
 * @returns {Object} Guild channels
 */
export function getGuildChannels(guildId: string, token: string): Object;
/**
 * Get channel information
 * @param {string} channelId - Channel ID
 * @param {string} token - Bearer token
 * @returns {Object} Channel information
 */
export function getChannel(channelId: string, token: string): Object;
/**
 * Get channel messages
 * @param {string} channelId - Channel ID
 * @param {Object} args - Message fetch arguments
 * @param {string} token - Bearer token
 * @returns {Object} Channel messages
 */
export function getChannelMessages(channelId: string, args: Object, token: string): Object;
/**
 * Send message to channel
 * @param {string} channelId - Channel ID
 * @param {Object} args - Message arguments
 * @param {string} token - Bearer token
 * @returns {Object} Sent message
 */
export function sendMessage(channelId: string, args: Object, token: string): Object;
/**
 * Edit a message
 * @param {string} channelId - Channel ID
 * @param {string} messageId - Message ID
 * @param {Object} args - Edit arguments
 * @param {string} token - Bearer token
 * @returns {Object} Edited message
 */
export function editMessage(channelId: string, messageId: string, args: Object, token: string): Object;
/**
 * Delete a message
 * @param {string} channelId - Channel ID
 * @param {string} messageId - Message ID
 * @param {string} token - Bearer token
 * @returns {Object} Delete result
 */
export function deleteMessage(channelId: string, messageId: string, token: string): Object;
/**
 * Add reaction to message
 * @param {string} channelId - Channel ID
 * @param {string} messageId - Message ID
 * @param {string} emoji - Emoji to react with
 * @param {string} token - Bearer token
 * @returns {Object} Reaction result
 */
export function addReaction(channelId: string, messageId: string, emoji: string, token: string): Object;
/**
 * Remove reaction from message
 * @param {string} channelId - Channel ID
 * @param {string} messageId - Message ID
 * @param {string} emoji - Emoji to remove
 * @param {string} token - Bearer token
 * @returns {Object} Reaction result
 */
export function removeReaction(channelId: string, messageId: string, emoji: string, token: string): Object;
/**
 * Get invite information
 * @param {string} inviteCode - Invite code
 * @param {string} token - Bearer token
 * @returns {Object} Invite information
 */
export function getInvite(inviteCode: string, token: string): Object;
/**
 * Create guild invite
 * @param {string} channelId - Channel ID to create invite for
 * @param {Object} args - Invite arguments
 * @param {string} token - Bearer token
 * @returns {Object} Created invite
 */
export function createInvite(channelId: string, args: Object, token: string): Object;
/**
 * Discord API Class for validation and API operations
 */
export class DiscordAPI {
    constructor(bearerToken: any);
    bearerToken: any;
    /**
     * Get current user information for validation
     * @returns {Promise<Object>} User information with success status
     */
    getCurrentUser(): Promise<Object>;
}
//# sourceMappingURL=discord-api.d.ts.map