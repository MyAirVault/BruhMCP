/**
 * Discord OAuth Validation Utilities
 * Validates OAuth tokens and responses
 * Based on Gmail MCP service architecture
 */
/**
 * Validates Discord OAuth token format
 * @param {string} token - Token to validate
 * @param {string} tokenType - Type of token (bearer, bot, refresh)
 * @returns {Object} Validation result
 */
export function validateTokenFormat(token: string, tokenType: string): Object;
/**
 * Validates Discord OAuth scopes
 * @param {Array<string>} scopes - Array of scopes to validate
 * @returns {Object} Validation result
 */
export function validateOAuthScopes(scopes: Array<string>): Object;
/**
 * Validates Discord OAuth response
 * @param {Object} oauthResponse - OAuth response to validate
 * @returns {Object} Validation result
 */
export function validateOAuthResponse(oauthResponse: Object): Object;
/**
 * Validates Discord user data
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result
 */
export function validateUserData(userData: Object): Object;
/**
 * Validates Discord guild data
 * @param {Object} guildData - Guild data to validate
 * @returns {Object} Validation result
 */
export function validateGuildData(guildData: Object): Object;
/**
 * Validates Discord channel data
 * @param {Object} channelData - Channel data to validate
 * @returns {Object} Validation result
 */
export function validateChannelData(channelData: Object): Object;
/**
 * Validates instance ID format
 * @param {string} instanceId - Instance ID to validate
 * @returns {Object} Validation result
 */
export function validateInstanceId(instanceId: string): Object;
/**
 * Validates token expiration
 * @param {number|string} expiresAt - Expiration timestamp or date string
 * @returns {Object} Validation result
 */
export function validateTokenExpiration(expiresAt: number | string): Object;
/**
 * Validates Discord webhook URL
 * @param {string} webhookUrl - Webhook URL to validate
 * @returns {Object} Validation result
 */
export function validateWebhookUrl(webhookUrl: string): Object;
/**
 * Validates Discord snowflake ID
 * @param {string} snowflake - Snowflake ID to validate
 * @returns {Object} Validation result
 */
export function validateSnowflakeId(snowflake: string): Object;
//# sourceMappingURL=oauth-validation.d.ts.map