/**
 * Validate Slack channel types string
 * @param {string} types - Channel types (comma-separated)
 * @param {string} instanceId - Instance ID for logging
 * @returns {boolean} True if valid
 */
export function validateSlackChannelTypes(types: string, instanceId?: string): boolean;
/**
 * Validate Slack file ID
 * @param {string} fileId - File ID to validate
 * @param {string} instanceId - Instance ID for logging
 * @returns {boolean} True if valid
 */
export function validateSlackFileId(fileId: string, instanceId?: string): boolean;
/**
 * Validate Slack emoji name
 * @param {string} emojiName - Emoji name to validate
 * @param {string} instanceId - Instance ID for logging
 * @returns {boolean} True if valid
 */
export function validateSlackEmojiName(emojiName: string, instanceId?: string): boolean;
/**
 * Validate Slack reminder time format
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid
 */
export function validateSlackReminderTime(time: string): boolean;
/**
 * Validate Slack message text
 * @param {string} text - Message text to validate
 * @returns {boolean} True if valid
 */
export function validateSlackMessageText(text: string): boolean;
/**
 * Validate Slack filename
 * @param {string} filename - Filename to validate
 * @returns {boolean} True if valid
 */
export function validateSlackFilename(filename: string): boolean;
//# sourceMappingURL=slackValidation.d.ts.map