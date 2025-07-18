/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Arguments to validate
 * @param {string} instanceId - Instance ID for logging
 * @throws {Error} Validation error if arguments are invalid
 */
export function validateToolArguments(toolName: string, args: Object, instanceId?: string): void;
/**
 * Validate Slack channel types
 * @param {string} types - Channel types (comma-separated)
 * @param {string} instanceId - Instance ID for logging
 * @throws {Error} If channel types are invalid
 */
export function validateSlackChannelTypes(types: string, instanceId?: string): void;
/**
 * Validate Slack file ID format
 * @param {string} fileId - Slack file ID
 * @param {string} instanceId - Instance ID for logging
 * @throws {Error} If file ID format is invalid
 */
export function validateSlackFileId(fileId: string, instanceId?: string): void;
/**
 * Validate Slack emoji name format
 * @param {string} emojiName - Emoji name (without colons)
 * @param {string} instanceId - Instance ID for logging
 * @throws {Error} If emoji name format is invalid
 */
export function validateSlackEmojiName(emojiName: string, instanceId?: string): void;
/**
 * Validate Slack reminder time format
 * @param {string} time - Reminder time string
 * @throws {Error} If time format is invalid
 */
export function validateSlackReminderTime(time: string): void;
/**
 * Validate Slack message text for safety
 * @param {string} text - Message text
 * @throws {Error} If text contains dangerous content
 */
export function validateSlackMessageText(text: string): void;
/**
 * Validate Slack filename
 * @param {string} filename - Filename
 * @throws {Error} If filename is invalid
 */
export function validateSlackFilename(filename: string): void;
//# sourceMappingURL=validation.d.ts.map