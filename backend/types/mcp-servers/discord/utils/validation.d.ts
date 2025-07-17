/**
 * Validates tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Arguments to validate
 * @returns {Object} Validated arguments
 * @throws {Error} If validation fails
 */
export function validateToolArguments(toolName: string, args: Object): Object;
/**
 * Validates Discord snowflake ID
 * @param {string} id - The ID to validate
 * @returns {boolean} True if valid
 */
export function isValidSnowflake(id: string): boolean;
/**
 * Validates Discord message content
 * @param {string} content - Message content
 * @returns {boolean} True if valid
 */
export function isValidMessageContent(content: string): boolean;
/**
 * Validates Discord embed structure
 * @param {Object} embed - Embed object
 * @returns {boolean} True if valid
 */
export function isValidEmbed(embed: Object): boolean;
/**
 * Validates Discord permission value
 * @param {string|number} permissions - Permission value
 * @returns {boolean} True if valid
 */
export function isValidPermissions(permissions: string | number): boolean;
/**
 * Validates Discord channel type
 * @param {number} type - Channel type
 * @returns {boolean} True if valid
 */
export function isValidChannelType(type: number): boolean;
/**
 * Validates Discord message limit
 * @param {number} limit - Message limit
 * @returns {boolean} True if valid
 */
export function isValidMessageLimit(limit: number): boolean;
/**
 * Validates Discord invite configuration
 * @param {Object} config - Invite configuration
 * @returns {boolean} True if valid
 */
export function isValidInviteConfig(config: Object): boolean;
/**
 * Sanitizes Discord message content
 * @param {string} content - Message content
 * @returns {string} Sanitized content
 */
export function sanitizeMessageContent(content: string): string;
/**
 * Validates Discord token format
 * @param {string} token - Token to validate
 * @returns {boolean} True if valid format
 */
export function isValidTokenFormat(token: string): boolean;
//# sourceMappingURL=validation.d.ts.map