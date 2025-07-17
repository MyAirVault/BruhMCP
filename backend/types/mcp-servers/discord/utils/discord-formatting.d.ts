/**
 * Discord Response Formatting Utilities
 * Helper functions to format Discord API responses for consistent MCP output
 */
/**
 * Format Discord user object
 * @param {Object} user - Discord user object
 * @returns {Object} Formatted user object
 */
export function formatUserResponse(user: Object): Object;
/**
 * Format Discord guild object
 * @param {Object} guild - Discord guild object
 * @returns {Object} Formatted guild object
 */
export function formatGuildResponse(guild: Object): Object;
/**
 * Format Discord channel object
 * @param {Object} channel - Discord channel object
 * @returns {Object} Formatted channel object
 */
export function formatChannelResponse(channel: Object): Object;
/**
 * Format Discord message object
 * @param {Object} message - Discord message object
 * @returns {Object} Formatted message object
 */
export function formatMessageResponse(message: Object): Object;
/**
 * Format Discord attachment object
 * @param {Object} attachment - Discord attachment object
 * @returns {Object} Formatted attachment object
 */
export function formatAttachmentResponse(attachment: Object): Object;
/**
 * Format Discord reaction object
 * @param {Object} reaction - Discord reaction object
 * @returns {Object} Formatted reaction object
 */
export function formatReactionResponse(reaction: Object): Object;
/**
 * Format Discord embed object for creation
 * @param {Object} embed - Embed data
 * @returns {Object} Formatted embed object
 */
export function formatEmbedForCreation(embed: Object): Object;
/**
 * Format error response for Discord operations
 * @param {string} action - Action that failed
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(action: string, error: Error, context?: Object): Object;
/**
 * Format success response for Discord operations
 * @param {string} action - Action that succeeded
 * @param {Object} data - Response data
 * @param {Object} context - Additional context
 * @returns {Object} Formatted success response
 */
export function formatSuccessResponse(action: string, data: Object, context?: Object): Object;
/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes: number): string;
/**
 * Format Discord timestamp
 * @param {string} timestamp - Discord timestamp
 * @returns {string} Formatted timestamp
 */
export function formatTimestamp(timestamp: string): string;
/**
 * Get channel type name
 * @param {number} type - Channel type number
 * @returns {string} Channel type name
 */
export function getChannelTypeName(type: number): string;
/**
 * Get message type name
 * @param {number} type - Message type number
 * @returns {string} Message type name
 */
export function getMessageTypeName(type: number): string;
//# sourceMappingURL=discord-formatting.d.ts.map