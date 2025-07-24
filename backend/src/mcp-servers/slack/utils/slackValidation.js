/**
 * Slack-specific validation utilities
 * Validates Slack IDs, formats, and business logic
 */

import { logValidationError } from './logger.js';

/**
 * Validate Slack channel types string
 * @param {string} types - Channel types (comma-separated)
 * @param {string} instanceId - Instance ID for logging
 * @returns {boolean} True if valid
 */
export function validateSlackChannelTypes(types, instanceId = 'unknown') {
	const validTypes = [
		'public_channel',
		'private_channel',
		'mpim',
		'im'
	];

	const typeList = types.split(',').map(t => t.trim());
	const invalidTypes = typeList.filter(type => !validTypes.includes(type));

	if (invalidTypes.length > 0) {
		const error = new Error(`Invalid channel types: ${invalidTypes.join(', ')}. Valid types: ${validTypes.join(', ')}`);
		logValidationError('invalid_channel_types', 'types', types, instanceId, { 
			invalidTypes, 
			validTypes 
		});
		throw error;
	}

	return true;
}

/**
 * Validate Slack file ID
 * @param {string} fileId - File ID to validate
 * @param {string} instanceId - Instance ID for logging
 * @returns {boolean} True if valid
 */
export function validateSlackFileId(fileId, instanceId = 'unknown') {
	// Slack file IDs typically start with 'F' followed by alphanumeric characters
	const fileIdPattern = /^F[A-Z0-9]+$/;

	if (!fileIdPattern.test(fileId)) {
		const error = new Error(`Invalid Slack file ID format: ${fileId}. Expected format: F followed by alphanumeric characters`);
		logValidationError('invalid_file_id', 'fileId', fileId, instanceId, { 
			pattern: fileIdPattern.toString(),
			expectedFormat: 'F + alphanumeric characters'
		});
		throw error;
	}

	return true;
}

/**
 * Validate Slack emoji name
 * @param {string} emojiName - Emoji name to validate
 * @param {string} instanceId - Instance ID for logging
 * @returns {boolean} True if valid
 */
export function validateSlackEmojiName(emojiName, instanceId = 'unknown') {
	// Emoji names should be alphanumeric with underscores, no colons
	const emojiPattern = /^[a-zA-Z0-9_+-]+$/;

	if (!emojiPattern.test(emojiName)) {
		const error = new Error(`Invalid emoji name: ${emojiName}. Emoji names should contain only letters, numbers, underscores, plus signs, and hyphens`);
		logValidationError('invalid_emoji_name', 'emojiName', emojiName, instanceId, { 
			pattern: emojiPattern.toString(),
			allowedCharacters: 'letters, numbers, underscores, plus signs, hyphens'
		});
		throw error;
	}

	// Check for common emoji names
	const commonEmojis = [
		'thumbsup', 'thumbsdown', 'heart', 'smile', 'laughing', 
		'confused', 'neutral_face', 'thinking_face', 'eyes', 'fire',
		'100', 'tada', 'rocket', 'star', 'checkmark'
	];

	if (emojiName.length < 2) {
		const error = new Error(`Emoji name too short: ${emojiName}. Minimum length is 2 characters`);
		logValidationError('emoji_name_too_short', 'emojiName', emojiName, instanceId, { 
			actualLength: emojiName.length,
			minimumLength: 2,
			suggestions: commonEmojis.slice(0, 5)
		});
		throw error;
	}

	return true;
}

/**
 * Validate Slack reminder time format
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid
 */
export function validateSlackReminderTime(time) {
	if (!time || typeof time !== 'string' || time.trim().length === 0) {
		throw new Error('Reminder time cannot be empty');
	}

	// Common time formats that Slack accepts
	const timePatterns = [
		/^in \d+( )?(minute|minutes|hour|hours|day|days|week|weeks|month|months)$/i,
		/^(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)( at \d{1,2}:\d{2}( )?(am|pm)?)?$/i,
		/^\d{4}-\d{2}-\d{2}( \d{1,2}:\d{2}( )?(am|pm)?)?$/,
		/^at \d{1,2}:\d{2}( )?(am|pm)?$/i,
		/^next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i
	];

	const isValidFormat = timePatterns.some(pattern => pattern.test(time.trim()));

	if (!isValidFormat) {
		throw new Error(`Invalid reminder time format: "${time}". Examples: "in 20 minutes", "tomorrow at 9am", "2024-12-25 14:30", "next Monday"`);
	}

	return true;
}

/**
 * Validate Slack message text
 * @param {string} text - Message text to validate
 * @returns {boolean} True if valid
 */
export function validateSlackMessageText(text) {
	if (!text || typeof text !== 'string') {
		throw new Error('Message text must be a non-empty string');
	}

	// Slack has a message length limit
	const maxLength = 40000;
	if (text.length > maxLength) {
		throw new Error(`Message text too long: ${text.length} characters. Maximum allowed: ${maxLength}`);
	}

	// Check for potentially problematic characters
	const problematicPatterns = [
		{ pattern: /\0/, message: 'Message cannot contain null characters' },
		{ pattern: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, message: 'Message contains invalid control characters' }
	];

	for (const { pattern, message } of problematicPatterns) {
		if (pattern.test(text)) {
			throw new Error(message);
		}
	}

	return true;
}

/**
 * Validate Slack filename
 * @param {string} filename - Filename to validate
 * @returns {boolean} True if valid
 */
export function validateSlackFilename(filename) {
	if (!filename || typeof filename !== 'string' || filename.trim().length === 0) {
		throw new Error('Filename cannot be empty');
	}

	// Check for invalid characters in filenames
	const invalidChars = /[<>:"|?*\x00-\x1F]/;
	if (invalidChars.test(filename)) {
		throw new Error(`Filename contains invalid characters: ${filename}. Avoid: < > : " | ? * and control characters`);
	}

	// Check filename length
	if (filename.length > 255) {
		throw new Error(`Filename too long: ${filename.length} characters. Maximum allowed: 255`);
	}

	// Check for reserved names (Windows-style, but good practice)
	const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
	const nameWithoutExt = filename.split('.')[0].toUpperCase();
	if (reservedNames.includes(nameWithoutExt)) {
		throw new Error(`Filename uses reserved name: ${filename}. Avoid: ${reservedNames.join(', ')}`);
	}

	return true;
}